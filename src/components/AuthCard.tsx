import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { LEGAL_CONFIG } from "@/lib/legal-config";

type Mode = "signin" | "signup";

export function AuthCard() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (mode === "signup" && !agreedToTerms) {
      setError("Please review and agree to the Terms of Service to create your account.");
      return;
    }

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

      // Record terms acceptance timestamp and version
      try {
        localStorage.setItem("terms_accepted_version", LEGAL_CONFIG.TERMS_VERSION);
        localStorage.setItem("terms_accepted_at", new Date().toISOString());
      } catch {
        // Ignore storage errors
      }

      if (!data.session) {
        setNotice(
          "Almost there — check your inbox and click the confirmation link to activate your account.",
        );
        return;
      }
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setError(error.message);
  }

  async function social(provider: "google") {
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
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          31 Day Dashboard
        </p>
        <h2 className="mt-3 font-display text-4xl font-black italic tracking-tight sm:text-5xl">
          Getting 1% Better Each Day
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
          Track your daily protocols, total points and sleep — one month, one grid, one percent at a
          time.
        </p>
      </div>

      <div className="w-full max-w-sm rounded-lg border border-foreground/15 bg-card p-6 shadow-sm">
        <div
          role="group"
          aria-label="Authentication mode"
          className="mb-5 flex gap-1 rounded-sm border border-border bg-muted p-1 font-mono text-xs"
        >
          <button
            type="button"
            aria-pressed={mode === "signin"}
            onClick={() => {
              setMode("signin");
              setError(null);
              setNotice(null);
            }}
            className={`flex-1 rounded-sm px-3 py-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
              mode === "signin"
                ? "bg-card font-semibold text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            aria-pressed={mode === "signup"}
            onClick={() => {
              setMode("signup");
              setError(null);
              setNotice(null);
            }}
            className={`flex-1 rounded-sm px-3 py-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
              mode === "signup"
                ? "bg-card font-semibold text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label
              htmlFor="auth-email"
              className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground"
            >
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              required
              autoComplete="email"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "auth-error" : undefined}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="auth-password"
              className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground"
            >
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "auth-error" : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="••••••"
            />
          </div>

          {mode === "signup" && (
            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="auth-terms-consent"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 size-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring"
              />
              <label
                htmlFor="auth-terms-consent"
                className="text-[11px] leading-snug text-muted-foreground select-none"
              >
                I agree to the{" "}
                <Link
                  to="/terms"
                  target="_blank"
                  className="text-foreground underline underline-offset-2 hover:text-primary font-medium"
                >
                  Terms of Service
                </Link>{" "}
                and acknowledge the{" "}
                <Link
                  to="/privacy"
                  target="_blank"
                  className="text-foreground underline underline-offset-2 hover:text-primary font-medium"
                >
                  Privacy Policy
                </Link>
                .
              </label>
            </div>
          )}

          {error && (
            <div id="auth-error" role="alert" className="text-xs font-semibold text-destructive mt-1">
              {error}
            </div>
          )}
          {notice && (
            <div role="status" className="text-xs font-semibold text-primary mt-1">
              {notice}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-sm bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-85 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring"
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
            className="w-full rounded-sm border border-foreground/20 bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
          >
            Continue with Google
          </button>
        </div>
      </div>
    </section>
  );
}
