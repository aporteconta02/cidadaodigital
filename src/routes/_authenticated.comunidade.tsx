import { createFileRoute } from "@tanstack/react-router";
import { 
  Plus, 
  MapPin, 
  Clock, 
  Megaphone,
  Calendar,
  ClipboardList,
  Vote,
  Phone,
  MessageSquare,
  Search,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Heart,
  Share2,
  AlertTriangle
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/comunidade")({
  component: ComunidadePage,
});

type CityTab = 'denuncias' | 'eventos' | 'voz' | 'mural' | 'telefones';

function ComunidadePage() {
  const [activeTab, setActiveTab] = useState<CityTab>('denuncias');

  const tabs: { id: CityTab; label: string }[] = [
    { id: 'denuncias', label: 'Denúncias' },
    { id: 'eventos', label: 'Eventos' },
    { id: 'voz', label: 'Voz do Povo' },
    { id: 'mural', label: 'Mural' },
    { id: 'telefones', label: 'Telefones' },
  ];

  return (
    <div className="pb-32 min-h-screen bg-bg-primary">
      {/* Twitter-style Sticky Tabs */}
      <div className="sticky top-0 z-30 bg-bg-primary/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex overflow-x-auto no-scrollbar px-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex-1 min-w-[100px] py-4 text-sm font-bold transition-colors text-center whitespace-nowrap",
                activeTab === tab.id ? "text-text-primary" : "text-text-muted hover:text-text-secondary"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'denuncias' && <DenunciasTab />}
            {activeTab === 'eventos' && <EventosTab />}
            {activeTab === 'voz' && <VozDoPovoTab />}
            {activeTab === 'mural' && <MuralTab />}
            {activeTab === 'telefones' && <TelefonesTab />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* FAB - Only for relevant tabs */}
      {['denuncias', 'mural'].includes(activeTab) && (
        <button className="fixed bottom-24 right-6 size-14 rounded-full bg-primary text-white shadow-[0_8px_24px_rgba(108,99,255,0.4)] flex items-center justify-center active:scale-90 transition-transform z-40">
          <Plus size={28} strokeWidth={3} />
        </button>
      )}
    </div>
  );
}

