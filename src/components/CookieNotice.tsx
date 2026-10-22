import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, X } from "lucide-react";

export function CookieNotice() {
  const [acknowledged, setAcknowledged] = useState<boolean>(true); // start hidden to avoid SSR hydration mismatch

  useEffect(() => {
    // Only runs on client
    try {
      const stored = localStorage.getItem("cookie_notice_acknowledged");
      if (!stored) {
        setAcknowledged(false);
      }
    } catch {
      // Storage unavailable or blocked
      setAcknowledged(true);
    }
  }, []);

  function handleDismiss() {
    try {
      localStorage.setItem("cookie_notice_acknowledged", "true");
    } catch {
      // Ignore storage errors
    }
    setAcknowledged(true);
  }

  if (acknowledged) {
    return null;
  }

  return (
    <aside
      role="region"
      aria-label="Storage and privacy notice"
      className="fixed bottom-4 right-4 z-40 max-w-sm rounded-lg border border-border bg-card p-4 shadow-lg transition-transform animate-in fade-in slide-in-from-bottom-4 duration-300 print:hidden"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-primary/10 p-1.5 text-primary shrink-0">
          <ShieldCheck className="size-4" aria-hidden="true" />
        </div>
        <div className="flex-1 text-xs">
          <p className="font-semibold text-foreground">Zero Tracking Cookies</p>
          <p className="mt-1 text-muted-foreground leading-relaxed">
            We do not use advertising or tracking cookies. We only use essential local storage for your login session and theme preference.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-sm bg-primary px-3 py-1 font-mono text-[11px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
            >
              Got it
            </button>
            <Link
              to="/cookies"
              className="font-mono text-[11px] text-muted-foreground underline-offset-4 hover:underline hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring rounded-sm px-1 py-0.5"
            >
              Storage Policy
            </Link>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss storage notice"
          className="text-muted-foreground hover:text-foreground rounded-sm p-1 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
