import { asClass, type AwilixContainer } from 'awilix';
import { PrismaNotificationLogRepository } from './infrastructure/repositories/PrismaNotificationLogRepository.js';
import { PrismaDeviceTokenRepository } from './infrastructure/repositories/PrismaDeviceTokenRepository.js';

/** registerNotificationModule is an exported domains/communications contract/implementation; see the owning README for lifecycle and extension rules. */
export function registerNotificationModule(container: AwilixContainer): void {
  container.register({
    notificationLogRepository: asClass(PrismaNotificationLogRepository).singleton(),
    deviceTokenRepository: asClass(PrismaDeviceTokenRepository).singleton(),
  });
}
