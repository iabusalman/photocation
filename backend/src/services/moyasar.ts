import { env } from '../env';
import { badRequest, serverError } from '../lib/http';

/**
 * Minimal typed client for the Moyasar v1 API.
 * Docs: https://docs.moyasar.com/ — HTTP Basic auth, secret key as username.
 */

export interface MoyasarPayment {
  id: string;
  status: string; // initiated | paid | failed | captured | refunded | voided
  amount: number; // halalas
  currency: string;
  description?: string | null;
  source?: { type?: string } & Record<string, unknown>;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

function authHeader(): string {
  if (!env.MOYASAR_SECRET_KEY) {
    throw serverError('Moyasar is not configured (MOYASAR_SECRET_KEY)');
  }
  const basic = Buffer.from(`${env.MOYASAR_SECRET_KEY}:`).toString('base64');
  return `Basic ${basic}`;
}

async function request<T>(
  path: string,
  init: RequestInit & { method: string },
): Promise<T> {
  const res = await fetch(`${env.MOYASAR_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const message =
      (body && (body.message || body.error)) || `Moyasar error (${res.status})`;
    throw badRequest(String(message), body);
  }
  return body as T;
}

/** Fetch a payment by id — the source of truth for reconciliation. */
export function fetchPayment(paymentId: string): Promise<MoyasarPayment> {
  return request<MoyasarPayment>(`/payments/${encodeURIComponent(paymentId)}`, {
    method: 'GET',
  });
}

/** Whether a Moyasar status represents a successfully captured payment. */
export function isPaidStatus(status: string): boolean {
  return status === 'paid' || status === 'captured';
}
