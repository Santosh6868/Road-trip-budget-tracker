import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Show iOS prompt after 3 seconds
    if (isIOSDevice) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setShowPrompt(false);
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 z-50">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-100 rounded-xl">
            <Smartphone className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-800">Install Trip Expense Tracker</h3>
            <p className="text-sm text-slate-600 mt-1">
              {isIOS
                ? "Tap the Share button in Safari, then select 'Add to Home Screen'"
                : "Install this app on your device for quick access, even offline!"}
            </p>
            {!isIOS && (
              <button
                onClick={handleInstall}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg"
              >
                <Download className="h-4 w-4" />
                Install App
              </button>
            )}
          </div>
          <button
            onClick={() => setShowPrompt(false)}
            className="p-1.5 bg-slate-100 rounded-full hover:bg-slate-200 transition-all"
          >
            <X className="h-4 w-4 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
}