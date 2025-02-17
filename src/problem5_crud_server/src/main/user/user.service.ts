import { User, Role } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '@utils/ApiError';
import { encryptPassword } from '@utils/encryption';
import prismaRepo from '@config/database';

const createUser = async (
  email: string,
  password: string,
  name = '',
  role: Role = Role.USER
): Promise<User> => {
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  const newUser = await prismaRepo.create<User>('User', {
    email,
    name,
    password: await encryptPassword(password),
    role
  });

  return newUser;
};

const getUserById = async (id: number): Promise<Partial<User> | null> => {
  return await prismaRepo.findOne<User>('User', id);
};

const getUserByEmail = async (email: string): Promise<Partial<User> | null> => {
  const users = await prismaRepo.findMany<User>('User', {
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
      role: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return users.length > 0 ? users[0] : null;
};

export default {
  createUser,
  getUserById,
  getUserByEmail
};
