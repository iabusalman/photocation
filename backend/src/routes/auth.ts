import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { verifyGoogleIdToken } from '../services/google';
import { verifyAppleIdentityToken } from '../services/apple';
import { upsertUserFromIdentity, publicUser } from '../services/users';
import { signSession } from '../lib/jwt';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../prisma';
import { HttpError, notFound, unauthorized } from '../lib/http';
import { getQuota } from '../services/quota';

export const authRouter = Router();

// ── Email + password ─────────────────────────────────────
const registerSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  email: z.string().email(),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
});

// POST /api/auth/register — create an email/password account.
authRouter.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);
    const lower = email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: lower } });
    if (existing) throw new HttpError(409, 'البريد الإلكتروني مستخدم بالفعل');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: lower,
        name: name ?? null,
        provider: 'email',
        providerId: lower,
        passwordHash,
      },
    });
    const token = signSession({ sub: user.id, email: user.email, name: user.name });
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/login — email/password sign-in.
authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    // Generic message — don't reveal whether the email exists.
    if (!user || !user.passwordHash) {
      throw unauthorized('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw unauthorized('البريد الإلكتروني أو كلمة المرور غير صحيحة');

    const token = signSession({ sub: user.id, email: user.email, name: user.name });
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

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
