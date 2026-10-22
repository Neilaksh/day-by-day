import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Footer } from "./Footer";

interface LegalLayoutProps {
  title: string;
  version: string;
  lastUpdated: string;
  children: ReactNode;
}

export function LegalLayout({ title, version, lastUpdated, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring rounded-sm px-1 py-0.5"
            aria-label="Return to tracker dashboard"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            <span>Back to Tracker</span>
          </Link>
          <span className="font-display text-sm font-bold italic tracking-tight text-foreground/80">
            Getting 1% Better Each Day
          </span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl px-4 py-10 flex-1">
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <header className="mb-8 border-b border-border pb-6">
            <h1 className="font-display text-3xl sm:text-4xl font-black italic tracking-tight text-foreground mb-2">
              {title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
              <span>Version {version}</span>
              <span aria-hidden="true">•</span>
              <span>Last Updated: {lastUpdated}</span>
            </div>
            <div className="mt-4 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
              <strong className="font-semibold">Legal Notice:</strong> This policy is provided as a compliance template and must be reviewed by a qualified legal advisor before commercial deployment.
            </div>
          </header>

          <div className="space-y-6 text-sm leading-relaxed text-foreground/90">
            {children}
          </div>
        </article>
      </div>

      <Footer />
    </div>
  );
}
