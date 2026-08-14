"use client";
import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sparkles } from "lucide-react";

const sectionLinks = [
  { label: "How it works", anchor: "how-it-works" },
  { label: "Features", anchor: "features" },
  { label: "Who it's for", anchor: "who-its-for" },
  { label: "Pricing", anchor: "pricing" },
  { label: "FAQ", anchor: "faq" },
];

export function PublicLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const sectionHref = (anchor: string) => (isHome ? `#${anchor}` : `/#${anchor}`);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col font-sans">
      <header className={`border-b sticky top-0 z-50 transition-all duration-300 ${scrolled ? "border-border/60 bg-background/95 backdrop-blur-lg shadow-md shadow-black/5" : "border-border/40 bg-background/90 backdrop-blur-md"}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg font-outfit shrink-0" data-testid="link-home">
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
            </div>
            AI Observly
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            {sectionLinks.map(({ label, anchor }) => (
              <a key={anchor} href={sectionHref(anchor)} className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                {label}
              </a>
            ))}
            <Link href="/blog" className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" data-testid="link-blog">
              Blog
            </Link>
            <Link href="/docs" className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" data-testid="link-docs">
              Docs
            </Link>
            <Link
              href="/spend-checkup"
              className="px-3 py-2 rounded-md font-semibold text-primary hover:bg-primary/10 transition-colors flex items-center gap-1.5"
              data-testid="link-spend-checkup"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Free Spend Check-up
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-muted" data-testid="link-login">
              Log in
            </Link>
            <Link href="/signup" className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:opacity-90 transition-opacity shadow-sm" data-testid="link-signup">
              Sign up
            </Link>
          </div>

          <button className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md px-6 py-4 flex flex-col gap-1">
            {sectionLinks.map(({ label, anchor }) => (
              <a key={anchor} href={sectionHref(anchor)} className="px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>
                {label}
              </a>
            ))}
            <Link href="/blog" className="px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>
              Blog
            </Link>
            <Link href="/docs" className="px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>
              Docs
            </Link>
            <Link href="/spend-checkup" className="px-3 py-2.5 rounded-md text-sm font-semibold text-primary hover:bg-primary/10 transition-colors flex items-center gap-2" onClick={() => setMobileOpen(false)}>
              <Sparkles className="w-3.5 h-3.5" />
              Free Spend Check-up
            </Link>
            <div className="border-t border-border mt-2 pt-3 flex flex-col gap-2">
              <Link href="/login" className="px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>
                Log in
              </Link>
              <Link href="/signup" className="px-3 py-2.5 rounded-md text-sm font-medium bg-primary text-primary-foreground text-center hover:opacity-90 transition-opacity" onClick={() => setMobileOpen(false)}>
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
              <div className="flex items-center gap-2 mb-3 font-outfit font-semibold text-foreground">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
                AI Observly
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">AI cost &amp; margin tracking for founders who ship fast.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="/#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="/#how-it-works" className="hover:text-foreground transition-colors">How it works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link></li>
                <li><Link href="/spend-checkup" className="hover:text-foreground transition-colors font-medium text-primary">Free Spend Check-up</Link></li>
                <li><a href="/#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Account</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/login" className="hover:text-foreground transition-colors">Log in</Link></li>
                <li><Link href="/signup" className="hover:text-foreground transition-colors">Start Monitoring now</Link></li>
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
