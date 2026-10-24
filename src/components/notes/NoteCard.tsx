"use client";

import { Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownBody } from "@/components/notes/MarkdownBody";
import type { Note } from "@/hooks/use-notes";

interface NoteCardProps {
  note: Note;
  onOpen: (note: Note) => void;
  onTogglePin: (note: Note) => void;
}

export function NoteCard({ note, onOpen, onTogglePin }: NoteCardProps) {
  return (
    <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => onOpen(note)}>
      <CardHeader className="py-4">
        {note.title && <CardTitle className="line-clamp-2">{note.title}</CardTitle>}
        <div
          className="mt-2 text-sm text-muted-foreground overflow-hidden"
          style={{ maxHeight: "10rem" }}
        >
          <MarkdownBody>{note.body}</MarkdownBody>
        </div>
        {note.source && <div className="mt-2 text-xs text-muted-foreground">{note.source}</div>}
      </CardHeader>
      <CardFooter className="p-4 pt-2 flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(note);
          }}
          className={
            note.pinned
              ? "text-primary hover:text-primary/90"
              : "text-muted-foreground hover:text-foreground"
          }
          aria-label={note.pinned ? "Unpin note" : "Pin note"}
        >
          <Pin className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
