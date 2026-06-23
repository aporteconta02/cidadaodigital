import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";

const DISMISS_KEY = "cp-install-dismissed-at";
const DISMISS_DAYS = 7;

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as any).standalone === true
  );
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
}

function dismissedRecently() {
  try {
    const ts = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (!ts) return false;
    return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone() || dismissedRecently()) return;

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", onBIP);

    const onInstalled = () => setVisible(false);
    window.addEventListener("appinstalled", onInstalled);

    const timer = window.setTimeout(() => {
      if (isIOS()) {
        setIosHint(true);
        setVisible(true);
      } else if (deferredRef.current || true) {
        // Show banner; if BIP hasn't fired yet, we'll still show with disabled CTA fallback
        setVisible(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
      window.clearTimeout(timer);
    };
  }, []);

  // keep a ref-like alias for the deferred prompt for the timer
  const deferredRef = { current: deferred };

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
    setVisible(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") {
      setVisible(false);
    } else {
      dismiss();
    }
    setDeferred(null);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed left-3 right-3 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-300"
      style={{ bottom: `calc(env(safe-area-inset-bottom, 0px) + 88px)` }}
      role="dialog"
      aria-label="Instalar CIDADÃO+"
    >
      <div className="max-w-lg mx-auto rounded-2xl border border-primary/40 bg-[#1a1030] text-white shadow-[0_12px_40px_rgba(124,58,237,0.45)] p-4">
        <div className="flex items-start gap-3">
          <img
            src="/icon-192.png"
            alt=""
            width={48}
            height={48}
            loading="lazy"
            className="size-12 rounded-xl shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold leading-tight">Instale o CIDADÃO+ no seu celular!</h3>
            <p className="text-xs text-white/70 mt-0.5">
              {iosHint
                ? "Toque em compartilhar e depois \"Adicionar à Tela de Início\"."
                : "Acesse mais rápido, com cara de app."}
            </p>
          </div>
          <button
            onClick={dismiss}
            aria-label="Fechar"
            className="shrink-0 size-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          {iosHint ? (
            <div className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-white/10 text-xs font-bold uppercase tracking-wider">
              <Share size={16} /> Compartilhar → Adicionar
            </div>
          ) : (
            <button
              onClick={install}
              disabled={!deferred}
              className="flex-1 h-12 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-50"
            >
              <Download size={16} /> Instalar agora
            </button>
          )}
          <button
            onClick={dismiss}
            className="h-12 px-4 rounded-xl bg-white/5 text-white/70 text-xs font-bold uppercase tracking-wider hover:bg-white/10"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
}
