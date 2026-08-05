import { asClass, type AwilixContainer } from 'awilix';
import { PrismaNotificationLogRepository } from './infrastructure/repositories/PrismaNotificationLogRepository.js';
import { PrismaDeviceTokenRepository } from './infrastructure/repositories/PrismaDeviceTokenRepository.js';

export function registerNotificationModule(container: AwilixContainer): void {
  container.register({
    notificationLogRepository: asClass(PrismaNotificationLogRepository).singleton(),
    deviceTokenRepository: asClass(PrismaDeviceTokenRepository).singleton(),
  });
}
