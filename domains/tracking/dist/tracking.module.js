import { asClass } from 'awilix';
import { PrismaTrackingSessionRepository } from './infrastructure/repositories/PrismaTrackingSessionRepository.js';
export function registerTrackingModule(container) {
    container.register({
        trackingSessionRepository: asClass(PrismaTrackingSessionRepository).singleton(),
    });
}
//# sourceMappingURL=tracking.module.js.map