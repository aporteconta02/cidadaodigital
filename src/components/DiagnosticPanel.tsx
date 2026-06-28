import { useEffect, useState } from "react";

type Diag = {
  timestamp: string;
  serviceWorkers: Array<{ scope: string; scriptURL: string; state: string }>;
  caches: string[];
  swSupported: boolean;
  cachesSupported: boolean;
  deactivation: {
    swCleared: boolean;
    cachesCleared: boolean;
    note: string;
  };
};

export function DiagnosticPanel() {
  const [open, setOpen] = useState(false);
  const [diag, setDiag] = useState<Diag | null>(null);
  const [loading, setLoading] = useState(false);

  const collect = async () => {
    setLoading(true);
    const swSupported = typeof navigator !== "undefined" && "serviceWorker" in navigator;
    const cachesSupported = typeof caches !== "undefined";

    let regs: Array<{ scope: string; scriptURL: string; state: string }> = [];
    if (swSupported) {
      const list = await navigator.serviceWorker.getRegistrations();
      regs = list.map((r) => {
        const w = r.active || r.waiting || r.installing;
        return {
          scope: r.scope,
          scriptURL: w?.scriptURL || "(sem worker)",
          state: w?.state || "unknown",
        };
      });
    }

    let cacheNames: string[] = [];
    if (cachesSupported) {
      cacheNames = await caches.keys();
    }

    setDiag({
      timestamp: new Date().toLocaleString("pt-BR"),
      serviceWorkers: regs,
      caches: cacheNames,
      swSupported,
      cachesSupported,
      deactivation: {
        swCleared: regs.length === 0,
        cachesCleared: cacheNames.length === 0,
        note:
          regs.length === 0 && cacheNames.length === 0
            ? "PWA totalmente desativado ✅"
            : "Resíduos detectados — recarregue para limpar",
      },
    });
    setLoading(false);
  };

  useEffect(() => {
    // Coleta inicial após o cleanup do __root.tsx rodar
    const t = setTimeout(collect, 800);
    return () => clearTimeout(t);
  }, []);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir diagnóstico"
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 9999,
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "rgba(124,58,237,0.9)",
          color: "white",
          border: "1px solid rgba(255,255,255,0.2)",
          fontSize: 18,
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        }}
      >
        🔧
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 9999,
        width: "min(380px, calc(100vw - 32px))",
        maxHeight: "70vh",
        overflow: "auto",
        background: "rgba(10,0,16,0.97)",
        color: "white",
        border: "1px solid rgba(124,58,237,0.4)",
        borderRadius: 12,
        padding: 16,
        fontFamily: "ui-monospace, monospace",
        fontSize: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <strong style={{ color: "#a855f7" }}>🔧 Diagnóstico PWA</strong>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={collect}
            disabled={loading}
            style={{ padding: "4px 8px", background: "#7c3aed", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 11 }}
          >
            {loading ? "..." : "↻"}
          </button>
          <button
            onClick={() => setOpen(false)}
            style={{ padding: "4px 8px", background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 6, cursor: "pointer", fontSize: 11 }}
          >
            ✕
          </button>
        </div>
      </div>

      {!diag ? (
        <p style={{ color: "#888" }}>Coletando...</p>
      ) : (
        <>
          <p style={{ margin: "0 0 8px", color: "#888" }}>Capturado: {diag.timestamp}</p>

          <Section title={`Status: ${diag.deactivation.note}`} color={diag.deactivation.swCleared && diag.deactivation.cachesCleared ? "#10b981" : "#f59e0b"}>
            <div>SW limpos: {diag.deactivation.swCleared ? "✅" : "❌"}</div>
            <div>Caches limpos: {diag.deactivation.cachesCleared ? "✅" : "❌"}</div>
            <div>Suporte SW: {diag.swSupported ? "sim" : "não"}</div>
            <div>Suporte Caches: {diag.cachesSupported ? "sim" : "não"}</div>
          </Section>

          <Section title={`Service Workers (${diag.serviceWorkers.length})`}>
            {diag.serviceWorkers.length === 0 ? (
              <div style={{ color: "#10b981" }}>Nenhum registrado ✅</div>
            ) : (
              diag.serviceWorkers.map((sw, i) => (
                <div key={i} style={{ marginBottom: 6, paddingLeft: 8, borderLeft: "2px solid #7c3aed" }}>
                  <div>scope: {sw.scope}</div>
                  <div style={{ wordBreak: "break-all" }}>script: {sw.scriptURL}</div>
                  <div>state: {sw.state}</div>
                </div>
              ))
            )}
          </Section>

          <Section title={`Caches (${diag.caches.length})`}>
            {diag.caches.length === 0 ? (
              <div style={{ color: "#10b981" }}>Nenhum cache ✅</div>
            ) : (
              diag.caches.map((c, i) => <div key={i}>• {c}</div>)
            )}
          </Section>
        </>
      )}
    </div>
  );
}

function Section({ title, children, color = "#a855f7" }: { title: string; children: React.ReactNode; color?: string }) {
  return (
    <div style={{ marginTop: 10, padding: 8, background: "rgba(255,255,255,0.03)", borderRadius: 6 }}>
      <div style={{ color, fontWeight: 600, marginBottom: 4 }}>{title}</div>
      {children}
    </div>
  );
}
