export class ConfigController {
    getInitConfigUseCase;
    constructor(getInitConfigUseCase) {
        this.getInitConfigUseCase = getInitConfigUseCase;
    }
    async getInitConfig(request, reply) {
        const config = await this.getInitConfigUseCase.execute();
        return reply.status(200).send({
            success: true,
            data: config,
        });
    }
}
//# sourceMappingURL=config.controller.js.map