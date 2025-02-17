import { PrismaRepository } from '@common/prisma/prisma.repository';
import { PrismaService } from '@common/prisma/prisma.service';

export const prisma = PrismaService.getInstance().getClient();
const prismaRepo = PrismaRepository.getInstance();
export default prismaRepo;
