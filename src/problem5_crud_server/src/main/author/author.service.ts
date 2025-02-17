import prismaRepo from '@config/database';
import { Author } from '@prisma/client';

const getAuthorById = async (id: number): Promise<Author> => {
  return await prismaRepo.findOne<Author>('Author', id);
};

export default {
  getAuthorById
};
