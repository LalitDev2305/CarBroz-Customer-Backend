import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateVehicleUseCase } from '../use-cases/CreateVehicleUseCase.js';
import { ListCustomerVehiclesUseCase } from '../use-cases/ListCustomerVehiclesUseCase.js';
import { SetDefaultVehicleUseCase } from '../use-cases/SetDefaultVehicleUseCase.js';
import { ArchiveVehicleUseCase } from '../use-cases/ArchiveVehicleUseCase.js';
export declare class VehicleController {
    private readonly createVehicleUseCase;
    private readonly listCustomerVehiclesUseCase;
    private readonly setDefaultVehicleUseCase;
    private readonly archiveVehicleUseCase;
    constructor(createVehicleUseCase: CreateVehicleUseCase, listCustomerVehiclesUseCase: ListCustomerVehiclesUseCase, setDefaultVehicleUseCase: SetDefaultVehicleUseCase, archiveVehicleUseCase: ArchiveVehicleUseCase);
    createVehicle(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    listVehicles(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    setDefaultVehicle(request: FastifyRequest<{
        Params: {
            publicId: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    archiveVehicle(request: FastifyRequest<{
        Params: {
            publicId: string;
        };
    }>, reply: FastifyReply): Promise<never>;
}
