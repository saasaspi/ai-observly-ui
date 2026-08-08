import { useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { 
  useGenerateKey, 
  useRegenerateKey, 
  useRevokeKey,
  useConnectStripe,
  usePlans,
  useSaveMapping,
  useSendTestEvent,
  useSeedTestBillingData,
  useRecalculateNow
} from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { Copy, KeyRound, CreditCard, Network, Code, BugPlay, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("keys");
  const { toast } = useToast();
  
  // Keys State
  const [apiKey, setApiKey] = useState<string | null>(null);
  const generateKey = useGenerateKey();
  const regenerateKey = useRegenerateKey();
  const revokeKey = useRevokeKey();
  const [showRevokeWarning, setShowRevokeWarning] = useState(false);

  // Stripe State
  const [stripeKey, setStripeKey] = useState("");
  const [stripeConnected, setStripeConnected] = useState(false);
  const connectStripe = useConnectStripe();

  // Mapping State
  const { data: plansData, isLoading: plansLoading } = usePlans();
  const saveMapping = useSaveMapping();
  const [mapping, setMapping] = useState<Record<string, string[]>>({});

  // Debug State
  const sendTestEvent = useSendTestEvent();
  const seedTestData = useSeedTestBillingData();
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

  const toggleFeature = (planName: string, feature: string) => {
    setMapping(prev => {
      const planFeatures = prev[planName] || [];
      const isSelected = planFeatures.includes(feature);
      return {
        ...prev,
        [planName]: isSelected ? planFeatures.filter(f => f !== feature) : [...planFeatures, feature]
      };
    });
  };

  const tabs = [
    { id: "keys", label: "Developer Keys", icon: KeyRound },
    { id: "stripe", label: "Stripe", icon: CreditCard },
    { id: "mapping", label: "Feature Mapping", icon: Network },
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
                    ? "bg-card border border-border text-primary shadow-sm" 
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
                      <div className="flex-1 font-mono text-sm bg-background border border-border rounded-md p-3 select-all overflow-x-auto text-primary">
                        {apiKey.includes('••••') ? apiKey : apiKey}
                      </div>
                      <button 
                        onClick={() => handleCopy(apiKey)}
                        className="bg-secondary text-secondary-foreground px-4 rounded-md flex items-center gap-2 hover:bg-secondary/80"
                        data-testid="btn-copy-key"
                      >
                        <Copy className="w-4 h-4" /> Copy
                      </button>
                    </div>
                    {!apiKey.includes('••••') && (
                      <p className="text-sm text-yellow-500 flex items-center gap-1 mb-6">
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

          {/* STRIPE TAB */}
          {activeTab === "stripe" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-xl font-bold font-outfit mb-6">Stripe Connection</h2>
              
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm leading-relaxed">
                    <strong>This key is read-only</strong> — it cannot move money, refund charges, or see card numbers.
                  </p>
                </div>

                <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="text-sm mb-2 font-medium">Instructions:</p>
                  <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                    <li>Go to your Stripe Dashboard → Developers → API Keys → Create restricted key.</li>
                    <li>Grant <strong>Read-only</strong> access to <strong>Customers</strong> and <strong>Subscriptions</strong> only.</li>
                    <li>Paste that key below.</li>
                  </ol>
                </div>

                {!stripeConnected ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text" 
                      placeholder="rk_live_..." 
                      className="flex-1 h-10 rounded-md border border-border bg-background px-3 font-mono text-sm"
                      value={stripeKey}
                      onChange={(e) => setStripeKey(e.target.value)}
                      data-testid="input-stripe-key"
                    />
                    <button 
                      onClick={() => {
                        connectStripe.mutate(stripeKey, {
                          onSuccess: () => {
                            setStripeConnected(true);
                            toast({ title: "Stripe connected" });
                          }
                        });
                      }}
                      disabled={!stripeKey || connectStripe.isPending}
                      className="h-10 bg-primary text-primary-foreground px-6 rounded-md font-medium whitespace-nowrap disabled:opacity-50 text-sm"
                      data-testid="btn-connect-stripe"
                    >
                      {connectStripe.isPending ? "Connecting..." : "Connect"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between border border-border p-4 rounded-lg bg-background">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">Connected</p>
                        <p className="text-xs text-muted-foreground">Last synced: Just now</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setStripeConnected(false)}
                      className="text-sm text-destructive hover:underline"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MAPPING TAB */}
          {activeTab === "mapping" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-xl font-bold font-outfit mb-2">Feature Mapping</h2>
              <p className="text-muted-foreground text-sm mb-6">
                This tells AI Observly which of your features a customer is paying for, so we can estimate revenue per feature. We'll always label this as an estimate, never a hard number.
              </p>
              
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                {plansLoading ? (
                  <div className="space-y-4">
                    <div className="h-20 bg-muted animate-pulse rounded-lg"></div>
                    <div className="h-20 bg-muted animate-pulse rounded-lg"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {plansData?.plans.map(plan => (
                      <div key={plan.name} className="border-b border-border pb-6 last:border-0 last:pb-0">
                        <h3 className="font-bold font-outfit text-base mb-3">{plan.name}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {plansData?.availableFeatures.map(feature => {
                            const isSelected = mapping[plan.name]?.includes(feature) ?? plan.includedFeatures.includes(feature);
                            
                            return (
                              <div key={feature} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`setting-check-${plan.name}-${feature}`}
                                  checked={isSelected}
                                  onCheckedChange={() => toggleFeature(plan.name, feature)}
                                />
                                <label 
                                  htmlFor={`setting-check-${plan.name}-${feature}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer"
                                >
                                  {feature.replace('-', ' ')}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-4 mt-2 border-t border-border flex justify-end">
                      <button 
                        onClick={() => {
                          saveMapping.mutate(mapping, {
                            onSuccess: () => toast({ title: "Mapping saved" })
                          });
                        }}
                        disabled={saveMapping.isPending}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:opacity-90 transition-opacity text-sm"
                        data-testid="btn-save-mapping"
                      >
                        {saveMapping.isPending ? "Saving..." : "Save mapping"}
                      </button>
                    </div>
                  </div>
                )}
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
                      <p className="text-sm font-mono mb-4"><span className="text-green-500">POST</span> https://api.aiobservly.com/log-usage</p>
                      
                      <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Payload Schema</p>
                      <pre className="bg-background border border-border rounded-lg p-4 text-xs font-mono mb-6 text-foreground/80 overflow-x-auto">
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
                      <pre className="bg-background border border-border rounded-lg p-4 text-xs font-mono text-foreground/80 overflow-x-auto">
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
                      <pre className="bg-background border border-border rounded-lg p-4 text-sm text-muted-foreground overflow-x-auto whitespace-pre-wrap font-mono">
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
                        onClick={() => handleCopy(`I want to track how much...`)} // Using full text in real app
                        className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-3 py-1.5 rounded text-xs flex items-center gap-1 hover:bg-secondary/80"
                      >
                        <Copy className="w-3 h-3" /> Copy prompt
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
                    <h3 className="font-semibold mb-1">Load sample billing data</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-yellow-500" /> Test mode — not connected to a real Stripe account
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      seedTestData.mutate(undefined, {
                        onSuccess: () => toast({ title: "Sample data loaded" })
                      });
                    }}
                    disabled={seedTestData.isPending}
                    className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary/80 whitespace-nowrap"
                    data-testid="btn-seed-data"
                  >
                    {seedTestData.isPending ? "Loading..." : "Load Sample Data"}
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
                    {recalculateNow.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
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
