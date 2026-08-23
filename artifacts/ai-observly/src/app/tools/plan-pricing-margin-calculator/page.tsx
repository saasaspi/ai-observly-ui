"use client";

import { useState, useId } from "react";
import { PublicLayout } from "@/components/public-layout";
import { Plus, X, Pencil, Trash2, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Target } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Plan {
  id: string;
  name: string;
  price: number;
  customers: number;
  totalTokens: number;
  tokenCost: number;
  overhead: number;
  targetMargin?: number;
}

interface FormState {
  name: string;
  price: string;
  customers: string;
  totalTokens: string;
  tokenCost: string;
  overhead: string;
  targetMargin: string;
}

// ─── Formulas ────────────────────────────────────────────────────────────────

function calc(p: Plan) {
  const revenue = p.price * p.customers;
  const totalCost = p.tokenCost + p.overhead;
  const netMarginDollars = revenue - totalCost;
  const netMarginPct = revenue === 0 ? -100 : (netMarginDollars / revenue) * 100;
  const avgCostPerUser = p.customers === 0 ? 0 : totalCost / p.customers;

  let requiredPrice: number | null = null;
  let requiredPriceNote: string | null = null;

  if (p.targetMargin !== undefined) {
    const g = p.targetMargin;
    if (p.customers === 0) {
      requiredPriceNote = "Add at least 1 enrolled customer to calculate required price.";
    } else if (g >= 100 && totalCost > 0) {
      requiredPriceNote = "A 100%+ margin goal can't be achieved by raising price alone — you need to reduce cost first.";
    } else if (g >= 100 && totalCost === 0) {
      requiredPriceNote = "Any price above $0 satisfies this margin goal (cost is $0).";
    } else {
      requiredPrice = (totalCost * 100) / ((100 - g) * p.customers);
    }
  }

  return { revenue, totalCost, netMarginDollars, netMarginPct, avgCostPerUser, requiredPrice, requiredPriceNote };
}

// ─── Example data ────────────────────────────────────────────────────────────

const EXAMPLE_PLANS: Plan[] = [
  { id: "ex-1", name: "Free", price: 0, customers: 500, totalTokens: 50000, tokenCost: 35, overhead: 10, targetMargin: undefined },
  { id: "ex-2", name: "Starter", price: 29, customers: 120, totalTokens: 180000, tokenCost: 190, overhead: 40, targetMargin: 60 },
  { id: "ex-3", name: "Pro", price: 79, customers: 55, totalTokens: 900000, tokenCost: 620, overhead: 110, targetMargin: 65 },
  { id: "ex-4", name: "Enterprise", price: 299, customers: 12, totalTokens: 4200000, tokenCost: 1800, overhead: 400, targetMargin: 70 },
];

const EMPTY_FORM: FormState = {
  name: "", price: "", customers: "", totalTokens: "", tokenCost: "", overhead: "", targetMargin: "",
};

