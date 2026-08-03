import { registerIndividualPartnerSchema, registerOrganizationPartnerSchema } from '../dtos/partner.dto.js';
import { ResponseHelper } from '@carbroz/common';
export class PartnerController {
    registerIndividual = async (request, reply) => {
        const input = registerIndividualPartnerSchema.parse(request.body);
        const context = {
            traceId: request.traceId,
            authenticatedUser: request.user
        };
        const useCase = request.diScope.resolve('registerIndividualPartnerUseCase');
        const result = await useCase.execute({ context, data: input });
        return reply.status(201).send(ResponseHelper.success(result, "Partner registered successfully"));
    };
    registerOrganization = async (request, reply) => {
        const input = registerOrganizationPartnerSchema.parse(request.body);
        const context = {
            traceId: request.traceId,
            authenticatedUser: request.user
        };
        const useCase = request.diScope.resolve('registerOrganizationPartnerUseCase');
        const result = await useCase.execute({ context, data: input });
        return reply.status(201).send(ResponseHelper.success(result, "Partner registered successfully"));
    };
    getProfile = async (request, reply) => {
        const context = {
            traceId: request.traceId,
            authenticatedUser: request.user
        };
        const useCase = request.diScope.resolve('getPartnerProfileUseCase');
        const result = await useCase.execute({ context });
        return reply.status(200).send(ResponseHelper.success(result, "Partner profile retrieved"));
    };
}
//# sourceMappingURL=partner.controller.js.map