import { buildApp } from './app.js';
import { getContainer } from './container/index.js';
import { AppConfig } from '@carbroz/config';

const start = async () => {
  try {
    const app = await buildApp();
    const port = AppConfig.port;
    const host = AppConfig.host;

    await app.listen({ port, host });
    
    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      app.log.info(`Received signal ${signal}, shutting down gracefully...`);
      try {
        const dbProvider = getContainer().resolve('databaseProvider');
        await dbProvider.disconnect();
      } catch (e) {
        app.log.warn('Failed to disconnect database gracefully');
      }
      await app.close();
      process.exit(0);
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
