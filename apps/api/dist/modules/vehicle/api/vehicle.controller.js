import { ResponseHelper } from '@carbroz/foundation-kernel';
import { createVehicleSchema } from '../dtos/vehicle.dto.js';
export class VehicleController {
    createVehicleUseCase;
    listCustomerVehiclesUseCase;
    setDefaultVehicleUseCase;
    archiveVehicleUseCase;
    constructor(createVehicleUseCase, listCustomerVehiclesUseCase, setDefaultVehicleUseCase, archiveVehicleUseCase) {
        this.createVehicleUseCase = createVehicleUseCase;
        this.listCustomerVehiclesUseCase = listCustomerVehiclesUseCase;
        this.setDefaultVehicleUseCase = setDefaultVehicleUseCase;
        this.archiveVehicleUseCase = archiveVehicleUseCase;
    }
    async createVehicle(request, reply) {
        const customerId = request.user?.customerId || request.user?.id || 1;
        const body = createVehicleSchema.parse(request.body);
        const vehicle = await this.createVehicleUseCase.execute({
            ...body,
            customerId,
        });
        return reply.status(201).send(ResponseHelper.created(vehicle, 'Vehicle registered successfully'));
    }
    async listVehicles(request, reply) {
        const customerId = request.user?.customerId || request.user?.id || 1;
        const vehicles = await this.listCustomerVehiclesUseCase.execute(customerId);
        return reply.send(ResponseHelper.success(vehicles));
    }
    async setDefaultVehicle(request, reply) {
        const customerId = request.user?.customerId || request.user?.id || 1;
        const vehicle = await this.setDefaultVehicleUseCase.execute(request.params.publicId, customerId);
        return reply.send(ResponseHelper.success(vehicle, 'Default vehicle updated'));
    }
    async archiveVehicle(request, reply) {
        const customerId = request.user?.customerId || request.user?.id || 1;
        await this.archiveVehicleUseCase.execute(request.params.publicId, customerId);
        return reply.send(ResponseHelper.success(null, 'Vehicle archived'));
    }
}
//# sourceMappingURL=vehicle.controller.js.map