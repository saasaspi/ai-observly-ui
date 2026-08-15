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
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [navPosts, setNavPosts] = useState<NavPost[]>([]);
  const isHome = pathname === "/";

  // Timers to prevent flicker on hover
  const productsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blogsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
              className="h-8 w-auto"
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

            {/* Free LLM Spend Analyzer */}
            <Link
              href="/spend-checkup"
              className="px-3 py-2 rounded-md font-semibold text-primary hover:bg-primary/10 transition-colors flex items-center gap-1.5"
              data-testid="link-spend-checkup"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Free LLM Spend Analyzer
            </Link>
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

            {/* Free LLM Spend Analyzer */}
            <Link
              href="/spend-checkup"
              className="px-3 py-2.5 rounded-md text-sm font-semibold text-primary hover:bg-primary/10 transition-colors flex items-center gap-2"
              onClick={() => setMobileOpen(false)}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Free LLM Spend Analyzer
            </Link>

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
                  className="h-7 w-auto"
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
                  <a href="/#features" className="hover:text-foreground transition-colors">
                    Features
                  </a>
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
