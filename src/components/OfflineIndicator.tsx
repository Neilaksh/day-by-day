import { useOnlineStatus } from "@/hooks/use-online-status";
import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2 bg-amber-500/90 text-amber-950 font-mono text-xs font-medium shadow-lg animate-in slide-in-from-top-2 duration-200 print:hidden"
    >
      <WifiOff className="size-3.5 shrink-0" aria-hidden="true" />
      <span>You're offline — an internet connection is required to save changes</span>
    </div>
  );
}
