import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

type Mode = "signin" | "signup";

export function AuthCard() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      setBusy(false);
      if (error) {
        setError(error.message);
        return;
      }
      if (!data.session) {
        setNotice("Almost there — check your inbox and click the confirmation link to activate your account.");
        return;
      }
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setError(error.message);
  }

  async function social(provider: "google" | "lovable") {
    setError(null);
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });
    if (result.error) setError(result.error.message);
    if (result.redirected) return;
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-6xl flex-col items-center justify-center px-4 py-16">
      <div className="mb-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">31 Day Dashboard</p>
        <h2 className="mt-3 font-display text-4xl font-black italic tracking-tight sm:text-5xl">
          Getting 1% Better Each Day
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
          Track your daily protocols, total points and sleep — one month, one grid, one percent at a time.
        </p>
      </div>

      <div className="w-full max-w-sm rounded-lg border border-foreground/15 bg-card p-6 shadow-sm">
        <div className="mb-5 flex gap-1 rounded-sm border border-border bg-muted p-1 font-mono text-xs">
          <button
            type="button"
            onClick={() => { setMode("signin"); setError(null); setNotice(null); }}
            className={`flex-1 rounded-sm px-3 py-1.5 transition-colors ${mode === "signin" ? "bg-card font-semibold shadow-sm" : "text-muted-foreground"}`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => { setMode("signup"); setError(null); setNotice(null); }}
            className={`flex-1 rounded-sm px-3 py-1.5 transition-colors ${mode === "signup" ? "bg-card font-semibold shadow-sm" : "text-muted-foreground"}`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label htmlFor="auth-email" className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="auth-password" className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
              placeholder="••••••"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {notice && <p className="text-sm text-primary">{notice}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-sm bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => social("google")}
            className="w-full rounded-sm border border-foreground/20 bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Continue with Google
          </button>
          <button
            type="button"
            onClick={() => social("lovable")}
            className="w-full rounded-sm border border-foreground/20 bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Continue with Lovable
          </button>
        </div>
      </div>
    </section>
  );
}
