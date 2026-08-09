// API client — all internal routes use /napi/* to avoid conflict with the api-server artifact at /api/*

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  // Routes under /napi/* are served by Next.js (avoids conflict with /api/* api-server artifact)
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function getDashboardSummary() {
  return apiFetch<{ totalRevenue: number; totalCost: number; totalProfit: number }>(
    "/napi/dashboard-summary"
  );
}

export async function getCustomers() {
  return apiFetch<
    { id: string; name: string; cost: number; revenue: number; margin: number; status: "red" | "yellow" | "green" }[]
  >("/napi/customers");
}

export async function getCustomerDetail(id: string) {
  return apiFetch<{
    id: string; name: string; cost: number; revenue: number; margin: number; status: string;
    tokens: number; requestCount: number; models: string[];
    barData: { period: string; cost: number; revenue: number }[];
    pieData: { name: string; value: number; color: string }[];
  }>(`/napi/customers/${id}`);
}

export async function getFeatureBreakdown() {
  return apiFetch<
    { id: string; name: string; cost: number; revenueEstimate: number; roi: number }[]
  >("/napi/features");
}

export async function getFeatureDetail(id: string) {
  return apiFetch<{
    id: string; name: string; cost: number; revenueEstimate: number; roi: number; margin: number;
    tokenCount: number; requestCount: number; models: string[];
    barData: { period: string; cost: number; revenue: number }[];
    pieData: { name: string; value: number; color: string }[];
  }>(`/napi/features/${id}`);
}

export async function getHistory(section: string, range: string) {
  return apiFetch<{
    barData: { period: string; cost: number; revenue: number; profit: number }[];
    pieData: { name: string; value: number; color: string }[];
  }>(`/napi/history?section=${section}&range=${range}`);
}

export async function getTechnicalDetails(id: string) {
  return apiFetch<{ tokens: number; models: string[]; requestCount: number }>(
    `/napi/technical-details/${id}`
  );
}

export async function generateKey() {
  return apiFetch<{ keyDisplay: string }>("/napi/generate-key", { method: "POST" });
}

export async function regenerateKey() {
  return apiFetch<{ keyDisplay: string }>("/napi/regenerate-key", { method: "POST" });
}

export async function revokeKey() {
  return apiFetch<{ keyDisplay: string }>("/napi/revoke-key", { method: "POST" });
}

export async function sendTestEvent() {
  return apiFetch<{ success: boolean }>("/napi/send-test-event", { method: "POST" });
}

export async function recalculateNow() {
  return apiFetch<{ lastCalculated: Date }>("/napi/recalculate", { method: "POST" });
}

export async function submitWaitlist(email: string) {
  return apiFetch<{ success: boolean }>("/napi/waitlist", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function signup(email: string, password: string) {
  const data = await apiFetch<{ success: boolean; userId: string }>("/napi/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (data.success) {
    localStorage.setItem("ai_observly_authed", "true");
    localStorage.setItem("ai_observly_user_email", email);
  }
  return data;
}

export async function login(email: string, password: string) {
  const data = await apiFetch<{ success: boolean; userId: string }>("/napi/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (data.success) {
    localStorage.setItem("ai_observly_authed", "true");
    localStorage.setItem("ai_observly_user_email", email);
  }
  return data;
}

export async function logout() {
  localStorage.removeItem("ai_observly_authed");
  return { success: true };
}

export async function requestPasswordReset(email: string) {
  return apiFetch<{ success: boolean }>("/napi/request-password-reset", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// Add-on costs (localStorage-backed for demo)
export interface AddonCost {
  id: string;
  costType: string;
  amount: number;
  currency: string;
  featureId: string;
  featureName: string;
  dateIncurred: string;
  recurrence: "one-time" | "monthly" | "weekly";
  notes?: string;
}

export function getAddonCosts(): AddonCost[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("ai_observly_addon_costs") ?? "[]");
  } catch {
    return [];
  }
}

export function saveAddonCosts(costs: AddonCost[]): void {
  localStorage.setItem("ai_observly_addon_costs", JSON.stringify(costs));
}

// Custom features / plans (localStorage)
export interface CustomFeature {
  id: string;
  name: string;
  label: string;
}

export interface CustomPlan {
  id: string;
  name: string;
  includedFeatureIds: string[];
}

export function getCustomFeatures(): CustomFeature[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("ai_observly_features") ?? "[]");
  } catch {
    return [];
  }
}

export function saveCustomFeatures(features: CustomFeature[]): void {
  localStorage.setItem("ai_observly_features", JSON.stringify(features));
}

export function getCustomPlans(): CustomPlan[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("ai_observly_plans") ?? "[]");
  } catch {
    return [];
  }
}

export function saveCustomPlans(plans: CustomPlan[]): void {
  localStorage.setItem("ai_observly_plans", JSON.stringify(plans));
}
