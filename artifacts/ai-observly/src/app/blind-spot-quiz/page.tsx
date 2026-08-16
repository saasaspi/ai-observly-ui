"use client";
import { useState, useEffect } from "react";
import { PublicLayout } from "@/components/public-layout";
import Link from "next/link";
import { ArrowRight, RotateCcw, Brain } from "lucide-react";

// Replace with real signup/pricing URL before shipping
const PRODUCT_URL = "/signup";

// ── Quiz data ──────────────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    layer: "Spend",
    text: "Right now, without looking it up — do you know your total AI spend this month?",
    options: [
      "I have no idea",
      "I could probably estimate",
      "I can find out manually",
      "I track this regularly",
      "I know automatically",
    ],
  },
  {
    layer: "Drivers",
    text: "Do you know which features or workflows are responsible for the biggest share of your AI cost?",
    options: [
      "I have no idea",
      "I could probably estimate",
      "I can find out manually",
      "I track this regularly",
      "I know automatically",
    ],
  },
  {
    layer: "Customers",
    text: "Do you know which customers or user segments are driving the most AI spend?",
    options: [
      "I have no idea",
      "I could probably estimate",
      "I can find out manually",
      "I track this regularly",
      "I know automatically",
    ],
  },
  {
    layer: "Features",
    text: "Do you know the per-call cost for each of your AI-powered features?",
    options: [
      "I have no idea",
      "I could probably estimate",
      "I can find out manually",
      "I track this regularly",
      "I know automatically",
    ],
  },
  {
    layer: "Profitability",
    text: "Do you know whether each of your AI-powered features generates more revenue than it costs to run?",
    options: [
      "I have no idea",
      "I could probably estimate",
      "I can find out manually",
      "I track this regularly",
      "I know automatically",
    ],
  },
  {
    layer: "Change",
    text: "When your AI costs spike or drop significantly, how quickly do you find out?",
    options: [
      "Usually at the end of the month, from the invoice",
      "After a few days, if I happen to notice",
      "When I check manually — weekly or so",
      "Within 24 hours",
      "I get an automated alert in real time",
    ],
  },
  {
    layer: "Action",
    text: "When you discover a cost problem, how quickly can you make a change?",
    options: [
      "I'd need to investigate before I could do anything",
      "Within a few days, after some digging",
      "Within a day, once I know what to change",
      "I have a playbook — I act within hours",
      "We have automated responses or very tight SLAs",
    ],
  },
  {
    layer: "Automation",
    text: "How automated is your AI cost monitoring today?",
    options: [
      "I check the monthly invoice — that's it",
      "I have some dashboards but check them inconsistently",
      "I review regular reports or exports",
      "I have dashboards I check most days",
      "I have automated alerts and real-time visibility",
    ],
  },
] as const;

// Pairs of question indices (0-based) that form each dimension
const DIMENSIONS = [
  { name: "Customer Visibility", qA: 2, qB: 1 }, // Customers + Drivers
  { name: "Feature Visibility",  qA: 3, qB: 4 }, // Features + Profitability
  { name: "Profitability",       qA: 0, qB: 5 }, // Spend + Change
  { name: "Automation",          qA: 6, qB: 7 }, // Action + Automation
] as const;

// ── Scoring ─────────────────────────────────────────────────────────────────────
function computeScores(answers: number[]) {
  const dimScores = DIMENSIONS.map(({ qA, qB }) => {
    const avg = (answers[qA] + answers[qB]) / 2; // 0–4
    return Math.round(avg * 25);                  // 0–100
  });
  const overall = Math.round(dimScores.reduce((a, b) => a + b, 0) / 4);
  return { dimScores, overall };
}

function getMaturity(score: number) {
  if (score <= 20) return { label: "Flying Blind",       color: "#ef4444", track: "#fecaca" };
  if (score <= 40) return { label: "Getting Visibility", color: "#f59e0b", track: "#fde68a" };
  if (score <= 60) return { label: "Tracking Costs",     color: "#3b82f6", track: "#bfdbfe" };
  if (score <= 80) return { label: "Cost-Aware",         color: "#14b8a6", track: "#99f6e4" };
  return                 { label: "AI Cost Leader",      color: "#22c55e", track: "#bbf7d0" };
}

function getDimColor(score: number) {
  if (score <= 20) return "#ef4444";
  if (score <= 40) return "#f59e0b";
  if (score <= 60) return "#3b82f6";
  if (score <= 80) return "#14b8a6";
  return "#22c55e";
}

type BlindSpotInfo = {
  headline: string;
  insight: string;
  scenarioBody: string;
  scenarioQuestion: string;
};

