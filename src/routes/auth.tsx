import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { canAttemptAuth, recordAuthAttempt, getRemainingWaitTime } from "@/lib/auth-rate-limit";
import { signUpUserFn } from "@/lib/server-functions";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Slistyle" },
      { name: "description", content: "Sign in or create your Slistyle account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email().max(255);
const passwordSchema = z.string().min(6).max(72);
const nameSchema = z.string().trim().min(1).max(120);

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    // Mettre à jour le temps d'attente restant
    const timer = setInterval(() => {
      setRemainingTime(getRemainingWaitTime(email));
    }, 1000);

    return () => clearInterval(timer);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const e1 = emailSchema.safeParse(email);
      if (!e1.success) return toast.error("Invalid email");

      // Vérifier le rate limit
      if (!canAttemptAuth(e1.data)) {
        const seconds = Math.ceil(remainingTime / 1000);
        return toast.error(`Please wait ${seconds}s before trying again`);
      }

      setLoading(true);
      const p1 = passwordSchema.safeParse(password);
      if (!p1.success) return toast.error("Password must be at least 6 characters");

      if (mode === "signup") {
        const n1 = nameSchema.safeParse(fullName);
        if (!n1.success) return toast.error("Please enter your name");
        
        const result = await signUpUserFn({
          data: {
            email: e1.data,
            password: p1.data,
            fullName: n1.data,
          }
        });

        if (!result.success) {
          // Enregistrer la tentative en cas d'erreur pour rate limit
          recordAuthAttempt(e1.data);
          return toast.error(result.error || "Failed to create account");
        }
        
        // Successfully created! Now immediately sign them in with their password
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: e1.data,
          password: p1.data,
        });

        if (signInErr) {
          recordAuthAttempt(e1.data);
          return toast.error("Account created, but could not sign in automatically: " + signInErr.message);
        }

        // Enregistrer la tentative réussie
        recordAuthAttempt(e1.data);
        toast.success("Account created and signed in successfully.");
        navigate({ to: "/account" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: e1.data,
          password: p1.data,
        });
        if (error) {
          recordAuthAttempt(e1.data);
          return toast.error(error.message);
        }
        
        recordAuthAttempt(e1.data);
        toast.success("Welcome back.");
        navigate({ to: "/account" });
      }
    } finally {
      setLoading(false);
    }
  };

  const isRateLimited = remainingTime > 0;

  return (
    <section className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-16">
      <Link to="/" className="font-serif text-3xl text-center tracking-wide font-medium">
        <span className="text-foreground">SLI</span>
        <span style={{ color: "#c5a880" }}>STYLE</span>
      </Link>
      <h1 className="mt-8 font-serif text-4xl text-center">
        {mode === "signin" ? "Welcome back." : "Create account."}
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {mode === "signup" && (
          <div>
            <label className="label-eyebrow mb-2 block">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={isRateLimited}
              className="w-full border border-border bg-background px-3 py-3 text-sm outline-none focus:border-foreground disabled:opacity-50"
            />
          </div>
        )}
        <div>
          <label className="label-eyebrow mb-2 block">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={isRateLimited}
            className="w-full border border-border bg-background px-3 py-3 text-sm outline-none focus:border-foreground disabled:opacity-50"
          />
        </div>
        <div>
          <label className="label-eyebrow mb-2 block">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={isRateLimited}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className="w-full border border-border bg-background px-3 py-3 text-sm outline-none focus:border-foreground disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={loading || isRateLimited}
          className="label-eyebrow w-full bg-foreground py-4 text-background transition hover:opacity-90 disabled:opacity-50"
        >
          {isRateLimited 
            ? `Wait ${Math.ceil(remainingTime / 1000)}s…` 
            : loading 
            ? "Please wait…" 
            : mode === "signin" 
            ? "Sign in" 
            : "Create account"}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="mt-6 text-center text-sm text-muted-foreground hover:text-foreground"
        disabled={isRateLimited}
      >
        {mode === "signin"
          ? "Don't have an account? Create one"
          : "Already have an account? Sign in"}
      </button>
    </section>
  );
}
