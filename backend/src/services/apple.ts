import { createRemoteJWKSet, jwtVerify } from 'jose';
import { appleAudiences } from '../env';
import { badRequest, serverError } from '../lib/http';
import type { VerifiedIdentity } from './google';

const APPLE_ISSUER = 'https://appleid.apple.com';
const APPLE_JWKS_URL = new URL('https://appleid.apple.com/auth/keys');

// Apple rotates signing keys; createRemoteJWKSet caches and refreshes them.
const jwks = createRemoteJWKSet(APPLE_JWKS_URL);

/**
 * Optional first-login profile data. Apple only returns the user's name in the
 * very first authorization response (not inside the identity token), so the
 * client forwards it alongside the token.
 */
export interface AppleProfileHint {
  name?: string | null;
}

/**
 * Verifies an "Sign in with Apple" identity token (a JWT) against Apple's
 * public JWKS, checking signature, issuer, audience and expiry.
 */
export async function verifyAppleIdentityToken(
  identityToken: string,
  hint: AppleProfileHint = {},
): Promise<VerifiedIdentity> {
  if (appleAudiences.length === 0) {
    throw serverError('Apple sign-in is not configured (APPLE_CLIENT_ID)');
  }

  const { payload } = await jwtVerify(identityToken, jwks, {
    issuer: APPLE_ISSUER,
    audience: appleAudiences,
  }).catch(() => {
    throw badRequest('Invalid Apple token');
  });

  if (!payload.sub) throw badRequest('Apple token missing subject');
  const email = (payload.email as string | undefined)?.toLowerCase();
  if (!email) throw badRequest('Apple token missing email');

  // Apple encodes email_verified as a boolean or the string "true".
  const rawVerified = payload.email_verified;
  const emailVerified = rawVerified === true || rawVerified === 'true';

  return {
    provider: 'apple',
    providerId: payload.sub,
    email,
    emailVerified,
    name: hint.name ?? null,
    avatarUrl: null,
  };
}
