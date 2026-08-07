import { geocodeSchema, reverseGeocodeSchema, calculateDistanceSchema } from '../dtos/maps.dto.js';
import { ResponseHelper } from '@carbroz/foundation-kernel';
export class MapsController {
    geocode = async (request, reply) => {
        const input = geocodeSchema.parse(request.query);
        const context = {
            traceId: request.traceId,
            authenticatedUser: request.user
        };
        const useCase = request.diScope.resolve('geocodeAddressUseCase');
        const result = await useCase.execute({ context, data: input });
        return reply.status(200).send(ResponseHelper.success(result, "Geocoded successfully"));
    };
    reverseGeocode = async (request, reply) => {
        const input = reverseGeocodeSchema.parse(request.query);
        const context = {
            traceId: request.traceId,
            authenticatedUser: request.user
        };
        const useCase = request.diScope.resolve('reverseGeocodeUseCase');
        const result = await useCase.execute({ context, data: input });
        return reply.status(200).send(ResponseHelper.success(result, "Reverse geocoded successfully"));
    };
    calculateDistance = async (request, reply) => {
        const input = calculateDistanceSchema.parse(request.query);
        const context = {
            traceId: request.traceId,
            authenticatedUser: request.user
        };
        const useCase = request.diScope.resolve('calculateDistanceUseCase');
        const result = await useCase.execute({ context, data: input });
        return reply.status(200).send(ResponseHelper.success(result, "Distance calculated successfully"));
    };
}
//# sourceMappingURL=maps.controller.js.map