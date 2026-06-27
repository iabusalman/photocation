import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../env';

export interface SessionClaims {
  sub: string; // user id
  email: string;
  name?: string | null;
}

export function signSession(claims: SessionClaims): string {
  return jwt.sign(claims, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as SignOptions);
}

export function verifySession(token: string): SessionClaims {
  return jwt.verify(token, env.JWT_SECRET) as SessionClaims;
}
