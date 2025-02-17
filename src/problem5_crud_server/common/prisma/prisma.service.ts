import { PrismaClient } from '@prisma/client';

export class PrismaService {
  private static instance: PrismaService;
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'pretty'
    });
  }

  static getInstance(): PrismaService {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaService();
    }
    return PrismaService.instance;
  }

  getClient(): PrismaClient {
    return this.prisma;
  }

  async onApplicationShutdown() {
    await this.prisma.$disconnect();
  }
}
