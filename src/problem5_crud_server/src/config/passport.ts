import { Strategy as JwtStrategy, ExtractJwt, VerifyCallback } from 'passport-jwt';
import config from './config';
import { TokenType, User } from '@prisma/client';
import prismaRepo from './database';
import logger from './logger';

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
};

const jwtVerify: VerifyCallback = async (payload, done) => {
  try {
    logger.info(`🔍 Verifying JWT`);

    if (payload.type !== TokenType.ACCESS) {
      logger.warn('⚠️ Invalid token type received');
      return done(null, false);
    }

    const user: User | null = await prismaRepo.findUnique<User>(
      'User',
      { id: payload.sub },
      { select: { id: true, email: true, name: true, role: true } }
    );

    logger.info('✅ User found!');

    if (!user) {
      logger.warn('⚠️ User not found for token');
      return done(null, false);
    }

    done(null, user);
  } catch (error) {
    logger.error('❌ Error verifying JWT:', error);
    done(error, false);
  }
};

export const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
