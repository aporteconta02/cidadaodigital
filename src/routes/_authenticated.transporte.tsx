import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Car, Bike, Package, Star, Phone, Loader2, CheckCircle2, XCircle, Upload, MapPin, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/transporte")({
  component: TransportePage,
});

type Tab = "solicitar" | "minhas" | "motorista";

function callPhone(raw: string) {
  const digits = (raw || "").replace(/\D/g, "");
  if (!digits) { toast.error("Telefone indisponível"); return; }
  // Copy to clipboard so desktop users without a dialer still get the number
  try { navigator.clipboard?.writeText(digits); } catch {}
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = `tel:${digits}`;
  } else {
    toast.success(`Telefone copiado: ${raw}`);
    window.open(`tel:${digits}`, "_self");
  }
}

function TransportePage() {
  const { usuario } = useAuth();
  const [tab, setTab] = useState<Tab>("solicitar");
  const [driver, setDriver] = useState<any>(null);

  const loadDriver = useCallback(async () => {
    if (!usuario) return;
    const { data } = await supabase.from("drivers").select("*").eq("usuario_id", usuario.id).maybeSingle();
    setDriver(data);
  }, [usuario]);

  useEffect(() => { loadDriver(); }, [loadDriver]);

  if (!usuario) return <TransporteLoading />;

  return (
    <div className="pb-32 bg-bg-primary min-h-screen">
      <header className="px-6 pt-10 pb-4">
        <h1 className="text-2xl font-black font-space tracking-tighter italic flex items-center gap-2">
          <Car className="text-primary" size={28} /> Transporte
        </h1>
        <p className="text-xs text-text-muted mt-1 uppercase font-bold tracking-widest">Carro · Moto · Entrega</p>
      </header>

      <div className="px-4 mb-4 flex gap-2 overflow-x-auto">
        {[
          { id: "solicitar" as Tab, label: "Solicitar" },
          { id: "minhas" as Tab, label: "Minhas Corridas" },
          { id: "motorista" as Tab, label: driver ? "Sou Motorista" : "Cadastrar-se" },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
              tab === t.id ? "bg-primary text-white shadow-glow" : "bg-bg-card text-text-secondary"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4">
        {tab === "solicitar" && <SolicitarTab usuarioId={usuario.id} />}
        {tab === "minhas" && <MinhasCorridasTab usuarioId={usuario.id} />}
        {tab === "motorista" && <MotoristaTab driver={driver} authId={usuario.auth_id} onChange={loadDriver} />}
      </div>
    </div>
  );
}

function TransporteLoading() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center gap-3 text-text-secondary">
      <Loader2 className="animate-spin text-primary" size={28} />
      <p className="text-xs font-bold uppercase tracking-widest">Carregando transporte...</p>
    </div>
  );
}

