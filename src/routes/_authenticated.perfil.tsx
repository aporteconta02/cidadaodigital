import { useState, useEffect, useRef } from "react";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { 
  LogOut, 
  Settings, 
  Shield, 
  ChevronRight, 
  User as UserIcon, 
  CreditCard, 
  Package, 
  AlertTriangle, 
  Calendar, 
  Users, 
  Ticket,
  Lock,
  Download,
  QrCode,
  CheckCircle2,
  Crown,
  Camera,
  X,
  History
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/perfil")({
  component: PerfilPage,
});

type UserProfile = {
  id: string;
  auth_id: string;
  nome: string;
  email: string;
  cidade: string;
  bairro: string;
  tipo: string;
  assinante_plus: boolean | null;
  numero_membro: string | null;
  validade_assinatura: string | null;
  qr_code_token: string | null;
  avatar_url?: string | null;
};

function PerfilPage() {
  const { profile } = Route.useRouteContext();
  const navigate = useNavigate();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(profile as UserProfile);
  const [loading, setLoading] = useState(!profile);
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile) {
      setUser(profile as UserProfile);
      setLoading(false);
    } else {
      fetchProfile();
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const authUser = session?.user;
      
      if (!authUser) {
        // Fallback demo data removed for production consistency
        return;
      }

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_id', authUser.id)
        .single();

      if (error) throw error;
      setUser(data as UserProfile);

    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error("Erro ao carregar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const handleUpgrade = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Demo mode upgrade
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 30);
        setUser({
          ...user,
          assinante_plus: true,
          numero_membro: "00848",
          validade_assinatura: expiry.toISOString(),
          qr_code_token: "C+00848-demo-token"
        });
        toast.success("Assinatura Cidadão+ ativada (Demo)!");
        return;
      }

      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);

      const { error } = await supabase
        .from('usuarios')
        .update({ 
          assinante_plus: true,
          validade_assinatura: expiry.toISOString()
        })
        .eq('auth_id', session.user.id);

      if (error) throw error;
      
      await router.invalidate();
      await fetchProfile();
      toast.success("Bem-vindo ao Clube Cidadão+!");
    } catch (error) {
      console.error('Error upgrading:', error);
      toast.error("Erro ao ativar assinatura");
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file || !user) return;

      setLoading(true);
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Date.now()}.${fileExt}`;


      const { error: uploadError } = await supabase.storage
        .from('avatares')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatares')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      await router.invalidate();
      await fetchProfile();
      toast.success("Foto de perfil atualizada!");
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error("Erro no upload da foto");
    } finally {
      setLoading(false);
    }
  };

  const saveCard = async () => {
    if (!cardRef.current) return;
    
    try {
      const wasFlipped = isFlipped;
      if (wasFlipped) setIsFlipped(false);
      
      await new Promise(resolve => setTimeout(resolve, 300));

      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        style: {
          transform: 'scale(1)',
          borderRadius: '24px'
        }
      });
      
      const link = document.createElement('a');
      link.download = `carteirinha-${user?.nome || 'cidadao'}.png`;
      link.href = dataUrl;
      link.click();
      
      toast.success("Carteirinha salva com sucesso!");
      
      if (wasFlipped) setIsFlipped(true);
    } catch (err) {
      console.error('Error saving card:', err);
      toast.error("Erro ao salvar carteirinha");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-primary gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
        <p className="font-bold animate-pulse">Carregando perfil...</p>
      </div>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="p-6 space-y-8 pb-32 animate-in fade-in duration-500">
      {/* Validation Modal for Merchants */}
      <AnimatePresence>
        {(new URLSearchParams(window.location.search)).get('mode') === 'validate' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              onClick={() => navigate({ to: '/perfil' } as any)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-card border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black font-display uppercase tracking-tight">Validar Membro</h3>
                  <button onClick={() => navigate({ to: '/perfil' } as any)} className="size-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-background/50 border border-white/5 rounded-2xl p-6 text-center">
                    <QrCode size={48} className="mx-auto text-primary mb-4" />
                    <p className="text-sm font-bold text-muted-foreground mb-4">Aponte a câmera para o QR Code da carteirinha do cliente.</p>
                    <button className="w-full bg-primary text-primary-foreground font-black py-4 rounded-xl uppercase tracking-widest active:scale-95 transition-all">
                      Abrir Scanner
                    </button>
                  </div>
                  
                  {/* Mock Result for validation demo */}
                  <div className="bg-secondary/10 border border-secondary/20 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-black">JS</div>
                      <div>
                        <p className="font-bold text-white">João Silva</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-secondary">Assinante Ativo</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header Perfil */}
      <div className="flex items-center gap-6 py-6 border-b border-white/[0.05]">
        <div className="relative group">
          <div className="size-24 rounded-full bg-white/[0.03] border-2 border-white/[0.05] flex items-center justify-center overflow-hidden shadow-premium transition-transform duration-500 group-hover:scale-105">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.nome} className="size-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-primary/80 font-display italic">{user ? getInitials(user.nome) : '??'}</span>
            )}
          </div>
          <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full cursor-pointer backdrop-blur-sm">
            <Camera size={22} className="text-white animate-pulse" />
            <input type="file" className="hidden" accept="image/*" onChange={uploadAvatar} />
          </label>
          <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border-2 border-white/5">
            <div className="bg-primary size-7 rounded-full flex items-center justify-center text-primary-foreground shadow-glow">
              <CheckCircle2 size={14} fill="currentColor" />
            </div>
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold font-display tracking-tight leading-none mb-3 italic">{user?.nome || 'Usuário'}</h2>
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-[9px] font-black tracking-[0.15em] text-primary uppercase border border-primary/20">
              {user?.tipo || 'MORADOR'}
            </span>
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60 italic">{user?.cidade || 'Cidade'} — {user?.bairro || 'Bairro'}</span>
          </div>
        </div>
      </div>

      {/* Carteirinha Digital */}
      <div className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 italic ml-1">Membro Digital C+</h3>
        
        {user?.assinante_plus ? (
          <div className="perspective-1000">
            <motion.div
              ref={cardRef}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative w-full aspect-[1.6/1] cursor-pointer group"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              {/* Card Front */}
              <div 
                className="absolute inset-0 backface-hidden rounded-3xl overflow-hidden p-6 shadow-2xl bg-slate-950 border border-amber-500/30"
                style={{ backfaceVisibility: 'hidden' }}
              >
                {/* Background effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-primary/10" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full -mr-10 -mt-10" />
                <div className="absolute -inset-[2px] rounded-[26px] bg-gradient-to-r from-amber-500/50 via-amber-200/50 to-amber-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[2px] animate-shimmer" />

                <div className="relative h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500 font-black tracking-tighter text-xl italic">★ CIDADÃO+</span>
                    </div>
                    <div className="bg-white p-1 rounded-lg">
                      <QRCodeSVG value={user.qr_code_token || user.id} size={48} />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-auto">
                    <div className="size-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden text-amber-500 font-black text-xl">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.nome} className="size-full object-cover" />
                      ) : (
                        <span>{getInitials(user.nome)}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white leading-none mb-1 uppercase tracking-tight">{user.nome}</p>
                      <p className="text-[10px] font-medium text-amber-500/80 uppercase tracking-widest">{user.cidade} — {user.bairro}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Membro Nº</p>
                      <p className="text-sm font-mono text-white/90">#{user.numero_membro || '00847'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Válido até</p>
                      <p className="text-sm font-mono text-white/90">
                        {user.validade_assinatura ? new Date(user.validade_assinatura).toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }) : '07/2027'}
                      </p>
                    </div>
                    <div className="size-8 opacity-50 bg-amber-500/20 rounded-full flex items-center justify-center">
                      <span className="text-amber-500 font-black text-xs">C+</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Back */}
              <div 
                className="absolute inset-0 backface-hidden rounded-3xl overflow-hidden p-6 shadow-2xl bg-slate-900 border border-amber-500/30 flex flex-col items-center justify-center gap-4"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-primary/5" />
                <div className="relative bg-white p-4 rounded-2xl shadow-xl">
                  <QRCodeSVG value={user.qr_code_token || user.id} size={140} />
                </div>
                <p className="relative text-[10px] font-bold text-amber-500/60 uppercase tracking-widest text-center max-w-[200px]">
                  Apresente este QR Code em estabelecimentos parceiros para obter descontos.
                </p>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button 
                onClick={() => setIsFlipped(!isFlipped)}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest hover:bg-amber-500/20 transition-all"
              >
                <QrCode size={16} />
                {isFlipped ? 'Ver Frente' : 'Ver QR Code'}
              </button>
              <button 
                onClick={saveCard}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/5 border border-white/10 text-white/70 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                <Download size={16} />
                Salvar
              </button>
            </div>
          </div>
        ) : (
          <div 
            onClick={handleUpgrade}
            className="relative aspect-[1.6/1] rounded-[32px] overflow-hidden bg-white/[0.02] border border-dashed border-white/10 flex flex-col items-center justify-center p-8 text-center gap-5 group cursor-pointer hover:bg-white/[0.04] hover:border-primary/30 transition-all duration-700 shadow-premium"
          >
            <div className="size-16 rounded-3xl bg-white/5 flex items-center justify-center text-muted-foreground/40 group-hover:scale-110 group-hover:text-primary transition-all duration-500">
              <Lock size={32} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground/90 mb-2 uppercase tracking-tight italic">Clube Cidadão+ Bloqueado</p>
              <p className="text-[10px] text-muted-foreground font-medium max-w-[200px] leading-relaxed uppercase tracking-widest opacity-60">Assine para desbloquear benefícios e sua carteirinha premium.</p>
            </div>
            <button className="px-8 py-3 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-premium hover:scale-105 active:scale-95 transition-all duration-300">
              Desbloquear Agora
            </button>
          </div>
        )}
      </div>

      {/* Seções do perfil */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Central do Usuário</h3>
        <MenuButton icon={<Package size={18} />} label="Meus Pedidos" onClick={() => navigate({ to: '/comercio' })} />
        <MenuButton icon={<AlertTriangle size={18} />} label="Minhas Denúncias" onClick={() => navigate({ to: '/comunidade' })} />
        <MenuButton icon={<Calendar size={18} />} label="Meus Eventos" onClick={() => navigate({ to: '/comunidade' })} />
        <MenuButton icon={<Shield size={18} />} label="Meus Alertas de Segurança" onClick={() => navigate({ to: '/sos' })} />
        <MenuButton icon={<Users size={18} />} label="Contatos de Confiança" onClick={() => navigate({ to: '/sos' })} />
        <MenuButton icon={<Ticket size={18} />} label="Clube de Benefícios" />
        
        {/* Merchant validation panel if merchant */}
        {user?.tipo === 'COMERCIANTE' && (
          <div className="pt-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary ml-1 mb-2">Painel do Comerciante</h3>
            <MenuButton 
              icon={<QrCode size={18} />} 
              label="Validar Clube Cidadão+" 
              onClick={() => navigate({ to: '/perfil', search: { mode: 'validate' } } as any)} 
            />
          </div>
        )}

        <MenuButton icon={<Settings size={18} />} label="Configurações da Conta" />
        
        <div className="pt-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-sos/10 border border-sos/20 text-sos hover:bg-sos/20 transition-all group"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-bold font-display uppercase tracking-widest">Sair do App</span>
            </div>
          </button>
        </div>
      </div>
      
      <div className="text-center opacity-30 pt-4">
        <p className="text-[10px] font-bold uppercase tracking-widest">CIDADÃO+ v1.1.0</p>
      </div>
    </div>
  );
}

function MenuButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all duration-500 group active:scale-[0.98] shadow-soft"
    >
      <div className="flex items-center gap-4 text-foreground/80">
        <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500 group-hover:scale-110">
          {icon}
        </div>
        <span className="text-xs font-bold uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity italic">{label}</span>
      </div>
      <ChevronRight size={14} className="text-muted-foreground/40 group-hover:translate-x-1 group-hover:text-primary transition-all" />
    </button>
  );
}
