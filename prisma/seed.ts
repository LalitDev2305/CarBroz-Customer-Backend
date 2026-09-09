import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Seed SystemConfig (Maintenance Mode)
  await prisma.systemConfig.upsert({
    where: { key: 'maintenance.enabled' },
    update: {},
    create: {
      key: 'maintenance.enabled',
      value: 'false',
      description: 'Is maintenance mode enabled?',
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'maintenance.message' },
    update: {},
    create: {
      key: 'maintenance.message',
      value: 'System is under maintenance. Please try again later.',
      description: 'Message shown when maintenance is enabled.',
    },
  });

  // Android Force Update
  await prisma.systemConfig.upsert({
    where: { key: 'android.minVersion' },
    update: {},
    create: {
      key: 'android.minVersion',
      value: '1.0.0',
      description: 'Minimum required Android app version.',
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'android.latestVersion' },
    update: {},
    create: {
      key: 'android.latestVersion',
      value: '1.0.0',
      description: 'Latest Android app version.',
    },
  });

  // iOS Force Update
  await prisma.systemConfig.upsert({
    where: { key: 'ios.minVersion' },
    update: {},
    create: {
      key: 'ios.minVersion',
      value: '1.0.0',
      description: 'Minimum required iOS app version.',
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'ios.latestVersion' },
    update: {},
    create: {
      key: 'ios.latestVersion',
      value: '1.0.0',
      description: 'Latest iOS app version.',
    },
  });

  // 2. Seed FeatureFlags
  await prisma.featureFlag.upsert({
    where: { key: 'wallet' },
    update: {},
    create: {
      key: 'wallet',
      enabled: true,
      description: 'Enable wallet feature',
    },
  });

  await prisma.featureFlag.upsert({
    where: { key: 'subscriptions' },
    update: {},
    create: {
      key: 'subscriptions',
      enabled: false,
      description: 'Enable subscriptions feature',
    },
  });

  // 3. Seed Roles
  const systemRoles = [
    { name: 'SUPER_ADMIN', description: 'Has access to all features', isSystem: true },
    { name: 'OPERATIONS_ADMIN', description: 'Can manage operations and bookings', isSystem: true },
    { name: 'SUPPORT_ADMIN', description: 'Can manage customer support queries', isSystem: true }
  ];

  for (const r of systemRoles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r
    });
  }

  // 4. Seed Permissions
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

  // 5. Seed RolePermission mappings
  const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
  const allPermissions = await prisma.permission.findMany();

  // 6. Seed Super Admin assignment (mapping all permissions to super admin)
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

  // 7. Provision the reserved authenticated Partner startup screen as a published registry document.
  const partnerDashboard = {
    screenId: 'partner_dashboard',
    schemaVersion: '3.0.0',
    targetApp: 'PARTNER',
    theme: { theme: 'light', statusBar: 'transparent' },
    template: {
      id: 'partner_dashboard_template',
      type: 'default_template',
      properties: {
        orientation: 'vertical',
        fillMaxSize: true,
        padding: { start: 24, top: 24, end: 24, bottom: 24 },
      },
      components: [{
        id: 'dashboard_shell',
        type: 'stack_component',
        properties: {
          orientation: 'vertical',
          verticalArrangement: { type: 'spacedBy', spacing: 8 },
          fillMaxWidth: true,
        },
        elements: [
          { id: 'dashboard_title', type: 'text', properties: { text: 'Partner Dashboard', fontSize: 28, fontWeight: 700, color: '#101522' } },
          { id: 'dashboard_status', type: 'text', properties: { text: 'Your workspace is ready.', fontSize: 15, fontWeight: 400, color: '#6B7078' } },
        ],
      }],
    },
  };

  await prisma.sduiScreen.upsert({
    where: {
      screenId_targetApp_versionNumber: {
        screenId: 'partner_dashboard',
        targetApp: 'PARTNER',
        versionNumber: 1,
      },
    },
    update: {
      status: 'PUBLISHED',
      layoutJson: partnerDashboard,
      publishedAt: new Date(),
      publishedBy: 'system-seed',
      changeDescription: 'Canonical authenticated Partner startup shell',
    },
    create: {
      screenId: 'partner_dashboard',
      targetApp: 'PARTNER',
      versionNumber: 1,
      status: 'PUBLISHED',
      layoutJson: partnerDashboard,
      lockVersion: 1,
      publishedAt: new Date(),
      publishedBy: 'system-seed',
      changeDescription: 'Canonical authenticated Partner startup shell',
    },
  });

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
