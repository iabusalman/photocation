import { NextFunction, Request, Response } from 'express';
import { isAdminEmail } from '../env';
import { forbidden } from '../lib/http';

/** Requires the authenticated user to be an admin. Use after requireAuth. */
export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user || !isAdminEmail(req.user.email)) {
    return next(forbidden('Admin access required'));
  }
  return next();
}
