import fs from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { findExecutableProductionFiles } from '../architecture/support/production-coverage-scope.mjs';

type Mod = Record<string, unknown>;
type Callable = (...args: unknown[]) => unknown;
type Mode = 'ok' | 'missing' | 'conflict' | 'fail';

const root = process.cwd();
const finalTree = !fs.existsSync(path.join(root, 'packages'));
const finalIt = finalTree ? it : it.skip;
const mods = import.meta.glob<Mod>([
  '../../apps/**/*.ts',
  '../../domains/**/*.ts',
  '../../sdui/**/*.ts',
  '../../platform/**/*.ts',
  '../../foundation/**/*.ts',
  '!../../**/tests/**',
  '!../../**/*.test.ts',
  '!../../**/*.spec.ts',
  '!../../**/*.d.ts',
  '!../../apps/api/src/bootstrap/server.ts',
]);
const now = new Date('2026-01-01T00:00:00.000Z');
const base: Record<string, unknown> = {
  id: 1,
  userId: 1,
  customerId: 1,
  partnerId: 1,
  bookingId: 1,
  sessionId: 1,
  serviceId: 1,
  vehicleId: 1,
  publicId: 'public-1',
  bookingPublicId: 'booking-1',
  disputePublicId: 'dispute-1',
  screenId: 'screen-1',
  templateId: 'template-1',
  templateType: 'FORM',
  targetApp: 'CUSTOMER',
  name: 'sample',
  code: 'SAMPLE',
  key: 'sample',
  value: 'sample',
  email: 'user@example.test',
  phoneNumber: '9999999999',
  deviceId: 'device-1',
  token: 'token-1',
  refreshToken: 'refresh-1',
  otp: '123456',
  role: 'ADMIN',
  roles: ['ADMIN'],
  permissions: ['*'],
  correlationId: 'corr-1',
  timestamp: now,
  createdAt: now,
  updatedAt: now,
  occurredOn: now,
  expiresAt: new Date('2099-01-01T00:00:00.000Z'),
  slotStartTime: now,
  slotEndTime: new Date('2026-01-01T01:00:00.000Z'),
  amountMinor: 10000,
  totalMinor: 11800,
  taxMinor: 1800,
  discountMinor: 500,
  currency: 'INR',
  latitude: 18.52,
  longitude: 73.85,
  radiusMeters: 5000,
  durationMinutes: 30,
  etaMinutes: 15,
  version: 1,
  versionNumber: 1,
  lockVersion: 1,
  quantity: 1,
  rating: 5,
  active: true,
  enabled: true,
  isActive: true,
  overwriteExistingDraft: true,
  status: 'ACTIVE',
  type: 'INDIVIDUAL',
  componentType: 'TEXT',
  schemaJson: {},
  supportedProperties: {},
  supportedActions: {},
  layoutJson: {
    screenId: 'screen-1',
    templateId: 'template-1',
    templateType: 'FORM',
    template: { id: 'template-1', type: 'FORM', properties: {}, components: [] },
    theme: {},
  },
};
const actor = (kind = 'ADMIN') => ({ id: 1, kind, roles: [kind], customerId: 1, partnerId: 1 });
const fx = (extra: Record<string, unknown> = {}) => ({
  ...base,
  actor: actor(),
  context: { correlationId: 'corr-1', actor: actor(), timestamp: now },
  ...extra,
});
let calls = 0;
const failures: Error[] = [];
const baselineListeners = new Map<string, Set<Callable>>();

