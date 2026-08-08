import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Settings, 
  LogOut,
  Sparkles,
  BookOpen
} from "lucide-react";
import { ReactNode } from "react";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/docs", label: "Docs", icon: BookOpen },
  ];

  const handleLogout = () => {
    localStorage.removeItem("ai_observly_authed");
    setLocation("/");
  };

  return (
    <div className="flex min-h-[100dvh] w-full bg-background">
      <aside className="w-64 flex-col hidden md:flex border-r border-border bg-card">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2" data-testid="link-logo">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight font-outfit">AI Observly</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item) => {
            const isActive = location.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-border">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground w-full transition-colors"
            data-testid="btn-logout"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold tracking-tight">AI Observly</span>
          </Link>
          <div className="flex gap-4">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm ${location.startsWith(item.href) ? "text-primary font-medium" : "text-muted-foreground"}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
