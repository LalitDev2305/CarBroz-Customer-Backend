import { asClass } from 'awilix';
import { PrismaBookingRepository } from './infrastructure/repositories/PrismaBookingRepository.js';
export function registerBookingModule(container) {
    container.register({
        bookingRepository: asClass(PrismaBookingRepository).singleton(),
    });
}
//# sourceMappingURL=booking.module.js.map