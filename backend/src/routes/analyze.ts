import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { requireAuth } from '../middleware/auth';
import { notFound, paymentRequired } from '../lib/http';
import { getQuota, consumeQuota } from '../services/quota';
import { analyzeImageLocation } from '../services/analyze';

export const analyzeRouter = Router();

const analyzeSchema = z.object({
  image: z.string().min(16), // base64 (optionally data-url prefixed)
  mediaType: z
    .enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
    .default('image/jpeg'),
});

/**
 * POST /api/analyze
 * Run AI photo-geolocation on an uploaded image. Auth + plan quota enforced;
 * the result is stored as a search-history entry.
 */
analyzeRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const { image, mediaType } = analyzeSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) throw notFound('User not found');

    const quota = await getQuota(user);
    if (quota.remaining <= 0) {
      throw paymentRequired(
        `لقد استهلكت حصّتك (${quota.used}/${quota.limit}). قم بالترقية للمتابعة.`,
      );
    }

    const result = await analyzeImageLocation(image, mediaType);

    // Persist the analysis and consume one unit of quota.
    const analysis = await prisma.analysis.create({
      data: {
        userId: user.id,
        status: 'succeeded',
        country: result.country,
        city: result.city,
        lat: result.lat,
        lng: result.lng,
        confidence: result.confidence,
        landmarks: JSON.stringify(result.landmarks),
        reasoning: result.reasoning,
      },
    });
    await consumeQuota(user.id);

    res.json({
      analysis: { ...analysis, landmarks: result.landmarks },
      quota: { ...quota, used: quota.used + 1, remaining: quota.remaining - 1 },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/analyze/history — the user's past analyses.
analyzeRouter.get('/history', requireAuth, async (req, res, next) => {
  try {
    const rows = await prisma.analysis.findMany({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const analyses = rows.map((a) => ({
      ...a,
      landmarks: a.landmarks ? (JSON.parse(a.landmarks) as string[]) : [],
    }));
    res.json({ analyses });
  } catch (err) {
    next(err);
  }
});
