import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, MapPin, Clock, AlertTriangle, CheckCircle2, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

type Period = '7d' | '30d' | '3m' | 'all';

const TIPO_LABEL: Record<string, string> = {
  suspeito: 'Suspeito',
  perturbacao: 'Perturbação',
  acidente: 'Acidente',
  crime: 'Crime',
  sos: 'SOS',
};

interface Props {
  bairro?: string | null;
}

export default function SecurityStatsTab({ bairro }: Props) {
  const [period, setPeriod] = useState<Period>('30d');
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!bairro) { setRows([]); setLoading(false); return; }
      setLoading(true);
      let query = supabase
        .from('alertas_seguranca')
        .select('id,tipo,bairro,descricao,latitude,longitude,criado_em,resolvido,resolvido_em,arquivado_em,confirmacoes,total_colaboracoes')
        .eq('bairro', bairro)
        .order('criado_em', { ascending: false })
        .limit(2000);

      if (period !== 'all') {
        const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
        const since = new Date(Date.now() - days * 86400_000).toISOString();
        query = query.gte('criado_em', since);
      }

      const { data, error } = await query;
      if (cancelled) return;
      if (error) console.error(error);
      setRows(data || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [bairro, period]);

  const stats = useMemo(() => {
    const byStreet = new Map<string, number>();
    const byBairro = new Map<string, number>();
    const byTipo = new Map<string, number>();
    const byHour = new Map<number, number>();

    for (const r of rows) {
      // extrai "rua" da descrição (primeiras palavras antes de vírgula/ponto)
      const street = (r.descricao || '').split(/[,.\n]/)[0]?.trim().slice(0, 40);
      if (street && street.length > 3) byStreet.set(street, (byStreet.get(street) || 0) + 1);

      if (r.bairro) byBairro.set(r.bairro, (byBairro.get(r.bairro) || 0) + 1);
      if (r.tipo) byTipo.set(r.tipo, (byTipo.get(r.tipo) || 0) + 1);
      const h = new Date(r.criado_em).getHours();
      byHour.set(h, (byHour.get(h) || 0) + 1);
    }

    const sort = (m: Map<any, number>) => [...m.entries()].sort((a, b) => b[1] - a[1]);

    // evolução últimos 30 dias
    const days: { day: string; total: number }[] = [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400_000);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const total = rows.filter((r) => r.criado_em.slice(0, 10) === key).length;
      days.push({ day: label, total });
    }

    const resolvidos = rows.filter((r) => r.resolvido || r.resolvido_em).length;
    const taxa = rows.length ? Math.round((resolvidos / rows.length) * 100) : 0;

    const topHour = sort(byHour)[0];
    const topTipo = sort(byTipo)[0];

    return {
      topStreets: sort(byStreet).slice(0, 5),
      topBairros: sort(byBairro).slice(0, 5),
      topTipo: topTipo ? { label: TIPO_LABEL[topTipo[0]] || topTipo[0], count: topTipo[1] } : null,
      topHour: topHour ? { hour: topHour[0], count: topHour[1] } : null,
      days,
      taxa,
      total: rows.length,
      resolvidos,
    };
  }, [rows]);

  return (
    <div className="space-y-6">
      {/* filtros de período */}
      <div className="flex gap-1.5 bg-white/5 rounded-full p-1 border border-white/10">
        {([
          { id: '7d', label: '7 dias' },
          { id: '30d', label: '30 dias' },
          { id: '3m', label: '3 meses' },
          { id: 'all', label: 'Tudo' },
        ] as const).map((opt) => (
          <button
            key={opt.id}
            onClick={() => setPeriod(opt.id)}
            className={cn(
              'flex-1 px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all',
              period === opt.id ? 'bg-primary text-white shadow' : 'text-text-muted'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* cards topo */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={<AlertTriangle size={16} />} label="Total" value={stats.total} tone="danger" />
            <StatCard icon={<CheckCircle2 size={16} />} label="Taxa Resolução" value={`${stats.taxa}%`} tone="success" />
            <StatCard
              icon={<Flame size={16} />}
              label="Tipo + comum"
              value={stats.topTipo ? `${stats.topTipo.label}` : '—'}
              sub={stats.topTipo ? `${stats.topTipo.count} ocorrências` : ''}
              tone="warning"
            />
            <StatCard
              icon={<Clock size={16} />}
              label="Horário + crítico"
              value={stats.topHour ? `${String(stats.topHour.hour).padStart(2, '0')}h` : '—'}
              sub={stats.topHour ? `${stats.topHour.count} alertas` : ''}
              tone="primary"
            />
          </div>

          {/* gráfico de linha 30 dias */}
          <div className="bg-bg-card border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-primary" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Evolução 30 dias</h4>
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.days} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: '#888', fontSize: 9 }} interval={4} />
                  <YAxis tick={{ fill: '#888', fontSize: 9 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 11 }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ranking ruas */}
          <RankCard
            title="🏆 Top 5 ruas com mais denúncias"
            items={stats.topStreets}
            emptyMsg="Sem dados de ruas (descrições muito curtas)"
          />

          {/* ranking bairros */}
          <RankCard
            title="🏘️ Top 5 bairros mais perigosos"
            items={stats.topBairros}
            emptyMsg="Sem dados de bairros no período"
            icon={<MapPin size={12} />}
          />
        </>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: any; sub?: string; tone: 'danger' | 'success' | 'warning' | 'primary' }) {
  const tones = {
    danger: 'bg-danger/10 border-danger/20 text-danger',
    success: 'bg-success/10 border-success/20 text-success',
    warning: 'bg-warning/10 border-warning/20 text-warning',
    primary: 'bg-primary/10 border-primary/20 text-primary',
  };
  return (
    <div className={cn('rounded-2xl p-4 border', tones[tone])}>
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <p className="text-[9px] font-black uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-xl font-black text-text-primary leading-tight">{value}</p>
      {sub && <p className="text-[9px] font-bold text-text-muted mt-0.5">{sub}</p>}
    </div>
  );
}

function RankCard({ title, items, emptyMsg, icon }: { title: string; items: [string, number][]; emptyMsg: string; icon?: React.ReactNode }) {
  const max = items[0]?.[1] || 1;
  return (
    <div className="bg-bg-card border border-white/5 rounded-2xl p-4">
      <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3">{title}</h4>
      {items.length === 0 ? (
        <p className="text-[10px] text-text-muted py-4 text-center">{emptyMsg}</p>
      ) : (
        <div className="space-y-2">
          {items.map(([name, count], i) => (
            <div key={name + i} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-text-primary truncate flex items-center gap-1.5">
                  <span className="text-[10px] text-text-muted font-black">#{i + 1}</span>
                  {icon}
                  {name}
                </span>
                <span className="font-black text-text-muted">{count}</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(count / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
