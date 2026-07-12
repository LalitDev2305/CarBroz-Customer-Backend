import { buildApp } from './app.js';
import { disconnectDatabase } from '@carbroz/database';
import { AppConfig } from '@carbroz/config';
const start = async () => {
    try {
        const app = await buildApp();
        const port = AppConfig.port;
        const host = AppConfig.host;
        await app.listen({ port, host });
        // Graceful shutdown
        const gracefulShutdown = async (signal) => {
            app.log.info(`Received signal ${signal}, shutting down gracefully...`);
            await disconnectDatabase();
            await app.close();
            process.exit(0);
        };
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=server.js.map