"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGenerateKey } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/protected-route";
import { Copy, AlertCircle, ArrowRight } from "lucide-react";

function OnboardingContent() {
  const router = useRouter();
  const { toast } = useToast();
  const generateKey = useGenerateKey();
  const [apiKey, setApiKey] = useState("");

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const handleGenerateKey = () => {
    generateKey.mutate(undefined, {
      onSuccess: (data) => {
        setApiKey(data.keyDisplay);
      },
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

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-3xl mb-8">
        <h1 className="text-3xl font-bold font-outfit text-center mb-10">Set up AI Observly</h1>

        <div className="bg-card border border-border rounded-xl shadow-sm p-6 md:p-10">
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-bold font-outfit mb-2">Generate your key</h2>
            <p className="text-muted-foreground mb-8">
              This is how your app will authenticate with AI Observly when sending usage reports.
            </p>

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
                  <div className="flex-1 font-mono text-sm bg-background border border-border rounded-md p-3 select-all overflow-x-auto text-primary font-medium">
                    {apiKey}
                  </div>
                  <button
                    onClick={() => handleCopy(apiKey)}
                    className="bg-secondary text-secondary-foreground px-4 rounded-md flex items-center gap-2 hover:bg-secondary/80 font-medium"
                    data-testid="btn-copy-key"
                  >
                    <Copy className="w-4 h-4" /> Copy
                  </button>
                </div>
                <p className="text-sm text-yellow-600 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Store this somewhere safe — you won't be able to see the full key again.
                </p>
              </div>
            )}

            <div className="border-t border-border pt-8 mt-8">
              <h3 className="font-semibold mb-4">Integration via AI assistant</h3>
              <p className="text-sm text-muted-foreground mb-4">
                If you're using Replit Agent, Cursor, Lovable, or another AI coding tool, just copy and paste this exact prompt:
              </p>

              <div className="relative">
                <pre className="bg-muted/50 border border-border rounded-lg p-5 pt-14 text-sm text-foreground overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                  {promptText}
                </pre>
                <button
                  onClick={() => handleCopy(promptText)}
                  className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 hover:bg-secondary/80 font-medium"
                  data-testid="btn-copy-prompt"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy prompt
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-12 pt-6 border-t border-border">
              <span className="text-sm text-muted-foreground">
                You can always access this guide and generate keys in Settings later.
              </span>
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium flex items-center gap-2 transition-opacity hover:opacity-90"
                data-testid="btn-finish-onboarding"
              >
                Go to dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Onboarding() {
  return (
    <ProtectedRoute>
      <OnboardingContent />
    </ProtectedRoute>
  );
}
