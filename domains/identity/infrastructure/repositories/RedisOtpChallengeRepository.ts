import { randomUUID } from 'node:crypto';
import type { IRedisClient } from '@carbroz/platform-cache';
import type { OtpChallenge } from '../../domain/OtpChallenge.js';
import type {
  CreateOtpChallengeInput,
  IOtpChallengeRepository,
  OtpChallengeRateLimitGuard,
} from '../../domain/repositories/IOtpChallengeRepository.js';

const OTP_NAMESPACE = 'carbroz:identity:otp:v1:';

export interface RedisOtpChallengeRepositoryOptions {
  rateLimitWindowMs: number;
}

type StoredOtpChallenge = {
  id: number;
  publicId: string;
  phoneNumber: string;
  deviceId: string;
  otpHash: string;
  attemptCount: number;
  maxAttempts: number;
  expiresAt: string;
  consumedAt: string | null;
  invalidatedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const CREATE_WITH_RATE_LIMIT_SCRIPT = `
-- carbroz:identity:otp:create-with-rate-limit:v1
local namespace = ARGV[1]
local phoneKey = ARGV[2]
local publicId = ARGV[3]
local phoneNumber = ARGV[4]
local deviceId = ARGV[5]
local otpHash = ARGV[6]
local maxAttempts = tonumber(ARGV[7])
local expiresAt = ARGV[8]
local nowIso = ARGV[9]
local nowMs = tonumber(ARGV[10])
local windowStartMs = tonumber(ARGV[11])
local maxChallenges = tonumber(ARGV[12])
local challengeTtlMs = tonumber(ARGV[13])
local rateTtlMs = tonumber(ARGV[14])

local rateKey = namespace .. 'rate:' .. phoneKey
redis.call('ZREMRANGEBYSCORE', rateKey, '-inf', '(' .. tostring(windowStartMs))
local count = redis.call('ZCARD', rateKey)
if count >= maxChallenges then
  return {0}
end

local id = redis.call('INCR', namespace .. 'seq')
local challengeKey = namespace .. 'challenge:' .. tostring(id)
local publicKey = namespace .. 'public:' .. publicId
local latestKey = namespace .. 'phone:' .. phoneKey .. ':latest'
local record = {
  id = id,
  publicId = publicId,
  phoneNumber = phoneNumber,
  deviceId = deviceId,
  otpHash = otpHash,
  attemptCount = 0,
  maxAttempts = maxAttempts,
  expiresAt = expiresAt,
  consumedAt = cjson.null,
  invalidatedAt = cjson.null,
  createdAt = nowIso,
  updatedAt = nowIso
}
local encoded = cjson.encode(record)

redis.call('SET', challengeKey, encoded, 'PX', challengeTtlMs)
redis.call('SET', publicKey, tostring(id), 'PX', challengeTtlMs)
redis.call('SET', latestKey, tostring(id), 'PX', challengeTtlMs)
redis.call('ZADD', rateKey, nowMs, tostring(id))
redis.call('PEXPIRE', rateKey, rateTtlMs)

return {1, tostring(id), encoded}
`;

const RECORD_FAILED_ATTEMPT_SCRIPT = `
-- carbroz:identity:otp:record-failed-attempt:v1
local raw = redis.call('GET', KEYS[1])
if not raw then return nil end
local record = cjson.decode(raw)
local maxAttempts = tonumber(ARGV[1])
if record.consumedAt ~= nil or record.invalidatedAt ~= nil then return nil end
if tonumber(record.attemptCount) >= maxAttempts then return nil end
record.attemptCount = tonumber(record.attemptCount) + 1
record.updatedAt = ARGV[2]
local encoded = cjson.encode(record)
local ttl = redis.call('PTTL', KEYS[1])
if ttl > 0 then
  redis.call('SET', KEYS[1], encoded, 'PX', ttl)
else
  redis.call('SET', KEYS[1], encoded)
end
return encoded
`;

const TRY_CONSUME_SCRIPT = `
-- carbroz:identity:otp:try-consume:v1
local raw = redis.call('GET', KEYS[1])
if not raw then return 0 end
local record = cjson.decode(raw)
local nowMs = tonumber(ARGV[1])
local maxAttempts = tonumber(ARGV[2])
if record.consumedAt ~= nil or record.invalidatedAt ~= nil then return 0 end
if tonumber(record.attemptCount) >= maxAttempts then return 0 end
local expiresAtMs = tonumber(ARGV[3])
if expiresAtMs <= nowMs then return 0 end
record.consumedAt = ARGV[4]
record.updatedAt = ARGV[4]
local encoded = cjson.encode(record)
local ttl = redis.call('PTTL', KEYS[1])
if ttl > 0 then
  redis.call('SET', KEYS[1], encoded, 'PX', ttl)
else
  redis.call('SET', KEYS[1], encoded)
end
return 1
`;

const INVALIDATE_SCRIPT = `
-- carbroz:identity:otp:invalidate:v1
local raw = redis.call('GET', KEYS[1])
if not raw then return 0 end
local record = cjson.decode(raw)
if record.consumedAt ~= nil or record.invalidatedAt ~= nil then return 0 end
record.invalidatedAt = ARGV[1]
record.updatedAt = ARGV[1]
local encoded = cjson.encode(record)
local ttl = redis.call('PTTL', KEYS[1])
if ttl > 0 then
  redis.call('SET', KEYS[1], encoded, 'PX', ttl)
else
  redis.call('SET', KEYS[1], encoded)
end
redis.call('ZREM', KEYS[2], tostring(record.id))
return 1
`;

/** Redis persistence adapter for Identity-owned OTP challenge state. */
export class RedisOtpChallengeRepository implements IOtpChallengeRepository {
  constructor(
    private readonly client: IRedisClient,
    private readonly options: RedisOtpChallengeRepositoryOptions,
  ) {
    if (!Number.isInteger(options.rateLimitWindowMs) || options.rateLimitWindowMs <= 0) {
      throw new RangeError('rateLimitWindowMs must be a positive integer');
    }
  }

  async create(input: CreateOtpChallengeInput): Promise<OtpChallenge> {
    const now = new Date();
    const challenge = await this.tryCreateWithinRateLimit(input, {
      now,
      windowStart: new Date(now.getTime() - this.options.rateLimitWindowMs),
      maxChallenges: Number.MAX_SAFE_INTEGER,
    });
    if (!challenge) throw new Error('Redis OTP challenge creation was unexpectedly rejected');
    return challenge;
  }

  async tryCreateWithinRateLimit(
    input: CreateOtpChallengeInput,
    guard: OtpChallengeRateLimitGuard,
  ): Promise<OtpChallenge | null> {
    this.validateCreateInput(input, guard);

    const publicId = randomUUID();
    const challengeTtlMs = input.expiresAt.getTime() - guard.now.getTime();
    const rateTtlMs = Math.max(1, guard.now.getTime() - guard.windowStart.getTime());
    const result = await this.client.eval(
      CREATE_WITH_RATE_LIMIT_SCRIPT,
      0,
      OTP_NAMESPACE,
      encodePhoneKey(input.phoneNumber),
      publicId,
      input.phoneNumber,
      input.deviceId,
      input.otpHash,
      String(input.maxAttempts),
      input.expiresAt.toISOString(),
      guard.now.toISOString(),
      String(guard.now.getTime()),
      String(guard.windowStart.getTime()),
      String(guard.maxChallenges),
      String(challengeTtlMs),
      String(rateTtlMs),
    );

    if (!Array.isArray(result) || Number(result[0]) === 0) return null;
    const raw = result[2];
    if (typeof raw !== 'string') throw new Error('Redis OTP create returned an invalid challenge record');
    return this.parseChallenge(raw);
  }

  async findForVerification(
    publicId: string,
    phoneNumber: string,
    deviceId: string,
  ): Promise<OtpChallenge | null> {
    const internalId = await this.client.get(publicKey(publicId));
    if (internalId === null) return null;
    const challenge = await this.findByInternalId(internalId);
    if (!challenge) return null;
    if (challenge.publicId !== publicId || challenge.phoneNumber !== phoneNumber || challenge.deviceId !== deviceId) {
      return null;
    }
    return challenge;
  }

  async findLatestByPhone(phoneNumber: string): Promise<OtpChallenge | null> {
    const internalId = await this.client.get(latestByPhoneKey(phoneNumber));
    if (internalId === null) return null;
    return this.findByInternalId(internalId);
  }

  async countCreatedSince(phoneNumber: string, since: Date): Promise<number> {
    return this.client.zcount(rateKey(phoneNumber), since.getTime(), '+inf');
  }

  async recordFailedAttempt(id: number, maxAttempts: number): Promise<OtpChallenge | null> {
    const now = new Date();
    const result = await this.client.eval(
      RECORD_FAILED_ATTEMPT_SCRIPT,
      1,
      challengeKey(id),
      String(maxAttempts),
      now.toISOString(),
    );
    if (result === null || result === undefined) return null;
    if (typeof result !== 'string') throw new Error('Redis OTP failed-attempt update returned invalid data');
    return this.parseChallenge(result);
  }

  async tryConsume(id: number, now: Date, maxAttempts: number): Promise<boolean> {
    const current = await this.findByInternalId(String(id));
    if (!current) return false;
    const result = await this.client.eval(
      TRY_CONSUME_SCRIPT,
      1,
      challengeKey(id),
      String(now.getTime()),
      String(maxAttempts),
      String(current.expiresAt.getTime()),
      now.toISOString(),
    );
    return Number(result) === 1;
  }

  async invalidate(id: number, now: Date): Promise<void> {
    const current = await this.findByInternalId(String(id));
    if (!current) return;
    await this.client.eval(
      INVALIDATE_SCRIPT,
      2,
      challengeKey(id),
      rateKey(current.phoneNumber),
      now.toISOString(),
    );
  }

  private async findByInternalId(rawId: string): Promise<OtpChallenge | null> {
    const id = Number(rawId);
    if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Redis OTP index contains an invalid internal ID');
    const raw = await this.client.get(challengeKey(id));
    return raw === null ? null : this.parseChallenge(raw);
  }

  private parseChallenge(raw: string): OtpChallenge {
    let parsed: StoredOtpChallenge;
    try {
      parsed = JSON.parse(raw) as StoredOtpChallenge;
    } catch {
      throw new Error('Redis OTP challenge record is corrupt');
    }

    if (
      !Number.isSafeInteger(parsed.id) || parsed.id <= 0 ||
      typeof parsed.publicId !== 'string' || !parsed.publicId ||
      typeof parsed.phoneNumber !== 'string' || !parsed.phoneNumber ||
      typeof parsed.deviceId !== 'string' || !parsed.deviceId ||
      typeof parsed.otpHash !== 'string' || !parsed.otpHash ||
      !Number.isInteger(parsed.attemptCount) || parsed.attemptCount < 0 ||
      !Number.isInteger(parsed.maxAttempts) || parsed.maxAttempts <= 0
    ) {
      throw new Error('Redis OTP challenge record is corrupt');
    }

    const expiresAt = parseDate(parsed.expiresAt);
    const createdAt = parseDate(parsed.createdAt);
    const updatedAt = parseDate(parsed.updatedAt);
    const consumedAt = parsed.consumedAt === null ? null : parseDate(parsed.consumedAt);
    const invalidatedAt = parsed.invalidatedAt === null ? null : parseDate(parsed.invalidatedAt);

    return {
      id: parsed.id,
      publicId: parsed.publicId,
      phoneNumber: parsed.phoneNumber,
      deviceId: parsed.deviceId,
      otpHash: parsed.otpHash,
      attemptCount: parsed.attemptCount,
      maxAttempts: parsed.maxAttempts,
      expiresAt,
      consumedAt,
      invalidatedAt,
      createdAt,
      updatedAt,
    };
  }

  private validateCreateInput(input: CreateOtpChallengeInput, guard: OtpChallengeRateLimitGuard): void {
    if (!input.phoneNumber.trim()) throw new Error('phoneNumber must not be empty');
    if (!input.deviceId.trim()) throw new Error('deviceId must not be empty');
    if (!input.otpHash) throw new Error('otpHash must not be empty');
    if (!Number.isInteger(input.maxAttempts) || input.maxAttempts <= 0) {
      throw new RangeError('maxAttempts must be a positive integer');
    }
    if (!Number.isInteger(guard.maxChallenges) || guard.maxChallenges <= 0) {
      throw new RangeError('maxChallenges must be a positive integer');
    }
    if (guard.windowStart.getTime() > guard.now.getTime()) {
      throw new RangeError('rate-limit windowStart must not be after now');
    }
    if (input.expiresAt.getTime() <= guard.now.getTime()) {
      throw new RangeError('OTP challenge expiresAt must be after now');
    }
  }
}

function encodePhoneKey(phoneNumber: string): string {
  return Buffer.from(phoneNumber.trim(), 'utf8').toString('base64url');
}

function challengeKey(id: number): string {
  return `${OTP_NAMESPACE}challenge:${id}`;
}

function publicKey(publicId: string): string {
  return `${OTP_NAMESPACE}public:${publicId}`;
}

function latestByPhoneKey(phoneNumber: string): string {
  return `${OTP_NAMESPACE}phone:${encodePhoneKey(phoneNumber)}:latest`;
}

function rateKey(phoneNumber: string): string {
  return `${OTP_NAMESPACE}rate:${encodePhoneKey(phoneNumber)}`;
}

function parseDate(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('Redis OTP challenge record is corrupt');
  return date;
}
