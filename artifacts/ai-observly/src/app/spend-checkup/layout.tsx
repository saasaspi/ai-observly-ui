import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LLM Spend Analyzer — AI Observly",
  description:
    "Upload your Claude, OpenAI, or Gemini billing CSV and get an instant breakdown of your LLM spend — health score, projections, model mix, and cost spikes. Free, no sign-up required.",
  openGraph: {
    title: "LLM Spend Analyzer — AI Observly",
    description:
      "Get an instant breakdown of your LLM spend from any billing CSV. Free, no sign-up.",
  },
};

export default function SpendCheckupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
