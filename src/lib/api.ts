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
  provider: "google" | "apple" | "email";
  plan: "free" | "starter" | "pro";
  usageCount: number;
  isAdmin?: boolean;
}

export interface AdminStats {
  users: number;
  analyses: number;
  activeSubscriptions: number;
  byPlan: Record<string, number>;
  revenueHalalas: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  provider: string;
  plan: "free" | "starter" | "pro";
  usageCount: number;
  usageResetAt: string | null;
  analyses: number;
  subscriptions: number;
  isAdmin: boolean;
  createdAt: string;
}

export interface AdminAnalysis {
  id: string;
  userEmail: string;
  country: string | null;
  city: string | null;
  confidence: number | null;
  landmarks: string[];
  createdAt: string;
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

export interface PlanDTO {
  id: "free" | "starter" | "pro";
  name: string;
  quota: number;
  windowDays?: number;
  monthlyHalalas: number;
  annualHalalas: number;
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

  plans: () => request<{ plans: PlanDTO[] }>("/api/plans"),

  analyze: (image: string, mediaType: string) =>
    request<{ analysis: AnalysisResult; quota: Quota }>("/api/analyze", {
      method: "POST",
      body: JSON.stringify({ image, mediaType }),
    }),
  history: () => request<{ analyses: AnalysisResult[] }>("/api/analyze/history"),

  subscription: () =>
    request<{ subscription: Subscription | null }>("/api/payments/subscription"),
  cancelSubscription: () =>
    request<{ cancelled: boolean; plan: string }>("/api/payments/cancel", {
      method: "POST",
    }),

  subscribe: (plan: "starter" | "pro", billing: "monthly" | "annual") =>
    request<SubscribeInit>("/api/payments/subscribe", {
      method: "POST",
      body: JSON.stringify({ plan, billing }),
    }),
  verifyPayment: (id: string, subscriptionId: string) =>
    request<{ activated: boolean; status: string; plan: string }>(
      `/api/payments/verify?id=${encodeURIComponent(id)}&subscriptionId=${encodeURIComponent(subscriptionId)}`,
    ),

  paypalCreateOrder: (subscriptionId: string) =>
    request<{ orderId: string; amountUsd: string }>(
      "/api/payments/paypal/create-order",
      { method: "POST", body: JSON.stringify({ subscriptionId }) },
    ),
  paypalCapture: (orderId: string, subscriptionId: string) =>
    request<{ activated: boolean; status: string; plan: string }>(
      "/api/payments/paypal/capture",
      { method: "POST", body: JSON.stringify({ orderId, subscriptionId }) },
    ),

  // ── Admin ──────────────────────────────────────────────
  adminStats: () => request<{ stats: AdminStats }>("/api/admin/stats"),
  adminUsers: (q = "") =>
    request<{ users: AdminUser[] }>(
      `/api/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`,
    ),
  adminAnalyses: () =>
    request<{ analyses: AdminAnalysis[] }>("/api/admin/analyses"),
  adminUpdateUser: (
    id: string,
    data: { plan?: "free" | "starter" | "pro"; resetUsage?: boolean },
  ) =>
    request<{ user: { id: string; plan: string; usageCount: number } }>(
      `/api/admin/users/${id}`,
      { method: "PATCH", body: JSON.stringify(data) },
    ),
  adminDeleteUser: (id: string) =>
    request<{ deleted: boolean }>(`/api/admin/users/${id}`, { method: "DELETE" }),
  adminPlans: () => request<{ plans: PlanDTO[] }>("/api/admin/plans"),
  adminUpdatePlan: (
    id: string,
    data: { name?: string; quota?: number; monthlyHalalas?: number; annualHalalas?: number },
  ) =>
    request<{ plan: PlanDTO }>(`/api/admin/plans/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};
