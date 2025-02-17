import request from 'supertest';
import { faker } from '@faker-js/faker';
import httpStatus from 'http-status';
import httpMocks from 'node-mocks-http';
import moment from 'moment';
import app from 'src/app';
import config from '@config/config';
import auth from '@middlewares/auth';
import tokenService from '@main/user/token.service';
import setupTestDB from '../utils/setupTestDb';
import { describe, beforeEach, test, expect, jest } from '@jest/globals';
import { userOne, insertUsers } from '../fixtures/user.fixture';
import { Role, TokenType, User } from '@prisma/client';
import prismaRepo from '@config/database';

setupTestDB();

describe('Auth routes', () => {
  describe('POST /v1/auth/register', () => {
    let newUser: { email: string; password: string };
    beforeEach(() => {
      newUser = {
        email: faker.internet.email().toLowerCase(),
        password: 'password1'
      };
    });

    test('should return 201 and successfully register user if request data is ok', async () => {
      const res = await request(app)
        .post('/v1/auth/register')
        .send(newUser)
        .expect(httpStatus.CREATED);

      expect(res.body.user).not.toHaveProperty('password');
      expect(res.body.user).toEqual({
        id: expect.anything(),
        name: null,
        email: newUser.email,
        role: Role.USER,
        isEmailVerified: false
      });

      const dbUser = await prismaRepo.findUnique<User>('User', { id: res.body.user.id });
      expect(dbUser).toBeDefined();
      expect(dbUser?.password).not.toBe(newUser.password);
      expect(dbUser).toMatchObject({
        name: null,
        email: newUser.email,
        role: Role.USER,
        isEmailVerified: false
      });

      expect(res.body.tokens).toEqual({
        access: { token: expect.anything(), expires: expect.anything() },
        refresh: { token: expect.anything(), expires: expect.anything() }
      });
    });

    test('should return 400 error if email is invalid', async () => {
      newUser.email = 'invalidEmail';

      await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if email is already used', async () => {
      await insertUsers([userOne]);
      newUser.email = userOne.email;

      await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if password length is less than 8 characters', async () => {
      newUser.password = 'passwo1';

      await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if password does not contain both letters and numbers', async () => {
      newUser.password = 'password';

      await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.BAD_REQUEST);

      newUser.password = '11111111';

      await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/auth/login', () => {
    test('should return 200 and login user if email and password match', async () => {
      await insertUsers([userOne]);
      const loginCredentials = {
        email: userOne.email,
        password: userOne.password
      };

      const res = await request(app)
        .post('/v1/auth/login')
        .send(loginCredentials)
        .expect(httpStatus.OK);

      expect(res.body.user).toMatchObject({
        id: expect.anything(),
        name: userOne.name,
        email: userOne.email,
        role: userOne.role,
        isEmailVerified: userOne.isEmailVerified
      });

      expect(res.body.user).toEqual(expect.not.objectContaining({ password: expect.anything() }));

      expect(res.body.tokens).toEqual({
        access: { token: expect.anything(), expires: expect.anything() },
        refresh: { token: expect.anything(), expires: expect.anything() }
      });
    });

    test('should return 401 error if there are no users with that email', async () => {
      const loginCredentials = {
        email: userOne.email,
        password: userOne.password
      };

      const res = await request(app)
        .post('/v1/auth/login')
        .send(loginCredentials)
        .expect(httpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({
        code: httpStatus.UNAUTHORIZED,
        message: 'Incorrect email or password'
      });
    });

    test('should return 401 error if password is wrong', async () => {
      await insertUsers([userOne]);
      const loginCredentials = {
        email: userOne.email,
        password: 'wrongPassword1'
      };

      const res = await request(app)
        .post('/v1/auth/login')
        .send(loginCredentials)
        .expect(httpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({
        code: httpStatus.UNAUTHORIZED,
        message: 'Incorrect email or password'
      });
    });
  });

  describe('POST /v1/auth/logout', () => {
    test('should return 204 if refresh token is valid', async () => {
      await insertUsers([userOne]);
      const dbUserOne = await prismaRepo.findUnique<User>('User', {
        email: userOne.email
      });
      if (!dbUserOne?.id) {
        throw new Error('User not found');
      }
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(dbUserOne.id, expires, TokenType.REFRESH);
      await tokenService.saveToken(refreshToken, dbUserOne.id, expires, TokenType.REFRESH);

      await request(app)
        .post('/v1/auth/logout')
        .send({ refreshToken })
        .expect(httpStatus.NO_CONTENT);

      const dbRefreshTokenData = await prismaRepo.findFirst('Token', {
        where: { token: refreshToken }
      });
      expect(dbRefreshTokenData).toBe(null);
    });

    test('should return 400 error if refresh token is missing from request body', async () => {
      await request(app).post('/v1/auth/logout').send().expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if refresh token is not found in the database', async () => {
      await insertUsers([userOne]);
      const dbUserOne = await prismaRepo.findUnique<User>('User', {
        email: userOne.email
      });
      if (!dbUserOne?.id) {
        throw new Error('User not found');
      }
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(dbUserOne.id, expires, TokenType.REFRESH);

      await request(app)
        .post('/v1/auth/logout')
        .send({ refreshToken })
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 404 error if refresh token is blacklisted', async () => {
      await insertUsers([userOne]);
      const dbUserOne = await prismaRepo.findUnique<User>('User', {
        email: userOne.email
      });
      if (!dbUserOne?.id) {
        throw new Error('User not found');
      }
      const expires = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(dbUserOne.id, expires, TokenType.REFRESH);
      await tokenService.saveToken(refreshToken, dbUserOne.id, expires, TokenType.REFRESH, true);

      await request(app)
        .post('/v1/auth/logout')
        .send({ refreshToken })
        .expect(httpStatus.NOT_FOUND);
    });
  });
});

describe('Auth middleware', () => {
  test('should call next with no errors if access token is valid', async () => {
    await insertUsers([userOne]);
    const dbUserOne = await prismaRepo.findUnique<User>('User', {
      email: userOne.email
    });
    if (!dbUserOne?.id) {
      throw new Error('User not found');
    }
    const userOneAccessToken = tokenService.generateToken(
      dbUserOne.id,
      moment().add(config.jwt.accessExpirationMinutes, 'minutes'),
      TokenType.ACCESS
    );
    const req = httpMocks.createRequest({
      headers: { Authorization: `Bearer ${userOneAccessToken}` }
    });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith();
    expect((req.user as User).id).toEqual(dbUserOne.id);
  });
});
