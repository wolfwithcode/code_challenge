import { Request } from 'express';
import { Prisma } from '@prisma/client';

declare module 'express-serve-static-core' {
  interface Request {
    parsedQuery?: ParsedQuery;
    prismaQuery?: Prisma.ResourceFindManyArgs;
  }
}
