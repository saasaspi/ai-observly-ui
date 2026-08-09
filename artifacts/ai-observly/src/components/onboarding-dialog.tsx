"use client";
import { useState, useEffect } from "react";
import { Bot, Users, X, ChevronRight, Send, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";

type Path = "none" | "ai_assistant" | "developer_handoff";

interface OnboardingState {
  done: boolean;
  path: Path;
  timestamp: number;
}

function getOnboarding(): OnboardingState | null {
  try {
    const raw = localStorage.getItem("ai_observly_onboarding");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setOnboarding(state: OnboardingState) {
  localStorage.setItem("ai_observly_onboarding", JSON.stringify(state));
}

// --- AI Assistant chat messages ---
const CHAT_STEPS = [
  {
    from: "bot",
    text: "Hi! I'm here to help you connect AI Observly to your app. First — what language or framework are you using? (e.g. Node.js, Python, Next.js)",
  },
  {
    from: "bot",
    text: "Got it! After every OpenAI or Anthropic call in your code, you'll add a small background POST. Here's the snippet:",
    code: `fetch("https://your-domain/api/log-usage", {\n  method: "POST",\n  body: JSON.stringify({\n    api_key: "obs_live_xxxxxxxx",\n    customer_id: user.id,\n    feature_label: "chat",\n    model: response.model,\n    input_tokens: usage.prompt_tokens,\n    output_tokens: usage.completion_tokens\n  })\n}).catch(() => {}); // fire-and-forget`,
  },
  {
    from: "bot",
    text: "Add that snippet after each AI call (it won't block your app). Once you paste it in and deploy, click 'Send test event' in Settings → Debug to confirm it's working.",
  },
  {
    from: "bot",
    text: "You're all set! 🎉 Head to the Overview to see your data once events start arriving. You can always revisit these steps in Settings → Integration.",
    done: true,
  },
];

function AIAssistantChat({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<{ from: string; text: string; code?: string }[]>([
    CHAT_STEPS[0],
  ]);
  const [typing, setTyping] = useState(false);
  const [copied, setCopied] = useState(false);

  const sendMessage = () => {
    if (!userInput.trim() && step < CHAT_STEPS.length - 1) return;
    const userMsg = { from: "user", text: userInput || "Next →" };
    const nextStep = step + 1;

    setMessages((prev) => [...prev, userMsg]);
    setUserInput("");
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      if (nextStep < CHAT_STEPS.length) {
        setMessages((prev) => [...prev, CHAT_STEPS[nextStep]]);
        setStep(nextStep);
      }
    }, 900);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDone = step === CHAT_STEPS.length - 1 && !typing;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 p-4 max-h-72">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm ${
                msg.from === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              <p className="leading-relaxed">{msg.text}</p>
              {msg.code && (
                <div className="mt-2 relative">
                  <pre className="bg-background/80 rounded-lg p-3 text-xs font-mono overflow-x-auto text-foreground whitespace-pre">
                    {msg.code}
                  </pre>
                  <button
                    onClick={() => copyCode(msg.code!)}
                    className="absolute top-2 right-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium hover:bg-primary/20 transition-colors"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-xl px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {!isDone ? (
        <div className="border-t border-border p-4 flex gap-2">
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your answer…"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1"
          />
          <button
            onClick={sendMessage}
            className="bg-primary text-primary-foreground p-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="border-t border-border p-4">
          <button
            onClick={onComplete}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Done — Go to Overview
          </button>
        </div>
      )}
    </div>
  );
}

function DeveloperHandoffForm({ onComplete }: { onComplete: () => void }) {
  const [devName, setDevName] = useState("");
  const [devEmail, setDevEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!devEmail.trim()) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Instructions sent!</p>
          <p className="text-sm text-muted-foreground mt-1">
            We've emailed <strong>{devEmail}</strong> with your API key and setup instructions.
          </p>
        </div>
        <button
          onClick={onComplete}
          className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Continue to Overview
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <p className="text-sm text-muted-foreground">
        We'll email your developer the API key and integration instructions so they can get started without you.
      </p>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Developer's name
        </label>
        <Input
          value={devName}
          onChange={(e) => setDevName(e.target.value)}
          placeholder="e.g. Alex Chen"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Developer's email <span className="text-red-500">*</span>
        </label>
        <Input
          type="email"
          value={devEmail}
          onChange={(e) => setDevEmail(e.target.value)}
          placeholder="dev@yourcompany.com"
          required
        />
      </div>
      <button
        type="submit"
        disabled={!devEmail.trim()}
        className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        Send instructions to developer
      </button>
      <p className="text-xs text-muted-foreground text-center">
        You can keep using the app while they set things up.
      </p>
    </form>
  );
}

export function OnboardingDialog({ onClose }: { onClose: () => void }) {
  const [path, setPath] = useState<Path>("none");

  const handleComplete = (chosenPath: Path) => {
    setOnboarding({ done: true, path: chosenPath, timestamp: Date.now() });
    onClose();
  };

  const handleSkip = () => {
    setOnboarding({ done: false, path: "none", timestamp: Date.now() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
          <div>
            <h2 className="text-lg font-bold font-outfit">Welcome to AI Observly 👋</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {path === "none"
                ? "How would you like to connect your app?"
                : path === "ai_assistant"
                ? "AI setup assistant"
                : "Send to your developer"}
            </p>
          </div>
          <button
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-muted transition-colors"
            aria-label="Skip"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {path === "none" && (
            <div className="p-6 space-y-4">
              <button
                onClick={() => setPath("ai_assistant")}
                className="w-full text-left p-5 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">Set up with AI Assistant</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      I'll walk you through connecting your app step by step — no developer needed.
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                </div>
              </button>

              <button
                onClick={() => setPath("developer_handoff")}
                className="w-full text-left p-5 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">I Have a Developer</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enter their email and we'll send them everything they need to integrate.
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                </div>
              </button>

              <button
                onClick={handleSkip}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground py-2 transition-colors"
              >
                Skip for now
              </button>
            </div>
          )}

          {path === "ai_assistant" && (
            <div className="flex flex-col h-full">
              <button
                onClick={() => setPath("none")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-6 pt-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <AIAssistantChat onComplete={() => handleComplete("ai_assistant")} />
            </div>
          )}

          {path === "developer_handoff" && (
            <div>
              <button
                onClick={() => setPath("none")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-6 pt-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <DeveloperHandoffForm onComplete={() => handleComplete("developer_handoff")} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook to determine whether to show the onboarding dialog (first login only)
export function useOnboardingDialog() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const state = getOnboarding();
    // Show if never seen before
    if (!state) {
      setShow(true);
    }
  }, []);

  return {
    show,
    close: () => setShow(false),
  };
}

// Hook for the integration-pending banner
export function useIntegrationBanner() {
  const [dismissed, setDismissed] = useState(true); // start hidden, check in effect

  useEffect(() => {
    const state = getOnboarding();
    const sessionDismissed = sessionStorage.getItem("ai_observly_banner_dismissed") === "true";
    // Show banner if onboarding was skipped or not done, and not session-dismissed
    if (state && !state.done && !sessionDismissed) {
      setDismissed(false);
    }
  }, []);

  const dismiss = () => {
    sessionStorage.setItem("ai_observly_banner_dismissed", "true");
    setDismissed(true);
  };

  return { show: !dismissed, dismiss };
}
