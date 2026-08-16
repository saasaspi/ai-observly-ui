import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Am I Losing Money on AI? | Free Blind Spot Quiz",
  description:
    "Take our free 90-second quiz to find your AI cost blind spots — see if you know what you're really spending, and whether it's actually profitable.",
  openGraph: {
    title: "Am I Losing Money on AI? | Free Blind Spot Quiz",
    description:
      "Take our free 90-second quiz to find your AI cost blind spots — see if you know what you're really spending, and whether it's actually profitable.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Am I Losing Money on AI? | Free Blind Spot Quiz",
    description:
      "Take our free 90-second quiz to find your AI cost blind spots — see if you know what you're really spending, and whether it's actually profitable.",
  },
};

export default function BlindSpotQuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
