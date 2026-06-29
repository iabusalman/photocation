import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const schema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),

  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  GOOGLE_CLIENT_ID: z.string().optional(),
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_BUNDLE_ID: z.string().optional(),

  MOYASAR_SECRET_KEY: z.string().optional(),
  MOYASAR_PUBLISHABLE_KEY: z.string().optional(),
  MOYASAR_API_BASE: z.string().default('https://api.moyasar.com/v1'),
  MOYASAR_WEBHOOK_SECRET: z.string().optional(),
  PAYMENT_CALLBACK_URL: z.string().default('http://localhost:5173/payment/callback'),

  ANTHROPIC_API_KEY: z.string().optional(),
  ANALYZE_MODEL: z.string().default('claude-opus-4-8'),

  // ── PayPal ───────────────────────────────────────────
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_SECRET: z.string().optional(),
  PAYPAL_ENV: z.enum(['sandbox', 'live']).default('sandbox'),
  // PayPal has no SAR; prices are converted to USD at this fixed peg.
  PAYPAL_SAR_TO_USD: z.coerce.number().default(3.75),

  // Comma-separated list of emails granted admin access to /api/admin.
  ADMIN_EMAILS: z.string().optional(),

  DATABASE_URL: z.string().default('file:./dev.db'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment configuration:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export const corsOrigins = env.CORS_ORIGINS.split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Allow an origin if it is explicitly listed, or if it matches one of these
// host patterns. The patterns cover Cloudflare Pages (production + every
// random preview subdomain like abc123.photocation.pages.dev) and Netlify,
// so previews work without listing each generated URL in CORS_ORIGINS.
const corsHostPatterns = [/\.pages\.dev$/, /\.netlify\.app$/];

export function isAllowedOrigin(origin: string): boolean {
  if (corsOrigins.includes(origin)) return true;
  try {
    const { hostname } = new URL(origin);
    return corsHostPatterns.some((re) => re.test(hostname));
  } catch {
    return false;
  }
}

export const appleAudiences = [env.APPLE_CLIENT_ID, env.APPLE_BUNDLE_ID].filter(
  (v): v is string => Boolean(v),
);

const adminEmails = (env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/** Whether an email address has admin privileges. */
export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && adminEmails.includes(email.toLowerCase());
}
