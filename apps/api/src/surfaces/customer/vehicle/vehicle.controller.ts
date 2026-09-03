import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ArchiveVehicleUseCase, CreateVehicleUseCase, ListCustomerVehiclesUseCase, SetDefaultVehicleUseCase } from '@carbroz/domain-customer';
import { createVehicleSchema } from './dto/vehicle.dto.js';

export class VehicleController {
  constructor(
    private readonly createVehicleUseCase: CreateVehicleUseCase,
    private readonly listCustomerVehiclesUseCase: ListCustomerVehiclesUseCase,
    private readonly setDefaultVehicleUseCase: SetDefaultVehicleUseCase,
    private readonly archiveVehicleUseCase: ArchiveVehicleUseCase
  ) {}

  async createVehicle(request: FastifyRequest, reply: FastifyReply) {
    const customerId = (request as any).user?.customerId || (request as any).user?.id || 1;
    const body = createVehicleSchema.parse(request.body);

    const vehicle = await this.createVehicleUseCase.execute({
      ...body,
      customerId,
    });

    return reply.status(201).send(ResponseHelper.created(vehicle, 'Vehicle registered successfully'));
  }

  async listVehicles(request: FastifyRequest, reply: FastifyReply) {
    const customerId = (request as any).user?.customerId || (request as any).user?.id || 1;
    const vehicles = await this.listCustomerVehiclesUseCase.execute(customerId);
    return reply.send(ResponseHelper.success(vehicles));
  }

  async setDefaultVehicle(request: FastifyRequest<{ Params: { publicId: string } }>, reply: FastifyReply) {
    const customerId = (request as any).user?.customerId || (request as any).user?.id || 1;
    const vehicle = await this.setDefaultVehicleUseCase.execute(request.params.publicId, customerId);
    return reply.send(ResponseHelper.success(vehicle, 'Default vehicle updated'));
  }

  async archiveVehicle(request: FastifyRequest<{ Params: { publicId: string } }>, reply: FastifyReply) {
    const customerId = (request as any).user?.customerId || (request as any).user?.id || 1;
    await this.archiveVehicleUseCase.execute(request.params.publicId, customerId);
    return reply.send(ResponseHelper.success(null, 'Vehicle archived'));
  }
}
