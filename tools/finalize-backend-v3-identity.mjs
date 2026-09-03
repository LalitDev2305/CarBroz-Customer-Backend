import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const p = (...parts) => path.join(root, ...parts);
const write = (relative, content) => {
  const file = p(relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};
const patch = (relative, transform) => {
  const file = p(relative);
  if (!fs.existsSync(file)) return;
  const before = fs.readFileSync(file, 'utf8');
  const after = transform(before);
  if (after !== before) fs.writeFileSync(file, after);
};

// Identity application owns its input contracts. API/Zod schemas remain transport-only.
write('domains/identity/application/GuestLoginUseCase.ts', `import { IUseCase, IUserRepository, IUserSessionRepository } from '@carbroz/common';

interface Input {
  deviceId: string;
  deviceModel?: string;
  osVersion?: string;
  fcmToken?: string;
}

export class GuestLoginUseCase implements IUseCase<Input, any> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userSessionRepository: IUserSessionRepository
  ) {}

  async execute(input: Input): Promise<any> {
    const { deviceId, deviceModel, osVersion, fcmToken } = input;
    const guestUser = await this.userRepository.upsert(\`guest_\${Date.now()}\`, {
      isGuest: true,
      role: 'GUEST',
    });

    const newSession = await this.userSessionRepository.upsert(guestUser.id, deviceId, {
      ...(deviceModel !== undefined ? { deviceModel } : {}),
      ...(osVersion !== undefined ? { osVersion } : {}),
      ...(fcmToken !== undefined ? { fcmToken } : {}),
    });

    return { user: guestUser, session: newSession };
  }
}
`);

write('domains/identity/application/LogoutUseCase.ts', `import { IUseCase, IUserSessionRepository } from '@carbroz/common';

interface Input {
  deviceId?: string;
  sessionId?: number;
  userId?: number;
  logoutAll?: boolean;
}

export class LogoutUseCase implements IUseCase<Input, void> {
  constructor(private readonly userSessionRepository: IUserSessionRepository) {}

  async execute(input: Input): Promise<void> {
    const { sessionId, userId, logoutAll } = input;
    if (logoutAll && userId) {
      await this.userSessionRepository.revokeAllForUser(userId);
    } else if (sessionId) {
      await this.userSessionRepository.save({
        id: sessionId,
        isRevoked: true,
        refreshToken: null,
      } as any);
    }
  }
}
`);

write('domains/identity/application/VerifyOtpUseCase.ts', `import { IUseCase, IUserRepository, IUserSessionRepository, ValidationError } from '@carbroz/common';

interface Input {
  phoneNumber: string;
  otp: string;
  deviceId: string;
  deviceModel?: string;
  osVersion?: string;
  fcmToken?: string;
}

export class VerifyOtpUseCase implements IUseCase<Input, any> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userSessionRepository: IUserSessionRepository
  ) {}

  async execute(input: Input): Promise<any> {
    const { phoneNumber, otp, deviceId, deviceModel, osVersion, fcmToken } = input;
    if (otp !== '123456' && otp !== '111111') {
      throw new ValidationError('Invalid OTP');
    }

    const user = await this.userRepository.upsert(phoneNumber, {
      role: 'USER',
      isGuest: false,
    });
    const refreshToken = \`rt_\${Buffer.from(user.id + Date.now().toString()).toString('base64')}\`;
    const session = await this.userSessionRepository.upsert(user.id, deviceId, {
      ...(deviceModel !== undefined ? { deviceModel } : {}),
      ...(osVersion !== undefined ? { osVersion } : {}),
      ...(fcmToken !== undefined ? { fcmToken } : {}),
      refreshToken,
    });

    return {
      user,
      session,
      nextScreen: { template: 'dashboard_template', api: 'home' },
    };
  }
}
`);

const authInputs = new Map([
  ['RefreshTokenUseCase.ts', `interface Input {\n  refreshToken: string;\n  deviceId: string;\n}\n`],
  ['SendOtpUseCase.ts', `interface Input {\n  phoneNumber: string;\n  deviceId: string;\n}\n`],
]);
for (const [name, declaration] of authInputs) {
  patch(`domains/identity/application/${name}`, (text) => {
    text = text.replace(/^import \{ z \} from 'zod';\r?\n/m, '');
    text = text.replace(/^import .*auth\.dto\.js.*\r?\n/m, '');
    text = text.replace(/^type Input = .*;\r?\n/m, declaration);
    return text;
  });
}

// Prisma nullable fields may be null, but exactOptionalPropertyTypes forbids
// explicitly passing undefined. Omit undefined updates and normalize nullable
// create values to null.
patch('domains/identity/infrastructure/repositories/PrismaUserRepository.ts', (text) => {
  text = text
    .replace('email: data.email,\n        phoneNumber: data.phoneNumber,', 'email: data.email ?? null,\n        phoneNumber: data.phoneNumber ?? null,')
    .replace(
      /data: \{\n\s*email: data\.email,\n\s*phoneNumber: data\.phoneNumber,\n\s*isGuest: data\.isGuest,\n\s*role: data\.role,\n\s*\}/,
      `data: {\n        ...(data.email !== undefined ? { email: data.email } : {}),\n        ...(data.phoneNumber !== undefined ? { phoneNumber: data.phoneNumber } : {}),\n        ...(data.isGuest !== undefined ? { isGuest: data.isGuest } : {}),\n        ...(data.role !== undefined ? { role: data.role } : {}),\n      }`,
    )
    .replace(
      /update: \{\n\s*email: data\.email,\n\s*isGuest: data\.isGuest,\n\s*role: data\.role,\n\s*\}/,
      `update: {\n        ...(data.email !== undefined ? { email: data.email } : {}),\n        ...(data.isGuest !== undefined ? { isGuest: data.isGuest } : {}),\n        ...(data.role !== undefined ? { role: data.role } : {}),\n      }`,
    )
    .replace('email: data.email,\n        isGuest: data.isGuest ?? false,', 'email: data.email ?? null,\n        isGuest: data.isGuest ?? false,');
  return text;
});

patch('domains/identity/infrastructure/repositories/PrismaUserSessionRepository.ts', (text) => {
  for (const name of ['deviceModel', 'osVersion', 'fcmToken', 'refreshToken']) {
    text = text.replace(new RegExp(`${name}: data\\.${name},`, 'g'), `${name}: data.${name} ?? null,`);
  }

  text = text.replace(
    /data: \{\n\s*deviceModel: data\.deviceModel \?\? null,\n\s*osVersion: data\.osVersion \?\? null,\n\s*fcmToken: data\.fcmToken \?\? null,\n\s*refreshToken: data\.refreshToken \?\? null,\n\s*isRevoked: data\.isRevoked,\n\s*lastActiveAt: data\.lastActiveAt,\n\s*\}/,
    `data: {\n        ...(data.deviceModel !== undefined ? { deviceModel: data.deviceModel } : {}),\n        ...(data.osVersion !== undefined ? { osVersion: data.osVersion } : {}),\n        ...(data.fcmToken !== undefined ? { fcmToken: data.fcmToken } : {}),\n        ...(data.refreshToken !== undefined ? { refreshToken: data.refreshToken } : {}),\n        ...(data.isRevoked !== undefined ? { isRevoked: data.isRevoked } : {}),\n        ...(data.lastActiveAt !== undefined ? { lastActiveAt: data.lastActiveAt } : {}),\n      }`,
  );

  text = text.replace(
    /update: \{\n\s*deviceModel: data\.deviceModel \?\? null,\n\s*osVersion: data\.osVersion \?\? null,\n\s*fcmToken: data\.fcmToken \?\? null,\n\s*refreshToken: data\.refreshToken \?\? null,\n\s*lastActiveAt: new Date\(\),\n\s*isRevoked: false\n\s*\}/,
    `update: {\n        ...(data.deviceModel !== undefined ? { deviceModel: data.deviceModel } : {}),\n        ...(data.osVersion !== undefined ? { osVersion: data.osVersion } : {}),\n        ...(data.fcmToken !== undefined ? { fcmToken: data.fcmToken } : {}),\n        ...(data.refreshToken !== undefined ? { refreshToken: data.refreshToken } : {}),\n        lastActiveAt: new Date(),\n        isRevoked: false\n      }`,
  );
  return text;
});

patch('domains/identity/infrastructure/repositories/PrismaAdminRoleRepository.ts', (text) =>
  text.replace(/records\.map\(r => r\.roleId\)/g, 'records.map((r: { roleId: number }) => r.roleId)')
);
patch('domains/identity/infrastructure/repositories/PrismaRoleRepository.ts', (text) =>
  text.replace(/role\.permissions\.map\(p => p\.permissionId\)/g, 'role.permissions.map((p: { permissionId: number }) => p.permissionId)')
);

console.log('Backend V3 Identity bounded context finalized.');