// ============== Solicitar ==============
function SolicitarTab({ usuarioId }: { usuarioId: string }) {
  const [tipo, setTipo] = useState<"carro" | "moto" | "entrega">("carro");
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [obs, setObs] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeRequest, setActiveRequest] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);

  // Carrega solicitação aberta atual
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("ride_requests")
        .select("*")
        .eq("cliente_id", usuarioId)
        .in("status", ["aberta", "aceita"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setActiveRequest(data);
    })();
  }, [usuarioId]);

  // Realtime: ofertas + status
  const activeId = activeRequest?.id;
  useEffect(() => {
    if (!activeId) { setOffers([]); return; }
    const fetchOffers = async () => {
      const { data } = await supabase
        .from("ride_offers")
        .select("*, drivers(nome_completo, foto_url, modelo_veiculo, placa, avaliacao_media, total_corridas, chave_pix, usuario_id, usuarios:usuario_id(telefone))")
        .eq("request_id", activeId);
      setOffers(data || []);
    };
    fetchOffers();
    const ch = supabase
      .channel(`req-${activeId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "ride_offers", filter: `request_id=eq.${activeId}` }, async (p) => {
        await fetchOffers();
        if (p.eventType === "INSERT") toast.info("Nova oferta recebida!");
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "ride_requests", filter: `id=eq.${activeId}` }, (p) => {
        setActiveRequest(p.new);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [activeId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!origem.trim() || !destino.trim()) { toast.error("Preencha origem e destino"); return; }
    setSubmitting(true);
    const { data, error } = await supabase.from("ride_requests").insert({
      cliente_id: usuarioId, tipo_servico: tipo, origem, destino, observacao: obs || null,
    }).select().single();
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    setActiveRequest(data); setOrigem(""); setDestino(""); setObs("");
    toast.success("Solicitação publicada!");
  }

  async function acceptOffer(offer: any) {
    const { error } = await supabase.from("ride_requests").update({
      status: "aceita", driver_aceito_id: offer.driver_id, oferta_aceita_id: offer.id,
    }).eq("id", activeRequest.id);
    if (error) { toast.error(error.message); return; }
    await supabase.from("ride_offers").update({ status: "aceita" }).eq("id", offer.id);
    await supabase.from("ride_offers").update({ status: "recusada" }).eq("request_id", activeRequest.id).neq("id", offer.id);
    toast.success("Oferta aceita!");
  }

  async function concluir() {
    await supabase.from("ride_requests").update({ status: "concluida" }).eq("id", activeRequest.id);
    setActiveRequest({ ...activeRequest, status: "concluida" });
  }

  async function cancelar() {
    if (!confirm("Cancelar solicitação?")) return;
    await supabase.from("ride_requests").update({ status: "cancelada" }).eq("id", activeRequest.id);
    setActiveRequest(null);
  }

  if (activeRequest && activeRequest.status === "concluida") {
    return <RatingForm request={activeRequest} usuarioId={usuarioId} tipo="cliente_para_driver" onDone={() => setActiveRequest(null)} />;
  }

  if (activeRequest) {
    const accepted = offers.find(o => o.id === activeRequest.oferta_aceita_id);
    return (
      <div className="space-y-4">
        <div className="bg-bg-card border border-primary/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Radio className="text-primary animate-pulse" size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
              {activeRequest.status === "aberta" ? "Aguardando ofertas..." : "Corrida aceita"}
            </span>
          </div>
          <div className="text-sm space-y-1">
            <p><span className="text-text-muted">Tipo:</span> {activeRequest.tipo_servico}</p>
            <p><span className="text-text-muted">De:</span> {activeRequest.origem}</p>
            <p><span className="text-text-muted">Para:</span> {activeRequest.destino}</p>
            {activeRequest.observacao && <p className="text-xs text-text-muted">"{activeRequest.observacao}"</p>}
          </div>
          {activeRequest.status === "aberta" && (
            <button onClick={cancelar} className="mt-4 text-xs text-danger font-bold uppercase">Cancelar solicitação</button>
          )}
        </div>

        {activeRequest.status === "aceita" && accepted && (
          <div className="bg-success/10 border border-success/30 rounded-2xl p-5">
            <h3 className="font-black text-success uppercase text-xs tracking-widest mb-3">Motorista a caminho</h3>
            <div className="flex items-center gap-3 mb-3">
              {accepted.drivers?.foto_url && <img src={accepted.drivers.foto_url} className="size-12 rounded-full object-cover" />}
              <div>
                <p className="font-bold">{accepted.drivers?.nome_completo}</p>
                <p className="text-xs text-text-muted">{accepted.drivers?.modelo_veiculo} · {accepted.drivers?.placa}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="text-text-muted">Valor:</span> <strong>R$ {Number(accepted.valor).toFixed(2)}</strong></p>
              <p><span className="text-text-muted">Pix:</span> {accepted.drivers?.chave_pix}</p>
              {accepted.drivers?.usuarios?.telefone && (
                <button type="button" onClick={() => callPhone(accepted.drivers.usuarios.telefone)} className="inline-flex items-center gap-2 mt-2 bg-success text-white px-4 py-2 rounded-xl text-xs font-black uppercase">
                  <Phone size={14}/> Ligar
                </button>
              )}
            </div>
            <button onClick={concluir} className="mt-4 w-full bg-primary text-white py-3 rounded-xl text-xs font-black uppercase">
              Marcar como concluída
            </button>
          </div>
        )}

        {activeRequest.status === "aberta" && (
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest mb-3 px-1">Ofertas ({offers.length})</h3>
            {offers.length === 0 ? (
              <p className="text-center text-text-muted text-sm py-8">Nenhuma oferta ainda...</p>
            ) : (
              <div className="space-y-3">
                {offers.map(o => (
                  <div key={o.id} className="bg-bg-card border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                    {o.drivers?.foto_url ? (
                      <img src={o.drivers.foto_url} className="size-12 rounded-full object-cover" />
                    ) : <div className="size-12 rounded-full bg-primary/20" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{o.drivers?.nome_completo}</p>
                      <p className="text-[10px] text-text-muted truncate">{o.drivers?.modelo_veiculo}</p>
                      <div className="flex items-center gap-1 text-[10px] text-gold mt-0.5">
                        <Star size={10} fill="currentColor" /> {Number(o.drivers?.avaliacao_media || 0).toFixed(1)} · {o.drivers?.total_corridas || 0} corridas
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-primary">R$ {Number(o.valor).toFixed(2)}</p>
                      <button onClick={() => acceptOffer(o)} className="mt-1 bg-primary text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg">
                        Aceitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Tipo de serviço</label>
        <div className="grid grid-cols-3 gap-2">
          {([
            { id: "carro" as const, icon: Car, label: "Carro" },
            { id: "moto" as const, icon: Bike, label: "Moto" },
            { id: "entrega" as const, icon: Package, label: "Entrega" },
          ]).map(t => (
            <button type="button" key={t.id} onClick={() => setTipo(t.id)}
              className={cn("p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all",
                tipo === t.id ? "bg-primary text-white border-primary shadow-glow" : "bg-bg-card border-white/5 text-text-secondary")}>
              <t.icon size={24} />
              <span className="text-[10px] font-black uppercase">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Origem</label>
        <input value={origem} onChange={e => setOrigem(e.target.value)} required maxLength={200}
          className="w-full bg-bg-card border border-white/5 rounded-xl px-4 py-3 text-sm" placeholder="Onde você está?" />
      </div>

      <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Destino</label>
        <input value={destino} onChange={e => setDestino(e.target.value)} required maxLength={200}
          className="w-full bg-bg-card border border-white/5 rounded-xl px-4 py-3 text-sm" placeholder="Para onde vai?" />
      </div>

      <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Observação (opcional)</label>
        <textarea value={obs} onChange={e => setObs(e.target.value)} maxLength={300} rows={3}
          className="w-full bg-bg-card border border-white/5 rounded-xl px-4 py-3 text-sm" placeholder="Ex: tenho bagagem, é urgente..." />
      </div>

      <button type="submit" disabled={submitting}
        className="w-full bg-primary text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-glow disabled:opacity-50 flex items-center justify-center gap-2">
        {submitting && <Loader2 className="animate-spin" size={16} />} Solicitar
      </button>
    </form>
  );
}

// ============== Minhas Corridas ==============
function MinhasCorridasTab({ usuarioId }: { usuarioId: string }) {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("ride_requests")
        .select("*, drivers(nome_completo, placa)")
        .eq("cliente_id", usuarioId)
        .order("created_at", { ascending: false });
      setList(data || []);
    })();
  }, [usuarioId]);

  if (!list.length) return <p className="text-center text-text-muted text-sm py-12">Nenhuma corrida ainda.</p>;
  return (
    <div className="space-y-3">
      {list.map(r => (
        <div key={r.id} className="bg-bg-card border border-white/5 rounded-2xl p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">{r.tipo_servico}</span>
            <span className={cn("text-[10px] font-black uppercase px-2 py-0.5 rounded-full",
              r.status === "concluida" ? "bg-success/20 text-success" :
              r.status === "aceita" ? "bg-primary/20 text-primary" :
              r.status === "cancelada" ? "bg-danger/20 text-danger" : "bg-white/10 text-text-secondary"
            )}>{r.status}</span>
          </div>
          <p className="text-xs flex items-center gap-1"><MapPin size={10} /> {r.origem} → {r.destino}</p>
          {r.drivers && <p className="text-[10px] text-text-muted mt-1">{r.drivers.nome_completo} · {r.drivers.placa}</p>}
        </div>
      ))}
    </div>
  );
}

// ============== Motorista ==============
function MotoristaTab({ driver, authId, onChange }: { driver: any; authId: string; onChange: () => void }) {
  if (!driver) return <DriverSignup authId={authId} onDone={onChange} />;

  if (driver.status_aprovacao === "pendente") {
    return (
      <div className="bg-bg-card border border-white/5 rounded-2xl p-6 text-center">
        <Loader2 className="animate-spin mx-auto mb-3 text-primary" size={32} />
        <h3 className="font-black uppercase tracking-widest text-sm">Aguardando aprovação</h3>
        <p className="text-xs text-text-muted mt-2">Seu cadastro está em análise pelo admin.</p>
      </div>
    );
  }

  if (driver.status_aprovacao === "recusada" || driver.status_aprovacao === "recusado") {
    return (
      <div className="bg-danger/10 border border-danger/30 rounded-2xl p-6 text-center">
        <XCircle className="mx-auto mb-3 text-danger" size={32} />
        <h3 className="font-black uppercase tracking-widest text-sm text-danger">Cadastro recusado</h3>
        {driver.motivo_recusa && <p className="text-xs text-text-muted mt-2">{driver.motivo_recusa}</p>}
      </div>
    );
  }

  return <DriverDashboard driver={driver} onChange={onChange} />;
}

function DriverSignup({ authId, onDone }: { authId: string; onDone: () => void }) {
  const [form, setForm] = useState({
    nome_completo: "", tipo_veiculo: "carro" as "carro"|"moto"|"ambos",
    modelo_veiculo: "", placa: "", chave_pix: "",
  });
  const [cnh, setCnh] = useState<File | null>(null);
  const [foto, setFoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function upload(file: File, prefix: string) {
    const ext = file.name.split(".").pop();
    const path = `${authId}/${prefix}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("cnh-docs").upload(path, file);
    if (error) throw error;
    return path;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!cnh) { toast.error("Envie a foto da CNH"); return; }
    setSubmitting(true);
    try {
      const cnhPath = await upload(cnh, "cnh");
      let fotoUrl: string | null = null;
      if (foto) {
        const fotoPath = await upload(foto, "foto");
        fotoUrl = supabase.storage.from("cnh-docs").getPublicUrl(fotoPath).data.publicUrl;
      }
      const { data: { user } } = await supabase.auth.getUser();
      const { data: usu } = await supabase.from("usuarios").select("id").eq("auth_id", user!.id).single();
      const { error } = await supabase.from("drivers").insert({
        usuario_id: usu!.id, ...form, cnh_foto_url: cnhPath, foto_url: fotoUrl,
      });
      if (error) throw error;
      toast.success("Cadastro enviado! Aguarde aprovação.");
      onDone();
    } catch (err: any) {
      toast.error(err.message || "Erro");
    } finally { setSubmitting(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <h2 className="text-sm font-black uppercase tracking-widest">Cadastro de motorista</h2>
      <input value={form.nome_completo} onChange={e => setForm({...form, nome_completo: e.target.value})} required placeholder="Nome completo" maxLength={120} className="w-full bg-bg-card border border-white/5 rounded-xl px-4 py-3 text-sm" />
      <select value={form.tipo_veiculo} onChange={e => setForm({...form, tipo_veiculo: e.target.value as any})} className="w-full bg-bg-card border border-white/5 rounded-xl px-4 py-3 text-sm">
        <option value="carro">Carro</option><option value="moto">Moto</option><option value="ambos">Ambos</option>
      </select>
      <input value={form.modelo_veiculo} onChange={e => setForm({...form, modelo_veiculo: e.target.value})} required placeholder="Modelo do veículo" maxLength={80} className="w-full bg-bg-card border border-white/5 rounded-xl px-4 py-3 text-sm" />
      <input value={form.placa} onChange={e => setForm({...form, placa: e.target.value.toUpperCase()})} required placeholder="Placa" maxLength={10} className="w-full bg-bg-card border border-white/5 rounded-xl px-4 py-3 text-sm" />
      <input value={form.chave_pix} onChange={e => setForm({...form, chave_pix: e.target.value})} required placeholder="Chave Pix" maxLength={120} className="w-full bg-bg-card border border-white/5 rounded-xl px-4 py-3 text-sm" />

      <label className="block bg-bg-card border border-white/5 rounded-xl px-4 py-3 cursor-pointer">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2"><Upload size={12} /> Foto da CNH *</span>
        <input type="file" accept="image/*" required className="hidden" onChange={e => setCnh(e.target.files?.[0] || null)} />
        {cnh && <span className="text-xs text-success mt-1 block">{cnh.name}</span>}
      </label>

      <label className="block bg-bg-card border border-white/5 rounded-xl px-4 py-3 cursor-pointer">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2"><Upload size={12} /> Foto de perfil (opcional)</span>
        <input type="file" accept="image/*" className="hidden" onChange={e => setFoto(e.target.files?.[0] || null)} />
        {foto && <span className="text-xs text-success mt-1 block">{foto.name}</span>}
      </label>

      <button type="submit" disabled={submitting} className="w-full bg-primary text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-glow disabled:opacity-50 flex items-center justify-center gap-2">
        {submitting && <Loader2 className="animate-spin" size={16} />} Enviar cadastro
      </button>
    </form>
  );
}

function DriverDashboard({ driver, onChange }: { driver: any; onChange: () => void }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [myActive, setMyActive] = useState<any>(null);

  async function toggleOnline() {
    const { error } = await supabase.from("drivers").update({ online: !driver.online }).eq("id", driver.id);
    if (error) toast.error(error.message); else onChange();
  }

  const loadRequests = useCallback(async () => {
    const { data } = await supabase.from("ride_requests").select("*, usuarios:cliente_id(nome, telefone)").eq("status", "aberta").order("created_at", { ascending: false });
    setRequests(data || []);
    const { data: active } = await supabase.from("ride_requests").select("*, usuarios:cliente_id(nome, telefone)").eq("driver_aceito_id", driver.id).in("status", ["aceita"]).maybeSingle();
    setMyActive(active);
  }, [driver.id]);

  useEffect(() => {
    if (!driver.online) { setRequests([]); return; }
    loadRequests();
    const ch = supabase
      .channel(`driver-${driver.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "ride_requests" }, loadRequests)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "ride_offers", filter: `driver_id=eq.${driver.id}` }, (p) => {
        if ((p.new as any).status === "aceita") toast.success("Sua oferta foi aceita!");
        loadRequests();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [driver.online, driver.id, loadRequests]);

  async function sendOffer(reqId: string, valor: number) {
    if (!valor || valor <= 0) { toast.error("Valor inválido"); return; }
    const { error } = await supabase.from("ride_offers").insert({ request_id: reqId, driver_id: driver.id, valor });
    if (error) toast.error(error.message); else toast.success("Oferta enviada");
  }

  return (
    <div className="space-y-4">
      <div className="bg-bg-card border border-white/5 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <h3 className="font-black uppercase tracking-widest text-sm">Status</h3>
          <p className="text-xs text-text-muted">⭐ {Number(driver.avaliacao_media).toFixed(1)} · {driver.total_corridas} corridas</p>
        </div>
        <button onClick={toggleOnline} className={cn(
          "px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest",
          driver.online ? "bg-green-500 text-white" : "bg-bg-primary text-text-secondary border border-white/10"
        )}>
          {driver.online ? "● Online" : "○ Offline"}
        </button>
      </div>

      {myActive && (
        <div className="bg-success/10 border border-success/30 rounded-2xl p-5">
          <h3 className="font-black uppercase text-xs text-success mb-2">Corrida em andamento</h3>
          <p className="text-sm">{myActive.usuarios?.nome}</p>
          <p className="text-xs text-text-muted">{myActive.origem} → {myActive.destino}</p>
          {myActive.usuarios?.telefone && (
            <a href={`tel:${myActive.usuarios.telefone}`} className="inline-flex items-center gap-2 mt-3 bg-success text-white px-4 py-2 rounded-xl text-xs font-black uppercase">
              <Phone size={14}/> Ligar
            </a>
          )}
        </div>
      )}

      {driver.online && (
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest mb-3 px-1">Solicitações abertas ({requests.length})</h3>
          {requests.length === 0 ? (
            <p className="text-center text-text-muted text-sm py-8">Nenhuma solicitação no momento</p>
          ) : (
            <div className="space-y-3">
              {requests.map(r => <RequestCard key={r.id} request={r} onOffer={(v) => sendOffer(r.id, v)} />)}
            </div>
          )}
        </div>
      )}

      {!driver.online && <p className="text-center text-text-muted text-sm py-8">Ative o status online para ver solicitações.</p>}
    </div>
  );
}

function RequestCard({ request, onOffer }: { request: any; onOffer: (v: number) => void }) {
  const [valor, setValor] = useState("");
  return (
    <div className="bg-bg-card border border-white/5 rounded-2xl p-4">
      <div className="flex justify-between mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-primary">{request.tipo_servico}</span>
        <span className="text-[10px] text-text-muted">{new Date(request.created_at).toLocaleTimeString("pt-BR", {hour:"2-digit",minute:"2-digit"})}</span>
      </div>
      <p className="text-xs"><span className="text-text-muted">De:</span> {request.origem}</p>
      <p className="text-xs"><span className="text-text-muted">Para:</span> {request.destino}</p>
      {request.observacao && <p className="text-[10px] text-text-muted mt-1 italic">"{request.observacao}"</p>}
      <div className="mt-3 flex gap-2">
        <input type="number" step="0.01" min="0" value={valor} onChange={e => setValor(e.target.value)}
          placeholder="R$" className="flex-1 bg-bg-primary border border-white/10 rounded-lg px-3 py-2 text-sm" />
        <button onClick={() => { onOffer(parseFloat(valor)); setValor(""); }}
          className="bg-primary text-white px-4 rounded-lg text-[10px] font-black uppercase">Ofertar</button>
      </div>
    </div>
  );
}

function RatingForm({ request, usuarioId, tipo, onDone }: { request: any; usuarioId: string; tipo: "cliente_para_driver" | "driver_para_cliente"; onDone: () => void }) {
  const [stars, setStars] = useState(5);
  const [comentario, setComentario] = useState("");

  async function submit() {
    const { data: drv } = await supabase.from("drivers").select("usuario_id").eq("id", request.driver_aceito_id).single();
    const avaliado_id = tipo === "cliente_para_driver" ? drv?.usuario_id : request.cliente_id;
    const { error } = await supabase.from("ride_ratings").insert({
      request_id: request.id, avaliador_id: usuarioId, avaliado_id, tipo, estrelas: stars, comentario,
    });
    if (error) toast.error(error.message); else { toast.success("Avaliação enviada!"); onDone(); }
  }

  return (
    <div className="bg-bg-card border border-white/5 rounded-2xl p-6 text-center">
      <CheckCircle2 className="mx-auto mb-3 text-success" size={32} />
      <h3 className="font-black uppercase tracking-widest text-sm mb-4">Avalie a corrida</h3>
      <div className="flex justify-center gap-2 mb-4">
        {[1,2,3,4,5].map(n => (
          <button key={n} onClick={() => setStars(n)}>
            <Star size={32} className={n <= stars ? "text-gold fill-gold" : "text-white/20"} />
          </button>
        ))}
      </div>
      <textarea value={comentario} onChange={e => setComentario(e.target.value)} maxLength={300} rows={2}
        className="w-full bg-bg-primary border border-white/10 rounded-xl px-3 py-2 text-sm mb-4" placeholder="Comentário (opcional)" />
      <button onClick={submit} className="w-full bg-primary text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-glow">
        Enviar avaliação
      </button>
    </div>
  );
}
