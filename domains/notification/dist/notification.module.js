import { asClass } from 'awilix';
import { PrismaNotificationLogRepository } from './infrastructure/repositories/PrismaNotificationLogRepository.js';
import { PrismaDeviceTokenRepository } from './infrastructure/repositories/PrismaDeviceTokenRepository.js';
export function registerNotificationModule(container) {
    container.register({
        notificationLogRepository: asClass(PrismaNotificationLogRepository).singleton(),
        deviceTokenRepository: asClass(PrismaDeviceTokenRepository).singleton(),
    });
}
//# sourceMappingURL=notification.module.js.map