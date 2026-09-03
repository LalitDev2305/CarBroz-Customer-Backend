import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const p = (...parts) => path.join(root, ...parts);
const patch = (relative, transform) => {
  const file = p(relative);
  if (!fs.existsSync(file)) return;
  const before = fs.readFileSync(file, 'utf8');
  const after = transform(before);
  if (after !== before) fs.writeFileSync(file, after);
};

const authInputs = new Map([
  ['GuestLoginUseCase.ts', `interface Input {\n  deviceId: string;\n  deviceModel?: string;\n  osVersion?: string;\n  fcmToken?: string;\n}\n`],
  ['LogoutUseCase.ts', `interface Input {\n  deviceId?: string;\n  sessionId?: number;\n  userId?: number;\n  logoutAll?: boolean;\n}\n`],
  ['RefreshTokenUseCase.ts', `interface Input {\n  refreshToken: string;\n  deviceId: string;\n}\n`],
  ['SendOtpUseCase.ts', `interface Input {\n  phoneNumber: string;\n  deviceId: string;\n}\n`],
  ['VerifyOtpUseCase.ts', `interface Input {\n  phoneNumber: string;\n  otp: string;\n  deviceId: string;\n  deviceModel?: string;\n  osVersion?: string;\n  fcmToken?: string;\n}\n`],
]);

for (const [name, declaration] of authInputs) {
  patch(`domains/identity/application/${name}`, (text) => {
    text = text.replace(/^import \{ z \} from 'zod';\n/m, '');
    text = text.replace(/^import .*auth\.dto\.js.*\n/m, '');
    text = text.replace(/^type Input = z\.infer<[^;]+>;\n/m, declaration);
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

  // Update operations must distinguish omission from clearing a nullable field.
  text = text.replace(
    /data: \{\n\s*deviceModel: data\.deviceModel \?\? null,\n\s*osVersion: data\.osVersion \?\? null,\n\s*fcmToken: data\.fcmToken \?\? null,\n\s*refreshToken: data\.refreshToken \?\? null,\n\s*isRevoked: data\.isRevoked,\n\s*lastActiveAt: data\.lastActiveAt,\n\s*\}/,
    `data: {\n        ...(data.deviceModel !== undefined ? { deviceModel: data.deviceModel } : {}),\n        ...(data.osVersion !== undefined ? { osVersion: data.osVersion } : {}),\n        ...(data.fcmToken !== undefined ? { fcmToken: data.fcmToken } : {}),\n        ...(data.refreshToken !== undefined ? { refreshToken: data.refreshToken } : {}),\n        ...(data.isRevoked !== undefined ? { isRevoked: data.isRevoked } : {}),\n        ...(data.lastActiveAt !== undefined ? { lastActiveAt: data.lastActiveAt } : {}),\n      }`,
  );

  // Upsert update: preserve unspecified nullable metadata instead of clearing it.
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
