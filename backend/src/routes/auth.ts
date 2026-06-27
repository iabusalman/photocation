import { Router } from 'express';
import { z } from 'zod';
import { verifyGoogleIdToken } from '../services/google';
import { verifyAppleIdentityToken } from '../services/apple';
import { upsertUserFromIdentity, publicUser } from '../services/users';
import { signSession } from '../lib/jwt';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../prisma';
import { notFound } from '../lib/http';
import { getQuota } from '../services/quota';

export const authRouter = Router();

const googleSchema = z.object({ idToken: z.string().min(10) });

// POST /api/auth/google — exchange a Google ID token for a Photocation session.
authRouter.post('/google', async (req, res, next) => {
  try {
    const { idToken } = googleSchema.parse(req.body);
    const identity = await verifyGoogleIdToken(idToken);
    const user = await upsertUserFromIdentity(identity);
    const token = signSession({ sub: user.id, email: user.email, name: user.name });
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

const appleSchema = z.object({
  identityToken: z.string().min(10),
  fullName: z
    .object({ givenName: z.string().nullish(), familyName: z.string().nullish() })
    .nullish(),
});

// POST /api/auth/apple — exchange an Apple identity token for a session.
authRouter.post('/apple', async (req, res, next) => {
  try {
    const { identityToken, fullName } = appleSchema.parse(req.body);
    const name =
      [fullName?.givenName, fullName?.familyName].filter(Boolean).join(' ') ||
      null;
    const identity = await verifyAppleIdentityToken(identityToken, { name });
    const user = await upsertUserFromIdentity(identity);
    const token = signSession({ sub: user.id, email: user.email, name: user.name });
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me — current user + quota.
authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) throw notFound('User not found');
    const quota = await getQuota(user);
    res.json({ user: publicUser(user), quota });
  } catch (err) {
    next(err);
  }
});
