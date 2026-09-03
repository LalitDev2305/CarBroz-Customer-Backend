import { ResponseHelper } from '../response/ResponseHelper.js';
import { FastifyRequest, FastifyReply } from 'fastify';
import { GeocodeAddressUseCase } from '@carbroz/domain-operations';
import { ReverseGeocodeUseCase } from '@carbroz/domain-operations';
import { CalculateDistanceUseCase } from '@carbroz/domain-operations';
import { geocodeSchema, reverseGeocodeSchema, calculateDistanceSchema } from '../dtos/maps.dto.js';
import { type IRequestContext } from '@carbroz/foundation-kernel';

export class MapsController {
  public geocode = async (request: FastifyRequest, reply: FastifyReply) => {
    const input = geocodeSchema.parse(request.query);
    const context = {
      traceId: request.traceId,
      authenticatedUser: request.user as any
    } as IRequestContext;
    
    const useCase = request.diScope.resolve<GeocodeAddressUseCase>('geocodeAddressUseCase');
    const result = await useCase.execute({ context, data: input });
    
    return reply.status(200).send(ResponseHelper.success(result, "Geocoded successfully"));
  };

  public reverseGeocode = async (request: FastifyRequest, reply: FastifyReply) => {
    const input = reverseGeocodeSchema.parse(request.query);
    const context = {
      traceId: request.traceId,
      authenticatedUser: request.user as any
    } as IRequestContext;
    
    const useCase = request.diScope.resolve<ReverseGeocodeUseCase>('reverseGeocodeUseCase');
    const result = await useCase.execute({ context, data: input });
    
    return reply.status(200).send(ResponseHelper.success(result, "Reverse geocoded successfully"));
  };

  public calculateDistance = async (request: FastifyRequest, reply: FastifyReply) => {
    const input = calculateDistanceSchema.parse(request.query);
    const context = {
      traceId: request.traceId,
      authenticatedUser: request.user as any
    } as IRequestContext;
    
    const useCase = request.diScope.resolve<CalculateDistanceUseCase>('calculateDistanceUseCase');
    const result = await useCase.execute({ context, data: input });
    
    return reply.status(200).send(ResponseHelper.success(result, "Distance calculated successfully"));
  };
}
