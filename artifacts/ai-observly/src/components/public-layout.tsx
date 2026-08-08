import { ReactNode } from "react";
import { Link } from "wouter";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col font-sans">
      <header className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50 bg-background/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg font-outfit" data-testid="link-home">
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </div>
            AI Observly
          </Link>
          
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-docs">
              Docs
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-login">
              Log in
            </Link>
            <Link href="/signup" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity" data-testid="link-signup">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t border-border py-12 text-center text-muted-foreground">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4 font-outfit font-semibold text-foreground">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            AI Observly
          </div>
          <p className="text-sm">© {new Date().getFullYear()} AI Observly. See exactly what your AI costs.</p>
        </div>
      </footer>
    </div>
  );
}