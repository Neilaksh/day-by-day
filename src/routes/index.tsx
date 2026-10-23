import { useState, lazy, Suspense } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InstallPwaHint } from "@/components/InstallPwaHint";
import { Footer } from "@/components/Footer";
import { DataManagementDialog } from "@/components/DataManagementDialog";
import { Shield } from "lucide-react";

const TrackerBoard = lazy(() =>
  import("@/components/TrackerBoard").then((m) => ({ default: m.TrackerBoard })),
);
const AuthCard = lazy(() => import("@/components/AuthCard").then((m) => ({ default: m.AuthCard })));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Getting 1% Better Each Day" },
      {
        name: "description",
        content:
          "A daily dashboard to track your protocols, total points and sleep — one month, one grid, one percent at a time.",
      },
      { property: "og:title", content: "Getting 1% Better Each Day" },
      {
        property: "og:description",
        content:
          "A daily dashboard to track your protocols, total points and sleep — one percent better every day.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { session, loading } = useSession();
  const [dataDialogOpen, setDataDialogOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <header className="sticky top-0 z-20 border-b border-border bg-card/85 backdrop-blur print:hidden android-fullscreen-header">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <span className="font-display text-lg font-black italic tracking-tight">
            Getting 1% Better Each Day
          </span>
          <nav aria-label="Account navigation" className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            {session && (
              <>
                <span className="hidden sm:inline">{session.user.email}</span>
                <Link
                  to="/notes"
                  className="rounded-sm border border-foreground/15 px-3 py-1.5 transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Notes
                </Link>
                <ThemeToggle />
                <button
                  type="button"
                  onClick={() => setDataDialogOpen(true)}
                  aria-label="Manage your personal data, export, or erase account"
                  className="inline-flex items-center justify-center gap-1.5 rounded-sm border border-foreground/15 px-3 py-1.5 transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Shield className="size-3" aria-hidden="true" />
                  <span className="hidden sm:inline">Data & Privacy</span>
                </button>
                <button
                  type="button"
                  onClick={() => supabase.auth.signOut()}
                  className="rounded-sm border border-foreground/15 px-3 py-1.5 transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Sign out
                </button>
              </>
            )}
            {!session && (
              <>
                <InstallPwaHint />
                <ThemeToggle />
              </>
            )}
          </nav>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {loading ? (
          <p className="py-32 text-center font-mono text-sm text-muted-foreground">Loading…</p>
        ) : (
          <Suspense
            fallback={
              <p className="py-32 text-center font-mono text-sm text-muted-foreground">Loading…</p>
            }
          >
            {session ? <TrackerBoard userId={session.user.id} /> : <AuthCard />}
          </Suspense>
        )}
      </main>

      {session && (
        <DataManagementDialog
          userId={session.user.id}
          userEmail={session.user.email}
          open={dataDialogOpen}
          onOpenChange={setDataDialogOpen}
        />
      )}

      <Footer />
    </div>
  );
}
