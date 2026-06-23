import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Car, CheckCircle2, XCircle, Star, Eye } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/transporte")({
  component: AdminTransporte,
});

type Tab = "pendentes" | "corridas" | "avaliacoes";

function AdminTransporte() {
  const [tab, setTab] = useState<Tab>("pendentes");
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Car className="text-admin-primary" size={28} />
        <h1 className="text-2xl font-bold">Transporte</h1>
      </div>

      <div className="flex gap-2 border-b border-admin-border">
        {[
          { id: "pendentes" as Tab, label: "Motoristas pendentes" },
          { id: "corridas" as Tab, label: "Corridas" },
          { id: "avaliacoes" as Tab, label: "Avaliações" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors",
              tab === t.id ? "border-admin-primary text-admin-primary" : "border-transparent text-admin-text-secondary hover:text-admin-text")}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "pendentes" && <PendentesTab />}
      {tab === "corridas" && <CorridasTab />}
      {tab === "avaliacoes" && <AvaliacoesTab />}
    </div>
  );
}

function PendentesTab() {
  const [list, setList] = useState<any[]>([]);
  const [filter, setFilter] = useState<"pendente"|"aprovado"|"recusado">("pendente");

  async function load() {
    const { data } = await supabase.from("drivers").select("*, usuarios:usuario_id(nome, email, telefone)").eq("status_aprovacao", filter).order("created_at", { ascending: false });
    setList(data || []);
  }
  useEffect(() => { load(); }, [filter]);

  async function setStatus(id: string, status: "aprovado"|"recusado", motivo?: string) {
    const { error } = await supabase.from("drivers").update({ status_aprovacao: status, motivo_recusa: motivo || null }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Atualizado"); load(); }
  }

  async function viewCnh(path: string) {
    const { data } = await supabase.storage.from("cnh-docs").createSignedUrl(path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {(["pendente","aprovado","recusado"] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold capitalize",
              filter === s ? "bg-admin-primary text-white" : "bg-admin-border-light text-admin-text")}>
            {s}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {list.length === 0 && <p className="text-admin-text-secondary text-sm">Nenhum.</p>}
        {list.map(d => (
          <div key={d.id} className="bg-admin-surface border border-admin-border rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                {d.foto_url && <img src={d.foto_url} className="size-12 rounded-full object-cover" />}
                <div>
                  <p className="font-semibold">{d.nome_completo}</p>
                  <p className="text-xs text-admin-text-secondary">{d.usuarios?.email} · {d.usuarios?.telefone}</p>
                  <p className="text-xs mt-1">{d.tipo_veiculo} · {d.modelo_veiculo} · {d.placa}</p>
                  <p className="text-xs text-admin-text-secondary">Pix: {d.chave_pix}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => viewCnh(d.cnh_foto_url)} className="text-xs px-3 py-1.5 bg-admin-border-light rounded-lg flex items-center gap-1">
                  <Eye size={12} /> Ver CNH
                </button>
                {filter === "pendente" && (
                  <>
                    <button onClick={() => setStatus(d.id, "aprovado")} className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg flex items-center gap-1">
                      <CheckCircle2 size={12} /> Aprovar
                    </button>
                    <button onClick={() => { const m = prompt("Motivo da recusa?"); if (m) setStatus(d.id, "recusado", m); }} className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg flex items-center gap-1">
                      <XCircle size={12} /> Recusar
                    </button>
                  </>
                )}
              </div>
            </div>
            {d.motivo_recusa && <p className="text-xs text-red-500 mt-2">Motivo: {d.motivo_recusa}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function CorridasTab() {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("ride_requests")
        .select("*, usuarios:cliente_id(nome), drivers(nome_completo, placa)")
        .order("created_at", { ascending: false }).limit(100);
      setList(data || []);
    })();
  }, []);
  return (
    <div className="space-y-2">
      {list.map(r => (
        <div key={r.id} className="bg-admin-surface border border-admin-border rounded-lg p-3 text-sm">
          <div className="flex justify-between">
            <strong>{r.tipo_servico}</strong>
            <span className="text-xs capitalize">{r.status}</span>
          </div>
          <p className="text-xs text-admin-text-secondary">{r.usuarios?.nome} → {r.drivers?.nome_completo || "—"}</p>
          <p className="text-xs">{r.origem} → {r.destino}</p>
          <p className="text-[10px] text-admin-text-secondary">{new Date(r.created_at).toLocaleString("pt-BR")}</p>
        </div>
      ))}
    </div>
  );
}

function AvaliacoesTab() {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("ride_ratings")
        .select("*, avaliador:avaliador_id(nome), avaliado:avaliado_id(nome)")
        .order("created_at", { ascending: false }).limit(100);
      setList(data || []);
    })();
  }, []);
  return (
    <div className="space-y-2">
      {list.map(r => (
        <div key={r.id} className="bg-admin-surface border border-admin-border rounded-lg p-3 text-sm">
          <div className="flex items-center gap-2 mb-1">
            {[1,2,3,4,5].map(n => <Star key={n} size={14} className={n <= r.estrelas ? "text-yellow-500 fill-yellow-500" : "text-gray-300"} />)}
            <span className="text-xs text-admin-text-secondary">· {r.tipo}</span>
          </div>
          <p className="text-xs">{r.avaliador?.nome} → {r.avaliado?.nome}</p>
          {r.comentario && <p className="text-xs italic mt-1">"{r.comentario}"</p>}
        </div>
      ))}
    </div>
  );
}
