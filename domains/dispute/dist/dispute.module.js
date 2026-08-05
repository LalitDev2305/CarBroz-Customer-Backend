import { asClass } from 'awilix';
import { PrismaDisputeRepository } from './infrastructure/repositories/PrismaDisputeRepository.js';
export function registerDisputeModule(container) {
    container.register({
        disputeRepository: asClass(PrismaDisputeRepository).singleton(),
    });
}
//# sourceMappingURL=dispute.module.js.map