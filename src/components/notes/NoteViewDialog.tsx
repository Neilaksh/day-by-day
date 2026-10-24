import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MarkdownBody } from "@/components/notes/MarkdownBody";
import type { Note } from "@/hooks/use-notes";

type NoteViewDialogProps = {
  note: Note | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function NoteViewDialog({
  note,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: NoteViewDialogProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Reset the delete confirmation whenever the dialog closes or a different note is shown
  useEffect(() => {
    setConfirmingDelete(false);
  }, [open, note?.id]);

  return (
    <Dialog open={open && note !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        {note ? (
          <>
            <DialogHeader>
              <DialogTitle className={note.title ? "" : "sr-only"}>
                {note.title ?? "Note"}
              </DialogTitle>
              <DialogDescription
                className={note.source ? "text-sm text-muted-foreground" : "sr-only"}
              >
                {note.source ?? "Note details"}
              </DialogDescription>
            </DialogHeader>

            <MarkdownBody>{note.body}</MarkdownBody>

            <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t pt-4">
              {confirmingDelete ? (
                <>
                  <span className="mr-auto text-sm text-muted-foreground">
                    Delete this note permanently?
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setConfirmingDelete(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" size="sm" onClick={onDelete}>
                    <Trash2 className="mr-1 h-4 w-4" />
                    Confirm delete
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={onEdit}>
                    <Pencil className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setConfirmingDelete(true)}>
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
