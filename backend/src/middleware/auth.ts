import { NextFunction, Request, Response } from 'express';
import { verifySession, SessionClaims } from '../lib/jwt';
import { unauthorized } from '../lib/http';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: SessionClaims;
    }
  }
}

/** Requires a valid Photocation session token in the Authorization header. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(unauthorized('Missing bearer token'));
  }
  const token = header.slice('Bearer '.length).trim();
  try {
    req.user = verifySession(token);
    return next();
  } catch {
    return next(unauthorized('Invalid or expired token'));
  }
}
