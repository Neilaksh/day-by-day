import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Note } from "@/hooks/use-notes";
import { MarkdownBody } from "./MarkdownBody";

export type NoteViewDialogProps = {
  note: Note | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function NoteViewDialog({ note, open, onOpenChange }: NoteViewDialogProps) {
  // If note is null, render nothing inside but still honor the open state
  if (!note) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          {note.title && (
            <DialogTitle>{note.title}</DialogTitle>
          )}
          {note.source && (
            <DialogDescription className="text-muted-foreground text-sm">
              — {note.source}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="pt-4">
          <MarkdownBody>{note.body}</MarkdownBody>
        </div>
      </DialogContent>
    </Dialog>
  );
}