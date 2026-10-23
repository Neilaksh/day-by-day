import { useState, lazy, Suspense } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSession } from "@/hooks/use-session";
import { useNotes, useTogglePin } from "@/hooks/use-notes";
import type { Note } from "@/hooks/use-notes";
import { NotesList } from "@/components/notes/NotesList";
import { NoteViewDialog } from "@/components/notes/NoteViewDialog";

const AuthCard = lazy(() =>
  import("@/components/AuthCard").then((m) => ({ default: m.AuthCard })),
);

export const Route = createFileRoute("/notes")({
  component: Notes,
});

function Notes() {
  const { session, loading } = useSession();
  const { data: notes, isLoading, isError, error } = useNotes(
    session?.user.id,
  );
  const togglePin = useTogglePin(session?.user.id ?? "");

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Derive the note from the notes list by id, so the dialog stays in sync after refetches
  const selectedNote = notes?.find((n) => n.id === selectedNoteId) ?? null;

  const onOpen = (note: Note) => {
    setSelectedNoteId(note.id);
  };

  const onTogglePin = (note: Note) => {
    togglePin.mutate({ id: note.id, pinned: !note.pinned });
  };

  if (loading) {
    return (
      <p className="py-32 text-center font-mono text-sm text-muted-foreground">
        Loading…
      </p>
    );
  }

  if (!session) {
    return (
      <Suspense
        fallback={
          <p className="py-32 text-center font-mono text-sm text-muted-foreground">
            Loading…
          </p>
        }
      >
        <AuthCard />
      </Suspense>
    );
  }

  if (isLoading) {
    return (
      <p className="py-32 text-center font-mono text-sm text-muted-foreground">
        Loading…
      </p>
    );
  }

  if (isError) {
    return (
      <div className="py-32 text-center font-mono text-sm text-muted-foreground">
        Failed to load notes:{" "}
        {String((error as Error)?.message ?? "Unknown error")}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      <h1 className="font-display text-2xl font-black italic tracking-tight">
        Notes & Quotes
      </h1>
      <NotesList
        notes={notes ?? []}
        onOpen={onOpen}
        onTogglePin={onTogglePin}
      />
      <p className="mt-6">
        <Link
          to="/"
          className="rounded-md border border-foreground/15 px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          Back to tracker
        </Link>
      </p>

      <NoteViewDialog
        note={selectedNote}
        open={selectedNoteId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedNoteId(null);
        }}
      />
    </div>
  );
}