// Helper for JSON API calls
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  // Routes under /napi/* are served by Next.js (avoids conflict with /api/* api-server artifact)
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
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

export async function getFeatureBreakdown() {
  return apiFetch<
    { name: string; cost: number; revenueEstimate: number; roi: number }[]
  >("/napi/features");
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

// Custom feature/plan management — localStorage-based (no backend yet)
export type CustomFeature = { id: string; name: string; label: string };
export type CustomPlan = { id: string; name: string; includedFeatureIds: string[] };

export async function getCustomFeatures(): Promise<CustomFeature[]> {
  const stored = localStorage.getItem("ai_observly_features");
  if (stored) return JSON.parse(stored);
  return [];
}

export async function saveCustomFeatures(features: CustomFeature[]): Promise<{ success: boolean }> {
  localStorage.setItem("ai_observly_features", JSON.stringify(features));
  return { success: true };
}

export async function getCustomPlans(): Promise<CustomPlan[]> {
  const stored = localStorage.getItem("ai_observly_plans");
  if (stored) return JSON.parse(stored);
  return [];
}

export async function saveCustomPlans(plans: CustomPlan[]): Promise<{ success: boolean }> {
  localStorage.setItem("ai_observly_plans", JSON.stringify(plans));
  return { success: true };
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
