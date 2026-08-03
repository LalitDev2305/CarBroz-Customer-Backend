import { ResponseHelper } from '@carbroz/common';
import { registerSduiComponentSchema, updateSduiScreenSchema } from '../../sdui/dtos/sdui-registry.dto.js';
export class AdminSduiController {
    registerSduiComponentUseCase;
    updateSduiScreenLayoutUseCase;
    constructor(registerSduiComponentUseCase, updateSduiScreenLayoutUseCase) {
        this.registerSduiComponentUseCase = registerSduiComponentUseCase;
        this.updateSduiScreenLayoutUseCase = updateSduiScreenLayoutUseCase;
    }
    registerComponent = async (request, reply) => {
        const dto = registerSduiComponentSchema.parse(request.body);
        const result = await this.registerSduiComponentUseCase.execute({
            context: request.requestContext,
            data: dto
        });
        return reply.status(201).send(ResponseHelper.success(result, 'Component registered successfully'));
    };
    updateScreenLayout = async (request, reply) => {
        const dto = updateSduiScreenSchema.parse(request.body);
        const result = await this.updateSduiScreenLayoutUseCase.execute({
            context: request.requestContext,
            data: dto
        });
        return reply.send(ResponseHelper.success(result, 'Screen layout published successfully'));
    };
}
//# sourceMappingURL=admin-sdui.controller.js.map