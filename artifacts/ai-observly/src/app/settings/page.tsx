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
} from "@/hooks/use-api";
import { type CustomFeature, type CustomPlan } from "@/lib/api";
import {
  Key, Copy, RefreshCw, Trash2, PlusCircle, X, ChevronDown, ChevronUp,
  Zap, CreditCard, BookOpen, FlaskConical, Loader2, AlertCircle, CheckCircle2,
} from "lucide-react";

function SettingsContent() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"keys" | "features" | "plans" | "guide" | "debug">("keys");
  const [apiKey, setApiKey] = useState("");
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  // API key mutations
  const generateKey = useGenerateKey();
  const regenerateKey = useRegenerateKey();
  const revokeKey = useRevokeKey();
  const sendTest = useSendTestEvent();
  const recalculate = useRecalculateNow();

  // Features & Plans
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

  const handleGenerateKey = () => {
    generateKey.mutate(undefined, {
      onSuccess: (data) => { setApiKey(data.keyDisplay); toast({ title: "API key generated" }); },
    });
  };

  const handleRegenerateKey = () => {
    regenerateKey.mutate(undefined, {
      onSuccess: (data) => { setApiKey(data.keyDisplay); toast({ title: "API key regenerated" }); },
    });
  };

  const handleRevokeKey = () => {
    revokeKey.mutate(undefined, {
      onSuccess: () => { setApiKey(""); toast({ title: "API key revoked" }); },
    });
  };

  // Feature CRUD
  const addFeature = () => {
    const id = `feat_${Date.now()}`;
    setFeatures(prev => [...prev, { id, name: "", label: "" }]);
    setExpandedFeature(id);
  };

  const updateFeature = (id: string, field: "name" | "label", value: string) => {
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const deleteFeature = (id: string) => {
    setFeatures(prev => prev.filter(f => f.id !== id));
    setPlans(prev => prev.map(p => ({ ...p, includedFeatureIds: p.includedFeatureIds.filter(fid => fid !== id) })));
  };

  const handleSaveFeatures = () => {
    saveFeatures.mutate(features, {
      onSuccess: () => toast({ title: "Features saved" }),
      onError: () => toast({ title: "Failed to save features", variant: "destructive" }),
    });
  };

  // Plan CRUD
  const addPlan = () => {
    setPlans(prev => [...prev, { id: `plan_${Date.now()}`, name: "", includedFeatureIds: [] }]);
  };

  const updatePlan = (id: string, field: "name", value: string) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const deletePlan = (id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id));
  };

  const togglePlanFeature = (planId: string, featureId: string) => {
    setPlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      const included = p.includedFeatureIds.includes(featureId);
      return { ...p, includedFeatureIds: included ? p.includedFeatureIds.filter(id => id !== featureId) : [...p.includedFeatureIds, featureId] };
    }));
  };

  const handleSavePlans = () => {
    savePlans.mutate(plans, {
      onSuccess: () => toast({ title: "Plans saved" }),
      onError: () => toast({ title: "Failed to save plans", variant: "destructive" }),
    });
  };

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
    { id: "guide", label: "Integration", icon: BookOpen },
    { id: "debug", label: "Debug", icon: FlaskConical },
  ] as const;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-outfit text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your API keys, features, and integration</p>
      </div>

      <div className="flex gap-1 border-b border-border flex-wrap">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
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
                  <button
                    onClick={() => copyToClipboard(apiKey)}
                    className="bg-secondary text-secondary-foreground px-4 rounded-md flex items-center gap-2 hover:bg-secondary/80 font-medium text-sm"
                  >
                    <Copy className="w-4 h-4" /> Copy
                  </button>
                </div>
                <p className="text-sm text-yellow-600 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Save this key — you won't be able to see the full value again.
                </p>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleRegenerateKey}
                    disabled={regenerateKey.isPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-background hover:bg-muted text-sm font-medium transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {regenerateKey.isPending ? "Regenerating..." : "Regenerate"}
                  </button>
                  <button
                    onClick={handleRevokeKey}
                    disabled={revokeKey.isPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    {revokeKey.isPending ? "Revoking..." : "Revoke"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleGenerateKey}
                disabled={generateKey.isPending}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
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
          <div className="flex items-center justify-between">
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
              {features.map(f => (
                <div key={f.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedFeature(expandedFeature === f.id ? null : f.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center"><Zap className="w-3.5 h-3.5" /></div>
                      <span className="font-medium text-sm">{f.name || <span className="text-muted-foreground italic">Unnamed feature</span>}</span>
                      {f.label && <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{f.label}</code>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => { e.stopPropagation(); deleteFeature(f.id); }}
                        className="text-muted-foreground hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                      ><Trash2 className="w-4 h-4" /></button>
                      {expandedFeature === f.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>
                  {expandedFeature === f.id && (
                    <div className="px-4 pb-4 border-t border-border pt-4 space-y-3 bg-muted/10">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Display name</label>
                          <Input value={f.name} onChange={e => updateFeature(f.id, "name", e.target.value)} placeholder="e.g. Smart chatbot" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">feature_label (sent in API)</label>
                          <Input value={f.label} onChange={e => updateFeature(f.id, "label", e.target.value)} placeholder="e.g. chatbot" className="font-mono" />
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
              <button
                onClick={handleSaveFeatures}
                disabled={saveFeatures.isPending}
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
              >
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
          <div className="flex items-center justify-between">
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
              {plans.map(p => (
                <div key={p.id} className="bg-card border border-border rounded-xl shadow-sm p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center"><CreditCard className="w-3.5 h-3.5" /></div>
                    <Input
                      value={p.name}
                      onChange={e => updatePlan(p.id, "name", e.target.value)}
                      placeholder="Plan name (e.g. Pro)"
                      className="h-8 flex-1"
                    />
                    <button onClick={() => deletePlan(p.id)} className="text-muted-foreground hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Included features</p>
                    {features.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">Add features first</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {features.map(f => {
                          const included = p.includedFeatureIds.includes(f.id);
                          return (
                            <button
                              key={f.id}
                              onClick={() => togglePlanFeature(p.id, f.id)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                                included
                                  ? "bg-primary/10 text-primary border-primary/30"
                                  : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                              }`}
                            >
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
              <button
                onClick={handleSavePlans}
                disabled={savePlans.isPending}
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                {savePlans.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Save Plans
              </button>
            </div>
          )}
        </div>
      )}

      {/* GUIDE */}
      {activeTab === "guide" && (
        <div className="max-w-2xl space-y-6">
          <div>
            <h2 className="text-base font-semibold mb-1">Integration prompt</h2>
            <p className="text-sm text-muted-foreground">
              Paste this into Replit, Cursor, Lovable, or any AI coding tool to add AI Observly tracking automatically.
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => copyToClipboard(promptText)}
              className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 hover:bg-secondary/80 font-medium z-10"
            >
              <Copy className="w-3.5 h-3.5" /> Copy prompt
            </button>
            <pre className="bg-muted/50 border border-border rounded-xl p-6 pt-14 text-sm text-foreground overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
              {promptText}
            </pre>
          </div>
        </div>
      )}

      {/* DEBUG */}
      {activeTab === "debug" && (
        <div className="max-w-2xl space-y-6">
          <div>
            <h2 className="text-base font-semibold mb-1">Debug Tools</h2>
            <p className="text-sm text-muted-foreground">
              Test your integration and trigger a manual recalculation.
            </p>
          </div>
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold mb-2">Send test event</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Sends a synthetic usage event to verify your integration is working.
              </p>
              <button
                onClick={() => sendTest.mutate(undefined, { onSuccess: () => toast({ title: "Test event sent!" }), onError: () => toast({ title: "Failed to send test", variant: "destructive" }) })}
                disabled={sendTest.isPending}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {sendTest.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
                Send test event
              </button>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold mb-2">Recalculate now</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Forces an immediate recalculation of your cost and margin data.
              </p>
              <button
                onClick={() => recalculate.mutate(undefined, { onSuccess: () => toast({ title: "Recalculation triggered" }), onError: () => toast({ title: "Failed to recalculate", variant: "destructive" }) })}
                disabled={recalculate.isPending}
                className="flex items-center gap-2 bg-secondary text-secondary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
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
