import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Maintenance Mode
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

  // 2. Android Force Update
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

  // 3. iOS Force Update
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

  // 4. Feature Flags
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