function getBlindSpot(dimScores: number[], overall: number): BlindSpotInfo {
  if (overall > 80) {
    return {
      headline: "You're already an AI Cost Leader",
      insight: "Your visibility is mature. The gap isn't knowledge — it's automation.",
      scenarioBody:
        "The next frontier isn't more dashboards — it's closing the gap between knowing and acting. The best AI companies eliminate the manual work of monitoring entirely.",
      scenarioQuestion: "How much of your current monitoring still requires a human to check?",
    };
  }

  const minScore = Math.min(...dimScores);
  // Tie-break: prefer Automation (index 3)
  let weakestIdx = dimScores.indexOf(minScore);
  if (dimScores[3] === minScore) weakestIdx = 3;

  const strongestIdx = dimScores.indexOf(Math.max(...dimScores));
  const strongestLabel = DIMENSIONS[strongestIdx].name.toLowerCase();

  const scenarios: BlindSpotInfo[] = [
    {
      headline: "Your biggest blind spot: customer-level cost attribution",
      insight: `You have some grip on ${strongestLabel}. You don't know which customers are actually driving your costs.`,
      scenarioBody:
        "Imagine your top account costs you 3× more to serve than they pay — and you find out four months in. The margin damage is already done.",
      scenarioQuestion:
        "Is one customer quietly subsidized by everyone else in your book?",
    },
    {
      headline: "Your biggest blind spot: feature-level margins",
      insight: `You have some grip on ${strongestLabel}. You don't know which features are actually worth their cost.`,
      scenarioBody:
        "Your most-used feature might also be your most expensive one. Every sprint you spend on performance is a sprint you could spend on margin.",
      scenarioQuestion:
        "Do you know which features make money and which ones quietly burn it?",
    },
    {
      headline: "Your biggest blind spot: AI profitability",
      insight: `You have some grip on ${strongestLabel}. You don't know whether your AI spend is actually profitable.`,
      scenarioBody:
        "Imagine your AI bill doubles next month. You can't tell investors if it's growth or a runaway bug. You can't tell your team what to fix.",
      scenarioQuestion:
        "Could you answer 'is our AI profitable?' with confidence right now?",
    },
    {
      headline: "Your biggest blind spot: automated cost monitoring",
      insight: `You have some grip on ${strongestLabel}. You just don't know the moment something goes wrong.`,
      scenarioBody:
        "A prompt bug causes 100× token usage for 48 hours. With automated alerting, that's a $20 problem. Without it, it's a $2,000 surprise on next month's invoice.",
      scenarioQuestion:
        "How long would it take you to notice something went wrong today?",
    },
  ];

  return scenarios[weakestIdx];
}

// ── Circular gauge (SVG + animated count-up) ──────────────────────────────────
function CircularGauge({
  score,
  color,
  track,
}: {
  score: number;
  color: string;
  track: string;
}) {
  const [animated, setAnimated] = useState(false);
  const [displayed, setDisplayed] = useState(0);
  const R = 80;
  const C = 2 * Math.PI * R;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!animated) return;
    const start = performance.now();
    const dur = 1200;
    const step = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayed(Math.round(eased * score));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [animated, score]);

  const offset = C - (animated ? score / 100 : 0) * C;

  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      className="mx-auto"
      aria-label={`Score: ${score} out of 100`}
    >
      <circle cx="100" cy="100" r={R} fill="none" stroke={track} strokeWidth="14" />
      <circle
        cx="100"
        cy="100"
        r={R}
        fill="none"
        stroke={color}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={offset}
        transform="rotate(-90 100 100)"
        style={{
          transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
      <text
        x="100"
        y="93"
        textAnchor="middle"
        fontSize="40"
        fontWeight="800"
        fill={color}
        fontFamily="inherit"
      >
        {displayed}
      </text>
      <text
        x="100"
        y="118"
        textAnchor="middle"
        fontSize="12"
        fill="#94a3b8"
        fontFamily="inherit"
      >
        out of 100
      </text>
    </svg>
  );
}

