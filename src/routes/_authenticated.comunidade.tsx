import { createFileRoute } from "@tanstack/react-router";
import { 
  Plus, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Camera, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle,
  Megaphone,
  Calendar,
  ClipboardList,
  Vote,
  X,
  Navigation,
  Check,
  Phone,
  Search,
  MessageSquare,
  Filter,
  ShieldAlert,
  Heart
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/comunidade")({
  component: ComunidadePage,
});

type CityTab = 'denuncias' | 'eventos' | 'mural' | 'voz';
type MuralSubTab = 'avisos' | 'telefones';

const DENUNCIA_CATEGORIES = [
  { id: 'buraco', label: "Buraco", icon: "🕳️" },
  { id: 'lixo', label: "Lixo", icon: "🗑️" },
  { id: 'luz', label: "Iluminação", icon: "💡" },
  { id: 'vandalismo', label: "Vandalismo", icon: "🏚️" },
  { id: 'obra', label: "Obra", icon: "🚧" },
  { id: 'agua', label: "Água/Esgoto", icon: "🚰" },
  { id: 'animal', label: "Animais", icon: "🐕" },
  { id: 'outro', label: "Outro", icon: "⚠️" },
];

function ComunidadePage() {
  const [activeTab, setActiveTab] = useState<CityTab>('denuncias');
  const [showNewDenuncia, setShowNewDenuncia] = useState(false);
  const [denunciaStep, setDenunciaStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [successProtocol, setSuccessProtocol] = useState<string | null>(null);
  
  const [muralSubTab, setMuralSubTab] = useState<MuralSubTab>('avisos');
  const [muralFilter, setMuralFilter] = useState('Todos');
  const [telefonesSearch, setTelefonesSearch] = useState("");
  const [showNewAviso, setShowNewAviso] = useState(false);

  const resetDenuncia = () => {
    setDenunciaStep(1);
    setSelectedCategory(null);
    setShowNewDenuncia(false);
    setSuccessProtocol(null);
  };

  const handleNextStep = () => {
    if (denunciaStep < 5) {
      setDenunciaStep(denunciaStep + 1);
    } else {
      // Simulate submission
      const protocol = "CP" + Math.floor(100000 + Math.random() * 900000);
      setSuccessProtocol(protocol);
    }
  };

  return (
    <div className="pb-32 animate-in fade-in duration-500">
      {/* City Tabs Scroller */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md pt-4 pb-2">
        <div className="flex gap-2 overflow-x-auto px-6 scrollbar-hide">
          <CityTabButton 
            active={activeTab === 'denuncias'} 
            onClick={() => setActiveTab('denuncias')} 
            icon={<Megaphone size={16} />} 
            label="Denúncias" 
          />
          <CityTabButton 
            active={activeTab === 'eventos'} 
            onClick={() => setActiveTab('eventos')} 
            icon={<Calendar size={16} />} 
            label="Eventos" 
          />
          <CityTabButton 
            active={activeTab === 'mural'} 
            onClick={() => setActiveTab('mural')} 
            icon={<ClipboardList size={16} />} 
            label="Mural" 
          />
          <CityTabButton 
            active={activeTab === 'voz'} 
            onClick={() => setActiveTab('voz')} 
            icon={<Vote size={16} />} 
            label="Voz do Povo" 
          />
        </div>
      </div>

      <div className="px-6 py-6">
        {activeTab === 'denuncias' && (
          <div className="space-y-8">
            {/* My Denuncias */}
            <section>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Minhas Denúncias</h3>
              <div className="space-y-3">
                <DenunciaItem 
                  title="Buraco na via" 
                  status="Em análise" 
                  statusColor="bg-premium/10 text-premium" 
                  time="Há 2 dias"
                />
                <DenunciaItem 
                  title="Lâmpada Queimada" 
                  status="Resolvida" 
                  statusColor="bg-secondary/10 text-secondary" 
                  time="Há 1 semana"
                />
              </div>
            </section>

            {/* Public Feed */}
            <section>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Feed da Cidade</h3>
              <div className="space-y-4">
                {[
                  { cat: 'Lixo', loc: 'Rua Bela Cintra, 45', time: 'Há 10 min', img: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=300' },
                  { cat: 'Vandalismo', loc: 'Praça da Matriz', time: 'Há 1h', img: 'https://images.unsplash.com/photo-1579548122064-9da09ef830c2?q=80&w=300' },
                  { cat: 'Buraco', loc: 'Av. Brasil, 1200', time: 'Há 3h', img: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=300' },
                ].map((item, i) => (
                  <div key={i} className="bg-card border border-white/5 rounded-2xl overflow-hidden shadow-standard flex gap-4 p-3 hover:bg-card-hover transition-colors cursor-pointer">
                    <img src={item.img} className="size-20 rounded-xl object-cover" />
                    <div className="flex-1 py-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-sm">{item.cat}</h4>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight truncate">{item.loc}</p>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                        <Clock size={10} />
                        <span>{item.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Floating FAB */}
            <button 
              onClick={() => setShowNewDenuncia(true)}
              className="fixed bottom-24 right-6 size-16 rounded-2xl bg-primary text-primary-foreground shadow-2xl flex items-center justify-center active:scale-90 transition-all z-30"
            >
              <Plus size={32} strokeWidth={3} />
            </button>
          </div>
        )}

        {activeTab === 'eventos' && (
          <div className="space-y-8">
            {/* Featured Event */}
            <section>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Destaque do Bairro</h3>
              <div className="relative h-64 rounded-[32px] overflow-hidden border border-white/5 shadow-standard group">
                <img 
                  src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  alt="Evento Destaque"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6">
                  <div className="flex gap-2 mb-3">
                    <span className="bg-primary px-3 py-1 rounded-full text-[10px] font-black text-primary-foreground uppercase tracking-widest">Música</span>
                    <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/10">Sáb, 21:00</span>
                  </div>
                  <h4 className="text-2xl font-black font-display text-white uppercase tracking-tighter leading-none mb-1">Show na Praça Central</h4>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Praça das Flores, S/N</p>
                </div>
              </div>
            </section>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {['Hoje', 'Esta semana', 'Este mês', 'Todos'].map((filter, i) => (
                <button 
                  key={i}
                  className={cn(
                    "whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    i === 0 ? "bg-white/10 text-white" : "text-muted-foreground hover:bg-white/5"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Event List */}
            <div className="space-y-4">
              {[
                { title: 'Feira de Adoção', date: '14 Jun • 10:00', loc: 'Parque Ibirapuera', cat: 'Pets', img: 'https://images.unsplash.com/photo-1548199973-03c40e556509?q=80&w=300' },
                { title: 'Yoga Coletivo', date: '15 Jun • 08:30', loc: 'Gramado Central', cat: 'Saúde', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=300' },
                { title: 'Cinema de Rua', date: '16 Jun • 19:30', loc: 'Rua das Flores', cat: 'Cultura', img: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=300' },
              ].map((event, i) => (
                <div key={i} className="bg-card border border-white/5 rounded-2xl overflow-hidden shadow-standard flex gap-4 p-3 hover:bg-card-hover transition-colors cursor-pointer">
                  <img src={event.img} className="size-20 rounded-xl object-cover" />
                  <div className="flex-1 py-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm truncate pr-2">{event.title}</h4>
                        <span className="text-[8px] font-black uppercase tracking-widest text-primary shrink-0">{event.cat}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight truncate">{event.loc}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-secondary font-black uppercase tracking-widest">
                      <Calendar size={10} />
                      <span>{event.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Floating FAB for Events */}
            <button 
              onClick={() => setShowNewDenuncia(true)}
              className="fixed bottom-24 right-6 size-16 rounded-2xl bg-secondary text-secondary-foreground shadow-2xl flex items-center justify-center active:scale-90 transition-all z-30"
            >
              <Plus size={32} strokeWidth={3} />
            </button>
          </div>
        )}

        {activeTab === 'voz' && (
          <div className="space-y-8">
            <header className="flex items-center gap-4 bg-primary/5 p-6 rounded-[32px] border border-primary/10 mb-2">
              <div className="size-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary text-3xl">🗳️</div>
              <div>
                <h3 className="text-lg font-black font-display uppercase tracking-tight leading-tight">Voz do Povo</h3>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Sua opinião constrói a cidade</p>
              </div>
            </header>

            <section>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Pesquisas Ativas</h3>
              <div className="space-y-4">
                {[
                  { 
                    id: 1, 
                    title: 'Nova Ciclovia na Av. Brasil', 
                    cat: 'Mobilidade', 
                    votes: 1240, 
                    days: 3, 
                    progress: 65,
                    color: 'text-blue-400 bg-blue-400/10'
                  },
                  { 
                    id: 2, 
                    title: 'Reforma do Parque da Matriz', 
                    cat: 'Lazer', 
                    votes: 856, 
                    days: 5, 
                    progress: 40,
                    color: 'text-secondary bg-secondary/10'
                  },
                ].map((poll) => (
                  <div key={poll.id} className="bg-card border border-white/5 rounded-3xl p-5 shadow-standard">
                    <div className="flex justify-between items-start mb-4">
                      <span className={cn("px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest", poll.color)}>
                        {poll.cat}
                      </span>
                      <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                        <Clock size={10} />
                        <span>Encerra em {poll.days} dias</span>
                      </div>
                    </div>
                    
                    <h4 className="font-bold text-base mb-4 leading-tight">{poll.title}</h4>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <span>Progresso da meta</span>
                        <span>{poll.progress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${poll.progress}%` }}
                          className="h-full bg-primary"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{poll.votes} votos registrados</span>
                      <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-standard active:scale-95 transition-all">
                        Votar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Encerradas</h3>
              <div className="bg-card/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between opacity-60">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-xl">🌳</div>
                  <div>
                    <h4 className="text-xs font-bold">Plantio de Árvores</h4>
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Aprovado com 82%</p>
                  </div>
                </div>
                <button className="text-[9px] font-black uppercase tracking-widest text-primary">Resultado</button>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'mural' && (
          <div className="space-y-6">
            {/* Sub-tabs */}
            <div className="flex bg-card/50 p-1.5 rounded-2xl border border-white/5 mb-6">
              <button 
                onClick={() => setMuralSubTab('avisos')}
                className={cn(
                  "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  muralSubTab === 'avisos' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-white/5"
                )}
              >
                Mural de Avisos
              </button>
              <button 
                onClick={() => setMuralSubTab('telefones')}
                className={cn(
                  "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  muralSubTab === 'telefones' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-white/5"
                )}
              >
                Telefones Úteis
              </button>
            </div>

            {muralSubTab === 'avisos' ? (
              <div className="space-y-8 pb-12">
                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {['Todos', 'Pets', 'Emprego', 'Venda', 'Alerta', 'Geral'].map((f) => (
                    <button 
                      key={f} 
                      onClick={() => setMuralFilter(f)}
                      className={cn(
                        "whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        muralFilter === f ? "bg-white/10 text-white" : "text-muted-foreground hover:bg-white/5"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {/* Feed */}
                <div className="space-y-4">
                  {[
                    { type: 'Pets', title: 'Gato desaparecido', text: 'Gato cinza sumiu na Rua das Flores ontem à tarde.', neighborhood: 'Jardim Paulista', time: 'Há 20 min', icon: '🐾', color: 'bg-orange-500/10 text-orange-500' },
                    { type: 'Emprego', title: 'Vaga para Garçom', text: 'Restaurante Sabor Mineiro está contratando urgente.', neighborhood: 'Centro', time: 'Há 2h', icon: '💼', color: 'bg-blue-500/10 text-blue-500' },
                    { type: 'Venda', title: 'Bicicleta Caloi Aro 29', text: 'Pouco uso, estado de nova. Preço a combinar.', neighborhood: 'Vila Mariana', time: 'Há 5h', icon: '🛒', color: 'bg-green-500/10 text-green-500' },
                    { type: 'Alerta', title: 'Falta de água amanhã', text: 'Sabesp informa manutenção programada na rede local.', neighborhood: 'Bairro Alto', time: 'Há 10h', icon: '⚠️', color: 'bg-red-500/10 text-red-500' },
                  ].filter(item => muralFilter === 'Todos' || item.type === muralFilter).map((aviso, i) => (
                    <div key={i} className="bg-card border border-white/5 rounded-3xl p-5 shadow-standard">
                      <div className="flex justify-between items-start mb-4">
                        <span className={cn("px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1", aviso.color)}>
                          <span>{aviso.icon}</span>
                          {aviso.type}
                        </span>
                        <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{aviso.time}</span>
                      </div>
                      <h4 className="font-bold text-base mb-2">{aviso.title}</h4>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{aviso.text}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          <MapPin size={10} />
                          <span>{aviso.neighborhood}</span>
                        </div>
                        <button className="text-primary hover:text-primary/80 transition-colors">
                          <MessageSquare size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* FAB for Avisos */}
                <button 
                  onClick={() => setShowNewAviso(true)}
                  className="fixed bottom-24 right-6 size-16 rounded-2xl bg-primary text-primary-foreground shadow-2xl flex items-center justify-center active:scale-90 transition-all z-30"
                >
                  <Plus size={32} strokeWidth={3} />
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input 
                    type="text" 
                    placeholder="Buscar serviço ou telefone..." 
                    value={telefonesSearch}
                    onChange={(e) => setTelefonesSearch(e.target.value)}
                    className="w-full bg-card border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>

                {/* Emergências Section */}
                <section>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Emergências</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Polícia', phone: '190', icon: <ShieldAlert size={20} />, color: 'bg-red-500' },
                      { label: 'Bombeiros', phone: '193', icon: '🚒', color: 'bg-orange-500' },
                      { label: 'SAMU', phone: '192', icon: '🚑', color: 'bg-red-600' },
                      { label: 'CVV', phone: '188', icon: <Heart size={20} />, color: 'bg-blue-500' },
                    ].map((item, i) => (
                      <a 
                        key={i} 
                        href={`tel:${item.phone}`}
                        className="bg-card border border-white/5 p-4 rounded-2xl flex items-center gap-3 shadow-standard active:scale-95 transition-all"
                      >
                        <div className={cn("size-10 rounded-xl flex items-center justify-center text-white", item.color)}>
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-widest">{item.label}</h4>
                          <span className="text-lg font-black text-foreground">{item.phone}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>

                {/* Serviços da Cidade */}
                <section>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Serviços da Cidade</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Prefeitura', category: 'Administração', phone: '156' },
                      { name: 'Defesa Civil', category: 'Segurança', phone: '199' },
                      { name: 'Iluminação Pública', category: 'Serviços', phone: '0800 123 4567' },
                      { name: 'Coleta de Lixo', category: 'Serviços', phone: '0800 765 4321' },
                      { name: 'Centro de Zoonoses', category: 'Saúde/Pet', phone: '1234-5678' },
                      { name: 'Conselho Tutelar', category: 'Social', phone: '1234-9999' },
                    ].filter(s => s.name.toLowerCase().includes(telefonesSearch.toLowerCase()) || s.category.toLowerCase().includes(telefonesSearch.toLowerCase())).map((service, i) => (
                      <div key={i} className="bg-card border border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-standard">
                        <div>
                          <h4 className="font-bold text-sm mb-1">{service.name}</h4>
                          <div className="flex items-center gap-2">
                             <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 text-muted-foreground">
                              {service.category}
                            </span>
                            <span className="text-[10px] text-primary font-black uppercase tracking-widest">{service.phone}</span>
                          </div>
                        </div>
                        <a 
                          href={`tel:${service.phone}`}
                          className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center active:scale-90 transition-all"
                        >
                          <Phone size={18} />
                        </a>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Denuncia Modal Flow */}
      <Modal show={showNewDenuncia} onClose={resetDenuncia}>
        {!successProtocol ? (
          <div className="p-2">
            {/* Steps Progress */}
            <div className="flex gap-1.5 mb-8">
              {[1, 2, 3, 4, 5].map((s) => (
                <div 
                  key={s} 
                  className={cn(
                    "h-1 rounded-full flex-1 transition-all duration-300",
                    s <= denunciaStep ? "bg-primary" : "bg-muted-foreground/20"
                  )} 
                />
              ))}
            </div>

            <h3 className="text-xl font-black font-display uppercase tracking-tight mb-6">
              {denunciaStep === 1 && "Escolha a Categoria"}
              {denunciaStep === 2 && "Tire uma Foto"}
              {denunciaStep === 3 && "Localização"}
              {denunciaStep === 4 && "Descrição"}
              {denunciaStep === 5 && "Revisar e Enviar"}
            </h3>

            {/* Step 1: Category */}
            {denunciaStep === 1 && (
              <div className="grid grid-cols-4 gap-3 mb-8">
                {DENUNCIA_CATEGORIES.map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
                      selectedCategory === cat.id ? "bg-primary/10 border-primary text-primary" : "bg-card border-white/5 text-muted-foreground"
                    )}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-[9px] font-black uppercase tracking-tight text-center">{cat.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Photo */}
            {denunciaStep === 2 && (
              <div className="space-y-4 mb-8">
                <div className="aspect-square rounded-3xl bg-background border border-dashed border-white/10 flex flex-col items-center justify-center text-muted-foreground group hover:border-primary/50 transition-colors cursor-pointer">
                   <Camera size={48} className="mb-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                   <span className="text-xs font-black uppercase tracking-widest">Abrir Câmera</span>
                </div>
                <button className="w-full py-4 rounded-2xl bg-card border border-white/5 flex items-center justify-center gap-3 text-sm font-bold">
                   <ImageIcon size={18} />
                   Escolher da Galeria
                </button>
              </div>
            )}

            {/* Step 3: Location */}
            {denunciaStep === 3 && (
              <div className="space-y-6 mb-8">
                <div className="h-40 bg-background rounded-2xl border border-white/5 overflow-hidden relative">
                   {/* Mini Map Placeholder */}
                   <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                      <MapPin size={32} className="text-primary animate-bounce" />
                   </div>
                </div>
                <div className="space-y-3">
                   <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                      <input 
                        defaultValue="Rua Bela Cintra, 1200 - Consolação"
                        className="w-full bg-card border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold"
                      />
                   </div>
                   <p className="text-[10px] text-muted-foreground font-bold uppercase text-center">GPS acionado automaticamente</p>
                </div>
              </div>
            )}

            {/* Step 4: Description */}
            {denunciaStep === 4 && (
              <div className="mb-8">
                <textarea 
                  placeholder="Conte-nos mais detalhes (opcional)..."
                  className="w-full bg-background border border-white/5 rounded-2xl p-6 text-sm font-bold min-h-[160px] focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
            )}

            {/* Step 5: Review */}
            {denunciaStep === 5 && (
              <div className="space-y-4 mb-8">
                 <ReviewItem label="Categoria" value={DENUNCIA_CATEGORIES.find(c => c.id === selectedCategory)?.label || "Outro"} />
                 <ReviewItem label="Local" value="Rua Bela Cintra, 1200" />
                 <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-1">Dica do Cidadão+</p>
                    <p className="text-xs text-muted-foreground">Denúncias com fotos claras são resolvidas 40% mais rápido.</p>
                 </div>
              </div>
            )}

            <div className="flex gap-3">
              {denunciaStep > 1 && (
                <button 
                  onClick={() => setDenunciaStep(denunciaStep - 1)}
                  className="flex-1 py-5 rounded-2xl bg-card border border-white/5 text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
                >
                  Voltar
                </button>
              )}
              <button 
                onClick={handleNextStep}
                disabled={denunciaStep === 1 && !selectedCategory}
                className={cn(
                  "flex-[2] py-5 rounded-2xl font-black uppercase tracking-widest shadow-standard active:scale-95 transition-all",
                  denunciaStep === 1 && !selectedCategory ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
                )}
              >
                {denunciaStep === 5 ? "Enviar Denúncia" : "Continuar"}
              </button>
            </div>
          </div>
        ) : (
          /* Success Screen */
          <div className="text-center py-6">
            <div className="size-20 rounded-full bg-secondary/20 flex items-center justify-center text-secondary mx-auto mb-6 shadow-[0_0_40px_rgba(0,232,122,0.15)]">
               <Check size={48} strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-black font-display uppercase tracking-tight mb-2">Denúncia Enviada!</h3>
            <p className="text-muted-foreground text-sm mb-8">Nossa equipe já recebeu sua solicitação. Você pode acompanhar o progresso na aba "Minhas Denúncias".</p>
            
            <div className="bg-background/50 border border-white/5 rounded-2xl p-4 mb-8">
               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Protocolo</span>
               <span className="text-xl font-black text-primary tracking-widest">{successProtocol}</span>
            </div>

            <button 
              onClick={resetDenuncia}
              className="w-full bg-primary text-primary-foreground font-black py-5 rounded-2xl shadow-standard uppercase tracking-widest active:scale-95 transition-all"
            >
              Concluir
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function CityTabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "whitespace-nowrap flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
        active ? "bg-primary border-primary text-primary-foreground shadow-standard" : "bg-card border-white/5 text-muted-foreground hover:bg-white/5"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function DenunciaItem({ title, status, statusColor, time }: { title: string, status: string, statusColor: string, time: string }) {
  return (
    <div className="bg-card border border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-standard">
      <div>
        <h4 className="font-bold text-sm mb-1">{title}</h4>
        <div className="flex items-center gap-3">
           <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded", statusColor)}>
            {status}
          </span>
          <span className="text-[9px] text-muted-foreground font-bold">{time}</span>
        </div>
      </div>
      <ChevronRight size={18} className="text-muted-foreground opacity-30" />
    </div>
  );
}

function ReviewItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-white/5">
       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
       <span className="text-xs font-bold text-foreground">{value}</span>
    </div>
  );
}

function Modal({ show, onClose, children }: { show: boolean, onClose: () => void, children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="w-full max-w-lg bg-card border border-white/10 rounded-[32px] p-8 relative z-10 shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 size-10 rounded-full bg-background border border-white/5 flex items-center justify-center text-muted-foreground"
            >
              <X size={20} />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
