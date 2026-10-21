import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { AuthCard } from "@/components/AuthCard";
import { TrackerBoard } from "@/components/TrackerBoard";
import { ThemeToggle } from "@/components/ThemeToggle";

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

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-card/85 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <span className="font-display text-lg font-black italic tracking-tight">
            Getting 1% Better Each Day
          </span>
          <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
            {session && (
              <>
                <span className="hidden sm:inline">{session.user.email}</span>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="rounded-sm border border-foreground/15 px-2.5 py-1 transition-colors hover:bg-secondary hover:text-foreground"
                >
                  Sign out
                </button>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main>
        {loading ? (
          <p className="py-32 text-center font-mono text-sm text-muted-foreground">Loading…</p>
        ) : session ? (
          <TrackerBoard userId={session.user.id} />
        ) : (
          <AuthCard />
        )}
      </main>

      <footer className="pb-10 pt-4 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground print:hidden">
        Small daily wins compound
      </footer>
    </div>
  );
}
