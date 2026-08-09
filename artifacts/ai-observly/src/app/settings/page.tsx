"use client";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  useGenerateKey,
  useRegenerateKey,
  useRevokeKey,
  useSendTestEvent,
  useRecalculateNow,
  useCustomFeatures,
  useSaveCustomFeatures,
  useCustomPlans,
  useSaveCustomPlans,
  useAddonCosts,
  useSaveAddonCosts,
} from "@/hooks/use-api";
import { type CustomFeature, type CustomPlan, type AddonCost, getAddonCosts, saveAddonCosts } from "@/lib/api";
import {
  Key, Copy, RefreshCw, Trash2, PlusCircle, X, ChevronDown, ChevronUp,
  Zap, CreditCard, BookOpen, FlaskConical, Loader2, AlertCircle, CheckCircle2,
  DollarSign, Pencil,
} from "lucide-react";

// ─── Add-on Cost Tab ───────────────────────────────────────────────────────

const COST_TYPES = ["Infra", "Resource", "Third-party", "Other"];
const CURRENCIES = ["USD", "EUR", "GBP", "CAD"];

const MOCK_FEATURES = [
  { id: "chat", name: "Smart Chat" },
  { id: "summarization", name: "Summarization" },
  { id: "code_assist", name: "Code Assist" },
  { id: "translation", name: "Translation" },
];

function emptyAddon(): Omit<AddonCost, "id"> {
  return {
    costType: "Infra",
    amount: 0,
    currency: "USD",
    featureId: "",
    featureName: "",
    dateIncurred: new Date().toISOString().split("T")[0],
    recurrence: "one-time",
    notes: "",
  };
}

