import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { deleteAccount } from "@/lib/delete-account";
import { Download, Trash2, AlertTriangle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface DataManagementDialogProps {
  userId: string;
  userEmail?: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DataManagementDialog({
  userId,
  userEmail,
  open,
  onOpenChange,
}: DataManagementDialogProps) {
  const [exporting, setExporting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // GDPR Art. 20 - Data Portability Export
  async function handleExport() {
    setExporting(true);
    try {
      const [protocolsRes, checksRes, sleepRes, notesRes] = await Promise.all([
        supabase.from("protocols").select("*").eq("user_id", userId),
        supabase.from("protocol_checks").select("*").eq("user_id", userId),
        supabase.from("sleep_logs").select("*").eq("user_id", userId),
        supabase.from("month_notes").select("*").eq("user_id", userId),
      ]);

      const exportPayload = {
        app: "Getting 1% Better Each Day",
        version: "1.0.0",
        exportedAt: new Date().toISOString(),
        user: {
          id: userId,
          email: userEmail || "unknown",
        },
        data: {
          protocols: protocolsRes.data ?? [],
          protocol_checks: checksRes.data ?? [],
          sleep_logs: sleepRes.data ?? [],
          month_notes: notesRes.data ?? [],
        },
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `day-by-day-export-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Data export downloaded successfully.");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  // GDPR Art. 17 - Right to Erasure / Deletion
  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      // 1. Call server function to delete all data + auth user
      //    (uses service-role key; deletes from auth.users so login is impossible)
      await deleteAccount();

      // 2. Clear application preferences from local storage
      try {
        localStorage.removeItem("theme");
        localStorage.removeItem("pwa_install_hint_dismissed");
        localStorage.removeItem("terms_accepted_version");
        localStorage.removeItem("terms_accepted_at");
      } catch {
        // Ignore local storage errors
      }

      // 3. Sign out of any remaining client session
      await supabase.auth.signOut();

      toast.success("Your account and all data have been permanently deleted.");
      onOpenChange(false);
      window.location.reload();
    } catch (err) {
      console.error("Account erasure error:", err);
      toast.error("Failed to delete account. Please try again or contact support.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-black italic">
            Privacy & Data Management
          </DialogTitle>
          <DialogDescription className="font-mono text-xs text-muted-foreground">
            Manage your personal data in accordance with GDPR and CCPA/CPRA rights.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Export Data */}
          <section className="rounded-md border border-border p-4 bg-muted/30">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Download className="size-4 text-primary" aria-hidden="true" />
              <span>Export Personal Data</span>
            </h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Download a complete JSON export of all your protocols, daily checks, sleep logs, and monthly notes.
            </p>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="mt-3 inline-flex items-center gap-2 rounded-sm border border-border bg-card px-3 py-1.5 font-mono text-xs font-medium text-foreground hover:bg-secondary transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              {exporting ? "Preparing download…" : "Download JSON Archive"}
            </button>
          </section>

          {/* Delete Account */}
          <section className="rounded-md border border-destructive/30 p-4 bg-destructive/5">
            <h3 className="font-semibold text-sm text-destructive flex items-center gap-2">
              <Trash2 className="size-4" aria-hidden="true" />
              <span>Erase Account & Data</span>
            </h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Permanently delete your account and all associated data (protocols, checks, sleep records, notes). You will not be able to log back in. This action is irreversible.
            </p>

            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="mt-3 inline-flex items-center gap-2 rounded-sm border border-destructive/40 bg-card px-3 py-1.5 font-mono text-xs font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring"
              >
                Delete My Data
              </button>
            ) : (
              <div className="mt-3 space-y-3 rounded border border-destructive/50 bg-destructive/10 p-3">
                <div className="flex items-start gap-2 text-xs text-destructive font-medium">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Are you absolutely sure? Your account and all tracker history will be immediately and permanently destroyed. You will not be able to log back in.</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="rounded-sm bg-destructive px-3 py-1.5 font-mono text-xs font-bold text-destructive-foreground hover:bg-destructive/90 transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  >
                    {deleting ? "Deleting…" : "Yes, permanently delete everything"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-sm border border-border bg-card px-3 py-1.5 font-mono text-xs text-muted-foreground hover:bg-secondary transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
