"use client";

import { useEffect, useState } from "react";
import { Download, WifiOff, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaRegister() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstallEvent(null);
    const sync = () => setOnline(navigator.onLine);

    sync();
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  return (
    <>
      {!online && (
        <div className="fixed top-0 inset-x-0 z-[60] bg-amber-500 text-amber-950 text-xs font-medium py-1.5 pt-[calc(env(safe-area-inset-top)+0.375rem)] flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" /> You&apos;re offline — some features are unavailable
        </div>
      )}
      {installEvent && !dismissed && (
        <div className="fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-6 md:left-auto md:right-6 md:w-80 z-50 rounded-2xl border border-border bg-card text-card-foreground shadow-xl p-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Install SmartLMS</p>
            <p className="text-xs text-muted-foreground">Add it to your home screen for quick access.</p>
          </div>
          <button
            onClick={install}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium"
          >
            <Download className="w-3.5 h-3.5" /> Install
          </button>
          <button onClick={() => setDismissed(true)} aria-label="Dismiss" className="p-1.5 text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
