import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      className="fixed left-0 right-0 z-[70] flex justify-center px-3 pointer-events-none"
      style={{ top: `calc(env(safe-area-inset-top, 0px) + 8px)` }}
      role="status"
    >
      <div className="pointer-events-auto max-w-lg w-full rounded-xl bg-warning/95 text-black px-4 py-2.5 shadow-lg flex items-center gap-2 text-xs font-bold">
        <WifiOff size={16} />
        <span className="flex-1">Você está sem conexão — algumas funções podem estar indisponíveis.</span>
      </div>
    </div>
  );
}
