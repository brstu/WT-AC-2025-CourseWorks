import { createServer } from 'http';
import app from './app';
import { env } from './config/env';
import { connectDb, disconnectDb } from './config/db';

async function main() {
  // eslint-disable-next-line no-console
  console.log('[server] booting...');

  await connectDb();

  const server = createServer(app);

  server.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] listening on http://localhost:${env.PORT}`);
  });

  const shutdown = async (signal: string) => {
    // eslint-disable-next-line no-console
    console.log(`[server] received ${signal}, shutting down...`);

    server.close(async (err) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.error('[server] close error:', err);
        process.exitCode = 1;
      }

      await disconnectDb();
      process.exit();
    });

    setTimeout(async () => {
      // eslint-disable-next-line no-console
      console.error('[server] force shutdown (timeout)');
      await disconnectDb();
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

void main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[server] fatal error:', err);
  process.exit(1);
});
