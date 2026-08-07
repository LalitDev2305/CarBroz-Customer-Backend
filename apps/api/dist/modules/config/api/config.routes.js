import { ConfigController } from './config.controller.js';
import { GetInitConfigUseCase } from '../use-cases/GetInitConfigUseCase.js';
import { getContainer } from '../../../container/index.js';
export const configRoutes = async (app) => {
    const container = getContainer();
    const configProvider = container.resolve('configProvider');
    const featureFlagProvider = container.resolve('featureFlagProvider');
    const getInitConfigUseCase = new GetInitConfigUseCase(configProvider, featureFlagProvider);
    const controller = new ConfigController(getInitConfigUseCase);
    app.get('/init', controller.getInitConfig.bind(controller));
};
//# sourceMappingURL=config.routes.js.map