import { OAuth2Client } from 'google-auth-library';
import { env } from '../env';
import { badRequest, serverError } from '../lib/http';

export interface VerifiedIdentity {
  provider: 'google' | 'apple';
  providerId: string; // "sub"
  email: string;
  emailVerified: boolean;
  name?: string | null;
  avatarUrl?: string | null;
}

let client: OAuth2Client | null = null;
function getClient(): OAuth2Client {
  if (!env.GOOGLE_CLIENT_ID) {
    throw serverError('Google sign-in is not configured (GOOGLE_CLIENT_ID)');
  }
  if (!client) client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
  return client;
}

/**
 * Verifies a Google ID token against Google's public certificates (signature,
 * issuer, audience and expiry) and returns the identity.
 */
export async function verifyGoogleIdToken(
  idToken: string,
): Promise<VerifiedIdentity> {
  const ticket = await getClient()
    .verifyIdToken({ idToken, audience: env.GOOGLE_CLIENT_ID })
    .catch(() => {
      throw badRequest('Invalid Google token');
    });

  const payload = ticket.getPayload();
  if (!payload?.sub) throw badRequest('Google token missing subject');
  if (!payload.email) throw badRequest('Google token missing email');

  return {
    provider: 'google',
    providerId: payload.sub,
    email: payload.email.toLowerCase(),
    emailVerified: Boolean(payload.email_verified),
    name: payload.name ?? null,
    avatarUrl: payload.picture ?? null,
  };
}