// ── Animated horizontal dimension bar ─────────────────────────────────────────
function DimBar({
  name,
  score,
  delay,
}: {
  name: string;
  score: number;
  delay: number;
}) {
  const [width, setWidth] = useState(0);
  const color = getDimColor(score);

  useEffect(() => {
    const t = setTimeout(() => setWidth(score), 150 + delay);
    return () => clearTimeout(t);
  }, [score, delay]);

  return (
    <div>
      <div className="flex justify-between mb-1.5 text-sm">
        <span className="font-medium text-foreground">{name}</span>
        <span className="font-bold tabular-nums" style={{ color }}>
          {score}
        </span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${width}%`,
            backgroundColor: color,
            transition: `width 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
          }}
        />
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function BlindSpotQuizPage() {
  const [phase, setPhase] = useState<"intro" | "quiz" | "results">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(8).fill(-1));
  const [selected, setSelected] = useState<number | null>(null);

  function handleAnswer(optIdx: number) {
    if (selected !== null) return;
    setSelected(optIdx);
    const next = [...answers];
    next[currentQ] = optIdx;
    setAnswers(next);
    setTimeout(() => {
      setSelected(null);
      if (currentQ === 7) {
        setPhase("results");
      } else {
        setCurrentQ((q) => q + 1);
      }
    }, 280);
  }

  function restart() {
    setPhase("intro");
    setCurrentQ(0);
    setAnswers(Array(8).fill(-1));
    setSelected(null);
  }

  const allAnswered = answers.every((a) => a >= 0);
  const { dimScores, overall } = allAnswered
    ? computeScores(answers)
    : { dimScores: [0, 0, 0, 0], overall: 0 };
  const maturity = getMaturity(overall);
  const blindSpot = allAnswered ? getBlindSpot(dimScores, overall) : null;

  return (
    <PublicLayout>
      <div className="min-h-[calc(100dvh-4rem)] flex flex-col items-center justify-center py-16 px-6">
        <div className="w-full max-w-2xl">

          {/* ── Intro screen ── */}
          {phase === "intro" && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                <Brain className="w-3.5 h-3.5" />
                Free · 8 questions · 90 seconds
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-outfit text-foreground mb-4 leading-tight">
                Find Your AI Blind Spot
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
                8 questions to see how well you actually understand your AI cost —
                who's driving it, whether it's profitable, and whether you'd
                know if something went wrong.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 mb-10 text-left max-w-xs mx-auto">
                {[
                  "Where your AI spend really goes",
                  "Which customers and features drive costs",
                  "Whether your AI features are profitable",
                  "How fast you'd catch a cost problem",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setPhase("quiz")}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 shadow-sm"
              >
                Start the quiz <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* ── Quiz screen ── */}
          {phase === "quiz" && (
            <div>
              {/* Segmented progress bar */}
              <div className="flex gap-1.5 mb-8">
                {QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-1.5 rounded-full transition-colors duration-300"
                    style={{
                      backgroundColor:
                        i < currentQ
                          ? "hsl(var(--primary))"
                          : i === currentQ
                          ? "hsl(var(--primary) / 0.5)"
                          : "hsl(var(--muted))",
                    }}
                  />
                ))}
              </div>

              {/* Layer badge + counter */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {QUESTIONS[currentQ].layer}
                </span>
                <span className="text-xs text-muted-foreground">
                  {currentQ + 1} of {QUESTIONS.length}
                </span>
              </div>

              {/* Question text */}
              <h2 className="text-xl md:text-2xl font-bold font-outfit text-foreground mb-8 leading-snug">
                {QUESTIONS[currentQ].text}
              </h2>

              {/* Answer options */}
              <div className="space-y-3">
                {QUESTIONS[currentQ].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={selected !== null}
                    className={`w-full text-left px-5 py-4 rounded-xl border text-sm font-medium transition-all duration-150 ${
                      selected === i
                        ? "border-primary bg-primary/10 text-primary scale-[0.98]"
                        : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5 hover:-translate-y-0.5 hover:shadow-sm"
                    } disabled:cursor-default`}
                  >
                    <span className="inline-flex w-6 h-6 rounded-full border border-current items-center justify-center text-[11px] mr-3 font-bold shrink-0 align-middle">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Results screen ── */}
          {phase === "results" && blindSpot && (
            <div className="text-center">
              {/* Gauge */}
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                Your AI Cost Visibility Score
              </p>
              <CircularGauge
                score={overall}
                color={maturity.color}
                track={maturity.track}
              />
              <p
                className="text-lg font-bold mt-2 mb-1"
                style={{ color: maturity.color }}
              >
                {maturity.label}
              </p>

              {/* Blind spot headline */}
              <h2 className="text-2xl md:text-3xl font-bold font-outfit text-foreground mt-8 mb-3 leading-snug">
                {blindSpot.headline}
              </h2>

              {/* Dynamic insight */}
              <p className="text-muted-foreground text-base mb-8 max-w-md mx-auto leading-relaxed">
                {blindSpot.insight}
              </p>

              {/* Dimension breakdown bars */}
              <div className="bg-card border border-border rounded-2xl p-6 mb-6 text-left space-y-5">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Dimension breakdown
                </p>
                {DIMENSIONS.map((dim, i) => (
                  <DimBar
                    key={dim.name}
                    name={dim.name}
                    score={dimScores[i]}
                    delay={i * 130}
                  />
                ))}
              </div>

              {/* Counterfactual scenario box */}
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-6 mb-8 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-3">
                  What this could cost you
                </p>
                <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed mb-3">
                  {blindSpot.scenarioBody}
                </p>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                  {blindSpot.scenarioQuestion}
                </p>
              </div>

              {/* CTA */}
              <Link
                href={PRODUCT_URL}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 shadow-sm mb-4"
              >
                See your AI margins in detail <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="mt-4">
                <button
                  onClick={restart}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retake assessment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
