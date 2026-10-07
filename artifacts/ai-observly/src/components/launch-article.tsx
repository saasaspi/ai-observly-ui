import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PublicLayout } from "@/components/public-layout";
import { BlogCta } from "@/components/blog-cta";
import { LAUNCH_POST, NEW_FEATURES } from "@/lib/new-features";
import {
  SavingsHeroVisual, SpeedHeroVisual, ReliabilityHeroVisual,
} from "@/components/new-feature-visuals";

const LABEL = "Product launch";

const sections: { id: string; h: string; paras: string[]; key: "savings" | "speed" | "reliability"; visual: React.ReactNode }[] = [
  {
    id: "ai-savings",
    h: "AI Savings: are you paying full price for the same work twice?",
    paras: [
      "Many AI features begin every request with the same block of instructions or background. Think of a help desk assistant that always starts by re-reading your whole policy handbook. Some AI providers will reuse their earlier work on that repeated material and charge less for it. Technical people call this caching. The plain version: reuse what has not changed instead of paying full price each time.",
      "AI Savings shows how much of your repeated work is reused versus charged at full price, how many dollars that saved, and how many you missed. It ranks features by how much they reuse, and highlights features that are used often but reuse very little. Those are the best places to ask your developer to look.",
      "It will not tell you that you will save a particular percentage. That depends on how your product is built. It shows what is true today so you can decide.",
    ],
    key: "savings",
    visual: <SavingsHeroVisual />,
  },
  {
    id: "ai-response-speed",
    h: "AI Response Speed: how long do your customers wait?",
    paras: [
      "An average wait time can look fine while a slice of your customers sit through painfully slow answers. AI Response Speed shows the usual wait and the unusually slow waits for each feature and model, in seconds. It also compares how quickly models write their answers, and flags requests that are both slow and costly.",
      "If you use several AI services, you can compare response times across OpenAI, Anthropic, Gemini, Groq and Azure. This is a view of what happened in your product. It is not a guarantee from any provider.",
    ],
    key: "speed",
    visual: <SpeedHeroVisual />,
  },
  {
    id: "ai-reliability",
    h: "AI Reliability: what do failed requests cost?",
    paras: [
      "When a request fails or is cut off, you may still pay for part of it. AI Reliability shows the money spent on failed and interrupted requests, grouped by plain reasons: too many requests at once, instructions that were too long, or a safety filter stepping in.",
      "It also separates responses that finished normally from those that were cut short and left incomplete, and from handoffs where the AI asked another tool to do a step, which is expected. A searchable feed of recent failures shows the time and the customer affected, so support can answer a complaint with facts.",
      "It does not fix anything automatically and it does not score your answer quality. It makes the problem visible and specific.",
    ],
    key: "reliability",
    visual: <ReliabilityHeroVisual />,
  },
];

export function LaunchCard() {
  return (
    <Link
      href={`/blog/${LAUNCH_POST.slug}`}
      className="group flex flex-col bg-card border border-primary/30 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="w-full aspect-[16/9] bg-primary/5 flex items-center justify-center gap-2 px-6">
        {["Savings", "Speed", "Reliability"].map((t) => (
          <span key={t} className="rounded-full border border-primary/30 bg-card px-3 py-1 text-xs font-semibold text-primary">{t}</span>
        ))}
      </div>
      <div className="flex flex-col flex-1 p-6 gap-3">
        <span className="inline-block self-start text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">{LABEL}</span>
        <h2 className="text-lg font-bold font-outfit text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-3">
          {LAUNCH_POST.title}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">{LAUNCH_POST.description}</p>
      </div>
    </Link>
  );
}

export function LaunchArticle() {
  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: LAUNCH_POST.title,
            description: LAUNCH_POST.description,
            publisher: { "@type": "Organization", name: "AI Observly" },
          }),
        }}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 w-full">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          All posts
        </Link>
        <article>
          <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary mb-4">{LABEL}</span>
          <h1 className="text-3xl md:text-4xl font-bold font-outfit tracking-tight text-foreground mb-6 leading-tight">
            {LAUNCH_POST.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10">
            Your AI bill tells you what you spent. It does not tell you whether you wasted some of it, whether customers waited too long, or whether requests failed along the way. AI Observly now has three views that answer those questions in everyday language.
          </p>

          <nav aria-label="In this article" className="mb-12 rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">In this article</p>
            <ul className="space-y-1.5 text-sm">
              {sections.map((s) => (
                <li key={s.id}><a href={`#${s.id}`} className="text-primary hover:underline">{s.h}</a></li>
              ))}
            </ul>
          </nav>

          <div className="space-y-14">
            {sections.map((s) => {
              const f = NEW_FEATURES.find((x) => x.key === s.key)!;
              return (
                <section key={s.id} id={s.id} className="scroll-mt-24">
                  <h2 className="text-2xl font-bold font-outfit text-foreground mb-4 leading-snug">{s.h}</h2>
                  {s.paras.map((p, i) => (
                    <p key={i} className="text-muted-foreground leading-relaxed mb-4">{p}</p>
                  ))}
                  <div className="my-6">{s.visual}</div>
                  <Link href={f.href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                    Explore {f.title} <ArrowRight className="w-4 h-4" />
                  </Link>
                </section>
              );
            })}

            <section>
              <h2 className="text-2xl font-bold font-outfit text-foreground mb-4">Which one should you look at first?</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If the bill is your worry, start with AI Savings. If customers complain that the product feels sluggish, start with AI Response Speed. If support keeps hearing that something did not work, start with AI Reliability. The three views are separate, so you can use whichever answers your question first.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                See the <Link href="/pricing" className="text-primary hover:underline">pricing page</Link> for current plan details.
              </p>
            </section>
          </div>
        </article>
        <BlogCta />
      </div>
    </PublicLayout>
  );
}
