import { Prisma } from '@prisma/client';

export type ModelName = Prisma.ModelName;
export type PrismaModel = {
  [K in ModelName]: Prisma.TypeMap['model'][K];
};
export type PrismaQuery = Prisma.FindManyArgs;
