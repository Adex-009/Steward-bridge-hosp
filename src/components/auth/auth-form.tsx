"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2, Briefcase, Users } from "lucide-react";
import { Card, Field, Input } from "@/components/ui/kit";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function AuthForm({ googleEnabled, defaultMode }: { googleEnabled: boolean; defaultMode: "signin" | "signup" }) {
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode);
  const [loading, setLoading] = useState<"google" | "credentials" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();

  async function handleGoogle() {
    setLoading("google");
    await signIn("google", { callbackUrl: "/onboarding/role" });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const name = String(form.get("name") || "");

    setLoading("credentials");
    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Something went wrong. Please try again.");
          setLoading(null);
          return;
        }
      }

      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Incorrect email or password. Please try again.");
        setLoading(null);
        return;
      }
      toast.push(mode === "signup" ? "Account created — welcome to StewardBridge." : "Welcome back.", "success");
      router.push("/onboarding/role");
      router.refresh();
    } catch {
      setError("We couldn't reach the server. Please try again.");
      setLoading(null);
    }
  }

  return (
    <Card className="w-full max-w-md p-8">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-brand-950">
          {mode === "signin" ? "Welcome back" : "Create your StewardBridge account"}
        </h1>
        <p className="mt-1.5 text-sm text-brand-500">
          {mode === "signin" ? "Sign in to continue to your workspace." : "Authenticate first — you'll choose your path next."}
        </p>
      </div>

      <div className="mt-7 flex flex-col gap-3">
        {googleEnabled ? (
          <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={loading !== null}>
            {loading === "google" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.52 12.27c0-.85-.07-1.66-.21-2.44H12v4.62h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.94-2.92l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.94H1.27v3.1A12 12 0 0 0 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.29A7.2 7.2 0 0 1 4.9 12c0-.8.14-1.57.38-2.29v-3.1H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.61l4.01 3.1C6.23 6.86 8.88 4.75 12 4.75z" />
              </svg>
            )}
            Continue with Google
          </Button>
        ) : (
          <div className="rounded-xl border border-dashed border-brand-200 bg-brand-50/60 p-3 text-center text-xs text-brand-400">
            Google sign-in isn't configured in this environment yet. Use email and password below.
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-brand-300">
          <div className="h-px flex-1 bg-brand-100" /> OR <div className="h-px flex-1 bg-brand-100" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "signup" && (
            <Field label="Full name" required>
              <Input name="name" required placeholder="Jane Doe" minLength={2} />
            </Field>
          )}
          <Field label="Email address" required>
            <Input name="email" type="email" required placeholder="you@example.com" />
          </Field>
          <Field label="Password" required hint={mode === "signup" ? "At least 8 characters." : undefined}>
            <Input name="password" type="password" required minLength={8} placeholder="••••••••" />
          </Field>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading !== null}>
            {loading === "credentials" && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Sign In" : "Create Account"}
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-brand-500">
        {mode === "signin" ? "New to StewardBridge?" : "Already have an account?"}{" "}
        <button
          className="font-semibold text-brand-700 hover:underline"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
          }}
        >
          {mode === "signin" ? "Create an account" : "Sign in"}
        </button>
      </p>

      <div className="mt-6 flex items-center justify-center gap-6 border-t border-brand-100 pt-5 text-xs text-brand-400">
        <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> Find Work</span>
        <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Find Workers</span>
      </div>
    </Card>
  );
}