function AddonCostTab({ customFeatures }: { customFeatures: CustomFeature[] }) {
  const { toast } = useToast();
  const [costs, setCosts] = useState<AddonCost[]>([]);
  const [form, setForm] = useState<Omit<AddonCost, "id">>(emptyAddon());
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Merge custom features + default mock features for the dropdown
  const allFeatures = [
    ...MOCK_FEATURES,
    ...customFeatures.filter((f) => !MOCK_FEATURES.find((m) => m.id === f.id)),
  ];

  useEffect(() => {
    setCosts(getAddonCosts());
  }, []);

  const recalculate = (updatedCosts: AddonCost[]) => {
    // Store locally — in a real app, this would hit the backend
    saveAddonCosts(updatedCosts);
    setCosts(updatedCosts);
  };

  const handleSave = () => {
    if (!form.featureId) {
      toast({ title: "Please select a feature", variant: "destructive" });
      return;
    }
    if (form.amount <= 0) {
      toast({ title: "Amount must be greater than 0", variant: "destructive" });
      return;
    }

    const featureName = allFeatures.find((f) => f.id === form.featureId)?.name ?? form.featureId;

    if (editId) {
      const updated = costs.map((c) =>
        c.id === editId ? { ...form, featureName, id: editId } : c
      );
      recalculate(updated);
      toast({ title: "Cost updated" });
    } else {
      const newCost: AddonCost = { ...form, featureName, id: `ac_${Date.now()}` };
      recalculate([...costs, newCost]);
      toast({ title: "Cost logged" });
    }

    setForm(emptyAddon());
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (c: AddonCost) => {
    setForm({
      costType: c.costType,
      amount: c.amount,
      currency: c.currency,
      featureId: c.featureId,
      featureName: c.featureName,
      dateIncurred: c.dateIncurred,
      recurrence: c.recurrence,
      notes: c.notes ?? "",
    });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const updated = costs.filter((c) => c.id !== id);
    recalculate(updated);
    toast({ title: "Cost removed" });
  };

  const totalByFeature = costs.reduce<Record<string, number>>((acc, c) => {
    acc[c.featureId] = (acc[c.featureId] ?? 0) + c.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-semibold">Add-on Costs</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Log additional costs (infra, third-party tools) that flow into your feature ROI calculations.
          </p>
        </div>
        <button
          onClick={() => { setForm(emptyAddon()); setEditId(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <PlusCircle className="w-4 h-4" /> Log Cost
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{editId ? "Edit cost" : "Log a new cost"}</h3>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cost type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cost type</label>
              <select
                value={form.costType}
                onChange={(e) => setForm((f) => ({ ...f, costType: e.target.value }))}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {COST_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* Feature */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Associated feature</label>
              <select
                value={form.featureId}
                onChange={(e) => setForm((f) => ({ ...f, featureId: e.target.value }))}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select a feature…</option>
                {allFeatures.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Amount</label>
              <div className="flex gap-2">
                <select
                  value={form.currency}
                  onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm w-24"
                >
                  {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.amount || ""}
                  onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date incurred</label>
              <Input
                type="date"
                value={form.dateIncurred}
                onChange={(e) => setForm((f) => ({ ...f, dateIncurred: e.target.value }))}
              />
            </div>

            {/* Recurrence */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recurrence</label>
              <select
                value={form.recurrence}
                onChange={(e) => setForm((f) => ({ ...f, recurrence: e.target.value as AddonCost["recurrence"] }))}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="one-time">One-time</option>
                <option value="monthly">Monthly (recurring)</option>
                <option value="weekly">Weekly (recurring)</option>
              </select>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes (optional)</label>
              <Input
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="e.g. GPU server for inference"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {editId ? "Update cost" : "Log cost"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Per-feature impact summary */}
      {Object.keys(totalByFeature).length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">ROI impact summary</p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(totalByFeature).map(([fid, total]) => {
              const fname = allFeatures.find((f) => f.id === fid)?.name ?? fid;
              return (
                <div key={fid} className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 text-sm">
                  <DollarSign className="w-3.5 h-3.5 text-orange-500" />
                  <span className="font-medium text-foreground">{fname}</span>
                  <span className="text-muted-foreground">+${total.toLocaleString()} cost</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Costs table */}
      {costs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
          <DollarSign className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No add-on costs logged yet.</p>
          <p className="text-xs mt-1">Costs logged here are included in feature ROI calculations.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[1fr_80px_100px_90px_90px_72px] gap-3 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
            <span>Type / Feature</span>
            <span>Amount</span>
            <span>Date</span>
            <span>Recurrence</span>
            <span>Notes</span>
            <span />
          </div>
          {costs.map((c) => (
            <div key={c.id} className="bg-card border border-border rounded-xl shadow-sm">
              {/* Mobile */}
              <div className="sm:hidden p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{c.costType}</p>
                    <p className="text-xs text-muted-foreground">{c.featureName}</p>
                  </div>
                  <p className="font-bold text-foreground">${c.amount} {c.currency}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{c.dateIncurred} · <span className="capitalize">{c.recurrence}</span></span>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(c)} className="text-primary hover:text-primary/80 p-1"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
              {/* Desktop */}
              <div className="hidden sm:grid grid-cols-[1fr_80px_100px_90px_90px_72px] gap-3 px-4 py-3.5 items-center text-sm">
                <div>
                  <p className="font-medium text-foreground">{c.costType}</p>
                  <p className="text-xs text-muted-foreground">{c.featureName}</p>
                </div>
                <span className="font-semibold text-foreground">${c.amount} <span className="text-xs text-muted-foreground font-normal">{c.currency}</span></span>
                <span className="text-muted-foreground">{c.dateIncurred}</span>
                <span className="capitalize text-muted-foreground">{c.recurrence}</span>
                <span className="text-muted-foreground truncate text-xs">{c.notes || "—"}</span>
                <div className="flex gap-1.5 justify-end">
                  <button onClick={() => handleEdit(c)} className="text-muted-foreground hover:text-primary p-1.5 rounded-md hover:bg-primary/10 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(c.id)} className="text-muted-foreground hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Settings ──────────────────────────────────────────────────────────

function SettingsContent() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"keys" | "features" | "plans" | "guide" | "debug" | "addon-cost">("keys");
  const [guideMode, setGuideMode] = useState<"self" | "developer">("self");

  // Check URL param on mount for deep-linking to a tab (e.g. ?tab=addon-cost)
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab === "addon-cost") setActiveTab("addon-cost");
  }, []);
  const [apiKey, setApiKey] = useState("");
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  const generateKey = useGenerateKey();
  const regenerateKey = useRegenerateKey();
  const revokeKey = useRevokeKey();
  const sendTest = useSendTestEvent();
  const recalculate = useRecalculateNow();

  const { data: savedFeatures, isLoading: featuresLoading } = useCustomFeatures();
  const { data: savedPlans, isLoading: plansLoading } = useCustomPlans();
  const saveFeatures = useSaveCustomFeatures();
  const savePlans = useSaveCustomPlans();

  const [features, setFeatures] = useState<CustomFeature[]>([]);
  const [plans, setPlans] = useState<CustomPlan[]>([]);

  useEffect(() => { if (savedFeatures) setFeatures(savedFeatures); }, [savedFeatures]);
  useEffect(() => { if (savedPlans) setPlans(savedPlans); }, [savedPlans]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const handleGenerateKey = () => generateKey.mutate(undefined, {
    onSuccess: (data) => { setApiKey(data.keyDisplay); toast({ title: "API key generated" }); },
  });
  const handleRegenerateKey = () => regenerateKey.mutate(undefined, {
    onSuccess: (data) => { setApiKey(data.keyDisplay); toast({ title: "API key regenerated" }); },
  });
  const handleRevokeKey = () => revokeKey.mutate(undefined, {
    onSuccess: () => { setApiKey(""); toast({ title: "API key revoked" }); },
  });

  const addFeature = () => {
    const id = `feat_${Date.now()}`;
    setFeatures((prev) => [...prev, { id, name: "", label: "" }]);
    setExpandedFeature(id);
  };
  const updateFeature = (id: string, field: "name" | "label", value: string) =>
    setFeatures((prev) => prev.map((f) => f.id === id ? { ...f, [field]: value } : f));
  const deleteFeature = (id: string) => {
    setFeatures((prev) => prev.filter((f) => f.id !== id));
    setPlans((prev) => prev.map((p) => ({ ...p, includedFeatureIds: p.includedFeatureIds.filter((fid) => fid !== id) })));
  };
  const handleSaveFeatures = () => saveFeatures.mutate(features, {
    onSuccess: () => toast({ title: "Features saved" }),
    onError: () => toast({ title: "Failed to save features", variant: "destructive" }),
  });

  const addPlan = () => setPlans((prev) => [...prev, { id: `plan_${Date.now()}`, name: "", includedFeatureIds: [] }]);
  const updatePlan = (id: string, field: "name", value: string) =>
    setPlans((prev) => prev.map((p) => p.id === id ? { ...p, [field]: value } : p));
  const deletePlan = (id: string) => setPlans((prev) => prev.filter((p) => p.id !== id));
  const togglePlanFeature = (planId: string, featureId: string) => {
    setPlans((prev) => prev.map((p) => {
      if (p.id !== planId) return p;
      const included = p.includedFeatureIds.includes(featureId);
      return { ...p, includedFeatureIds: included ? p.includedFeatureIds.filter((id) => id !== featureId) : [...p.includedFeatureIds, featureId] };
    }));
  };
  const handleSavePlans = () => savePlans.mutate(plans, {
    onSuccess: () => toast({ title: "Plans saved" }),
    onError: () => toast({ title: "Failed to save plans", variant: "destructive" }),
  });

  const promptText = `I want to track how much I'm spending on AI (OpenAI/Anthropic) calls, broken 
down by which customer is using it and which feature they're using, using a 
tool called AI Observly. Please do the following:

1. Find every place in my code where we call the OpenAI or Anthropic API.

2. After each of those calls finishes and we have the AI's answer, add a 
   step that sends a small report to AI Observly in the background — this 
   must NOT wait for a response and must NOT affect what happens with the 
   real AI answer in any way, even if this report fails to send.

3. The report should be a POST request to:
   https://[your-ai-observly-domain]/api/log-usage

   With this information:
   - api_key: "${apiKey || "obs_live_xxxxxxxxxxxxxxxx"}"
   - customer_id: the ID of whichever customer is logged in
   - feature_label: a short label for which feature this call belongs to
   - model: the name of the AI model used
   - input_tokens and output_tokens: from the normal API response

4. Don't change anything else about how the AI calls work.

Show me exactly what you're about to change before applying it, so I can 
confirm.`;

  const tabs = [
    { id: "keys", label: "API Keys", icon: Key },
    { id: "features", label: "Features", icon: Zap },
    { id: "plans", label: "Plans", icon: CreditCard },
    { id: "addon-cost", label: "Add-on Cost", icon: DollarSign },
    { id: "guide", label: "Integration", icon: BookOpen },
    { id: "debug", label: "Debug", icon: FlaskConical },
  ] as const;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-outfit text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your API keys, features, and integration</p>
      </div>

      {/* Tabs — horizontal scroll on mobile */}
      <div className="flex gap-1 border-b border-border overflow-x-auto no-scrollbar pb-px">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
              activeTab === id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* KEYS */}
      {activeTab === "keys" && (
        <div className="space-y-6 max-w-2xl">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-semibold mb-1">Your API Key</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Used to authenticate usage events sent from your app to AI Observly.
            </p>
            {apiKey ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 font-mono text-sm bg-background border border-border rounded-md p-3 text-primary font-medium overflow-x-auto select-all">
                    {apiKey}
                  </div>
                  <button onClick={() => copyToClipboard(apiKey)} className="bg-secondary text-secondary-foreground px-4 rounded-md flex items-center gap-2 hover:bg-secondary/80 font-medium text-sm">
                    <Copy className="w-4 h-4" /> Copy
                  </button>
                </div>
                <p className="text-sm text-yellow-600 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Save this key — you won't be able to see the full value again.
                </p>
                <div className="flex gap-2 pt-2 flex-wrap">
                  <button onClick={handleRegenerateKey} disabled={regenerateKey.isPending} className="flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-background hover:bg-muted text-sm font-medium transition-colors">
                    <RefreshCw className="w-4 h-4" />
                    {regenerateKey.isPending ? "Regenerating..." : "Regenerate"}
                  </button>
                  <button onClick={handleRevokeKey} disabled={revokeKey.isPending} className="flex items-center gap-2 px-4 py-2 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium transition-colors">
                    <Trash2 className="w-4 h-4" />
                    {revokeKey.isPending ? "Revoking..." : "Revoke"}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={handleGenerateKey} disabled={generateKey.isPending} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
                {generateKey.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                {generateKey.isPending ? "Generating..." : "Generate API Key"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* FEATURES */}
      {activeTab === "features" && (
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-base font-semibold">Your AI Features</h2>
              <p className="text-sm text-muted-foreground mt-1">Define the features you send as <code className="font-mono bg-muted px-1 rounded text-xs">feature_label</code> in usage events.</p>
            </div>
            <button onClick={addFeature} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              <PlusCircle className="w-4 h-4" /> Add Feature
            </button>
          </div>
          {featuresLoading ? (
            <div className="flex items-center justify-center h-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : features.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
              <Zap className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No features yet. Add your first AI feature.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {features.map((f) => (
                <div key={f.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpandedFeature(expandedFeature === f.id ? null : f.id)}>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center"><Zap className="w-3.5 h-3.5" /></div>
                      <span className="font-medium text-sm">{f.name || <span className="text-muted-foreground italic">Unnamed feature</span>}</span>
                      {f.label && <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{f.label}</code>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); deleteFeature(f.id); }} className="text-muted-foreground hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      {expandedFeature === f.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>
                  {expandedFeature === f.id && (
                    <div className="px-4 pb-4 border-t border-border pt-4 space-y-3 bg-muted/10">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Display name</label>
                          <Input value={f.name} onChange={(e) => updateFeature(f.id, "name", e.target.value)} placeholder="e.g. Smart chatbot" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">feature_label (sent in API)</label>
                          <Input value={f.label} onChange={(e) => updateFeature(f.id, "label", e.target.value)} placeholder="e.g. chatbot" className="font-mono" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {features.length > 0 && (
            <div className="flex justify-end pt-2">
              <button onClick={handleSaveFeatures} disabled={saveFeatures.isPending} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
                {saveFeatures.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Save Features
              </button>
            </div>
          )}
        </div>
      )}

      {/* PLANS */}
      {activeTab === "plans" && (
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-base font-semibold">Your Pricing Plans</h2>
              <p className="text-sm text-muted-foreground mt-1">Map your pricing tiers to the AI features they include.</p>
            </div>
            <button onClick={addPlan} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              <PlusCircle className="w-4 h-4" /> Add Plan
            </button>
          </div>
          {plansLoading ? (
            <div className="flex items-center justify-center h-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
              <CreditCard className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No plans yet. Add your pricing tiers.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {plans.map((p) => (
                <div key={p.id} className="bg-card border border-border rounded-xl shadow-sm p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center"><CreditCard className="w-3.5 h-3.5" /></div>
                    <Input value={p.name} onChange={(e) => updatePlan(p.id, "name", e.target.value)} placeholder="Plan name (e.g. Pro)" className="h-8 flex-1" />
                    <button onClick={() => deletePlan(p.id)} className="text-muted-foreground hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Included features</p>
                    {features.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">Add features first</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {features.map((f) => {
                          const included = p.includedFeatureIds.includes(f.id);
                          return (
                            <button key={f.id} onClick={() => togglePlanFeature(p.id, f.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${included ? "bg-primary/10 text-primary border-primary/30" : "bg-muted text-muted-foreground border-border hover:bg-muted/80"}`}>
                              {included ? <CheckCircle2 className="w-3 h-3 inline mr-1" /> : null}
                              {f.name || f.label || "Unnamed"}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {plans.length > 0 && (
            <div className="flex justify-end pt-2">
              <button onClick={handleSavePlans} disabled={savePlans.isPending} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
                {savePlans.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Save Plans
              </button>
            </div>
          )}
        </div>
      )}

      {/* ADD-ON COST */}
      {activeTab === "addon-cost" && <AddonCostTab customFeatures={features} />}

      {/* GUIDE */}
      {activeTab === "guide" && (
        <div className="max-w-2xl space-y-6">
          <div>
            <h2 className="text-base font-semibold mb-1">Integration</h2>
            <p className="text-sm text-muted-foreground">Connect your app to AI Observly in the way that fits your workflow.</p>
          </div>

          {/* Path toggle */}
          <div className="flex bg-muted rounded-lg p-1 max-w-sm">
            <button
              onClick={() => setGuideMode("self")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${guideMode === "self" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              I'll set this up myself
            </button>
            <button
              onClick={() => setGuideMode("developer")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${guideMode === "developer" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              I have a developer
            </button>
          </div>

          {guideMode === "self" ? (
            /* ── Self path: AI prompt ── */
            <div>
              <p className="text-sm text-muted-foreground mb-4">Paste this into Replit, Cursor, Lovable, or any AI coding tool to add AI Observly tracking automatically.</p>
              <div className="relative">
                <button onClick={() => copyToClipboard(promptText)} className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 hover:bg-secondary/80 font-medium z-10">
                  <Copy className="w-3.5 h-3.5" /> Copy prompt
                </button>
                <pre className="bg-muted/50 border border-border rounded-xl p-6 pt-14 text-sm text-foreground overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                  {promptText}
                </pre>
              </div>
            </div>
          ) : (
            /* ── Developer path: technical docs ── */
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h3 className="font-semibold mb-2">How AI Observly logging works</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your app keeps calling OpenAI/Anthropic exactly as it does today, using your own API key. Nothing routes through AI Observly. After each call completes, send us a small usage report in the background — don't await it, and don't let a failure affect the user-facing request in any way.
                  </p>
                </div>
                <div className="p-6 space-y-6">
                  {/* Endpoint */}
                  <div>
                    <div className="inline-flex items-center gap-3 bg-muted/50 border border-border rounded-lg px-4 py-3 font-mono text-sm mb-4 w-full">
                      <span className="text-primary font-bold">POST</span>
                      <span className="text-foreground/80 break-all">https://[your-ai-observly-domain]/api/log-usage</span>
                    </div>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Payload</h4>
                    <div className="relative">
                      <button onClick={() => copyToClipboard(`{\n  "api_key": "${apiKey || "obs_live_xxxxxxxxxxxxxxxx"}",\n  "customer_id": "the ID you use for this customer",\n  "feature_label": "chatbot",\n  "model": "gpt-4o",\n  "input_tokens": 512,\n  "output_tokens": 128\n}`)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground p-1">
                        <Copy className="w-4 h-4" />
                      </button>
                      <pre className="bg-muted/50 border border-border rounded-lg p-4 pr-10 text-sm font-mono text-foreground overflow-x-auto">{`{
  "api_key": "${apiKey || "obs_live_xxxxxxxxxxxxxxxx"}",
  "customer_id": "the ID you use for this customer",
  "feature_label": "chatbot",
  "model": "gpt-4o",
  "input_tokens": 512,
  "output_tokens": 128
}`}</pre>
                    </div>
                  </div>
                  {/* Code example */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Example (Node.js) — fire-and-forget</h4>
                    <div className="relative">
                      <button onClick={() => copyToClipboard(`const response = await openai.chat.completions.create({ ... });\n\nfetch("https://[your-ai-observly-domain]/api/log-usage", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({\n    api_key: process.env.AI_OBSERVLY_KEY,\n    customer_id: currentCustomer.id,\n    feature_label: "chatbot",\n    model: "gpt-4o",\n    input_tokens: response.usage.prompt_tokens,\n    output_tokens: response.usage.completion_tokens,\n  }),\n}).catch(() => {});`)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground p-1">
                        <Copy className="w-4 h-4" />
                      </button>
                      <pre className="bg-muted/50 border border-border rounded-lg p-4 pr-10 text-sm font-mono text-foreground overflow-x-auto">{`const response = await openai.chat.completions.create({ ... });

fetch("https://[your-ai-observly-domain]/api/log-usage", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    api_key: process.env.AI_OBSERVLY_KEY,
    customer_id: currentCustomer.id,
    feature_label: "chatbot",
    model: "gpt-4o",
    input_tokens: response.usage.prompt_tokens,
    output_tokens: response.usage.completion_tokens,
  }),
}).catch(() => {});`}</pre>
                    </div>
                  </div>
                  {/* Note */}
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3 text-sm">
                    <span className="font-semibold text-primary shrink-0">Note:</span>
                    <span className="text-muted-foreground">Call this after every AI request you want tracked. Never await/block on it in the main request path.</span>
                  </div>
                  {/* Copy link hint */}
                  <div className="flex items-center gap-3 pt-2 border-t border-border">
                    <p className="text-sm text-muted-foreground flex-1">Share this page with your developer</p>
                    <button
                      onClick={() => { copyToClipboard(window.location.href); }}
                      className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy link
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DEBUG */}
      {activeTab === "debug" && (
        <div className="max-w-2xl space-y-6">
          <div>
            <h2 className="text-base font-semibold mb-1">Debug Tools</h2>
            <p className="text-sm text-muted-foreground">Test your integration and trigger a manual recalculation.</p>
          </div>
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold mb-2">Send test event</h3>
              <p className="text-sm text-muted-foreground mb-4">Sends a synthetic usage event to verify your integration is working.</p>
              <button onClick={() => sendTest.mutate(undefined, { onSuccess: () => toast({ title: "Test event sent!" }), onError: () => toast({ title: "Failed to send test", variant: "destructive" }) })} disabled={sendTest.isPending} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                {sendTest.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
                Send test event
              </button>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold mb-2">Recalculate now</h3>
              <p className="text-sm text-muted-foreground mb-4">Forces an immediate recalculation of your cost and margin data.</p>
              <button onClick={() => recalculate.mutate(undefined, { onSuccess: () => toast({ title: "Recalculation triggered" }), onError: () => toast({ title: "Failed to recalculate", variant: "destructive" }) })} disabled={recalculate.isPending} className="flex items-center gap-2 bg-secondary text-secondary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">
                {recalculate.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Recalculate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Settings() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <SettingsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
