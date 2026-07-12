import { checkDatabaseHealth } from '@carbroz/database';
import { AppConfig } from '@carbroz/config';
export class HealthController {
    async getHealth(request, reply) {
        const isDbUp = await checkDatabaseHealth();
        return reply.status(200).send({
            success: true,
            message: 'CarBroz Backend Running',
            version: '1.0.0',
            environment: AppConfig.env,
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            database: isDbUp ? 'up' : 'down'
        });
    }
}
//# sourceMappingURL=health.controller.js.map