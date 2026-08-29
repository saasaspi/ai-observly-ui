import Link from "next/link";
import { BookText, Code2, ArrowRight } from "lucide-react";
import { getDocsNav } from "@/lib/sanity/docs";

export default async function DocsIndexPage() {
  const { categories, uncategorized } = await getDocsNav();

  const hasContent = categories.length > 0 || uncategorized.length > 0;

  if (!hasContent) {
    // Safe empty state when Sanity has no doc content yet
    return (
      <div className="py-12 md:py-20 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-6">
          <BookText className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold font-outfit mb-4 text-foreground tracking-tight">
          Documentation
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
          We're currently writing our technical documentation. Please check back soon for integration guides, API references, and tutorials.
        </p>
        
        <div className="bg-muted/50 border border-border rounded-xl p-8 text-left">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-primary" />
            Quick Start (Node.js)
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            While we're preparing our full docs, here's how to log usage to AI Observly:
          </p>
          <pre className="bg-card border border-border rounded-lg p-4 text-xs sm:text-sm font-mono text-foreground overflow-x-auto">
{`fetch("https://[your-ai-observly-domain]/api/log-usage", {
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
}).catch(() => {}); // Fire and forget`}
          </pre>
        </div>
      </div>
    );
  }

  // If there's content, show a nice grid of categories
  return (
    <div className="py-10 lg:py-16 max-w-4xl">
      <div className="mb-12">
        <h1 className="text-4xl font-bold font-outfit mb-4 text-foreground tracking-tight">
          Documentation
        </h1>
        <p className="text-lg text-muted-foreground">
          Learn how to integrate AI Observly, track your LLM costs, and understand your margins.
        </p>
      </div>

      <div className="space-y-12">
        {categories.map(category => (
          <div key={category._id} className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-foreground mb-6 font-outfit">
              {category.title}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {category.docs?.map(doc => (
                <Link
                  key={doc._id} 
                  href={`/docs/${doc.slug}`}
                  className="group flex flex-col p-5 border border-border rounded-xl bg-card hover:bg-muted/50 transition-colors shadow-sm hover:shadow-md"
                >
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center justify-between mb-2">
                    {doc.title}
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                  </h3>
                  {doc.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{doc.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}

        {uncategorized.length > 0 && (
          <div className="scroll-mt-20">
            <h2 className="text-2xl font-semibold text-foreground mb-6 font-outfit">
              Overview
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {uncategorized.map(doc => (
                <Link 
                  key={doc._id} 
                  href={`/docs/${doc.slug}`}
                  className="group flex flex-col p-5 border border-border rounded-xl bg-card hover:bg-muted/50 transition-colors shadow-sm hover:shadow-md"
                >
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center justify-between mb-2">
                    {doc.title}
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
