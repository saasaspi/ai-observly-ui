import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGenerateKey, useConnectStripe, useSaveMapping, usePlans } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Copy, AlertCircle, ArrowRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Step 1 state
  const generateKey = useGenerateKey();
  const [apiKey, setApiKey] = useState("");
  
  // Step 2 state
  const connectStripe = useConnectStripe();
  const [stripeKey, setStripeKey] = useState("");
  const [stripeConnected, setStripeConnected] = useState(false);
  
  // Step 3 state
  const { data: plansData, isLoading: plansLoading } = usePlans();
  const saveMapping = useSaveMapping();
  const [mapping, setMapping] = useState<Record<string, string[]>>({});

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const handleGenerateKey = () => {
    generateKey.mutate(undefined, {
      onSuccess: (data) => {
        setApiKey(data.keyDisplay);
      }
    });
  };

  const handleConnectStripe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripeKey) return;
    
    connectStripe.mutate(stripeKey, {
      onSuccess: () => {
        setStripeConnected(true);
        toast({ title: "Stripe connected successfully" });
      }
    });
  };

  const toggleFeature = (planName: string, feature: string) => {
    setMapping(prev => {
      const planFeatures = prev[planName] || [];
      const isSelected = planFeatures.includes(feature);
      
      return {
        ...prev,
        [planName]: isSelected 
          ? planFeatures.filter(f => f !== feature)
          : [...planFeatures, feature]
      };
    });
  };

  const handleSaveMapping = () => {
    saveMapping.mutate(mapping, {
      onSuccess: () => {
        toast({ title: "Mapping saved" });
      }
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
   https://api.aiobservly.com/log-usage

   With this information:
   - api_key: "${apiKey || "obs_live_xxxxxxxxxxxxxxxx"}"
   - customer_id: the ID of whichever customer is logged in
   - feature_label: a short label for which feature this call belongs to
   - model: the name of the AI model used
   - input_tokens and output_tokens: from the normal API response

4. Don't change anything else about how the AI calls work.

Show me exactly what you're about to change before applying it, so I can 
confirm.`;

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-3xl mb-8">
        <h1 className="text-3xl font-bold font-outfit text-center mb-10">Set up AI Observly</h1>
        
        {/* Progress bar */}
        <div className="flex items-center justify-between relative mb-12">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -z-10 -translate-y-1/2" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-primary -z-10 -translate-y-1/2 transition-all duration-300"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
          
          {[1, 2, 3].map((num) => (
            <div 
              key={num}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 ${
                step >= num 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-card text-muted-foreground border-border"
              }`}
            >
              {step > num ? <CheckCircle2 className="w-5 h-5" /> : num}
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-xl shadow-lg p-6 md:p-10">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold font-outfit mb-2">1. Generate your key</h2>
              <p className="text-muted-foreground mb-8">This is how your app will authenticate with AI Observly when sending usage reports.</p>
              
              {!apiKey ? (
                <button 
                  onClick={handleGenerateKey}
                  disabled={generateKey.isPending}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium mb-12"
                  data-testid="btn-generate-key"
                >
                  {generateKey.isPending ? "Generating..." : "Generate Key"}
                </button>
              ) : (
                <div className="mb-12">
                  <div className="flex gap-2 mb-2">
                    <div className="flex-1 font-mono text-sm bg-background border border-border rounded-md p-3 select-all overflow-x-auto text-primary">
                      {apiKey}
                    </div>
                    <button 
                      onClick={() => handleCopy(apiKey)}
                      className="bg-secondary text-secondary-foreground px-4 rounded-md flex items-center gap-2 hover:bg-secondary/80"
                      data-testid="btn-copy-key"
                    >
                      <Copy className="w-4 h-4" /> Copy
                    </button>
                  </div>
                  <p className="text-sm text-yellow-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Store this somewhere safe — you won't be able to see the full key again.
                  </p>
                </div>
              )}

              <div className="border-t border-border pt-8 mt-8">
                <h3 className="font-semibold mb-4">I'm building this myself</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  If you're using Replit Agent, Cursor, Lovable, or another AI coding tool, just copy and paste this exact prompt:
                </p>
                
                <div className="relative">
                  <pre className="bg-background border border-border rounded-lg p-4 text-sm text-muted-foreground overflow-x-auto whitespace-pre-wrap font-mono">
                    {promptText}
                  </pre>
                  <button 
                    onClick={() => handleCopy(promptText)}
                    className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-3 py-1.5 rounded text-xs flex items-center gap-1 hover:bg-secondary/80"
                    data-testid="btn-copy-prompt"
                  >
                    <Copy className="w-3 h-3" /> Copy prompt
                  </button>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button 
                  onClick={() => setStep(2)}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium flex items-center gap-2"
                  data-testid="btn-next-step"
                >
                  Next step <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold font-outfit mb-2">2. Connect Stripe</h2>
              <p className="text-muted-foreground mb-8">We need this to know how much your customers are paying you, so we can calculate margins.</p>
              
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-8 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">
                  <strong>This key is read-only</strong> — it cannot move money, refund charges, or see card numbers.
                </p>
              </div>

              <div className="mb-8 p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm mb-2 font-medium">Instructions:</p>
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                  <li>Go to your Stripe Dashboard → Developers → API Keys → Create restricted key.</li>
                  <li>Grant <strong>Read-only</strong> access to <strong>Customers</strong> and <strong>Subscriptions</strong> only, and leave everything else off.</li>
                  <li>Paste that key below.</li>
                </ol>
              </div>

              {!stripeConnected ? (
                <form onSubmit={handleConnectStripe} className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text" 
                    placeholder="rk_live_..." 
                    className="flex-1 h-12 rounded-md border border-border bg-background px-4 font-mono text-sm"
                    value={stripeKey}
                    onChange={(e) => setStripeKey(e.target.value)}
                    data-testid="input-stripe-key"
                  />
                  <button 
                    type="submit"
                    disabled={!stripeKey || connectStripe.isPending}
                    className="h-12 bg-primary text-primary-foreground px-6 rounded-md font-medium whitespace-nowrap disabled:opacity-50"
                    data-testid="btn-connect-stripe"
                  >
                    {connectStripe.isPending ? "Connecting..." : "Connect"}
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2 text-green-500 bg-green-500/10 border border-green-500/20 p-4 rounded-md">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Stripe Connected</span>
                  <span className="text-sm text-muted-foreground ml-auto">Last synced: Just now</span>
                </div>
              )}

              <div className="flex justify-between mt-12">
                <button 
                  onClick={() => setStep(1)}
                  className="px-6 py-3 text-muted-foreground hover:text-foreground font-medium"
                >
                  Back
                </button>
                <button 
                  onClick={() => setStep(3)}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium flex items-center gap-2"
                  data-testid="btn-next-step"
                >
                  Next step <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold font-outfit mb-2">3. Map your plans to features</h2>
              <p className="text-muted-foreground mb-4">
                This tells AI Observly which of your features a customer is paying for, so we can estimate revenue per feature. We'll always label this as an estimate, never a hard number.
              </p>
              
              {plansLoading ? (
                <div className="space-y-4 my-8">
                  <div className="h-24 bg-muted animate-pulse rounded-lg"></div>
                  <div className="h-24 bg-muted animate-pulse rounded-lg"></div>
                  <div className="h-24 bg-muted animate-pulse rounded-lg"></div>
                </div>
              ) : (
                <div className="space-y-6 my-8">
                  {plansData?.plans.map(plan => (
                    <div key={plan.name} className="border border-border rounded-lg p-5 bg-background">
                      <h3 className="font-bold font-outfit text-lg mb-4">{plan.name}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {plansData?.availableFeatures.map(feature => {
                          const isSelected = mapping[plan.name]?.includes(feature) ?? plan.includedFeatures.includes(feature);
                          
                          // Initialize mapping state if empty
                          if (mapping[plan.name] === undefined && plan.includedFeatures.includes(feature)) {
                            // This is handled by toggleFeature, but for render we just fall back to plan.includedFeatures
                          }
                          
                          return (
                            <div key={feature} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`check-${plan.name}-${feature}`}
                                checked={isSelected}
                                onCheckedChange={() => toggleFeature(plan.name, feature)}
                                data-testid={`check-${plan.name.toLowerCase()}-${feature.toLowerCase()}`}
                              />
                              <label 
                                htmlFor={`check-${plan.name}-${feature}`}
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
                  
                  <button 
                    onClick={handleSaveMapping}
                    disabled={saveMapping.isPending}
                    className="w-full bg-secondary text-secondary-foreground py-3 rounded-md font-medium hover:bg-secondary/80"
                    data-testid="btn-save-mapping"
                  >
                    {saveMapping.isPending ? "Saving..." : "Save mapping"}
                  </button>
                </div>
              )}

              <div className="flex justify-between mt-12 border-t border-border pt-6">
                <button 
                  onClick={() => setStep(2)}
                  className="px-6 py-3 text-muted-foreground hover:text-foreground font-medium"
                >
                  Back
                </button>
                <button 
                  onClick={() => setLocation("/dashboard")}
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-medium flex items-center gap-2"
                  data-testid="btn-finish-onboarding"
                >
                  Go to dashboard <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
