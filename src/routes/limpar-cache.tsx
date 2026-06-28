import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/limpar-cache")({
  component: LimparCache,
});

function LimparCache() {
  const [status, setStatus] = useState<"idle" | "limpando" | "ok" | "erro">("idle");

  const limparTudo = async () => {
    setStatus("limpando");
    try {
      if (typeof caches !== "undefined") {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }

      if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }

      setStatus("ok");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch {
      setStatus("erro");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg,#0d0020,#0a0015)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "sans-serif",
        gap: "16px",
        padding: "24px",
      }}
    >
      <div style={{ fontSize: "56px" }}>
        {status === "ok" ? "✅" : status === "erro" ? "❌" : "🔄"}
      </div>
      <h2 style={{ color: "#a78bfa", margin: 0, fontSize: "24px" }}>CIDADÃO+</h2>
      <p style={{ opacity: 0.7, textAlign: "center", margin: 0 }}>
        {status === "idle" && "Limpar cache para resolver problemas de tela branca"}
        {status === "limpando" && "Limpando cache..."}
        {status === "ok" && "Cache limpo! Redirecionando..."}
        {status === "erro" && "Erro ao limpar. Tente recarregar manualmente."}
      </p>
      {status === "idle" && (
        <button
          onClick={limparTudo}
          style={{
            padding: "14px 32px",
            background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: 600,
            boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
          }}
        >
          Limpar cache agora
        </button>
      )}
    </div>
  );
}
