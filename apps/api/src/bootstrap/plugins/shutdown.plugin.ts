import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';

export default fp(async (app: FastifyInstance) => {
  const signals = ['SIGINT', 'SIGTERM'];

  for (const signal of signals) {
    process.on(signal, async () => {
      app.log.info(`Received ${signal}, initiating graceful shutdown...`);

      try {
        // app.close() executes registered onClose hooks, including the canonical
        // Redis/cache provider shutdown lifecycle.
        await app.close();
        app.log.info('Fastify instance closed cleanly.');

        // TODO: disconnect Prisma through the canonical database lifecycle owner.

        app.log.info('Graceful shutdown completed.');
        process.exit(0);
      } catch (err) {
        app.log.error(err, 'Error during graceful shutdown');
        process.exit(1);
      }
    });
  }
}, {
  name: 'shutdown-plugin',
});
