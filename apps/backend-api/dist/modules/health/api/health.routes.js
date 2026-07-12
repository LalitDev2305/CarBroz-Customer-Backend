import { HealthController } from './health.controller.js';
export default async function healthRoutes(app) {
    const healthController = new HealthController();
    app.get('/', healthController.getHealth.bind(healthController));
}
//# sourceMappingURL=health.routes.js.map