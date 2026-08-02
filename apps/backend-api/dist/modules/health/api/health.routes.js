import { HealthController } from './health.controller.js';
export default async function healthRoutes(app) {
    const controller = new HealthController();
    app.get('/liveness', controller.liveness.bind(controller));
    app.get('/readiness', controller.readiness.bind(controller));
    // Root /health maps to liveness for simple checks
    app.get('/', controller.liveness.bind(controller));
}
//# sourceMappingURL=health.routes.js.map