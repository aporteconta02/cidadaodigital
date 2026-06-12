import { createFileRoute } from "@tanstack/react-router";
import { 
  Users, 
  ShoppingBag, 
  ShieldAlert, 
  Megaphone,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Clock,
  DollarSign
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    assinantes: 0,
    lojasAtivas: 0,
    pedidosHoje: 0,
    receitaEstimada: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lineData, setLineData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [atividades, setAtividades] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Basic Stats
        const { count: userCount } = await supabase.from('usuarios').select('*', { count: 'exact', head: true });
        const { count: subCount } = await supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('assinante_plus', true);
        const { count: lojaCount } = await supabase.from('lojas').select('*', { count: 'exact', head: true }).eq('aprovada', true);
        const { count: pedidoHojeCount } = await supabase.from('pedidos').select('*', { count: 'exact', head: true }).gte('criado_em', new Date().toISOString().split('T')[0]);

        setStats({
          totalUsuarios: userCount || 0,
          assinantes: subCount || 0,
          lojasAtivas: lojaCount || 0,
          pedidosHoje: pedidoHojeCount || 0,
          receitaEstimada: (subCount || 0) * 9.90
        });

        // Line Chart Data (Last 7 days)
        const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
        const chartData = await Promise.all(days.map(async (day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const { count } = await supabase
            .from('usuarios')
            .select('*', { count: 'exact', head: true })
            .gte('criado_em', `${dateStr}T00:00:00`)
            .lte('criado_em', `${dateStr}T23:59:59`);
          return { name: format(day, 'dd/MM'), usuarios: count || 0 };
        }));
        setLineData(chartData);

        // Pie Chart Data (Denúncias by Categoria)
        const { data: denuncias } = await supabase.from('denuncias').select('categoria');
        const counts: Record<string, number> = {};
        denuncias?.forEach(d => {
          counts[d.categoria] = (counts[d.categoria] || 0) + 1;
        });
        const colors = ['#6C63FF', '#FF6B35', '#00D68F', '#FF3B5C', '#FFD700', '#00BFFF'];
        setPieData(Object.entries(counts).map(([name, value], i) => ({
          name,
          value,
          color: colors[i % colors.length]
        })));

        // Recent Activity
        const { data: recentUsers } = await supabase
          .from('usuarios')
          .select('*')
          .order('criado_em', { ascending: false })
          .limit(4);
        
        setAtividades(recentUsers?.map(u => ({
          name: u.nome,
          email: u.email,
          action: "Novo usuário cadastrado",
          status: u.ativo ? "Ativo" : "Inativo",
          date: u.criado_em ? format(new Date(u.criado_em), 'HH:mm') : '--:--',
          color: u.ativo ? "text-success" : "text-danger"
        })) || []);

      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-white/5 rounded-2xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 rounded-3xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-white/5 rounded-3xl" />
          <div className="h-80 bg-white/5 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-space uppercase tracking-tight">Visão Geral</h2>
          <p className="text-text-muted text-sm font-bold uppercase tracking-widest mt-1">Status em tempo real da plataforma</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-[#0A0A0F] border border-white/5 px-4 py-2 rounded-xl">
             <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Receita Recorrente</p>
             <p className="text-lg font-black text-primary">R$ {stats.receitaEstimada.toFixed(2)}</p>
          </div>
          <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-95">
            Baixar Relatório
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Usuários" 
          value={stats.totalUsuarios.toLocaleString()} 
          trend="+5%" 
          trendUp={true} 
          icon={<Users size={20} className="text-primary" />} 
          color="bg-primary/10" 
        />
        <KPICard 
          title="Assinantes Plus" 
          value={stats.assinantes.toLocaleString()} 
          trend="+8%" 
          trendUp={true} 
          icon={<DollarSign size={20} className="text-secondary" />} 
          color="bg-secondary/10" 
        />
        <KPICard 
          title="Lojas Ativas" 
          value={stats.lojasAtivas.toLocaleString()} 
          trend="+2%" 
          trendUp={true} 
          icon={<ShoppingBag size={20} className="text-success" />} 
          color="bg-success/10" 
        />
        <KPICard 
          title="Pedidos Hoje" 
          value={stats.pedidosHoje.toLocaleString()} 
          trend="+4" 
          trendUp={true} 
          icon={<ShieldAlert size={20} className="text-danger" />} 
          color="bg-danger/10" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-[#0A0A0F] border border-white/5 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-text-muted italic">Novos Usuários (7 dias)</h3>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary" />
              <span className="text-[10px] font-bold text-text-muted uppercase">Cadastros</span>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#4A4A6A" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#4A4A6A" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111118', border: '1px solid #2A2A3A', borderRadius: '12px' }}
                  itemStyle={{ color: '#6C63FF', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="usuarios" 
                  stroke="#6C63FF" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#6C63FF', strokeWidth: 2, stroke: '#0A0A0F' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-[#0A0A0F] border border-white/5 rounded-3xl p-6 shadow-xl">
          <h3 className="text-sm font-black uppercase tracking-widest text-text-muted italic mb-8">Denúncias por Categoria</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111118', border: '1px solid #2A2A3A', borderRadius: '12px' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle"
                  formatter={(value) => <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-[#0A0A0F] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-text-muted italic">Atividades Recentes</h3>
          <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Ver tudo</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-text-muted">Usuário</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-text-muted">Ação</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-text-muted">Status</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-text-muted">Data</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-text-muted"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {atividades.map((row, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-gradient-hero flex items-center justify-center text-[10px] font-black border border-white/10">
                        {row.name ? row.name.charAt(0) : '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold leading-none">{row.name}</p>
                        <p className="text-[10px] text-text-muted mt-1">{row.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-medium text-text-secondary">{row.action}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("text-[10px] font-black uppercase tracking-widest", row.color)}>{row.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-text-muted">
                      <Clock size={12} />
                      <span className="text-[10px] font-bold">{row.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-muted">
                      <ArrowUpRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, trend, trendUp, icon, color }: any) {
  return (
    <div className="bg-[#0A0A0F] border border-white/5 rounded-3xl p-6 shadow-xl hover-card-effect group">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("size-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", color)}>
          {icon}
        </div>
        <div className={cn(
          "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg bg-white/5",
          trendUp ? "text-success" : "text-danger"
        )}>
          {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic mb-1 opacity-60">{title}</p>
        <h4 className="text-3xl font-black font-space tracking-tighter italic">{value}</h4>
      </div>
    </div>
  );
}