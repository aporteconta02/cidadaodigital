import { useEffect, useState, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageSquare, CheckCircle2, Wrench, Send, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Map from '@/components/Map';

type Tipo = 'informacao' | 'confirmacao' | 'resolucao';

const TIPO_META: Record<Tipo, { label: string; icon: JSX.Element; color: string }> = {
  informacao: { label: 'Informação adicional', icon: <MessageSquare size={14} />, color: 'text-primary' },
  confirmacao: { label: 'Confirmo que aconteceu', icon: <CheckCircle2 size={14} />, color: 'text-warning' },
  resolucao: { label: 'Foi resolvido', icon: <Wrench size={14} />, color: 'text-success' },
};

interface Props {
  alert: any | null;
  onClose: () => void;
  onResolved?: () => void;
}

export default function AlertCollaborationDrawer({ alert, onClose, onResolved }: Props) {
  const { usuario } = useAuth();
  const [colabs, setColabs] = useState<any[]>([]);
  const [tipo, setTipo] = useState<Tipo>('informacao');
  const [texto, setTexto] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchColabs = useCallback(async (alertId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('alerta_colaboracoes' as any)
      .select('*, autor:usuarios!alerta_colaboracoes_user_id_fkey(nome, avatar_url)')
      .eq('alerta_id', alertId)
      .order('created_at', { ascending: true });
    if (!error) setColabs((data as any) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!alert?.id) return;
    fetchColabs(alert.id);
    const channel = supabase
      .channel(`colabs-${alert.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerta_colaboracoes', filter: `alerta_id=eq.${alert.id}` },
        () => fetchColabs(alert.id)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [alert?.id, fetchColabs]);

  const submit = async () => {
    if (!alert?.id) return;
    if (!texto.trim()) { toast.error('Escreva sua colaboração.'); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Faça login para colaborar.'); return; }
    setSubmitting(true);
    const { error } = await supabase.from('alerta_colaboracoes' as any).insert({
      alerta_id: alert.id,
      user_id: user.id,
      tipo,
      texto: texto.trim(),
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Colaboração enviada!');
    setTexto('');
    setTipo('informacao');
    if (tipo === 'resolucao') onResolved?.();
  };

  const open = !!alert;
  const tipoLabel = alert?.tipo ? String(alert.tipo).toUpperCase() : '';

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="bottom" className="bg-bg-elevated border-border-custom rounded-t-3xl p-0 h-[90vh] flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-white/5">
          <SheetTitle className="text-xl font-black font-space uppercase italic text-white text-left">
            {tipoLabel}
          </SheetTitle>
          {alert?.criado_em && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted text-left">
              {formatDistanceToNow(new Date(alert.criado_em), { locale: ptBR, addSuffix: true })}
              {alert.bairro ? ` • ${alert.bairro}` : ''}
            </p>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 no-scrollbar">
          {/* Mini map */}
          {alert?.latitude && alert?.longitude && (
            <div className="h-40 w-full rounded-2xl overflow-hidden border border-white/5">
              <Map
                center={[Number(alert.latitude), Number(alert.longitude)]}
                zoom={16}
                markers={[{
                  id: alert.id,
                  position: [Number(alert.latitude), Number(alert.longitude)],
                  title: tipoLabel,
                  description: alert.descricao || '',
                  type: alert.tipo,
                  created_at: alert.criado_em,
                }]}
                light
              />
            </div>
          )}

          {/* Original description */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 flex items-center gap-1.5">
              <MapPin size={12} /> Descrição original
            </p>
            <p className="text-sm text-text-primary leading-relaxed">
              {alert?.descricao || <span className="text-text-muted italic">Sem descrição.</span>}
            </p>
          </div>

          {/* Timeline */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3">
              Colaborações ({colabs.length})
            </p>
            {loading ? (
              <div className="space-y-2">
                {[1,2].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
              </div>
            ) : colabs.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-6">Seja o primeiro a colaborar.</p>
            ) : (
              <div className="space-y-3">
                {colabs.map((c) => {
                  const meta = TIPO_META[c.tipo as Tipo] || TIPO_META.informacao;
                  const nome = c.autor?.nome || 'Vizinho';
                  return (
                    <div key={c.id} className="flex gap-3">
                      <div className="size-8 shrink-0 rounded-full bg-white/10 overflow-hidden flex items-center justify-center text-[10px] font-black">
                        {c.autor?.avatar_url
                          ? <img src={c.autor.avatar_url} alt={nome} className="size-full object-cover" />
                          : nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-text-primary">{nome}</span>
                          <span className={cn("text-[9px] font-black uppercase tracking-widest flex items-center gap-1", meta.color)}>
                            {meta.icon} {meta.label}
                          </span>
                          <span className="text-[9px] text-text-muted ml-auto">
                            {formatDistanceToNow(new Date(c.created_at), { locale: ptBR, addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary mt-1 leading-relaxed">{c.texto}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        {usuario?.id && (
          <div className="border-t border-white/5 p-4 space-y-3 bg-bg-primary/50">
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(TIPO_META) as Tipo[]).map((t) => {
                const m = TIPO_META[t];
                const active = tipo === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTipo(t)}
                    className={cn(
                      "flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-[9px] font-black uppercase tracking-tight transition-all",
                      active ? "border-primary bg-primary/10 text-primary" : "border-white/10 bg-white/5 text-text-muted"
                    )}
                  >
                    {m.icon}
                    <span className="text-center leading-tight">{m.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escreva sua colaboração..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-primary/50"
                onKeyDown={(e) => { if (e.key === 'Enter' && !submitting) submit(); }}
              />
              <button
                onClick={submit}
                disabled={submitting || !texto.trim()}
                className="size-12 rounded-xl bg-primary text-white flex items-center justify-center active:scale-95 transition-all disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
