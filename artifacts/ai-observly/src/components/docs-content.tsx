"use client";
import { useState } from "react";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
   - api_key: "obs_live_xxxxxxxxxxxxxxxx"
   - customer_id: the ID of whichever customer is logged in
   - feature_label: a short label for which feature this call belongs to
   - model: the name of the AI model used
   - input_tokens and output_tokens: from the normal API response

4. Don't change anything else about how the AI calls work.

Show me exactly what you're about to change before applying it, so I can 
confirm.`;

const devPayloadText = `{
  "api_key": "obs_live_xxxxxxxxxxxxxxxx",
  "customer_id": "the ID you use for this customer",
  "feature_label": "chatbot",
  "model": "gpt-4o",
  "input_tokens": 512,
  "output_tokens": 128
}`;

const devExampleText = `const response = await openai.chat.completions.create({ ... });

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
}).catch(() => {});`;

export function DocsContent() {
  const [tab, setTab] = useState<"self" | "developer">("self");
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold font-outfit mb-2">Integration Guide</h1>
        <p className="text-muted-foreground text-lg">How to connect your app to AI Observly</p>
      </div>

      <div className="flex bg-muted rounded-lg p-1 mb-8 max-w-md">
        <button
          onClick={() => setTab("self")}
          className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${tab === "self" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          I'm building this myself
        </button>
        <button
          onClick={() => setTab("developer")}
          className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${tab === "developer" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          I have a developer
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {tab === "self" ? (
          <div className="p-8">
            <p className="text-muted-foreground mb-6">
              Paste the text below into Replit, Cursor, Lovable, or whatever tool you're using — it tells your AI assistant exactly what to change.
            </p>
            <div className="relative">
              <button
                onClick={() => handleCopy(promptText)}
                className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 hover:bg-secondary/80 font-medium"
              >
                <Copy className="w-3.5 h-3.5" /> Copy prompt
              </button>
              <pre className="bg-muted/50 border border-border rounded-lg p-6 pt-14 text-sm text-foreground overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                {promptText}
              </pre>
            </div>
          </div>
        ) : (
          <div>
            <div className="p-8 border-b border-border">
              <h2 className="text-xl font-bold font-outfit mb-4">How AI Observly logging works</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your app keeps calling OpenAI/Anthropic exactly as it does today, using your own API key. Nothing routes through AI Observly. After each call completes, send us a small usage report in the background — don't await it, and don't let a failure to send it affect the user-facing request in any way.
              </p>
            </div>
            <div className="p-8 space-y-8">
              <div>
                <div className="inline-flex items-center gap-3 bg-muted/50 border border-border rounded-lg px-4 py-3 font-mono text-sm mb-6 w-full">
                  <span className="text-primary font-bold">POST</span>
                  <span className="text-foreground/80 break-all">https://[your-ai-observly-domain]/api/log-usage</span>
                </div>
                <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Payload</h3>
                <div className="relative">
                  <button onClick={() => handleCopy(devPayloadText)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
                    <Copy className="w-4 h-4" />
                  </button>
                  <pre className="bg-muted/50 border border-border rounded-lg p-4 text-sm font-mono text-foreground overflow-x-auto">
                    {devPayloadText}
                  </pre>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Example (Node.js), fire-and-forget:</h3>
                <div className="relative">
                  <button onClick={() => handleCopy(devExampleText)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
                    <Copy className="w-4 h-4" />
                  </button>
                  <pre className="bg-muted/50 border border-border rounded-lg p-4 text-sm font-mono text-foreground overflow-x-auto">
                    {devExampleText}
                  </pre>
                </div>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3 text-sm">
                <span className="font-semibold text-primary">Note:</span>
                <span className="text-muted-foreground">Call this after every AI request you want tracked. Never await/block on it in the main request path.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
