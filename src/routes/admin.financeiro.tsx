import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Image as ImageIcon,
  ArrowUpRight,
  Clock,
  Calendar,
  CheckCircle2,
  PieChart as PieChartIcon
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth } from "date-fns";

export const Route = createFileRoute("/admin/financeiro")({
  component: AdminFinanceiro,
});

function AdminFinanceiro() {
  const [loading, setLoading] = useState(true);
  const [financeData, setFinanceData] = useState({
    receitaPlus: 0,
    totalAssinantes: 0,
    receitaBanners: 0,
    receitaComissoes: 0,
    totalVendasMarketplace: 0,
    assinantesRecentes: [] as any[]
  });

  useEffect(() => {
    async function fetchFinance() {
      try {
        setLoading(true);
        
        // Assinantes Plus
        const { data: assinantes, count: subCount } = await supabase
          .from('usuarios')
          .select('id, nome, email, validade_assinatura, criado_em', { count: 'exact' })
          .eq('assinante_plus', true)
          .order('criado_em', { ascending: false })
          .limit(5);

        // Banners (simulação de receita baseada em banners ativos)
        const { count: bannerCount } = await supabase
          .from('banners')
          .select('*', { count: 'exact', head: true })
          .eq('ativo', true);
        
        // Pedidos Marketplace do mês atual
        const start = startOfMonth(new Date()).toISOString();
        const end = endOfMonth(new Date()).toISOString();
        const { data: pedidos } = await supabase
          .from('pedidos')
          .select('total')
          .gte('criado_em', start)
          .lte('criado_em', end);

        const totalVendas = pedidos?.reduce((sum, p) => sum + Number(p.total), 0) || 0;

        setFinanceData({
          receitaPlus: (subCount || 0) * 9.90,
          totalAssinantes: subCount || 0,
          receitaBanners: (bannerCount || 0) * 150.00, // Estimativa R$150/banner
          receitaComissoes: totalVendas * 0.06,
          totalVendasMarketplace: totalVendas,
          assinantesRecentes: assinantes || []
        });

      } catch (error) {
        console.error("Erro ao carregar dados financeiros:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFinance();
  }, []);

  const kpis = [
    { 
      label: "Receita Recorrente (Plus)", 
      value: `R$ ${financeData.receitaPlus.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
      desc: `${financeData.totalAssinantes} Assinantes`,
      icon: <Users className="text-primary" />, 
      color: "bg-primary/10" 
    },
    { 
      label: "Receita Publicidade (Banners)", 
      value: `R$ ${financeData.receitaBanners.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
      desc: "Anúncios Ativos",
      icon: <ImageIcon className="text-secondary" />, 
      color: "bg-secondary/10" 
    },
    { 
      label: "Comissões Marketplace (6%)", 
      value: `R$ ${financeData.receitaComissoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
      desc: `Sobre R$ ${financeData.totalVendasMarketplace.toLocaleString()}`,
      icon: <ShoppingBag className="text-success" />, 
      color: "bg-success/10" 
    },
    { 
      label: "Receita Total Estimada", 
      value: `R$ ${(financeData.receitaPlus + financeData.receitaBanners + financeData.receitaComissoes).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
      desc: "Projeção Mensal",
      icon: <TrendingUp className="text-primary" />, 
      color: "bg-primary/10" 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold font-space uppercase tracking-tight">Financeiro</h2>
        <p className="text-text-muted text-sm font-bold uppercase tracking-widest mt-1">Visão consolidada de receitas e assinaturas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-[#0A0A0F] border border-white/5 rounded-3xl p-6 shadow-xl group hover-card-effect">
             <div className="flex items-center justify-between mb-4">
                <div className={cn("size-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", kpi.color)}>
                   {kpi.icon}
                </div>
                <ArrowUpRight size={18} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-text-muted italic mb-1 opacity-60">{kpi.label}</p>
             <h4 className="text-2xl font-black font-space tracking-tighter italic">{kpi.value}</h4>
             <p className="text-[10px] text-text-muted font-bold mt-2 uppercase tracking-widest">{kpi.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Subscribers List */}
         <div className="lg:col-span-2 bg-[#0A0A0F] border border-white/5 rounded-3xl overflow-hidden shadow-xl flex flex-col">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
               <h3 className="text-sm font-black uppercase tracking-widest text-text-muted italic">Assinantes Recentes</h3>
               <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Gerenciar Todos</button>
            </div>
            <div className="overflow-x-auto flex-1">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-white/[0.02]">
                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-text-muted">Usuário</th>
                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-text-muted">Status</th>
                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-text-muted">Início</th>
                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-text-muted">Validade</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {loading ? (
                        <tr><td colSpan={4} className="px-6 py-8 text-center animate-pulse text-text-muted">Carregando...</td></tr>
                     ) : financeData.assinantesRecentes.map((sub, i) => (
                        <tr key={sub.id} className="hover:bg-white/[0.01] transition-colors">
                           <td className="px-6 py-4">
                              <p className="text-sm font-bold">{sub.nome}</p>
                              <p className="text-[10px] text-text-muted">{sub.email}</p>
                           </td>
                           <td className="px-6 py-4">
                              <span className="px-2 py-0.5 bg-success/10 text-success border border-success/20 rounded-full text-[9px] font-black uppercase tracking-widest">Ativo</span>
                           </td>
                           <td className="px-6 py-4 text-xs text-text-secondary">
                              {format(new Date(sub.criado_em), 'dd/MM/yyyy')}
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-text-muted">
                                 <Clock size={12} />
                                 <span className="text-[10px] font-bold">{sub.validade_assinatura ? format(new Date(sub.validade_assinatura), 'dd/MM/yyyy') : '--'}</span>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Distribution Chart or Summary */}
         <div className="bg-[#0A0A0F] border border-white/5 rounded-3xl p-6 shadow-xl space-y-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-text-muted italic">Origem da Receita</h3>
            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Plus', value: financeData.receitaPlus, color: '#6C63FF' },
                    { name: 'Ads', value: financeData.receitaBanners, color: '#FF6B35' },
                    { name: 'Mktp', value: financeData.receitaComissoes, color: '#00D68F' }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4A4A6A', fontSize: 10, fontWeight: 'bold' }} />
                    <YAxis hide />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#111118', border: '1px solid #2A2A3A', borderRadius: '12px' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                       {[1, 2, 3].map((_, i) => (
                         <Cell key={i} fill={['#6C63FF', '#FF6B35', '#00D68F'][i]} />
                       ))}
                    </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                     <div className="size-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary"><DollarSign size={16} /></div>
                     <p className="text-xs font-bold">Ticket Médio Plus</p>
                  </div>
                  <p className="text-sm font-black italic">R$ 9,90</p>
               </div>
               <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                     <div className="size-8 rounded-xl bg-success/20 flex items-center justify-center text-success"><CheckCircle2 size={16} /></div>
                     <p className="text-xs font-bold">Taxa de Conversão</p>
                  </div>
                  <p className="text-sm font-black italic">4.2%</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}