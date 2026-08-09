"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useSignup } from "@/hooks/use-api";
import { Sparkles } from "lucide-react";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Signup() {
  const router = useRouter();
  const { toast } = useToast();
  const signupMutation = useSignup();

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = (data: z.infer<typeof signupSchema>) => {
    signupMutation.mutate(
      { email: data.email, password: data.password },
      {
        onSuccess: () => {
          router.push("/onboarding");
        },
        onError: () => {
          toast({ title: "Signup failed", description: "Something went wrong. Please try again.", variant: "destructive" });
        },
      }
    );
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
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold font-outfit mb-2">Create an account</h1>
          <p className="text-muted-foreground">Start tracking your AI margins</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="founder@startup.com" {...field} data-testid="input-signup-email" autoComplete="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} data-testid="input-signup-password" autoComplete="new-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} data-testid="input-signup-confirm" autoComplete="new-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <button
              type="submit"
              className="w-full h-12 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity mt-6"
              disabled={signupMutation.isPending}
              data-testid="btn-submit-signup"
            >
              {signupMutation.isPending ? "Creating account..." : "Sign up"}
            </button>
          </form>
        </Form>
      </div>

      <p className="mt-8 text-muted-foreground text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline font-medium" data-testid="link-login">
          Sign in
        </Link>
      </p>
    </div>
  );
}
