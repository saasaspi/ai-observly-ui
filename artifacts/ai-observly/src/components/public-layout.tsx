"use client";
import { ReactNode, useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

type NavPost = { _id: string; title: string; slug: string }

export function PublicLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [blogsOpen, setBlogsOpen] = useState(false);
  const [freeToolsOpen, setFreeToolsOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [activeFeaturesTab, setActiveFeaturesTab] = useState<"core" | "tools" | "trust">("core");
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [mobileFreeToolsOpen, setMobileFreeToolsOpen] = useState(false);
  const [mobileFeaturesOpen, setMobileFeaturesOpen] = useState(false);
  const [navPosts, setNavPosts] = useState<NavPost[]>([]);
  const isHome = pathname === "/";

  // Timers to prevent flicker on hover
  const productsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blogsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const freeToolsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const featuresTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch recent posts for Blogs dropdown on mount
  useEffect(() => {
    fetch("/napi/recent-posts?limit=5")
      .then((r) => r.json())
      .then((data) => setNavPosts(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const sectionHref = (anchor: string) => (isHome ? `#${anchor}` : `/#${anchor}`);

  const openProducts = () => {
    if (productsTimer.current) clearTimeout(productsTimer.current);
    setProductsOpen(true);
  };
  const closeProducts = () => {
    productsTimer.current = setTimeout(() => setProductsOpen(false), 120);
  };
  const openBlogs = () => {
    if (blogsTimer.current) clearTimeout(blogsTimer.current);
    setBlogsOpen(true);
  };
  const closeBlogs = () => {
    blogsTimer.current = setTimeout(() => setBlogsOpen(false), 120);
  };
  const openFreeTools = () => {
    if (freeToolsTimer.current) clearTimeout(freeToolsTimer.current);
    setFreeToolsOpen(true);
  };
  const closeFreeTools = () => {
    freeToolsTimer.current = setTimeout(() => setFreeToolsOpen(false), 120);
  };
  const openFeatures = () => {
    if (featuresTimer.current) clearTimeout(featuresTimer.current);
    setFeaturesOpen(true);
  };
  const closeFeatures = () => {
    featuresTimer.current = setTimeout(() => setFeaturesOpen(false), 160);
  };

  // Mega-menu content
  const coreFeatures = [
    { title: "Per-Customer Cost Attribution", desc: "See exactly which customers are profitable and which are eating your margin", href: "/features/per-customer-cost-attribution" },
    { title: "Per-Feature Margins & ROI", desc: "Know which features are worth building and which are burning budget", href: "/features/per-feature-margins-roi" },
    { title: "Plan & Pricing Profitability", desc: "See net margin by plan, not just revenue", href: "/features/plan-pricing-profitability" },
    { title: "Margin Alerts", desc: "Get notified the moment a customer or plan turns margin-negative", href: "/features" },
  ];
  const freeToolItems = [
    { title: "LLM Spend Analyzer", desc: "Upload your billing CSV, get an instant cost breakdown", href: "/spend-checkup" },
    { title: "AI Blind Spot Quiz", desc: "Find your AI cost blind spots in 2 minutes", href: "/blind-spot-quiz" },
    { title: "Plan & Pricing Margin Calculator", desc: "Model your plan margins and back-calculate your ideal price", href: "/tools/plan-pricing-margin-calculator" },
  ];
  const trustItems = [
    { title: "No Proxy Architecture", desc: "Nothing routes through our servers", href: "/security" },
    { title: "No Stored API Keys", desc: "We never see or store your provider keys", href: "/security" },
    { title: "Data Retention", desc: "30 days on Free, 90 days on Pro", href: "/security" },
  ];
  const megaTabItems = activeFeaturesTab === "core" ? coreFeatures : activeFeaturesTab === "tools" ? freeToolItems : trustItems;

  const dropdownBase =
    "absolute top-full left-0 mt-1 bg-card border border-border rounded-xl shadow-lg py-1.5 z-50";
  const dropdownLink =
    "block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors";

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col font-sans">
      <header
        className={`border-b sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-border/60 bg-background/95 backdrop-blur-lg shadow-md shadow-black/5"
            : "border-border/40 bg-background/90 backdrop-blur-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="shrink-0" data-testid="link-home">
            <Image
              src="/logo.png"
              alt="AI Observly"
              width={2172}
              height={724}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            {/* Products dropdown */}
            <div
              className="relative"
              onMouseEnter={openProducts}
              onMouseLeave={closeProducts}
            >
              <button className="flex items-center gap-1 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                Products <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {productsOpen && (
                <div className={`${dropdownBase} w-44`}>
                  <a href={sectionHref("how-it-works")} className={dropdownLink}>
                    How it works
                  </a>
                  <a href={sectionHref("features")} className={dropdownLink}>
                    Features
                  </a>
                  <a href={sectionHref("who-its-for")} className={dropdownLink}>
                    Who it&apos;s for
                  </a>
                </div>
              )}
            </div>

            {/* Features mega-menu */}
            <div className="relative" onMouseEnter={openFeatures} onMouseLeave={closeFeatures}>
              <button className="flex items-center gap-1 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                Features <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {featuresOpen && (
                <div className="absolute top-full left-0 mt-2 bg-card border border-border rounded-2xl shadow-xl z-50 flex gap-0 overflow-hidden" style={{ width: 640 }}>
                  {/* Left: tabs + grid */}
                  <div className="flex-1 p-5">
                    {/* Tab strip */}
                    <div className="flex gap-1 mb-4">
                      {(["core", "tools", "trust"] as const).map((tab) => {
                        const labels = { core: "Core Features", tools: "Free Tools", trust: "Trust & Security" };
                        return (
                          <button
                            key={tab}
                            onClick={() => setActiveFeaturesTab(tab)}
                            onMouseEnter={() => setActiveFeaturesTab(tab)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              activeFeaturesTab === tab
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                          >
                            {labels[tab]}
                          </button>
                        );
                      })}
                    </div>
                    {/* 2-column grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {megaTabItems.map((item) => (
                        <Link
                          key={item.href + item.title}
                          href={item.href}
                          onClick={() => setFeaturesOpen(false)}
                          className="group flex flex-col gap-0.5 rounded-xl p-3 hover:bg-muted transition-colors"
                        >
                          <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">{item.title}</span>
                          <span className="text-xs text-muted-foreground leading-snug">{item.desc}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                  {/* Right: preview card */}
                  <div className="w-48 shrink-0 border-l border-border bg-muted/30 p-4 flex flex-col gap-3">
                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border bg-muted/50">
                        <div className="w-2 h-2 rounded-full bg-red-400/70" />
                        <div className="w-2 h-2 rounded-full bg-yellow-400/70" />
                        <div className="w-2 h-2 rounded-full bg-green-400/70" />
                      </div>
                      <div className="p-2 space-y-1">
                        {[["Acme Corp", "-$60", "text-red-500"], ["Verity Labs", "+$95", "text-green-600"], ["Moonshot", "+$315", "text-green-600"]].map(([n, m, c]) => (
                          <div key={n} className="flex justify-between text-[9px]">
                            <span className="text-muted-foreground">{n}</span>
                            <span className={`font-bold ${c}`}>{m}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground leading-snug mb-0.5">Explore how AI Observly prices out</p>
                      <p className="text-[10px] text-muted-foreground mb-3">See which plan fits your customer base.</p>
                      <Link
                        href="/pricing"
                        onClick={() => setFeaturesOpen(false)}
                        className="block text-center text-xs font-semibold bg-primary text-primary-foreground rounded-lg px-3 py-2 hover:opacity-90 transition-opacity"
                      >
                        View Pricing
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Docs */}
            <Link
              href="/docs"
              className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              data-testid="link-docs"
            >
              Docs
            </Link>

            {/* Blogs dropdown */}
            <div
              className="relative"
              onMouseEnter={openBlogs}
              onMouseLeave={closeBlogs}
            >
              <button
                className="flex items-center gap-1 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                data-testid="link-blog"
              >
                Blog <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {blogsOpen && (
                <div className={`${dropdownBase} w-72`}>
                  {navPosts.length > 0 ? (
                    <>
                      {navPosts.map((post) => (
                        <Link
                          key={post._id}
                          href={`/blog/${post.slug}`}
                          className="block px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors leading-snug"
                          onClick={() => setBlogsOpen(false)}
                        >
                          {post.title}
                        </Link>
                      ))}
                      <div className="border-t border-border mt-1 pt-1">
                        <Link
                          href="/blog"
                          className="block px-4 py-2 text-sm font-medium text-primary hover:bg-muted transition-colors"
                          onClick={() => setBlogsOpen(false)}
                        >
                          View all posts →
                        </Link>
                      </div>
                    </>
                  ) : (
                    <Link href="/blog" className={dropdownLink}>
                      View all posts
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Pricing */}
            <Link
              href="/pricing"
              className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Pricing
            </Link>

            {/* Free Tools dropdown */}
            <div
              className="relative"
              onMouseEnter={openFreeTools}
              onMouseLeave={closeFreeTools}
            >
              <button
                className="flex items-center gap-1.5 px-3 py-2 rounded-md font-semibold text-primary hover:bg-primary/10 transition-colors"
                data-testid="link-free-tools"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Free Tools <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {freeToolsOpen && (
                <div className={`${dropdownBase} w-56`}>
                  <Link
                    href="/blind-spot-quiz"
                    className={dropdownLink}
                    onClick={() => setFreeToolsOpen(false)}
                  >
                    🔍 AI Blind Spot Quiz
                  </Link>
                  <Link
                    href="/spend-checkup"
                    className={dropdownLink}
                    onClick={() => setFreeToolsOpen(false)}
                    data-testid="link-spend-checkup"
                  >
                    📊 LLM Spend Analyzer
                  </Link>
                </div>
              )}
            </div>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted"
              data-testid="link-login"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:opacity-90 transition-opacity shadow-sm"
              data-testid="link-signup"
            >
              Sign up
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md px-6 py-4 flex flex-col gap-1">
            {/* Products — expandable */}
            <button
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
            >
              Products
              {mobileProductsOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {mobileProductsOpen && (
              <div className="pl-4 flex flex-col gap-0.5">
                <a
                  href={sectionHref("how-it-works")}
                  className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  How it works
                </a>
                <a
                  href={sectionHref("features")}
                  className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Features
                </a>
                <a
                  href={sectionHref("who-its-for")}
                  className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Who it&apos;s for
                </a>
              </div>
            )}

            {/* Features — expandable accordion */}
            <button
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileFeaturesOpen(!mobileFeaturesOpen)}
            >
              Features
              {mobileFeaturesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {mobileFeaturesOpen && (
              <div className="pl-4 flex flex-col gap-0.5">
                <p className="px-3 pt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Core Features</p>
                {[
                  { label: "Per-Customer Cost Attribution", href: "/features/per-customer-cost-attribution" },
                  { label: "Per-Feature Margins & ROI", href: "/features/per-feature-margins-roi" },
                  { label: "Plan & Pricing Profitability", href: "/features/plan-pricing-profitability" },
                  { label: "Margin Alerts", href: "/features" },
                ].map((item) => (
                  <Link key={item.href} href={item.href} className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>
                    {item.label}
                  </Link>
                ))}
                <p className="px-3 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Free Tools</p>
                {[
                  { label: "LLM Spend Analyzer", href: "/spend-checkup" },
                  { label: "AI Blind Spot Quiz", href: "/blind-spot-quiz" },
                  { label: "Plan & Pricing Margin Calculator", href: "/tools/plan-pricing-margin-calculator" },
                ].map((item) => (
                  <Link key={item.href} href={item.href} className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>
                    {item.label}
                  </Link>
                ))}
                <p className="px-3 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Trust & Security</p>
                {[
                  { label: "No Proxy Architecture", href: "/security" },
                  { label: "No Stored API Keys", href: "/security" },
                  { label: "Data Retention", href: "/security" },
                ].map((item) => (
                  <Link key={item.label} href={item.href} className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Docs */}
            <Link
              href="/docs"
              className="px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Docs
            </Link>

            {/* Blog */}
            <Link
              href="/blog"
              className="px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Blog
            </Link>

            {/* Pricing */}
            <Link
              href="/pricing"
              className="px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </Link>

            {/* Free Tools — expandable */}
            <button
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-md text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
              onClick={() => setMobileFreeToolsOpen(!mobileFreeToolsOpen)}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Free Tools
              </span>
              {mobileFreeToolsOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {mobileFreeToolsOpen && (
              <div className="pl-4 flex flex-col gap-0.5">
                <Link
                  href="/blind-spot-quiz"
                  className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  🔍 AI Blind Spot Quiz
                </Link>
                <Link
                  href="/spend-checkup"
                  className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  📊 LLM Spend Analyzer
                </Link>
              </div>
            )}

            <div className="border-t border-border mt-2 pt-3 flex flex-col gap-2">
              <Link
                href="/login"
                className="px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="px-3 py-2.5 rounded-md text-sm font-medium bg-primary text-primary-foreground text-center hover:opacity-90 transition-opacity"
                onClick={() => setMobileOpen(false)}
              >
                Start Monitoring now
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col">{children}</main>

      <footer className="border-t border-border py-12 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="inline-block mb-3">
                <Image
                  src="/logo.png"
                  alt="AI Observly"
                  width={2172}
                  height={724}
                  className="h-10 w-auto"
                />
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI cost &amp; margin tracking for founders who ship fast.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/features/per-customer-cost-attribution" className="hover:text-foreground transition-colors">
                    Per-Customer Attribution
                  </Link>
                </li>
                <li>
                  <Link href="/features/per-feature-margins-roi" className="hover:text-foreground transition-colors">
                    Per-Feature Margins
                  </Link>
                </li>
                <li>
                  <Link href="/features/plan-pricing-profitability" className="hover:text-foreground transition-colors">
                    Plan Profitability
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <a href="/#how-it-works" className="hover:text-foreground transition-colors">
                    How it works
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/blog" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-foreground transition-colors">
                    Docs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/spend-checkup"
                    className="hover:text-foreground transition-colors font-medium text-primary"
                  >
                    Free LLM Spend Analyzer
                  </Link>
                </li>
                <li>
                  <a href="/#faq" className="hover:text-foreground transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Account</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/login" className="hover:text-foreground transition-colors">
                    Log in
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-foreground transition-colors">
                    Start Monitoring now
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} AI Observly. See exactly what your AI costs.</p>
            <p>Built in public · Made for founders</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
