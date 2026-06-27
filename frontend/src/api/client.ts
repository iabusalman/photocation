const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const TOKEN_KEY = 'photocation.token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export interface ApiError extends Error {
  status: number;
  details?: unknown;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  const text = await res.text();
  const body = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const err = new Error(body?.message || `Request failed (${res.status})`) as ApiError;
    err.status = res.status;
    err.details = body?.details;
    throw err;
  }
  return body as T;
}

// ── Types ────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  provider: 'google' | 'apple';
  createdAt: string;
}

export interface Package {
  id: string;
  title: string;
  description: string;
  city: string;
  location: string;
  coverImage: string | null;
  priceHalalas: number;
  currency: string;
  durationMins: number;
}

export interface Booking {
  id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  scheduledFor: string;
  amountHalalas: number;
  currency: string;
  notes?: string | null;
  package: Package;
  payment?: { status: string; moyasarId: string | null } | null;
}

export interface PaymentInit {
  publishableKey: string | null;
  amount: number;
  currency: string;
  description: string;
  callbackUrl: string;
  metadata: { bookingId: string };
}

// ── Endpoints ────────────────────────────────────────────
export const api = {
  loginGoogle: (idToken: string) =>
    request<{ token: string; user: User }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    }),

  loginApple: (identityToken: string, fullName?: { givenName?: string; familyName?: string }) =>
    request<{ token: string; user: User }>('/api/auth/apple', {
      method: 'POST',
      body: JSON.stringify({ identityToken, fullName }),
    }),

  me: () => request<{ user: User }>('/api/auth/me'),

  listPackages: () => request<{ packages: Package[] }>('/api/packages'),
  getPackage: (id: string) => request<{ package: Package }>(`/api/packages/${id}`),

  listBookings: () => request<{ bookings: Booking[] }>('/api/bookings'),
  getBooking: (id: string) => request<{ booking: Booking }>(`/api/bookings/${id}`),
  createBooking: (input: { packageId: string; scheduledFor: string; notes?: string }) =>
    request<{ booking: Booking }>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  initPayment: (bookingId: string) =>
    request<PaymentInit>('/api/payments/init', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    }),

  verifyPayment: (id: string, bookingId: string) =>
    request<{ status: string; paid: boolean }>(
      `/api/payments/verify?id=${encodeURIComponent(id)}&bookingId=${encodeURIComponent(bookingId)}`,
    ),
};

/** Format halalas (integer) as a localized currency string. */
export function formatPrice(halalas: number, currency = 'SAR'): string {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(halalas / 100);
}
