import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/limpar-cache")({
  head: () => ({
    meta: [
      { title: "Limpar cache — CIDADÃO+" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LimparCachePage,
});

function LimparCachePage() {
  const limpar = async () => {
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {}
    } finally {
      window.location.href = "/";
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0010",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "sans-serif",
        gap: 16,
        padding: 24,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 48 }}>🔄</div>
      <h1 style={{ color: "#a855f7", margin: 0 }}>CIDADÃO+</h1>
      <p style={{ opacity: 0.7, margin: 0 }}>
        Limpa o cache, desregistra o service worker e recarrega o app.
      </p>
      <button
        onClick={limpar}
        style={{
          padding: "14px 28px",
          background: "#7c3aed",
          color: "white",
          border: "none",
          borderRadius: 10,
          cursor: "pointer",
          fontSize: 16,
        }}
      >
        Limpar cache agora
      </button>
    </div>
  );
}
