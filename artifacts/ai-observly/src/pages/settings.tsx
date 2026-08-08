import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout";
import { 
  useGenerateKey, 
  useRegenerateKey, 
  useRevokeKey,
  useCustomFeatures,
  useCustomPlans,
  useSaveCustomFeatures,
  useSaveCustomPlans,
  useSendTestEvent,
  useRecalculateNow
} from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { Copy, KeyRound, Network, Code, BugPlay, AlertTriangle, RefreshCw, Trash2, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomFeature, CustomPlan } from "@/lib/api";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("keys");
  const { toast } = useToast();
  
  // Keys State
  const [apiKey, setApiKey] = useState<string | null>(null);
  const generateKey = useGenerateKey();
  const regenerateKey = useRegenerateKey();
  const revokeKey = useRevokeKey();
  const [showRevokeWarning, setShowRevokeWarning] = useState(false);

  // Features & Plans State
  const { data: serverFeatures, isLoading: featuresLoading } = useCustomFeatures();
  const { data: serverPlans, isLoading: plansLoading } = useCustomPlans();
  const saveFeatures = useSaveCustomFeatures();
  const savePlans = useSaveCustomPlans();

  const [features, setFeatures] = useState<CustomFeature[]>([]);
  const [plans, setPlans] = useState<CustomPlan[]>([]);
  
  const [newFeatureName, setNewFeatureName] = useState("");
  const [newFeatureLabel, setNewFeatureLabel] = useState("");
  const [newPlanName, setNewPlanName] = useState("");

  const initializedFeatures = useRef(false);
  const initializedPlans = useRef(false);

  useEffect(() => {
    if (serverFeatures && !initializedFeatures.current) {
      setFeatures(serverFeatures);
      initializedFeatures.current = true;
    }
  }, [serverFeatures]);

  useEffect(() => {
    if (serverPlans && !initializedPlans.current) {
      setPlans(serverPlans);
      initializedPlans.current = true;
    }
  }, [serverPlans]);

  // Debug State
  const sendTestEvent = useSendTestEvent();
  const recalculateNow = useRecalculateNow();
  const [lastCalculated, setLastCalculated] = useState<string | null>(null);

  // Integration Guide State
  const [guideTab, setGuideTab] = useState("developer");

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const handleGenerateKey = () => {
    generateKey.mutate(undefined, {
      onSuccess: (data) => setApiKey(data.keyDisplay)
    });
  };

  const handleRegenerateKey = () => {
    regenerateKey.mutate(undefined, {
      onSuccess: (data) => {
        setApiKey(data.keyDisplay);
        toast({ title: "Key regenerated", description: "Update your app with the new key." });
      }
    });
  };

  const handleRevokeKey = () => {
    revokeKey.mutate(undefined, {
      onSuccess: () => {
        setApiKey(null);
        setShowRevokeWarning(false);
        toast({ title: "Key revoked", description: "Your app will no longer be able to send events." });
      }
    });
  };

  // Features Handlers
  const handleAddFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureName || !newFeatureLabel) return;
    
    const newFeature = {
      id: "f_" + Math.random().toString(36).slice(2, 9),
      name: newFeatureName,
      label: newFeatureLabel
    };
    
    const updated = [...features, newFeature];
    setFeatures(updated);
    saveFeatures.mutate(updated);
    
    setNewFeatureName("");
    setNewFeatureLabel("");
    toast({ title: "Feature added" });
  };

  const handleDeleteFeature = (id: string) => {
    const updated = features.filter(f => f.id !== id);
    setFeatures(updated);
    saveFeatures.mutate(updated);
    
    // Also remove from plans
    const updatedPlans = plans.map(p => ({
      ...p,
      includedFeatureIds: p.includedFeatureIds.filter(fId => fId !== id)
    }));
    setPlans(updatedPlans);
    savePlans.mutate(updatedPlans);
    
    toast({ title: "Feature removed" });
  };

  // Plan Handlers
  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName) return;
    
    const newPlan = {
      id: "p_" + Math.random().toString(36).slice(2, 9),
      name: newPlanName,
      includedFeatureIds: []
    };
    
    const updated = [...plans, newPlan];
    setPlans(updated);
    savePlans.mutate(updated);
    
    setNewPlanName("");
    toast({ title: "Plan added" });
  };

  const handleDeletePlan = (id: string) => {
    const updated = plans.filter(p => p.id !== id);
    setPlans(updated);
    savePlans.mutate(updated);
    toast({ title: "Plan removed" });
  };

  const togglePlanFeature = (planId: string, featureId: string) => {
    const updated = plans.map(p => {
      if (p.id !== planId) return p;
      const has = p.includedFeatureIds.includes(featureId);
      return {
        ...p,
        includedFeatureIds: has 
          ? p.includedFeatureIds.filter(id => id !== featureId)
          : [...p.includedFeatureIds, featureId]
      };
    });
    setPlans(updated);
    savePlans.mutate(updated);
  };

  const tabs = [
    { id: "keys", label: "Developer Keys", icon: KeyRound },
    { id: "features", label: "Features & Plans", icon: Network },
    { id: "guide", label: "Integration Guide", icon: Code },
    { id: "debug", label: "Test & Debug", icon: BugPlay },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-outfit">Settings</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Nav */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 max-w-3xl">
          
          {/* KEYS TAB */}
          {activeTab === "keys" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-xl font-bold font-outfit mb-6">Developer Keys</h2>
              
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-8">
                <h3 className="font-semibold mb-2">API Secret Key</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Use this key in your backend to authenticate requests to the AI Observly API.
                </p>

                {!apiKey ? (
                  <button 
                    onClick={handleGenerateKey}
                    disabled={generateKey.isPending}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium"
                    data-testid="btn-generate-key"
                  >
                    {generateKey.isPending ? "Generating..." : "Generate Key"}
                  </button>
                ) : (
                  <div>
                    <div className="flex gap-2 mb-3">
                      <div className="flex-1 font-mono text-sm bg-background border border-border rounded-md p-3 select-all overflow-x-auto text-primary font-medium">
                        {apiKey.includes('••••') ? apiKey : apiKey}
                      </div>
                      <button 
                        onClick={() => handleCopy(apiKey)}
                        className="bg-secondary text-secondary-foreground px-4 rounded-md flex items-center gap-2 hover:bg-secondary/80 font-medium"
                        data-testid="btn-copy-key"
                      >
                        <Copy className="w-4 h-4" /> Copy
                      </button>
                    </div>
                    {!apiKey.includes('••••') && (
                      <p className="text-sm text-yellow-600 flex items-center gap-1.5 mb-6">
                        <AlertTriangle className="w-4 h-4" /> Store this somewhere safe — you won't be able to see the full key again.
                      </p>
                    )}
                    
                    <div className="flex gap-3 mt-6 pt-6 border-t border-border">
                      <button 
                        onClick={handleRegenerateKey}
                        disabled={regenerateKey.isPending}
                        className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary/80 flex items-center gap-2"
                        data-testid="btn-regenerate-key"
                      >
                        <RefreshCw className="w-4 h-4" /> Regenerate
                      </button>
                      
                      {!showRevokeWarning ? (
                        <button 
                          onClick={() => setShowRevokeWarning(true)}
                          className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm font-medium hover:bg-destructive/20"
                          data-testid="btn-revoke-key"
                        >
                          Revoke
                        </button>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-destructive font-medium">Are you sure?</span>
                          <button onClick={handleRevokeKey} className="bg-destructive text-destructive-foreground px-3 py-1.5 rounded text-sm font-medium" data-testid="btn-confirm-revoke">Yes, revoke</button>
                          <button onClick={() => setShowRevokeWarning(false)} className="px-3 py-1.5 rounded text-sm text-muted-foreground hover:text-foreground">Cancel</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FEATURES & PLANS TAB */}
          {activeTab === "features" && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-8">
                <h2 className="text-xl font-bold font-outfit mb-2">Features & Plans</h2>
                <p className="text-muted-foreground text-sm">
                  Define the AI features your app offers, and map them to your pricing plans so we can estimate revenue per feature.
                </p>
              </div>
              
              {/* Features Section */}
              <div className="bg-card border border-border rounded-xl shadow-sm mb-8 overflow-hidden">
                <div className="p-6 border-b border-border bg-muted/20">
                  <h3 className="font-bold font-outfit text-lg">Your Features</h3>
                  <p className="text-sm text-muted-foreground">The specific AI capabilities your users interact with.</p>
                </div>
                
                <div className="p-6">
                  {featuresLoading ? (
                    <div className="space-y-3 mb-6">
                      <div className="h-12 bg-muted animate-pulse rounded-md" />
                      <div className="h-12 bg-muted animate-pulse rounded-md" />
                    </div>
                  ) : features.length > 0 ? (
                    <div className="space-y-3 mb-8">
                      {features.map(f => (
                        <div key={f.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-background">
                          <div>
                            <p className="font-medium text-sm">{f.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">label: {f.label}</p>
                          </div>
                          <button 
                            onClick={() => handleDeleteFeature(f.id)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 mb-6 bg-muted/30 rounded-lg border border-dashed border-border">
                      <p className="text-sm text-muted-foreground">No features defined yet.</p>
                    </div>
                  )}

                  <form onSubmit={handleAddFeature} className="bg-muted/30 p-4 rounded-lg border border-border">
                    <h4 className="text-sm font-semibold mb-3">Add Feature</h4>
                    <div className="flex flex-col sm:flex-row gap-3 items-start">
                      <input 
                        type="text" 
                        placeholder="Feature name (e.g. Email Drafting)" 
                        value={newFeatureName}
                        onChange={(e) => {
                          setNewFeatureName(e.target.value);
                          // Auto-suggest label if it hasn't been manually edited heavily
                          if (!newFeatureLabel || newFeatureLabel === newFeatureName.toLowerCase().replace(/\\s+/g, '-').slice(0, -1)) {
                            setNewFeatureLabel(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                          }
                        }}
                        className="flex-1 h-10 px-3 rounded-md border border-border bg-background text-sm w-full"
                      />
                      <input 
                        type="text" 
                        placeholder="API label (e.g. email-draft)" 
                        value={newFeatureLabel}
                        onChange={(e) => setNewFeatureLabel(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        className="flex-1 h-10 px-3 rounded-md border border-border bg-background text-sm font-mono w-full"
                      />
                      <button 
                        type="submit"
                        disabled={!newFeatureName || !newFeatureLabel}
                        className="h-10 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50 flex items-center gap-2 shrink-0 w-full sm:w-auto justify-center"
                      >
                        <Plus className="w-4 h-4" /> Add
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Plans Section */}
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border bg-muted/20">
                  <h3 className="font-bold font-outfit text-lg">Your Plans</h3>
                  <p className="text-sm text-muted-foreground">Map features to plans to track revenue allocation.</p>
                </div>
                
                <div className="p-6">
                  {plansLoading ? (
                    <div className="space-y-4 mb-6">
                      <div className="h-24 bg-muted animate-pulse rounded-md" />
                    </div>
                  ) : plans.length > 0 ? (
                    <div className="space-y-4 mb-8">
                      {plans.map(p => (
                        <div key={p.id} className="border border-border rounded-lg bg-background overflow-hidden">
                          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/10">
                            <p className="font-semibold">{p.name}</p>
                            <button 
                              onClick={() => handleDeletePlan(p.id)}
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="p-4">
                            {features.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {features.map(f => (
                                  <div key={f.id} className="flex items-center space-x-2">
                                    <Checkbox 
                                      id={`plan-${p.id}-feat-${f.id}`}
                                      checked={p.includedFeatureIds.includes(f.id)}
                                      onCheckedChange={() => togglePlanFeature(p.id, f.id)}
                                    />
                                    <label 
                                      htmlFor={`plan-${p.id}-feat-${f.id}`}
                                      className="text-sm font-medium leading-none cursor-pointer"
                                    >
                                      {f.name}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">Add some features above first.</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 mb-6 bg-muted/30 rounded-lg border border-dashed border-border">
                      <p className="text-sm text-muted-foreground">No plans defined yet.</p>
                    </div>
                  )}

                  <form onSubmit={handleAddPlan} className="bg-muted/30 p-4 rounded-lg border border-border">
                    <h4 className="text-sm font-semibold mb-3">Add Plan</h4>
                    <div className="flex flex-col sm:flex-row gap-3 items-start">
                      <input 
                        type="text" 
                        placeholder="Plan name (e.g. Pro Tier)" 
                        value={newPlanName}
                        onChange={(e) => setNewPlanName(e.target.value)}
                        className="flex-1 h-10 px-3 rounded-md border border-border bg-background text-sm w-full"
                      />
                      <button 
                        type="submit"
                        disabled={!newPlanName}
                        className="h-10 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50 flex items-center gap-2 shrink-0 w-full sm:w-auto justify-center"
                      >
                        <Plus className="w-4 h-4" /> Add
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* GUIDE TAB */}
          {activeTab === "guide" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-xl font-bold font-outfit mb-6">Integration Guide</h2>
              
              <div className="flex bg-muted rounded-lg p-1 mb-6">
                <button 
                  onClick={() => setGuideTab("developer")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${guideTab === "developer" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  I have a developer
                </button>
                <button 
                  onClick={() => setGuideTab("self")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${guideTab === "self" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  I'm building this myself
                </button>
              </div>

              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                {guideTab === "developer" ? (
                  <div className="p-0">
                    <div className="p-6 border-b border-border bg-background">
                      <h3 className="font-semibold mb-2">How AI Observly logging works</h3>
                      <p className="text-sm text-muted-foreground">
                        Your app keeps calling OpenAI/Anthropic exactly as it does today, using your own API key. Nothing routes through AI Observly. After each call completes, send us a small usage report in the background — don't await it, and don't let a failure to send it affect the user-facing request in any way.
                      </p>
                    </div>
                    
                    <div className="p-6">
                      <div className="inline-flex items-center gap-3 bg-muted/50 border border-border rounded-lg px-4 py-3 font-mono text-sm mb-6 w-full">
                        <span className="text-primary font-bold">POST</span>
                        <span className="text-foreground/80 break-all">https://api.aiobservly.com/log-usage</span>
                      </div>
                      
                      <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Payload Schema</p>
                      <pre className="bg-muted/50 border border-border rounded-lg p-4 text-xs font-mono mb-6 text-foreground/80 overflow-x-auto">
{`{
  "api_key": "obs_live_xxxxxxxxxxxxxxxx",
  "customer_id": "the ID you use for this customer",
  "feature_label": "chatbot",
  "model": "gpt-4o",
  "input_tokens": 512,
  "output_tokens": 128
}`}
                      </pre>

                      <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Example (Node.js)</p>
                      <pre className="bg-muted/50 border border-border rounded-lg p-4 text-xs font-mono text-foreground/80 overflow-x-auto">
{`const response = await openai.chat.completions.create({ ... });

// Fire and forget - do not await
fetch("https://api.aiobservly.com/log-usage", {
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
}).catch(() => {});`}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    <h3 className="font-semibold mb-2">AI Assistant Prompt</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Paste this exact prompt into Replit Agent, Cursor, or Lovable to set up the integration automatically.
                    </p>
                    
                    <div className="relative">
                      <pre className="bg-muted/50 border border-border rounded-lg p-5 pt-14 text-sm text-foreground overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
{`I want to track how much I'm spending on AI (OpenAI/Anthropic) calls, broken 
down by which customer is using it and which feature they're using, using a 
tool called AI Observly. Please do the following:

1. Find every place in my code where we call the OpenAI or Anthropic API.

2. After each of those calls finishes and we have the AI's answer, add a 
   step that sends a small report to AI Observly in the background — this 
   must NOT wait for a response and must NOT affect what happens with the 
   real AI answer in any way, even if this report fails to send.

3. The report should be a POST request to:
   https://api.aiobservly.com/log-usage

   With this information:
   - api_key: "${apiKey || "obs_live_xxxxxxxxxxxxxxxx"}"
   - customer_id: the ID of whichever customer is logged in
   - feature_label: a short label for which feature this call belongs to
   - model: the name of the AI model used
   - input_tokens and output_tokens: from the normal API response

4. Don't change anything else about how the AI calls work.

Show me exactly what you're about to change before applying it, so I can 
confirm.`}
                      </pre>
                      <button 
                        onClick={() => handleCopy(`I want to track how much...`)}
                        className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 hover:bg-secondary/80 font-medium"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy prompt
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DEBUG TAB */}
          {activeTab === "debug" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-xl font-bold font-outfit mb-6">Test & Debug</h2>
              
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">Send a test usage event</h3>
                    <p className="text-sm text-muted-foreground">Fires a mock log-usage request to verify connection.</p>
                  </div>
                  <button 
                    onClick={() => {
                      sendTestEvent.mutate(undefined, {
                        onSuccess: () => toast({ title: "Test event sent successfully" }),
                        onError: () => toast({ title: "Test failed", variant: "destructive" })
                      });
                    }}
                    disabled={sendTestEvent.isPending}
                    className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary/80 whitespace-nowrap"
                    data-testid="btn-test-event"
                  >
                    {sendTestEvent.isPending ? "Sending..." : "Send Test Event"}
                  </button>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">Force recalculation</h3>
                    <p className="text-sm text-muted-foreground mb-1">Manually trigger the background margin job.</p>
                    {lastCalculated && <p className="text-xs text-muted-foreground font-mono">Last calculated: {lastCalculated}</p>}
                  </div>
                  <button 
                    onClick={() => {
                      recalculateNow.mutate(undefined, {
                        onSuccess: (data) => {
                          setLastCalculated(new Date(data.lastCalculated).toLocaleTimeString());
                          toast({ title: "Recalculation complete" });
                        }
                      });
                    }}
                    disabled={recalculateNow.isPending}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 flex items-center gap-2 whitespace-nowrap"
                    data-testid="btn-recalculate"
                  >
                    <RefreshCw className={`w-4 h-4 ${recalculateNow.isPending ? 'animate-spin' : ''}`} />
                    {recalculateNow.isPending ? "Running..." : "Recalculate Now"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}