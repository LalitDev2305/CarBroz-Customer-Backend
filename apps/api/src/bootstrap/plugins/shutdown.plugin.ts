import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';

export default fp(async (app: FastifyInstance) => {
  // Graceful shutdown handler
  const signals = ['SIGINT', 'SIGTERM'];
  
  for (const signal of signals) {
    process.on(signal, async () => {
      app.log.info(`Received ${signal}, initiating graceful shutdown...`);
      
      try {
        // Stop accepting new connections and close fastify
        await app.close();
        app.log.info('Fastify instance closed cleanly.');
        
        // TODO: Phase 3+ - Disconnect Database (Prisma)
        // TODO: Phase 4+ - Disconnect Redis
        
        app.log.info('Graceful shutdown completed.');
        process.exit(0);
      } catch (err) {
        app.log.error(err, 'Error during graceful shutdown');
        process.exit(1);
      }
    });
  }
}, {
  name: 'shutdown-plugin'
});
