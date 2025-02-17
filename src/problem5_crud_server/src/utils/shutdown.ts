import { PrismaService } from '@common/prisma/prisma.service';

export const setupGracefulShutdown = () => {
  const handler = async (signal: string) => {
    try {
      await PrismaService.getInstance().onApplicationShutdown();
      console.log(`${signal} received. Prisma disconnected successfully`);
      process.exit(0);
    } catch (error) {
      console.error(`Error during ${signal} shutdown:`, error);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => handler('SIGINT'));
  process.on('SIGTERM', () => handler('SIGTERM'));
};
