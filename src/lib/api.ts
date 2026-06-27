const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";
const TOKEN_KEY = "photocation.token";

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
      "Content-Type": "application/json",
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
  provider: "google" | "apple";
  plan: "free" | "starter" | "pro";
  usageCount: number;
}

export interface Quota {
  plan: string;
  used: number;
  limit: number;
  remaining: number;
  resetAt: string | null;
}

export interface AnalysisResult {
  id: string;
  status: string;
  country: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  confidence: number | null;
  landmarks: string[];
  reasoning: string | null;
  createdAt: string;
}

export interface Subscription {
  id: string;
  plan: "starter" | "pro";
  billing: "monthly" | "annual";
  status: "pending" | "active" | "cancelled";
  amountHalalas: number;
  currency: string;
  currentPeriodEnd: string | null;
  createdAt: string;
}

export interface SubscribeInit {
  subscriptionId: string;
  publishableKey: string | null;
  amount: number;
  currency: string;
  description: string;
  callbackUrl: string;
  metadata: { subscriptionId: string };
}

// ── Endpoints ────────────────────────────────────────────
export const api = {
  loginGoogle: (idToken: string) =>
    request<{ token: string; user: User }>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    }),
  loginApple: (
    identityToken: string,
    fullName?: { givenName?: string; familyName?: string },
  ) =>
    request<{ token: string; user: User }>("/api/auth/apple", {
      method: "POST",
      body: JSON.stringify({ identityToken, fullName }),
    }),
  register: (name: string, email: string, password: string) =>
    request<{ token: string; user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name: name || undefined, email, password }),
    }),
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ user: User; quota: Quota }>("/api/auth/me"),

  analyze: (image: string, mediaType: string) =>
    request<{ analysis: AnalysisResult; quota: Quota }>("/api/analyze", {
      method: "POST",
      body: JSON.stringify({ image, mediaType }),
    }),
  history: () => request<{ analyses: AnalysisResult[] }>("/api/analyze/history"),

  subscription: () =>
    request<{ subscription: Subscription | null }>("/api/payments/subscription"),

  subscribe: (plan: "starter" | "pro", billing: "monthly" | "annual") =>
    request<SubscribeInit>("/api/payments/subscribe", {
      method: "POST",
      body: JSON.stringify({ plan, billing }),
    }),
  verifyPayment: (id: string, subscriptionId: string) =>
    request<{ activated: boolean; status: string; plan: string }>(
      `/api/payments/verify?id=${encodeURIComponent(id)}&subscriptionId=${encodeURIComponent(subscriptionId)}`,
    ),
};
