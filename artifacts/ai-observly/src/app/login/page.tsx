"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLogin, useRequestPasswordReset } from "@/hooks/use-api";
import { Sparkles } from "lucide-react";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const router = useRouter();
  const { toast } = useToast();
  const loginMutation = useLogin();
  const resetMutation = useRequestPasswordReset();

  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data, {
      onSuccess: () => { router.push("/dashboard"); },
      onError: () => {
        toast({ title: "Login failed", description: "Invalid credentials.", variant: "destructive" });
      },
    });
  };

  const onReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    resetMutation.mutate(resetEmail, {
      onSuccess: () => {
        toast({ title: "Reset link sent", description: "Check your email for reset instructions." });
        setShowForgot(false);
      },
    });
  };

  const handleGoogleSuccess = (name: string, email: string) => {
    localStorage.setItem("ai_observly_authed", "true");
    localStorage.setItem("ai_observly_user_name", name);
    localStorage.setItem("ai_observly_user_email", email);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-background">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl font-outfit mb-8" data-testid="link-home">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Sparkles className="w-5 h-5" />
        </div>
        AI Observly
      </Link>

      <div className="w-full max-w-md p-8 bg-card border border-border rounded-2xl shadow-xl shadow-black/5">
        {!showForgot ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold font-outfit mb-2">Welcome back</h1>
              <p className="text-muted-foreground">Sign in to your account</p>
            </div>

            {/* Google sign-in */}
            <GoogleSignInButton
              label="Sign in with Google"
              onSuccess={handleGoogleSuccess}
              onError={() => toast({ title: "Google sign-in failed", description: "Please try again.", variant: "destructive" })}
            />
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-medium">or continue with email</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="founder@startup.com" {...field} data-testid="input-email" autoComplete="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <button type="button" onClick={() => setShowForgot(true)} className="text-sm text-primary hover:underline" data-testid="btn-forgot-password">
                        Forgot password?
                      </button>
                    </div>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} data-testid="input-password" autoComplete="current-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <button type="submit" className="w-full h-12 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity mt-6" disabled={loginMutation.isPending} data-testid="btn-submit-login">
                  {loginMutation.isPending ? "Signing in..." : "Sign in"}
                </button>
              </form>
            </Form>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold font-outfit mb-2">Reset Password</h1>
              <p className="text-muted-foreground">We'll send you a link to reset it.</p>
            </div>
            <form onSubmit={onReset} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="founder@startup.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required data-testid="input-reset-email" />
              </div>
              <button type="submit" className="w-full h-12 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity mt-4" disabled={resetMutation.isPending} data-testid="btn-submit-reset">
                {resetMutation.isPending ? "Sending..." : "Send Reset Link"}
              </button>
              <button type="button" onClick={() => setShowForgot(false)} className="w-full h-12 text-muted-foreground hover:text-foreground transition-colors mt-2" data-testid="btn-back-to-login">
                Back to login
              </button>
            </form>
          </>
        )}
      </div>

      <p className="mt-8 text-muted-foreground text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary hover:underline font-medium" data-testid="link-signup">Sign up</Link>
      </p>
    </div>
  );
}