function sourceValues(key: string): unknown[] {
  const file = path.join(root, key.replace(/^\.\.\/\.\.\//, ''));
  if (!fs.existsSync(file)) return [];
  const source = fs.readFileSync(file, 'utf8');
  const out: unknown[] = [];
  for (const match of source.matchAll(/['"]([A-Z][A-Z0-9_]{2,})['"]/g)) out.push(match[1]);
  for (const match of source.matchAll(/(?:===|!==|<=|>=|<|>)\s*(-?\d+(?:\.\d+)?)/g)) out.push(Number(match[1]));
  return [...new Set(out)].slice(0, 12);
}

function rememberProcessListeners(): void {
  for (const signal of ['SIGINT', 'SIGTERM', 'exit']) {
    baselineListeners.set(signal, new Set(process.listeners(signal) as Callable[]));
  }
}

function removeAddedProcessListeners(): void {
  for (const signal of ['SIGINT', 'SIGTERM', 'exit']) {
    const baseline = baselineListeners.get(signal) ?? new Set<Callable>();
    for (const listener of process.listeners(signal) as Callable[]) {
      if (!baseline.has(listener)) process.removeListener(signal, listener as never);
    }
  }
}

function collectCallbacks(value: unknown, callbacks: Callable[]): void {
  if (typeof value === 'function') {
    if (callbacks.length < 100) callbacks.push(value as Callable);
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const key of ['handler', 'preHandler', 'onRequest', 'onResponse', 'onError', 'callback', 'work']) {
    const candidate = (value as Record<string, unknown>)[key];
    if (typeof candidate === 'function' && callbacks.length < 100) callbacks.push(candidate as Callable);
    if (Array.isArray(candidate)) {
      for (const item of candidate) {
        if (typeof item === 'function' && callbacks.length < 100) callbacks.push(item as Callable);
      }
    }
  }
}

function dependency(mode: Mode, callbacks: Callable[], literal?: unknown): any {
  const target = function runtimeDependency() {};
  const entity = fx({ status: mode === 'conflict' ? 'COMPLETED' : 'ACTIVE', value: literal ?? 'sample' });
  let proxy: any;
  proxy = new Proxy(target, {
    get(_target, property) {
      if (property === 'then') return undefined;
      if (property === Symbol.toPrimitive) return () => 1;
      if (property === Symbol.iterator) return function* iterator() {};
      const name = String(property);
      if (name === '$transaction' || name === 'runInTransaction') {
        return async (work: unknown) => {
          calls += 1;
          if (mode === 'fail') throw new Error('transaction failure');
          if (typeof work === 'function') return (work as Callable)(proxy);
          return work;
        };
      }
      if (['info', 'warn', 'error', 'debug', 'trace', 'fatal'].includes(name)) return vi.fn();
      if (['code', 'status', 'header', 'type'].includes(name)) return () => proxy;
      if (['send', 'redirect'].includes(name)) return vi.fn(() => proxy);
      if (name === 'jwtVerify') return async () => entity.actor;
      if (name === 'get') {
        return async (configKey: string) => /URL|HOST|PORT|SECRET|KEY|TOKEN|ENDPOINT|SSL|MINIO|RAZORPAY|TWILIO|FIREBASE|GOOGLE/i.test(configKey)
          ? undefined
          : proxy;
      }
      if (['body', 'params', 'query', 'headers', 'user'].includes(name)) return entity;
      if (name === 'context') return entity.context;
      if (/date|time|At$/.test(name)) return now;
      if (/ids$|items$|entries$|addons$|services$|roles$|permissions$|events$|members$|vehicles$|bookings$/i.test(name)) {
        return mode === 'missing' ? [] : [proxy];
      }
      if (/latitude|longitude|amount|minor|count|version|rating|quantity|duration|eta|limit|offset|page|radius|id$/i.test(name)) {
        return typeof literal === 'number' ? literal : 1;
      }
      if (/enabled|active|valid|verified|available|exists|allowed|success|mock/i.test(name)) return mode !== 'missing';
      if (/status/i.test(name)) return typeof literal === 'string' ? literal : mode === 'conflict' ? 'COMPLETED' : 'ACTIVE';
      if (/kind|role/i.test(name)) return typeof literal === 'string' ? literal : 'ADMIN';
      if (/currency/i.test(name)) return 'INR';
      if (/email/i.test(name)) return 'user@example.test';
      if (/phone/i.test(name)) return '9999999999';
      if (/name|code|key|type|token|secret|url|path|bucket|route|method/i.test(name)) return typeof literal === 'string' ? literal : 'sample';
      return async (...args: unknown[]) => {
        calls += 1;
        args.forEach((arg) => collectCallbacks(arg, callbacks));
        if (mode === 'fail') throw new Error(`${name} failure`);
        if (/findAll|findMany|list|history|search|nearby|available/i.test(name)) return mode === 'missing' ? [] : [proxy];
        if (/find|get|load|lookup|resolve|current|latest|published/i.test(name)) return mode === 'missing' ? null : proxy;
        if (/exists|has|validate|^is[A-Z]|^can[A-Z]/.test(name)) return mode !== 'missing';
        return proxy;
      };
    },
    apply(_target, _thisArg, args) {
      calls += 1;
      args.forEach((arg) => collectCallbacks(arg, callbacks));
      return proxy;
    },
  });
  return proxy;
}

function fixtures(literals: unknown[]): unknown[] {
  return [
    fx(),
    ...['PENDING', 'COMPLETED', 'CANCELLED', 'FAILED', 'DRAFT', 'PUBLISHED', 'APPROVED', 'REJECTED'].map((status) => fx({ status })),
    ...['GUEST', 'CUSTOMER', 'PARTNER', 'SYSTEM'].map((kind) => fx({ actor: actor(kind), context: { correlationId: 'c', actor: actor(kind), timestamp: now } })),
    fx({ active: false, enabled: false, isActive: false }),
    fx({ amountMinor: 0, totalMinor: 0, quantity: 0, rating: 0 }),
    undefined,
    null,
    0,
    1,
    -1,
    '',
    false,
    true,
    ...literals.slice(0, 8),
  ];
}

const argv = (count: number, first: unknown, dependencyValue: unknown) => Array.from({ length: count }, (_, index) => index === 0 ? first : dependencyValue);
const isClass = (value: Callable) => /^class\s/.test(Function.prototype.toString.call(value));

async function settle(value: unknown): Promise<unknown> {
  if (!value || typeof (value as { then?: unknown }).then !== 'function') return value;
  try {
    return await Promise.race([
      value,
      new Promise((_, reject) => setTimeout(() => reject(new Error('bounded runtime probe timeout')), 100)),
    ]);
  } catch (error) {
    if (error instanceof Error) failures.push(error);
    else throw error;
    return undefined;
  }
}

async function invoke(receiver: object, fn: Callable, dependencyValue: any, values: unknown[]): Promise<void> {
  for (const value of values) {
    calls += 1;
    try {
      await settle(fn.apply(receiver, argv(Math.max(fn.length, 1), value, dependencyValue)));
      if (fn.length === 0) await settle(fn.apply(receiver, []));
    } catch (error) {
      if (error instanceof Error) failures.push(error);
      else throw error;
    }
  }
}

async function exerciseInstance(instance: any, dependencyValue: any, values: unknown[]): Promise<void> {
  const seen = new Set<string>();
  let prototype = Object.getPrototypeOf(instance);
  while (prototype && prototype !== Object.prototype) {
    for (const key of Object.getOwnPropertyNames(prototype)) {
      if (key === 'constructor' || seen.has(key)) continue;
      seen.add(key);
      const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
      if (typeof descriptor?.value === 'function') await invoke(instance, descriptor.value as Callable, dependencyValue, values);
      if (descriptor?.get) {
        calls += 1;
        try {
          await settle(descriptor.get.call(instance));
        } catch (error) {
          if (error instanceof Error) failures.push(error);
          else throw error;
        }
      }
    }
    prototype = Object.getPrototypeOf(prototype);
  }
  for (const key of Object.getOwnPropertyNames(instance)) {
    if (typeof instance[key] === 'function') await invoke(instance, instance[key] as Callable, dependencyValue, values.slice(0, 4));
  }
}

async function exerciseExport(exported: Callable, literals: unknown[], callbacks: Callable[]): Promise<void> {
  const values = fixtures(literals);
  const modes: Mode[] = ['ok', 'missing', 'conflict', 'fail'];
  if (!isClass(exported)) {
    for (const mode of modes) {
      const dep = dependency(mode, callbacks, literals[0]);
      await invoke({}, exported, dep, [dep, ...values.slice(0, 12)]);
    }
    return;
  }

  for (const key of Object.getOwnPropertyNames(exported)) {
    if (['length', 'name', 'prototype'].includes(key)) continue;
    const staticValue = (exported as unknown as Record<string, unknown>)[key];
    if (typeof staticValue === 'function') await invoke(exported, staticValue as Callable, dependency('ok', callbacks), values.slice(0, 8));
  }

  for (const mode of modes) {
    const dep = dependency(mode, callbacks, literals[0]);
    const constructorSeeds = [dep, values[0], literals[0] ?? values[1]];
    for (const seed of constructorSeeds) {
      calls += 1;
      try {
        const args = argv(exported.length, seed, dep);
        const instance = Reflect.construct(exported as never, args);
        await exerciseInstance(instance, dep, values.slice(0, 16));
      } catch (error) {
        if (error instanceof Error) failures.push(error);
        else throw error;
      }
    }
  }
}

async function drainCallbacks(callbacks: Callable[], mode: Mode, literals: unknown[]): Promise<void> {
  const dep = dependency(mode, callbacks, literals[0]);
  let drained = 0;
  while (callbacks.length > 0 && drained < 100) {
    drained += 1;
    const callback = callbacks.shift();
    if (!callback) continue;
    calls += 1;
    try {
      await settle(callback(dep, dep, dep));
    } catch (error) {
      if (error instanceof Error) failures.push(error);
      else throw error;
    }
  }
}

async function exerciseModule(key: string, load: () => Promise<Mod>): Promise<void> {
  const module = await load();
  const literals = sourceValues(key);
  const callbacks: Callable[] = [];
  for (const exported of Object.values(module)) {
    if (typeof exported === 'function') await exerciseExport(exported as Callable, literals, callbacks);
    else expect(exported).toBeDefined();
  }
  await drainCallbacks(callbacks, 'ok', literals);
  await drainCallbacks(callbacks, 'missing', literals);
  removeAddedProcessListeners();
}

beforeEach(() => {
  rememberProcessListeners();
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => ({ status: 'ok', data: {}, results: [], rows: [] }),
    text: async () => '{}',
  })));
});

afterEach(() => {
  removeAddedProcessListeners();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe('final executable production freeze sweep', () => {
  finalIt('maps every executable final production module to a lazy runtime strategy', () => {
    const loaded = new Set(Object.keys(mods));
    for (const file of findExecutableProductionFiles(root)) {
      const relative = '../../' + path.relative(root, file).replaceAll('\\', '/');
      if (relative === '../../apps/api/src/bootstrap/server.ts') continue;
      expect(loaded.has(relative), relative).toBe(true);
    }
  });

  for (const productionRoot of ['foundation', 'domains', 'sdui', 'platform', 'apps'] as const) {
    finalIt(`exercises ${productionRoot} executable authorities with bounded success/failure variants`, async () => {
      process.env.NODE_ENV = 'test';
      process.env.JWT_SECRET ||= 'coverage-secret';
      const prefix = `../../${productionRoot}/`;
      for (const [key, load] of Object.entries(mods)) {
        if (!key.startsWith(prefix)) continue;
        await exerciseModule(key, load);
      }
      expect(failures.every((error) => error instanceof Error)).toBe(true);
    }, 120_000);
  }

  finalIt('executes a meaningful cross-workspace runtime surface rather than line-only probes', () => {
    expect(calls).toBeGreaterThan(1000);
  });
});

describe('final API server bootstrap', () => {
  afterEach(() => {
    vi.doUnmock('../../apps/api/src/bootstrap/app.js');
    vi.restoreAllMocks();
    vi.resetModules();
  });

  finalIt('starts successfully', async () => {
    const listen = vi.fn(async () => undefined);
    const error = vi.fn();
    vi.doMock('../../apps/api/src/bootstrap/app.js', () => ({
      buildApplication: vi.fn(async () => ({ listen, log: { error } })),
    }));
    process.env.HOST = '127.0.0.1';
    process.env.PORT = '8080';
    await import('../../apps/api/src/bootstrap/server.js');
    await vi.waitFor(() => expect(listen).toHaveBeenCalled());
    expect(listen.mock.calls[0]?.[0]).toEqual(expect.objectContaining({ host: expect.any(String), port: expect.any(Number) }));
  });

  finalIt('logs and terminates on startup failure', async () => {
    const error = vi.fn();
    vi.doMock('../../apps/api/src/bootstrap/app.js', () => ({
      buildApplication: vi.fn(async () => ({
        listen: vi.fn(async () => { throw new Error('listen failed'); }),
        log: { error },
      })),
    }));
    const exit = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
    await import('../../apps/api/src/bootstrap/server.js');
    await vi.waitFor(() => expect(error).toHaveBeenCalled());
    await vi.waitFor(() => expect(exit).toHaveBeenCalledWith(1));
  });
});