function DenunciasTab() {
  const items = [
    { id: 1, title: "Buraco na via", loc: "Rua Bela Cintra, 45", time: "Há 10 min", status: "Em análise", img: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=400" },
    { id: 2, title: "Lixo acumulado", loc: "Praça da Matriz", time: "Há 1h", status: "Pendente", img: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=400" },
    { id: 3, title: "Luz apagada", loc: "Av. Brasil, 1200", time: "Há 3h", status: "Concluído", img: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=400" },
  ];

  return (
    <div className="space-y-6">
      {items.map((item) => (
        <div key={item.id} className="bg-bg-card rounded-2xl overflow-hidden border border-white/5 shadow-sm active:scale-[0.98] transition-transform">
          <div className="relative h-40">
            <img src={item.img} className="w-full h-full object-cover" alt={item.title} />
            <div className="absolute top-3 right-3">
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg",
                item.status === 'Concluído' ? "bg-success" : item.status === 'Em análise' ? "bg-primary" : "bg-warning"
              )}>
                {item.status}
              </span>
            </div>
          </div>
          <div className="p-4">
            <h4 className="font-bold text-base mb-1">{item.title}</h4>
            <div className="flex items-center gap-1.5 text-text-muted mb-3">
              <MapPin size={14} className="text-primary" />
              <span className="text-xs font-medium">{item.loc}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold uppercase tracking-widest opacity-60">
              <Clock size={12} />
              <span>{item.time}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EventosTab() {
  const items = [
    { id: 1, title: "Show na Praça Central", date: "Sáb, 14 Jun • 21:00", loc: "Praça das Flores", cat: "Música", img: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800" },
    { id: 2, title: "Feira de Adoção Pet", date: "Dom, 15 Jun • 10:00", loc: "Parque Ibirapuera", cat: "Pets", img: "https://images.unsplash.com/photo-1548199973-03c40e556509?q=80&w=800" },
  ];

  return (
    <div className="space-y-6">
      {items.map((item) => (
        <div key={item.id} className="bg-bg-card rounded-2xl overflow-hidden border border-white/5 shadow-sm active:scale-[0.98] transition-transform group">
          <div className="relative h-44">
            <img src={item.img} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" alt={item.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-5">
              <div className="absolute top-3 left-3">
                <span className="bg-white px-3 py-1 rounded-lg text-[10px] font-black text-black uppercase tracking-widest">
                  {item.date}
                </span>
              </div>
              <h4 className="text-xl font-black font-space text-white uppercase tracking-tighter leading-tight">{item.title}</h4>
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">{item.loc}</p>
            </div>
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full">{item.cat}</span>
            <button className="bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors border border-white/10">
              Interesse
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function VozDoPovoTab() {
  const [voted, setVoted] = useState<number | null>(null);
  
  const polls = [
    { 
      id: 1, 
      title: "Nova Ciclovia na Av. Brasil", 
      options: [
        { label: "Sou a favor", percentage: 65 },
        { label: "Contra", percentage: 25 },
        { label: "Indiferente", percentage: 10 }
      ],
      votes: 1240,
      daysLeft: 3
    }
  ];

  return (
    <div className="space-y-8">
      <div className="bg-primary/5 p-6 rounded-[32px] border border-primary/10 mb-2">
        <h3 className="text-lg font-black font-space uppercase tracking-tight">Voz do Povo</h3>
        <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Sua opinião constrói a cidade</p>
      </div>

      {polls.map((poll) => (
        <div key={poll.id} className="bg-bg-card border border-white/5 rounded-3xl p-6 shadow-sm">
          <h4 className="font-bold text-lg mb-6 leading-tight">{poll.title}</h4>
          
          <div className="space-y-3 mb-6">
            {poll.options.map((opt, i) => (
              <button 
                key={i}
                onClick={() => setVoted(poll.id)}
                className="relative w-full h-12 rounded-xl bg-white/5 overflow-hidden group active:scale-[0.98] transition-transform"
              >
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: voted ? `${opt.percentage}%` : 0 }}
                  className="absolute inset-0 bg-primary/20 transition-all duration-1000"
                />
                <div className="absolute inset-0 px-4 flex items-center justify-between">
                  <span className="text-sm font-bold">{opt.label}</span>
                  {voted && <span className="text-sm font-black opacity-60">{opt.percentage}%</span>}
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">
            <span>{poll.votes} votos registrados</span>
            <div className="flex items-center gap-1 text-warning">
              <Clock size={12} />
              <span>{poll.daysLeft} dias restantes</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MuralTab() {
  const posts = [
    { id: 1, user: "Carlos S.", time: "Há 20 min", text: "Alguém sabe se a feira da Praça da Matriz vai acontecer amanhã mesmo com chuva?", likes: 12, comments: 4, cat: "Dúvida" },
    { id: 2, user: "Ana Paula", time: "Há 1h", text: "Encontrei uma chave de carro na Rua 15. Deixei no posto policial central.", likes: 45, comments: 8, cat: "Utilidade" },
    { id: 3, user: "Marcos V.", time: "Há 3h", text: "O pessoal do bairro está se organizando para um mutirão de limpeza no sábado. Quem topa?", likes: 89, comments: 24, cat: "Comunidade" },
  ];

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="bg-bg-card border-b border-white/5 p-5 active:bg-white/[0.02] transition-colors">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-gradient-hero flex items-center justify-center text-[10px] font-black">
                {post.user.charAt(0)}
              </div>
              <div>
                <h5 className="text-sm font-bold leading-none">{post.user}</h5>
                <span className="text-[10px] text-text-muted font-medium">{post.time}</span>
              </div>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-text-muted bg-white/5 px-2 py-1 rounded-md">{post.cat}</span>
          </div>
          
          <p className="text-sm leading-relaxed mb-4">{post.text}</p>
          
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-1.5 text-text-muted hover:text-danger transition-colors group">
              <Heart size={16} className="group-active:scale-125 transition-transform" />
              <span className="text-xs font-bold">{post.likes}</span>
            </button>
            <button className="flex items-center gap-1.5 text-text-muted hover:text-primary transition-colors">
              <MessageSquare size={16} />
              <span className="text-xs font-bold">{post.comments}</span>
            </button>
            <button className="ml-auto text-text-muted">
              <Share2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function TelefonesTab() {
  const groups = [
    {
      title: "Emergências",
      color: "text-danger bg-danger/10 border-danger/20",
      items: [
        { name: "Polícia Militar", tel: "190", emoji: "🚔" },
        { name: "SAMU", tel: "192", emoji: "🚑" },
        { name: "Bombeiros", tel: "193", emoji: "🚒" },
      ]
    },
    {
      title: "Utilidade Pública",
      color: "text-primary bg-primary/10 border-primary/20",
      items: [
        { name: "Defesa Civil", tel: "199", emoji: "🏗️" },
        { name: "Guarda Municipal", tel: "153", emoji: "👮" },
        { name: "Conselho Tutelar", tel: "(31) 3641-0000", emoji: "🏠" },
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {groups.map((group, i) => (
        <div key={i} className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic px-2">{group.title}</h3>
          <div className="space-y-3">
            {group.items.map((item, j) => (
              <div 
                key={j} 
                className={cn(
                  "bg-bg-card p-4 rounded-2xl flex items-center justify-between border border-white/5 shadow-sm active:scale-[0.98] transition-transform",
                  i === 0 && "border-l-4 border-l-danger"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">
                    {item.emoji}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{item.name}</h4>
                    <p className="text-xs text-text-muted font-medium">{item.tel}</p>
                  </div>
                </div>
                <a 
                  href={`tel:${item.tel}`}
                  className="bg-success text-white size-10 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                >
                  <Phone size={18} fill="currentColor" />
                </a>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
