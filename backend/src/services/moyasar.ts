import { env } from '../env';
import { badRequest, serverError } from '../lib/http';

/**
 * Minimal typed client for the Moyasar v1 API.
 * Docs: https://docs.moyasar.com/
 *
 * Authentication uses HTTP Basic auth with the secret key as the username and
 * an empty password.
 */

export interface MoyasarPayment {
  id: string;
  status: string; // initiated | paid | failed | authorized | captured | refunded | voided
  amount: number; // in halalas
  fee: number;
  currency: string;
  refunded: number;
  description?: string | null;
  source?: { type?: string; company?: string; message?: string | null } & Record<
    string,
    unknown
  >;
  invoice_id?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
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

export interface CreatePaymentInput {
  amount: number; // halalas
  currency: string;
  description: string;
  callbackUrl: string;
  // A tokenized source (e.g. { type: 'creditcard', token: 'token_...' }) or
  // any source object accepted by Moyasar.
  source: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Server-side payment creation. Used when the client sends a tokenized card
 * source rather than completing the hosted Moyasar form directly.
 */
export function createPayment(
  input: CreatePaymentInput,
): Promise<MoyasarPayment> {
  return request<MoyasarPayment>('/payments', {
    method: 'POST',
    body: JSON.stringify({
      amount: input.amount,
      currency: input.currency,
      description: input.description,
      callback_url: input.callbackUrl,
      source: input.source,
      metadata: input.metadata,
    }),
  });
}

/** Whether a Moyasar status represents a successfully captured payment. */
export function isPaidStatus(status: string): boolean {
  return status === 'paid' || status === 'captured';
}
