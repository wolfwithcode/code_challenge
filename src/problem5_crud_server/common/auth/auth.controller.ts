import httpStatus from 'http-status';
import catchAsync from '@utils/catchAsync';
import authService from './auth.service';
import userService from '@main/user/user.service';
import tokenService from '@main/user/token.service';
import exclude from '@utils/exclude';
import { User } from '@prisma/client';

const register = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.createUser(email, password);
  const userWithoutPassword = exclude(user, ['password', 'createdAt', 'updatedAt']);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user: userWithoutPassword, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = (await authService.loginUserWithEmailAndPassword(email, password)) as User;
  if (!user) {
    return res.status(httpStatus.UNAUTHORIZED).send({ message: 'Invalid credentials' });
  }
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

export default {
  register,
  login,
  logout,
  refreshTokens
};
