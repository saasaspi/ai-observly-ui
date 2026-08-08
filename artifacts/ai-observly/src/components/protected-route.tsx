import { useEffect, useState, ReactNode } from "react";
import { useLocation } from "wouter";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const authed = localStorage.getItem("ai_observly_authed") === "true";
    if (!authed) {
      setLocation("/login");
    } else {
      setIsAuthed(true);
    }
  }, [setLocation]);

  if (isAuthed === null) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
