import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const e1 = emailSchema.safeParse(email);
      const p1 = passwordSchema.safeParse(password);
      if (!e1.success) return toast.error("Invalid email");
      if (!p1.success) return toast.error("Password must be at least 6 characters");

      if (mode === "signup") {
        const n1 = nameSchema.safeParse(fullName);
        if (!n1.success) return toast.error("Please enter your name");
        const { error } = await supabase.auth.signUp({
          email: e1.data,
          password: p1.data,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: n1.data },
          },
        });
        if (error) return toast.error(error.message);
        toast.success("Account created. Check your inbox to confirm.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: e1.data,
          password: p1.data,
        });
        if (error) return toast.error(error.message);
        toast.success("Welcome back.");
        navigate({ to: "/account" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-16">
      <Link to="/" className="font-serif text-3xl text-center">SLISTYLE</Link>
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
              className="w-full border border-border bg-background px-3 py-3 text-sm outline-none focus:border-foreground"
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
            className="w-full border border-border bg-background px-3 py-3 text-sm outline-none focus:border-foreground"
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
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className="w-full border border-border bg-background px-3 py-3 text-sm outline-none focus:border-foreground"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="label-eyebrow w-full bg-foreground py-4 text-background transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="mt-6 text-center text-sm text-muted-foreground hover:text-foreground"
      >
        {mode === "signin"
          ? "Don't have an account? Create one"
          : "Already have an account? Sign in"}
      </button>
    </section>
  );
}
