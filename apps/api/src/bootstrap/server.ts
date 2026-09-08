import { isDetailedDiagnosticLoggingEnabled } from './config/diagnostic-mode.js';
import { buildApp } from './app.js';

/** Starts the HTTP process and delegates all composition to buildApp. */
async function start(): Promise<void> {
  const app = await buildApp();
  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? '0.0.0.0';
  try {
    await app.listen({ port, host });
  } catch (error) {
    if (isDetailedDiagnosticLoggingEnabled()) {
      process.stderr.write('\u001B[31m❌ SERVER ERROR  server.start.failed\u001B[0m\n');
    } else {
      app.log.error({ err: error }, 'server.start.failed');
    }
    process.exit(1);
  }
}

void start();
