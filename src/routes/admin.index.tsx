import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  ShoppingBag,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Star,
  Package,
  AlertTriangle,
  Check,
  X,
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
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

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
    pendencias: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lineData, setLineData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [atividades, setAtividades] = useState<any[]>([]);
  const [lojasPendentes, setLojasPendentes] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [
        { count: userCount },
        { count: subCount },
        { count: lojaCount },
        { count: pedidoHojeCount },
        { count: lojasPend },
        { count: eventosPend },
        { count: denunciasAbertas },
      ] = await Promise.all([
        supabase.from("usuarios").select("*", { count: "exact", head: true }),
        supabase.from("usuarios").select("*", { count: "exact", head: true }).eq("assinante_plus", true),
        supabase.from("lojas").select("*", { count: "exact", head: true }).eq("aprovada", true),
        supabase.from("pedidos").select("*", { count: "exact", head: true }).gte("criado_em", new Date().toISOString().split("T")[0]),
        supabase.from("lojas").select("*", { count: "exact", head: true }).eq("aprovada", false),
        supabase.from("eventos").select("*", { count: "exact", head: true }).eq("aprovado", false),
        supabase.from("denuncias").select("*", { count: "exact", head: true }).eq("status", "enviada"),
      ]);

      setStats({
        totalUsuarios: userCount || 0,
        assinantes: subCount || 0,
        lojasAtivas: lojaCount || 0,
        pedidosHoje: pedidoHojeCount || 0,
        receitaEstimada: (subCount || 0) * 9.9,
        pendencias: (lojasPend || 0) + (eventosPend || 0) + (denunciasAbertas || 0),
      });

      // 7 dias
      const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
      const chartData = await Promise.all(
        days.map(async (day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const { count } = await supabase
            .from("usuarios")
            .select("*", { count: "exact", head: true })
            .gte("criado_em", `${dateStr}T00:00:00`)
            .lte("criado_em", `${dateStr}T23:59:59`);
          return { name: format(day, "EEE", { locale: ptBR }), usuarios: count || 0 };
        })
      );
      setLineData(chartData);

      // Pie
      const { data: denuncias } = await supabase.from("denuncias").select("categoria");
      const counts: Record<string, number> = {};
      denuncias?.forEach((d) => {
        counts[d.categoria] = (counts[d.categoria] || 0) + 1;
      });
      const colors = ["#0095F6", "#833AB4", "#1DB954", "#ED4956", "#FDCB58", "#00376B"];
      setPieData(
        Object.entries(counts).map(([name, value], i) => ({
          name,
          value,
          color: colors[i % colors.length],
        }))
      );

      // Atividades
      const { data: recent } = await supabase
        .from("usuarios")
        .select("*")
        .order("criado_em", { ascending: false })
        .limit(8);
      setAtividades(
        recent?.map((u) => ({
          name: u.nome,
          email: u.email,
          action: "Novo cadastro",
          type: u.tipo,
          status: u.ativo ? "Ativo" : "Inativo",
          date: u.criado_em ? format(new Date(u.criado_em), "dd/MM HH:mm") : "--",
        })) || []
      );

      // Lojas pendentes
      const { data: lojas } = await supabase
        .from("lojas")
        .select("id, nome, categoria, cidade")
        .eq("aprovada", false)
        .limit(5);
      setLojasPendentes(lojas || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const aprovarLoja = async (id: string, aprovada: boolean) => {
    const { error } = await supabase.from("lojas").update({ aprovada, ativo: aprovada }).eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar loja");
      return;
    }
    toast.success(aprovada ? "Loja aprovada" : "Loja rejeitada");
    fetchData();
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-admin-border-light rounded-lg w-1/3" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-admin-surface border border-admin-border rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    { label: "Total de Usuários", value: stats.totalUsuarios, trend: "+5%", up: true, icon: Users, color: "bg-admin-primary/10 text-admin-primary" },
    { label: "Assinantes Clube+", value: stats.assinantes, trend: "+8%", up: true, icon: Star, color: "bg-admin-purple/10 text-admin-purple" },
    { label: "Lojas Ativas", value: stats.lojasAtivas, trend: "+2%", up: true, icon: ShoppingBag, color: "bg-admin-success/10 text-admin-success" },
    { label: "Pedidos Hoje", value: stats.pedidosHoje, trend: "+4", up: true, icon: Package, color: "bg-orange-100 text-orange-600" },
    { label: "Receita Estimada", value: `R$ ${stats.receitaEstimada.toFixed(2)}`, trend: "+12%", up: true, icon: DollarSign, color: "bg-admin-success/10 text-admin-success" },
    { label: "Pendências", value: stats.pendencias, trend: stats.pendencias > 0 ? "ação" : "ok", up: stats.pendencias === 0, icon: AlertTriangle, color: "bg-admin-danger/10 text-admin-danger" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-[20px] font-semibold text-admin-text">Dashboard</h2>
          <p className="text-sm text-admin-text-secondary mt-0.5">Status em tempo real da plataforma</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((k) => (
          <KPICard key={k.label} {...k} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-admin-surface border border-admin-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-admin-text">Novos Cadastros — Últimos 7 dias</h3>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-admin-primary" />
              <span className="text-xs text-admin-text-secondary">Cadastros</span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFEFEF" vertical={false} />
                <XAxis dataKey="name" stroke="#8E8E8E" fontSize={12} tickLine={false} axisLine={false} dy={8} />
                <YAxis stroke="#8E8E8E" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #DBDBDB", borderRadius: "8px", fontSize: 12 }}
                  labelStyle={{ color: "#262626", fontWeight: 600 }}
                />
                <Line
                  type="monotone"
                  dataKey="usuarios"
                  stroke="#0095F6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#0095F6", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-admin-surface border border-admin-border rounded-lg p-5">
          <h3 className="text-base font-semibold text-admin-text mb-4">Denúncias por Categoria</h3>
          <div className="h-64 w-full">
            {pieData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-admin-text-secondary">Sem dados</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #DBDBDB", borderRadius: "8px", fontSize: 12 }} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(v) => <span className="text-xs text-admin-text">{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Pendências + Atividade */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Atividade */}
        <div className="lg:col-span-2 bg-admin-surface border border-admin-border rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-admin-border-light flex items-center justify-between">
            <h3 className="text-base font-semibold text-admin-text">Atividade Recente</h3>
            <button className="text-xs font-semibold text-admin-primary hover:underline">Ver tudo</button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-admin-bg/40">
                <th className="px-5 py-3 text-left text-xs font-semibold text-admin-text-secondary uppercase tracking-wide">Usuário</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-admin-text-secondary uppercase tracking-wide">Ação</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-admin-text-secondary uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-admin-text-secondary uppercase tracking-wide">Data</th>
              </tr>
            </thead>
            <tbody>
              {atividades.map((row, i) => (
                <tr key={i} className="border-t border-admin-border-light hover:bg-admin-bg/60 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-admin-sidebar-active flex items-center justify-center text-xs font-semibold text-admin-text">
                        {row.name ? row.name.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-admin-text truncate">{row.name}</p>
                        <p className="text-xs text-admin-text-secondary truncate">{row.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-admin-text">{row.action}</td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold",
                        row.status === "Ativo" ? "bg-admin-success/10 text-admin-success" : "bg-admin-text-muted/20 text-admin-text-secondary"
                      )}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-admin-text-secondary">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} />
                      {row.date}
                    </div>
                  </td>
                </tr>
              ))}
              {atividades.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-admin-text-secondary">
                    Nenhuma atividade recente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Requer Atenção */}
        <div className="bg-admin-surface border border-admin-border rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-admin-border-light flex items-center gap-2">
            <AlertTriangle size={18} className="text-admin-warning" />
            <h3 className="text-base font-semibold text-admin-text">Requer Atenção</h3>
          </div>
          <div className="divide-y divide-admin-border-light">
            {lojasPendentes.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-admin-text-secondary">
                Nada pendente no momento ✅
              </div>
            ) : (
              lojasPendentes.map((l) => (
                <div key={l.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-admin-sidebar-active flex items-center justify-center">
                    <ShoppingBag size={16} className="text-admin-text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-admin-text truncate">{l.nome}</p>
                    <p className="text-xs text-admin-text-secondary truncate">
                      {l.categoria} {l.cidade ? `• ${l.cidade}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => aprovarLoja(l.id, true)}
                    className="size-8 rounded-lg bg-admin-success/10 text-admin-success hover:bg-admin-success/20 flex items-center justify-center transition-colors"
                    title="Aprovar"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => aprovarLoja(l.id, false)}
                    className="size-8 rounded-lg bg-admin-danger/10 text-admin-danger hover:bg-admin-danger/20 flex items-center justify-center transition-colors"
                    title="Rejeitar"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({
  label,
  value,
  trend,
  up,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  trend: string;
  up: boolean;
  icon: any;
  color: string;
}) {
  return (
    <div className="bg-admin-surface border border-admin-border rounded-lg p-5 transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between mb-3">
        <div className={cn("size-10 rounded-full flex items-center justify-center", color)}>
          <Icon size={20} strokeWidth={2} />
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded",
            up ? "text-admin-success bg-admin-success/10" : "text-admin-danger bg-admin-danger/10"
          )}
        >
          {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {trend}
        </span>
      </div>
      <p className="text-[32px] leading-none font-bold text-admin-text" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
        {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
      </p>
      <p className="text-sm text-admin-text-secondary mt-2">{label}</p>
    </div>
  );
}
