import { useState, useEffect } from "react";
import { Download, MoreVertical, X, Smartphone } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPwaHint() {
  const isMobile = useIsMobile();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [isFirefox, setIsFirefox] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Check if running as standalone PWA
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: fullscreen)").matches ||
        window.matchMedia("(display-mode: minimal-ui)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.startsWith("android-app://");
      setIsStandalone(isStandaloneMode);
      return isStandaloneMode;
    };

    if (checkStandalone()) return;

    const standaloneMql = window.matchMedia("(display-mode: standalone)");
    const onStandaloneChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsStandalone(true);
    };
    standaloneMql.addEventListener("change", onStandaloneChange);

    // 2. Detect browser
    const ua = navigator.userAgent.toLowerCase();
    const isFx = /firefox|fxios/i.test(ua);
    const isApple = /iphone|ipad|ipod/i.test(ua);
    setIsFirefox(isFx);
    setIsIOS(isApple);

    // 3. Check dismissed state from localStorage
    const dismissed = localStorage.getItem("pwa_install_hint_dismissed");
    if (!dismissed) {
      setIsDismissed(false);
    }

    // 4. Capture beforeinstallprompt (Chromium only)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      standaloneMql.removeEventListener("change", onStandaloneChange);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Only show on mobile version and hide completely on desktop or inside installed PWA
  if (!isMobile || isStandalone || isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else {
      // Non-Chromium (Firefox, Safari, etc.) where beforeinstallprompt doesn't fire
      setShowDialog(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("pwa_install_hint_dismissed", "true");
  };

  return (
    <>
      {/* Header Install Button (Mobile only) */}
      <button
        onClick={handleInstallClick}
        title="Install as App"
        aria-label="Install as App"
        className="inline-flex md:hidden items-center gap-1.5 rounded-sm border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-mono font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
      >
        <Download className="h-3.5 w-3.5" />
        <span className="hidden xs:inline">Install</span>
      </button>

      {/* Floating Fallback Banner on Mobile (Crucial for Firefox Android & Safari) */}
      {!isDismissed && (
        <aside
          role="region"
          aria-label="PWA install banner"
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-lg border border-border bg-card p-3 shadow-lg print:hidden md:hidden sm:bottom-6"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 rounded-md bg-primary/15 p-1.5 text-primary">
                <Smartphone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Install "Getting 1% Better"
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {isFirefox ? (
                    <>
                      To install: tap the <MoreVertical className="inline h-3 w-3 align-baseline" />{" "}
                      menu → <span className="font-semibold text-foreground">Install</span>
                    </>
                  ) : isIOS ? (
                    <>
                      To install: tap Share (⎋) →{" "}
                      <span className="font-semibold text-foreground">Add to Home Screen</span>
                    </>
                  ) : deferredPrompt ? (
                    "Add to your home screen for quick offline tracking."
                  ) : (
                    <>
                      To install: tap the <MoreVertical className="inline h-3 w-3 align-baseline" />{" "}
                      menu → <span className="font-semibold text-foreground">Install</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="rounded-sm bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Install
                </button>
              )}
              <button
                onClick={handleDismiss}
                aria-label="Dismiss banner"
                className="rounded-sm p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Detailed Instructions Dialog when user taps Install on Firefox or unsupported browsers */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-sm rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-display">
              <Smartphone className="h-5 w-5 text-primary" />
              Install "Getting 1% Better"
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Install this app on your device for fast access and offline tracking.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs">
            {isFirefox ? (
              <div className="rounded-md border border-border bg-secondary/50 p-3">
                <p className="font-semibold text-foreground">Firefox for Android:</p>
                <ol className="mt-2 list-inside list-decimal space-y-1.5 text-muted-foreground">
                  <li>
                    Tap the <strong className="text-foreground">⋮</strong> (three dots) menu button
                    in the address bar.
                  </li>
                  <li>
                    Select <strong className="text-foreground">Install</strong> (or "Add to Home screen").
                  </li>
                  <li>Confirm by tapping Add.</li>
                </ol>
              </div>
            ) : isIOS ? (
              <div className="rounded-md border border-border bg-secondary/50 p-3">
                <p className="font-semibold text-foreground">Safari on iOS:</p>
                <ol className="mt-2 list-inside list-decimal space-y-1.5 text-muted-foreground">
                  <li>
                    Tap the <strong className="text-foreground">Share</strong> icon (square with arrow) at the bottom.
                  </li>
                  <li>
                    Scroll down and select <strong className="text-foreground">Add to Home Screen</strong>.
                  </li>
                  <li>Tap Add in the top-right corner.</li>
                </ol>
              </div>
            ) : (
              <div className="rounded-md border border-border bg-secondary/50 p-3">
                <p className="font-semibold text-foreground">How to install:</p>
                <p className="mt-1 text-muted-foreground">
                  Tap your browser menu (<MoreVertical className="inline h-3 w-3" />) and select{" "}
                  <strong className="text-foreground">Install</strong> or{" "}
                  <strong className="text-foreground">Add to Home screen</strong>.
                </p>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowDialog(false)}
                className="rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                Got it
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
