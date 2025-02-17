import { Server } from 'http';
import app from './app';
import config from './config/config';
import logger from './config/logger';
import prismaRepo from '@config/database';
import { setupGracefulShutdown } from './utils/shutdown';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let server: Server;

async function startServer() {
  try {
    await prismaRepo.findFirst('User', {}).catch(() => {
      logger.warn('Database connection check failed, but continuing startup');
    });

    logger.info('Connected to SQL Database');

    server = app.listen(config.port, () => {
      logger.info(`Listening on port ${config.port}`);
    });

    setupGracefulShutdown();
  } catch (error) {
    logger.error('Failed to connect to the database:', error);
    process.exit(1);
  }
}

startServer();

const unexpectedErrorHandler = (error: unknown) => {
  logger.error(error);
  process.exit(1);
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);
