import { PublicLayout } from "@/components/public-layout";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useSubmitWaitlist } from "@/hooks/use-api";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function LandingPage() {
  const { toast } = useToast();
  const submitWaitlist = useSubmitWaitlist();
  
  const form = useForm<z.infer<typeof waitlistSchema>>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: z.infer<typeof waitlistSchema>) => {
    submitWaitlist.mutate(data.email, {
      onSuccess: () => {
        toast({
          title: "You're on the list!",
          description: "We'll notify you when early access is ready.",
        });
        form.reset();
      },
      onError: () => {
        toast({
          title: "Something went wrong",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            Stop guessing your AI margins
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 font-outfit text-foreground leading-[1.1]">
            See which customers and features are <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">actually making you money.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            AI Observly connects to your AI provider and tracks costs across your customers and features — showing you real cost and ROI in plain English, no engineering dashboard required.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/signup" 
              className="inline-flex items-center justify-center h-14 px-8 text-lg font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity w-full sm:w-auto shadow-sm"
              data-testid="hero-cta"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-card border-y border-border relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-outfit mb-4">How it works</h2>
            <p className="text-muted-foreground text-lg">Three steps to crystal clear AI margins.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold font-outfit mb-6">1</div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Generate your key</h3>
              <p className="text-muted-foreground leading-relaxed">
                Generate your AI Observly secret key. Takes about two minutes — no complicated setup required.
              </p>
            </div>
            
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold font-outfit mb-6">2</div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Your app keeps working exactly as before</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your AI features keep calling OpenAI or Anthropic directly, exactly like they do today. AI Observly never sits in the middle of your live traffic — your app just sends us a quick, background copy of what each request cost after the fact.
              </p>
            </div>
            
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold font-outfit mb-6">3</div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">See the real picture</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your dashboard shows, per customer and per feature: what it costs you, what it earns you, and whether it's actually profitable — in plain dollars, not tokens.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ / Trust */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-outfit mb-12 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-8">
            <div className="p-8 rounded-2xl bg-card border border-border shadow-sm">
              <h3 className="text-xl font-semibold mb-3 flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                "Can this break my app?"
              </h3>
              <p className="text-muted-foreground ml-9 leading-relaxed">
                No. AI Observly never routes your live AI traffic through our servers — your app keeps calling OpenAI/Anthropic directly. If AI Observly is ever briefly unavailable, your product keeps working exactly as normal.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-card border border-border shadow-sm">
              <h3 className="text-xl font-semibold mb-3 flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                "Do you have access to my revenue data?"
              </h3>
              <p className="text-muted-foreground ml-9 leading-relaxed">
                You control what revenue data you enter. AI Observly allows you to define custom plans and customer revenues so we can calculate margins accurately.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-card border border-border shadow-sm">
              <h3 className="text-xl font-semibold mb-3 flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                "Do I need to be technical to set this up?"
              </h3>
              <p className="text-muted-foreground ml-9 leading-relaxed">
                No. If you're building with an AI coding assistant like Replit, Cursor, or Lovable, we give you a copy-paste prompt that does the setup for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section className="py-24 px-6 bg-card border-t border-border mt-auto">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold font-outfit mb-4">Ready to see your real margins?</h2>
          <p className="text-muted-foreground mb-8">Join the waitlist to get early access.</p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-1 text-left">
                    <FormControl>
                      <Input 
                        placeholder="founder@startup.com" 
                        {...field} 
                        className="h-12 bg-background border-border focus-visible:ring-primary shadow-sm"
                        data-testid="input-waitlist-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <button 
                type="submit" 
                className="h-12 px-6 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity whitespace-nowrap shadow-sm"
                disabled={submitWaitlist.isPending}
                data-testid="btn-waitlist-submit"
              >
                {submitWaitlist.isPending ? "Joining..." : "Get Early Access"}
              </button>
            </form>
          </Form>
        </div>
      </section>
    </PublicLayout>
  );
}