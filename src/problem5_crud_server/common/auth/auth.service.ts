import httpStatus from 'http-status';
import tokenService from '@main/user/token.service';
import userService from '@main/user/user.service';
import ApiError from '@utils/ApiError';
import { Token, TokenType, User } from '@prisma/client';
import { encryptPassword, isPasswordMatch } from '@utils/encryption';
import { AuthTokensResponse } from '@interfaces/response';
import exclude from '@utils/exclude';
import prismaRepo from '@config/database';

const loginUserWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<Omit<Partial<User>, 'password'>> => {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await isPasswordMatch(password, user.password as string))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return exclude(user, ['password']);
};

const logout = async (refreshToken: string): Promise<void> => {
  const refreshTokenData: Token = await prismaRepo.findFirst('Token', {
    where: {
      token: refreshToken,
      type: TokenType.REFRESH,
      blacklisted: false
    },
    select: { id: true }
  });
  if (!refreshTokenData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await prismaRepo.delete('Token', refreshTokenData.id);
};

const refreshAuth = async (refreshToken: string): Promise<AuthTokensResponse> => {
  try {
    const refreshTokenData = await tokenService.verifyToken(refreshToken, TokenType.REFRESH);
    const { userId } = refreshTokenData;
    await prismaRepo.delete('Token', refreshTokenData.id);
    return tokenService.generateAuthTokens({ id: userId } as User);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

export default {
  loginUserWithEmailAndPassword,
  isPasswordMatch,
  encryptPassword,
  logout,
  refreshAuth
};
