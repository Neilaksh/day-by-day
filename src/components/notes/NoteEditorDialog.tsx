import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MarkdownBody } from "@/components/notes/MarkdownBody";
import type { Note } from "@/hooks/use-notes";

export type NoteEditorDialogProps = {
  note: Note | null; // null = creating a new note
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: {
    title: string | null;
    body: string;
    source: string | null;
  }) => void;
  saving: boolean;
};

const fieldClass =
  "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm " +
  "placeholder:text-muted-foreground focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

function trimToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function NoteEditorDialog({
  note,
  open,
  onOpenChange,
  onSave,
  saving,
}: NoteEditorDialogProps) {
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [body, setBody] = useState("");
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  // Reset the fields only when the dialog opens or a different note is chosen.
  // Not on every refetch, which would wipe what the user is typing.
  useEffect(() => {
    if (!open) return;
    setTitle(note?.title ?? "");
    setSource(note?.source ?? "");
    setBody(note?.body ?? "");
    setMode("edit");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, note?.id]);

  const canSave = body.trim() !== "" && !saving;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      title: trimToNull(title),
      body: body.trim(),
      source: trimToNull(source),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{note ? "Edit note" : "New note"}</DialogTitle>
          <DialogDescription>
            {note
              ? "Update this note or quote."
              : "Add a note or a quote. Markdown is supported."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label htmlFor="note-title" className="text-sm font-medium">
              Title
            </label>
            <input
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Optional"
              disabled={saving}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="note-source" className="text-sm font-medium">
              Source / author
            </label>
            <input
              id="note-source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Optional, for quotes"
              disabled={saving}
              className={fieldClass}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="note-body" className="text-sm font-medium">
                Body
              </label>
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant={mode === "edit" ? "secondary" : "ghost"}
                  onClick={() => setMode("edit")}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={mode === "preview" ? "secondary" : "ghost"}
                  onClick={() => setMode("preview")}
                >
                  Preview
                </Button>
              </div>
            </div>

            {mode === "edit" ? (
              <textarea
                id="note-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.preventDefault();
                    handleSave();
                  }
                }}
                rows={8}
                placeholder="Write in markdown. Ctrl+Enter to save."
                disabled={saving}
                className={fieldClass + " resize-y"}
              />
            ) : (
              <div className="mt-1 min-h-[12rem] rounded-md border border-input px-3 py-2">
                {body.trim() === "" ? (
                  <p className="text-sm text-muted-foreground">Nothing to preview.</p>
                ) : (
                  <MarkdownBody>{body}</MarkdownBody>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={!canSave}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}