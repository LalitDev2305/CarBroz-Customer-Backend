import { ResponseHelper } from '@carbroz/common';
import { getSduiScreenSchema } from '../dtos/sdui-registry.dto.js';
export class SduiRegistryController {
    getSduiScreenUseCase;
    constructor(getSduiScreenUseCase) {
        this.getSduiScreenUseCase = getSduiScreenUseCase;
    }
    getScreen = async (request, reply) => {
        const params = request.params;
        const query = request.query;
        const dto = getSduiScreenSchema.parse({
            screenId: params.screenId,
            targetApp: query.targetApp || 'CUSTOMER'
        });
        const screenLayout = await this.getSduiScreenUseCase.execute({
            context: request.requestContext,
            data: dto
        });
        return reply.send(ResponseHelper.success(screenLayout));
    };
}
//# sourceMappingURL=sdui-registry.controller.js.map