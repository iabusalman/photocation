import { env } from '../env';
import { badRequest, serverError } from '../lib/http';

/**
 * Minimal PayPal Orders v2 client.
 * Docs: https://developer.paypal.com/docs/api/orders/v2/
 * Auth is OAuth2 client-credentials (client id + secret).
 */

const BASE =
  env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

export interface PayPalOrder {
  id: string;
  status: string; // CREATED | APPROVED | COMPLETED | ...
  purchase_units?: Array<{
    custom_id?: string;
    amount?: { currency_code?: string; value?: string };
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        amount?: { currency_code?: string; value?: string };
      }>;
    };
  }>;
  [key: string]: unknown;
}

function ensureConfigured(): void {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_SECRET) {
    throw serverError('PayPal is not configured (PAYPAL_CLIENT_ID/SECRET)');
  }
}

async function getAccessToken(): Promise<string> {
  ensureConfigured();
  const basic = Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_SECRET}`).toString('base64');
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw badRequest('PayPal auth failed', body);
  return (body as { access_token: string }).access_token;
}

/** Convert a price in halalas (SAR) to a USD string with 2 decimals. */
export function halalasToUsd(halalas: number): string {
  const usd = halalas / 100 / env.PAYPAL_SAR_TO_USD;
  return usd.toFixed(2);
}

/** Create a PayPal order for the given USD amount. */
export async function createOrder(
  usdValue: string,
  description: string,
  customId: string,
): Promise<PayPalOrder> {
  const token = await getAccessToken();
  const res = await fetch(`${BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          custom_id: customId,
          description: description.slice(0, 127),
          amount: { currency_code: 'USD', value: usdValue },
        },
      ],
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw badRequest('PayPal create order failed', body);
  return body as PayPalOrder;
}

/** Capture an approved PayPal order. */
export async function captureOrder(orderId: string): Promise<PayPalOrder> {
  const token = await getAccessToken();
  const res = await fetch(
    `${BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw badRequest('PayPal capture failed', body);
  return body as PayPalOrder;
}
