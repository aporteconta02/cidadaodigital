import { createFileRoute } from "@tanstack/react-router";
import { 
  Users, 
  ShoppingBag, 
  ShieldAlert, 
  Megaphone,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Clock
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

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const lineData = [
  { name: 'Sem 1', usuarios: 400 },
  { name: 'Sem 2', usuarios: 700 },
  { name: 'Sem 3', usuarios: 600 },
  { name: 'Sem 4', usuarios: 1200 },
  { name: 'Sem 5', usuarios: 1500 },
  { name: 'Sem 6', usuarios: 1400 },
  { name: 'Sem 7', usuarios: 1800 },
];

const pieData = [
  { name: 'Iluminação', value: 40, color: '#6C63FF' },
  { name: 'Buracos', value: 30, color: '#FF6B35' },
  { name: 'Lixo', value: 20, color: '#00D68F' },
  { name: 'Segurança', value: 10, color: '#FF3B5C' },
];

function AdminDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-space uppercase tracking-tight">Visão Geral</h2>
          <p className="text-text-muted text-sm font-bold uppercase tracking-widest mt-1">Status em tempo real da plataforma</p>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-95">
          Baixar Relatório
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Usuários" 
          value="12.482" 
          trend="+12%" 
          trendUp={true} 
          icon={<Users size={20} className="text-primary" />} 
          color="bg-primary/10" 
        />
        <KPICard 
          title="Pedidos Mês" 
          value="3.840" 
          trend="+8%" 
          trendUp={true} 
          icon={<ShoppingBag size={20} className="text-secondary" />} 
          color="bg-secondary/10" 
        />
        <KPICard 
          title="Ocorrências" 
          value="842" 
          trend="-2%" 
          trendUp={false} 
          icon={<Megaphone size={20} className="text-success" />} 
          color="bg-success/10" 
        />
        <KPICard 
          title="Alertas SOS" 
          value="12" 
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
            <h3 className="text-sm font-black uppercase tracking-widest text-text-muted italic">Crescimento de Usuários</h3>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary" />
              <span className="text-[10px] font-bold text-text-muted uppercase">Novos Cadastros</span>
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
              {[
                { name: "João Silva", email: "joao@exemplo.com", action: "Abriu denúncia: Buraco na via", status: "Pendente", date: "Há 2 min", color: "text-warning" },
                { name: "Maria Oliveira", email: "maria@exemplo.com", action: "Novo pedido no Marketplace", status: "Concluído", date: "Há 15 min", color: "text-success" },
                { name: "Carlos Souza", email: "carlos@exemplo.com", action: "Acionou SOS Emergência", status: "Crítico", date: "Há 45 min", color: "text-danger" },
                { name: "Ana Paula", email: "ana@exemplo.com", action: "Publicou novo aviso no Mural", status: "Aprovado", date: "Há 2h", color: "text-primary" },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-gradient-hero flex items-center justify-center text-[10px] font-black border border-white/10">
                        {row.name.charAt(0)}
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
