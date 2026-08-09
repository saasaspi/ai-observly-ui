"use client";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { User, CreditCard, X, CheckCircle2, ArrowRight } from "lucide-react";

type PlanId = "free" | "pro";

const PLANS: Record<PlanId, { name: string; price: string; features: string[] }> = {
  free: {
    name: "Free",
    price: "$0 / mo",
    features: [
      "10,000 AI events / month",
      "Up to 3 customers",
      "Up to 3 features",
      "7-day data history",
      "Cost tracking",
      "Basic latency stats",
    ],
  },
  pro: {
    name: "Pro",
    price: "$29 / mo",
    features: [
      "Unlimited AI events",
      "Unlimited customers & features",
      "90-day data history",
      "Cost, latency & error tracking",
      "Slack & email spend alerts",
      "Model comparison charts",
      "Priority email support",
      "14-day money-back guarantee",
    ],
  },
};

function ManagePlanDialog({ onClose }: { onClose: () => void }) {
  const [currentPlan, setCurrentPlan] = useState<PlanId>("free");
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem("ai_observly_plan");
    if (stored === "pro") setCurrentPlan("pro");
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleUpgrade = () => {
    toast({
      title: "Billing coming soon",
      description: "We'll notify you as soon as checkout is ready.",
    });
  };

  const plan = PLANS[currentPlan];
  const nextPlan = currentPlan === "free" ? PLANS.pro : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* X button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-outfit">Manage Plan</h2>
            <p className="text-sm text-muted-foreground">You're on the {plan.name} plan</p>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Current plan */}
          <div className="border-2 border-primary/30 bg-primary/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">Current</span>
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </div>
            <p className="font-bold text-lg font-outfit">{plan.name}</p>
            <p className="text-sm text-muted-foreground font-medium mb-4">{plan.price}</p>
            <ul className="space-y-1.5">
              {plan.features.map((f) => (
                <li key={f} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-primary shrink-0 mt-px">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Next tier or top-plan message */}
          {nextPlan ? (
            <div className="border border-border rounded-xl p-5 flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Next tier</p>
              <p className="font-bold text-lg font-outfit">{nextPlan.name}</p>
              <p className="text-sm text-muted-foreground font-medium mb-4">{nextPlan.price}</p>
              <ul className="space-y-1.5 flex-1 mb-5">
                {nextPlan.features.map((f) => (
                  <li key={f} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-primary shrink-0 mt-px">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleUpgrade}
                className="w-full bg-primary text-primary-foreground py-2.5 px-4 rounded-lg text-sm font-medium hover:opacity-90 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
              >
                Upgrade to Pro <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="border border-border rounded-xl p-5 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">You're on our top plan</p>
                <p className="text-xs text-muted-foreground mt-1">All features included. Thanks for being a Pro member!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileContent() {
  const [name, setName] = useState("");
  const [editName, setEditName] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<PlanId>("free");
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedName  = localStorage.getItem("ai_observly_user_name")  || "";
    const storedEmail = localStorage.getItem("ai_observly_user_email") || "";
    const storedPlan  = localStorage.getItem("ai_observly_plan") as PlanId | null;
    setName(storedName);
    setEditName(storedName);
    setEmail(storedEmail);
    if (storedPlan === "pro") setPlan("pro");
  }, []);

  const handleSaveName = () => {
    const trimmed = editName.trim();
    if (!trimmed) {
      toast({ title: "Name cannot be empty", variant: "destructive" });
      return;
    }
    localStorage.setItem("ai_observly_user_name", trimmed);
    setName(trimmed);
    toast({ title: "Name updated" });
  };

  return (
    <>
      {showPlanDialog && <ManagePlanDialog onClose={() => setShowPlanDialog(false)} />}

      <div className="space-y-8 max-w-xl">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-foreground">Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your account details and subscription</p>
        </div>

        {/* Account details card */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <User className="w-5 h-5" />
            </div>
            <h2 className="font-semibold">Account details</h2>
          </div>

          {/* Name — editable */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Name</label>
            <div className="flex gap-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              />
              <button
                onClick={handleSaveName}
                disabled={editName.trim() === name || editName.trim() === ""}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0"
              >
                Save
              </button>
            </div>
          </div>

          {/* Email — read-only */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input
              value={email || "—"}
              readOnly
              className="bg-muted/40 cursor-not-allowed text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">Email is tied to your login and cannot be changed here.</p>
          </div>
        </div>

        {/* Plan card */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold">Plan</h2>
                <p className="text-sm text-muted-foreground">
                  {plan === "pro" ? "Pro — $29/mo" : "Free — $0/mo"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPlanDialog(true)}
              className="shrink-0 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              Manage Plan
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ProfileContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
