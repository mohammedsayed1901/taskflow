import type { Server } from 'node:http';

import { app } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';

const FORCE_SHUTDOWN_TIMEOUT_MS = 10_000;

let httpServer: Server | undefined;
let isShuttingDown = false;

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

function listenForRequests(): Promise<Server> {
  return new Promise((resolve, reject) => {
    const server = app.listen(env.PORT);

    function handleError(error: Error): void {
      server.off('listening', handleListening);
      reject(error);
    }

    function handleListening(): void {
      server.off('error', handleError);
      resolve(server);
    }

    server.once('error', handleError);
    server.once('listening', handleListening);
  });
}

function closeHttpServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log(`${signal} received. Starting graceful shutdown.`);

  const forceShutdownTimer = setTimeout(() => {
    console.error('Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, FORCE_SHUTDOWN_TIMEOUT_MS);

  forceShutdownTimer.unref();

  try {
    if (httpServer) {
      await closeHttpServer(httpServer);
      httpServer = undefined;

      console.log('HTTP server closed');
    }

    await disconnectDatabase();
    console.log('MongoDB disconnected');
  } catch (error: unknown) {
    console.error('Graceful shutdown failed:', getErrorMessage(error));
    process.exitCode = 1;
  } finally {
    clearTimeout(forceShutdownTimer);
  }
}

async function startServer(): Promise<void> {
  try {
    await connectDatabase();
    console.log('MongoDB connected');

    httpServer = await listenForRequests();
    console.log(`TaskFlow API listening on port ${env.PORT}`);
  } catch (error: unknown) {
    console.error('Server startup failed:', getErrorMessage(error));

    try {
      await disconnectDatabase();
    } catch (disconnectError: unknown) {
      console.error('MongoDB cleanup failed:', getErrorMessage(disconnectError));
    }

    process.exitCode = 1;
  }
}

process.on('SIGINT', (signal) => {
  void shutdown(signal);
});

process.on('SIGTERM', (signal) => {
  void shutdown(signal);
});

await startServer();
