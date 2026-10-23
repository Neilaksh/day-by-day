import { useState, lazy, Suspense } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import {
  useNotes,
  useTogglePin,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
} from "@/hooks/use-notes";
import type { Note } from "@/hooks/use-notes";
import { Button } from "@/components/ui/button";
import { NotesList } from "@/components/notes/NotesList";
import { NoteViewDialog } from "@/components/notes/NoteViewDialog";
import { NoteEditorDialog } from "@/components/notes/NoteEditorDialog";

const AuthCard = lazy(() =>
  import("@/components/AuthCard").then((m) => ({ default: m.AuthCard })),
);

export const Route = createFileRoute("/notes")({
  component: Notes,
});

function Notes() {
  // ---- All hooks first, before any early return ----
  const { session, loading } = useSession();
  const userId = session?.user.id;

  const { data: notes, isLoading, isError, error } = useNotes(userId);
  const togglePin = useTogglePin(userId ?? "");
  const createNote = useCreateNote(userId ?? "");
  const updateNote = useUpdateNote(userId ?? "");
  const deleteNote = useDeleteNote(userId ?? "");

  // Viewer state: store the id, not the note object, so it stays in sync after refetches
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Editor state: editorNoteId is null when creating a new note
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorNoteId, setEditorNoteId] = useState<string | null>(null);

  const selectedNote = notes?.find((n) => n.id === selectedNoteId) ?? null;
  const editorNote = notes?.find((n) => n.id === editorNoteId) ?? null;

  // ---- Handlers ----
  const onOpen = (note: Note) => {
    setSelectedNoteId(note.id);
  };

  const onTogglePin = (note: Note) => {
    togglePin.mutate({ id: note.id, pinned: !note.pinned });
  };

  const onNewNote = () => {
    setEditorNoteId(null);
    setEditorOpen(true);
  };

  const onEdit = () => {
    if (selectedNoteId === null) return;
    setEditorNoteId(selectedNoteId);
    setSelectedNoteId(null);
    setEditorOpen(true);
  };

  const onDelete = () => {
    if (selectedNoteId === null) return;
    deleteNote.mutate(selectedNoteId, {
      onSuccess: () => setSelectedNoteId(null),
    });
  };

  const onSave = (values: {
    title: string | null;
    body: string;
    source: string | null;
  }) => {
    if (editorNoteId === null) {
      // useCreateNote doesn't accept null, so leave empty fields out;
      // the database stores a missing title/source as null anyway.
      createNote.mutate(
        {
          body: values.body,
          ...(values.title !== null ? { title: values.title } : {}),
          ...(values.source !== null ? { source: values.source } : {}),
        },
        { onSuccess: () => setEditorOpen(false) },
      );
    } else {
      updateNote.mutate(
        { id: editorNoteId, ...values },
        { onSuccess: () => setEditorOpen(false) },
      );
    }
  };

  // ---- Early returns (after all hooks) ----
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
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-black italic tracking-tight">
          Notes & Quotes
        </h1>
        <Button size="sm" onClick={onNewNote}>
          <Plus className="mr-1 h-4 w-4" />
          New note
        </Button>
      </div>

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
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <NoteEditorDialog
        note={editorNote}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSave={onSave}
        saving={createNote.isPending || updateNote.isPending}
      />
    </div>
  );
}