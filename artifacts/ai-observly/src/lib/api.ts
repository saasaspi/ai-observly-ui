export async function getDashboardSummary() {
  return { totalRevenue: 4200, totalCost: 1140, totalProfit: 3060 };
}

export async function getCustomers() {
  return [
    { id: "c1", name: "Acme Corp", cost: 380, revenue: 320, margin: -60, status: "red" as const },
    { id: "c2", name: "BuildFast Inc", cost: 210, revenue: 680, margin: 470, status: "yellow" as const },
    { id: "c3", name: "Moonshot AI", cost: 95, revenue: 410, margin: 315, status: "green" as const },
    { id: "c4", name: "DataPulse", cost: 140, revenue: 520, margin: 380, status: "green" as const },
    { id: "c5", name: "Verity Labs", cost: 315, revenue: 410, margin: 95, status: "yellow" as const },
  ];
}

export async function getFeatureBreakdown() {
  return [
    { name: "Chatbot", cost: 520, revenueEstimate: 1120, roi: 600 },
    { name: "Summarizer", cost: 310, revenueEstimate: 840, roi: 530 },
    { name: "Report Generator", cost: 220, revenueEstimate: 600, roi: 380 },
    { name: "Image Analysis", cost: 290, revenueEstimate: 180, roi: -110 },
  ];
}

export async function getTechnicalDetails(id: string) {
  return { tokens: 142000, models: ["gpt-4o", "gpt-3.5-turbo"], requestCount: 847 };
}

export async function generateKey() {
  return { keyDisplay: "obs_live_" + Math.random().toString(36).slice(2, 18) };
}
export async function regenerateKey() {
  return { keyDisplay: "obs_live_" + Math.random().toString(36).slice(2, 18) };
}
export async function revokeKey() {
  return { keyDisplay: "" };
}

export async function connectStripe(key: string) {
  return { connected: true, lastSynced: new Date() };
}

export async function getPlans() {
  return {
    plans: [
      { name: "Starter", includedFeatures: ["chatbot"] },
      { name: "Growth", includedFeatures: ["chatbot", "summarizer"] },
      { name: "Pro", includedFeatures: ["chatbot", "summarizer", "report-generator", "image-analysis"] },
    ],
    availableFeatures: ["chatbot", "summarizer", "report-generator", "image-analysis"],
  };
}
export async function saveMapping(plans: any) {
  return { success: true };
}

export async function sendTestEvent() {
  return { success: true };
}
export async function seedTestBillingData() {
  return { success: true };
}
export async function recalculateNow() {
  return { lastCalculated: new Date() };
}

export async function submitWaitlist(email: string) {
  return { success: true };
}

export async function signup(email: string, password: string) {
  return { success: true, userId: "u_demo" };
}
export async function login(email: string, password: string) {
  return { success: true, userId: "u_demo" };
}
export async function requestPasswordReset(email: string) {
  return { success: true };
}
