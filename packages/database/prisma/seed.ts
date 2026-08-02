import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const systemRoles = [
    { name: 'SUPER_ADMIN', description: 'Has access to all features', isSystem: true },
    { name: 'OPERATIONS_ADMIN', description: 'Can manage operations and bookings', isSystem: true },
    { name: 'SUPPORT_ADMIN', description: 'Can manage customer support queries', isSystem: true }
  ];

  const permissions = [
    { key: 'users.manage', module: 'Users', description: 'Manage all users' },
    { key: 'partners.manage', module: 'Partners', description: 'Manage all partners' },
    { key: 'bookings.manage', module: 'Bookings', description: 'Manage all bookings' },
    { key: 'pricing.manage', module: 'Pricing', description: 'Manage pricing rules' },
    { key: 'services.manage', module: 'Services', description: 'Manage catalog services' },
    { key: 'analytics.view', module: 'Analytics', description: 'View analytics' },
    { key: 'payments.manage', module: 'Payments', description: 'Manage payments' },
    { key: 'wallet.manage', module: 'Wallet', description: 'Manage wallets' },
    { key: 'coupons.manage', module: 'Coupons', description: 'Manage coupons' },
    { key: 'settings.manage', module: 'Settings', description: 'Manage global settings' },
    { key: 'feature_flags.manage', module: 'Feature Flags', description: 'Manage feature flags' },
    { key: 'configurations.manage', module: 'Configurations', description: 'Manage configurations' }
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { key: p.key },
      update: {},
      create: p
    });
  }

  for (const r of systemRoles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r
    });
  }

  const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
  const allPermissions = await prisma.permission.findMany();

  if (superAdminRole && allPermissions.length > 0) {
    for (const p of allPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: p.id
          }
        },
        update: {},
        create: {
          roleId: superAdminRole.id,
          permissionId: p.id
        }
      });
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
