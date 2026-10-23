"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import type { Note } from "@/hooks/use-notes";
import { NoteCard } from "./NoteCard";

interface NotesListProps {
  notes: Note[];
  onOpen: (note: Note) => void;
  onTogglePin: (note: Note) => void;
}

export function NotesList({ notes, onOpen, onTogglePin }: NotesListProps) {
  const [search, setSearch] = useState("");

  const filteredNotes = useMemo(() => {
    const term = search.toLowerCase();
    return notes.filter(
      (note) =>
        (note.title ?? "").toLowerCase().includes(term) ||
        note.body.toLowerCase().includes(term) ||
        (note.source ?? "").toLowerCase().includes(term),
    );
  }, [notes, search]);

  const sortedNotes = useMemo(() => {
    const pinned = filteredNotes.filter((note) => note.pinned);
    const unpinned = filteredNotes.filter((note) => !note.pinned);
    return [...pinned, ...unpinned];
  }, [filteredNotes]);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search notes…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm"
      />
      {notes.length === 0 ? (
        <p className="text-center text-muted-foreground">No notes yet</p>
      ) : sortedNotes.length === 0 ? (
        <p className="text-center text-muted-foreground">No matches</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onOpen={onOpen}
              onTogglePin={onTogglePin}
            />
          ))}
        </div>
      )}
    </div>
  );
}