function fmt(n: number, decimals = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// ─── Modal ───────────────────────────────────────────────────────────────────

function PlanModal({
  form,
  onChange,
  onSubmit,
  onClose,
  isEditing,
  errors,
}: {
  form: FormState;
  onChange: (field: keyof FormState, value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  isEditing: boolean;
  errors: Partial<Record<keyof FormState, string>>;
}) {
  const id = useId();

  const field = (
    label: string,
    key: keyof FormState,
    opts?: { optional?: boolean; prefix?: string; suffix?: string; placeholder?: string }
  ) => (
    <div>
      <label htmlFor={id + key} className="block text-sm font-medium text-foreground mb-1.5">
        {label}
        {opts?.optional && <span className="ml-1 text-xs text-muted-foreground font-normal">(optional)</span>}
      </label>
      <div className="relative">
        {opts?.prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{opts.prefix}</span>
        )}
        <input
          id={id + key}
          type="number"
          min="0"
          value={form[key]}
          onChange={(e) => onChange(key, e.target.value)}
          placeholder={opts?.placeholder ?? "0"}
          className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
            opts?.prefix ? "pl-7" : ""
          } ${opts?.suffix ? "pr-8" : ""} ${
            errors[key] ? "border-red-400" : "border-border"
          }`}
        />
        {opts?.suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{opts.suffix}</span>
        )}
      </div>
      {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <h2 className="text-lg font-bold font-outfit">{isEditing ? "Edit plan" : "Add a plan"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Plan name */}
          <div>
            <label htmlFor={id + "name"} className="block text-sm font-medium text-foreground mb-1.5">
              Plan name <span className="text-red-400">*</span>
            </label>
            <input
              id={id + "name"}
              type="text"
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="e.g. Pro"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                errors.name ? "border-red-400" : "border-border"
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {field("Price / customer / month *", "price", { prefix: "$", placeholder: "49" })}
            {field("Enrolled customers *", "customers", { placeholder: "100" })}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {field("Token / LLM cost / mo", "tokenCost", { optional: true, prefix: "$", placeholder: "0" })}
            {field("Additional overhead / mo", "overhead", { optional: true, prefix: "$", placeholder: "0" })}
          </div>

          {field("Total tokens / mo", "totalTokens", { optional: true, placeholder: "0" })}
          {field("Ideal margin goal", "targetMargin", { optional: true, suffix: "%", placeholder: "e.g. 70" })}

          <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2.5">
            Token/LLM cost and overhead default to $0 if left blank. Total tokens is for display only.
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-border rounded-xl py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Calculate Margin
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Plan Card ───────────────────────────────────────────────────────────────

function PlanCard({ plan, onEdit, onDelete }: { plan: Plan; onEdit: () => void; onDelete: () => void }) {
  const { revenue, totalCost, netMarginDollars, netMarginPct, avgCostPerUser, requiredPrice, requiredPriceNote } =
    calc(plan);

  const isNegative = netMarginDollars < 0;
  const costBarPct = revenue === 0 ? 100 : Math.min((totalCost / revenue) * 100, 100);
  const marginBarPct = Math.max(100 - costBarPct, 0);

  const targetMarkerPct =
    plan.targetMargin !== undefined ? Math.max(0, Math.min(plan.targetMargin, 100)) : null;

  const meetsGoal =
    plan.targetMargin !== undefined && netMarginPct >= plan.targetMargin && revenue > 0;

  return (
    <div className={`bg-card border rounded-2xl overflow-hidden ${isNegative ? "border-red-300" : "border-border"}`}>
      {/* Losing strip */}
      {isNegative && (
        <div className="bg-red-50 border-b border-red-200 px-5 py-2.5 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-red-500 shrink-0" />
          <span className="text-sm font-semibold text-red-600">
            Losing ${fmt(Math.abs(netMarginDollars))}/mo at current pricing
          </span>
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-bold font-outfit">{plan.name}</h3>
            <p className="text-sm text-muted-foreground">
              ${fmt(plan.price)}/mo · {plan.customers.toLocaleString()} customers
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className={`text-2xl font-bold font-outfit ${isNegative ? "text-red-500" : "text-green-600"}`}>
              {isNegative ? "" : "+"}{fmt(netMarginPct, 1)}%
            </p>
            <p className={`text-sm font-medium ${isNegative ? "text-red-500" : "text-green-600"}`}>
              {isNegative ? "-" : "+"}${fmt(Math.abs(netMarginDollars))}/mo net
            </p>
          </div>
        </div>

        {/* Cost-vs-revenue bar */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Cost {fmt(costBarPct, 1)}%</span>
            <span>Margin {fmt(marginBarPct, 1)}%</span>
          </div>
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-red-400/70 rounded-l-full transition-all duration-500"
              style={{ width: `${costBarPct}%` }}
            />
            <div
              className="absolute right-0 top-0 h-full bg-green-500/60 rounded-r-full transition-all duration-500"
              style={{ width: `${marginBarPct}%` }}
            />
            {targetMarkerPct !== null && (
              <div
                className="absolute top-0 h-full w-0.5 bg-primary z-10"
                style={{ left: `${targetMarkerPct}%` }}
                title={`Target: ${targetMarkerPct}%`}
              />
            )}
          </div>
          {targetMarkerPct !== null && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
              <span className="text-xs text-muted-foreground">
                Target margin: {targetMarkerPct}%
              </span>
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            ["Revenue", `$${fmt(revenue)}/mo`],
            ["Total Cost", `$${fmt(totalCost)}/mo`],
            plan.totalTokens > 0 ? ["Total Tokens", plan.totalTokens.toLocaleString()] : null,
            ["Avg Cost / User", `$${fmt(avgCostPerUser)}/mo`],
            plan.tokenCost > 0 ? ["Token / LLM Cost", `$${fmt(plan.tokenCost)}/mo`] : null,
            plan.overhead > 0 ? ["Overhead", `$${fmt(plan.overhead)}/mo`] : null,
          ]
            .filter(Boolean)
            .map(([label, value]) => (
              <div key={label as string} className="bg-muted/50 rounded-xl p-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
                  {label as string}
                </p>
                <p className="text-sm font-bold text-foreground">{value as string}</p>
              </div>
            ))}
        </div>

        {/* Target margin panel */}
        {plan.targetMargin !== undefined && (
          <div
            className={`rounded-xl p-4 mb-5 ${
              meetsGoal
                ? "bg-green-50 border border-green-200"
                : "bg-primary/5 border border-primary/20"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {meetsGoal ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <Target className="w-4 h-4 text-primary" />
              )}
              <span className={`text-sm font-semibold ${meetsGoal ? "text-green-700" : "text-primary"}`}>
                {meetsGoal ? `Hitting your ${plan.targetMargin}% goal ✓` : `To hit ${plan.targetMargin}% margin`}
              </span>
            </div>
            {requiredPriceNote ? (
              <p className="text-xs text-muted-foreground">{requiredPriceNote}</p>
            ) : requiredPrice !== null ? (
              meetsGoal ? (
                <p className="text-xs text-green-700">
                  Your current ${fmt(plan.price)}/mo price already clears the ${fmt(requiredPrice)}/mo
                  required price.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  You need to charge{" "}
                  <strong className="text-foreground">${fmt(requiredPrice)}/mo per customer</strong>{" "}
                  (currently ${fmt(plan.price)}/mo — raise by ${fmt(requiredPrice - plan.price)}).
                </p>
              )
            ) : null}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 border border-border rounded-xl py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-1.5 border border-red-200 rounded-xl px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PlanPricingMarginCalculator() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  // ── Summary ───────────────────────────────────────────────────────────────
  const totalCustomers = plans.reduce((s, p) => s + p.customers, 0);
  const totalRevenue = plans.reduce((s, p) => s + p.price * p.customers, 0);
  const totalCostAll = plans.reduce((s, p) => s + p.tokenCost + p.overhead, 0);
  const blendedMarginDollars = totalRevenue - totalCostAll;
  const blendedMarginPct = totalRevenue === 0 ? -100 : (blendedMarginDollars / totalRevenue) * 100;

  // ── Modal helpers ─────────────────────────────────────────────────────────
  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(id: string) {
    const p = plans.find((x) => x.id === id);
    if (!p) return;
    setEditingId(id);
    setForm({
      name: p.name,
      price: String(p.price),
      customers: String(p.customers),
      totalTokens: p.totalTokens > 0 ? String(p.totalTokens) : "",
      tokenCost: p.tokenCost > 0 ? String(p.tokenCost) : "",
      overhead: p.overhead > 0 ? String(p.overhead) : "",
      targetMargin: p.targetMargin !== undefined ? String(p.targetMargin) : "",
    });
    setErrors({});
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setErrors({});
  }

  function updateForm(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) errs.name = "Plan name is required.";
    if (form.price === "" || isNaN(Number(form.price)) || Number(form.price) < 0)
      errs.price = "Enter a valid price (≥ 0).";
    if (form.customers === "" || isNaN(Number(form.customers)) || Number(form.customers) < 0)
      errs.customers = "Enter a valid customer count (≥ 0).";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function submit() {
    if (!validate()) return;
    const plan: Plan = {
      id: editingId ?? crypto.randomUUID(),
      name: form.name.trim(),
      price: Number(form.price) || 0,
      customers: Math.round(Number(form.customers) || 0),
      totalTokens: Math.round(Number(form.totalTokens) || 0),
      tokenCost: Number(form.tokenCost) || 0,
      overhead: Number(form.overhead) || 0,
      targetMargin: form.targetMargin !== "" ? Number(form.targetMargin) : undefined,
    };
    setPlans((prev) =>
      editingId ? prev.map((p) => (p.id === editingId ? plan : p)) : [...prev, plan]
    );
    closeModal();
  }

  function deletePlan(id: string) {
    setPlans((prev) => prev.filter((p) => p.id !== id));
  }

  function loadExamples() {
    setPlans(EXAMPLE_PLANS);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <PublicLayout>
      {/* Page header */}
      <section className="py-14 px-6 bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 rounded-full px-3 py-1 mb-5">
            Free Tool · No account needed
          </span>
          <h1 className="text-3xl md:text-4xl font-bold font-outfit mb-4">
            Plan & Pricing Margin Calculator
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Add your pricing plans with enrollment and cost numbers, instantly see your real net
            margin per plan, and find the price you need to charge to hit a target margin.
          </p>
        </div>
      </section>

      <section className="py-10 px-6">
        <div className="max-w-5xl mx-auto">

          {/* Summary bar */}
          {plans.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                ["Plans", String(plans.length)],
                ["Total Customers", totalCustomers.toLocaleString()],
                ["Total Revenue", `$${fmt(totalRevenue)}/mo`],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                    {label}
                  </p>
                  <p className="text-lg font-bold font-outfit">{value}</p>
                </div>
              ))}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                  Blended Net Margin
                </p>
                <p
                  className={`text-lg font-bold font-outfit ${
                    blendedMarginDollars < 0 ? "text-red-500" : "text-green-600"
                  }`}
                >
                  {blendedMarginDollars < 0 ? "" : "+"}
                  {fmt(blendedMarginPct, 1)}%
                  <span className="text-sm font-medium ml-1">
                    ({blendedMarginDollars < 0 ? "-" : "+"}${fmt(Math.abs(blendedMarginDollars))}/mo)
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Add Plan button */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold font-outfit">
              {plans.length === 0 ? "Your plans" : `${plans.length} plan${plans.length === 1 ? "" : "s"}`}
            </h2>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Plan
            </button>
          </div>

          {/* Empty state */}
          {plans.length === 0 && (
            <div className="border-2 border-dashed border-border rounded-2xl py-20 text-center">
              <AlertCircle className="w-8 h-8 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium mb-2">No plans yet</p>
              <p className="text-sm text-muted-foreground mb-5">
                Add a plan using the button above, or{" "}
                <button
                  onClick={loadExamples}
                  className="text-primary font-semibold hover:underline"
                >
                  see it with example data
                </button>{" "}
                first.
              </p>
              <button
                onClick={openAdd}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" /> Add my first plan
              </button>
            </div>
          )}

          {/* Plan cards */}
          {plans.length > 0 && (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onEdit={() => openEdit(plan.id)}
                  onDelete={() => deletePlan(plan.id)}
                />
              ))}
            </div>
          )}

          {/* After plans: reset to examples */}
          {plans.length > 0 && (
            <div className="mt-8 text-center">
              <button
                onClick={loadExamples}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Reset to example data
              </button>
            </div>
          )}

          {/* Bottom info */}
          <div className="mt-12 bg-muted/40 border border-border rounded-2xl p-6 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              How the math works
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Revenue = Price × Customers</li>
              <li>Total Cost = Token/LLM Cost + Overhead</li>
              <li>Net Margin ($) = Revenue − Total Cost</li>
              <li>Net Margin (%) = Net Margin ÷ Revenue × 100</li>
              <li>Required price for goal g% = Total Cost × 100 ÷ ((100 − g) × Customers)</li>
            </ul>
            <p className="mt-3">
              Everything is calculated in your browser — no data is sent anywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Modal */}
      {modalOpen && (
        <PlanModal
          form={form}
          onChange={updateForm}
          onSubmit={submit}
          onClose={closeModal}
          isEditing={editingId !== null}
          errors={errors}
        />
      )}
    </PublicLayout>
  );
}
