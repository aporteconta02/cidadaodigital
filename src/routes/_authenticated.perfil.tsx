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
  History,
  ShieldAlert,
  ShoppingBag,
  Bell,
  LockKeyhole,
  LogOut as LogOutIcon,
  Megaphone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
      
      if (!authUser) return;

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_id', authUser.id)
        .maybeSingle();

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
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setUser({
          ...user,
          assinante_plus: true,
          numero_membro: "00847",
          validade_assinatura: expiry.toISOString(),
          qr_code_token: "CIDADE-PLUS-00847"
        });
        toast.success("Assinatura Cidadão+ ativada!");
        return;
      }

      const { error } = await supabase
        .from('usuarios')
        .update({ 
          assinante_plus: true,
          numero_membro: "00847",
          validade_assinatura: expiry.toISOString(),
          qr_code_token: "CIDADE-PLUS-00847"
        })
        .eq('auth_id', session.user.id);

      if (error) throw error;
      await fetchProfile();
      toast.success("Bem-vindo ao Clube Cidadão+!");
    } catch (error) {
      toast.error("Erro ao ativar assinatura");
    } finally {
      setLoading(false);
    }
  };

  const saveCard = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current);
      const link = document.createElement('a');
      link.download = 'carteirinha-cidadao-plus.png';
      link.href = dataUrl;
      link.click();
      toast.success("Carteirinha salva na galeria!");
    } catch (err) {
      toast.error("Erro ao salvar imagem");
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-bg-primary pb-32">
      {/* Header Perfil - Estilo Nubank */}
      <div className="bg-gradient-hero p-8 pt-12 rounded-b-[40px] shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="relative group mb-4">
            <div className="size-24 rounded-full border-[3px] border-white shadow-xl overflow-hidden bg-white/20">
              {user?.avatar_url ? (
                <img src={user.avatar_url} className="size-full object-cover" alt="Perfil" />
              ) : (
                <div className="size-full flex items-center justify-center text-3xl font-black text-white">
                  {user?.nome.charAt(0)}
                </div>
              )}
            </div>
            <button className="absolute bottom-0 right-0 size-8 rounded-full bg-white flex items-center justify-center shadow-md text-primary">
              <Camera size={16} />
            </button>
          </div>
          
          <h2 className="text-xl font-bold text-white mb-1">{user?.nome}</h2>
          <p className="text-white/70 text-sm mb-4">{user?.cidade}, {user?.bairro}</p>
          
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            <Crown size={12} className="text-gold" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              {user?.assinante_plus ? 'MEMBRO PLUS' : 'MORADOR'}
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-8">
        {/* Carteirinha Digital */}
        <div className="mb-10">
          <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4 ml-2">Sua Carteirinha</h3>
          
          {user?.assinante_plus ? (
            <div className="perspective-1000">
              <motion.div
                ref={cardRef}
                onClick={() => setIsFlipped(!isFlipped)}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                className="relative w-full h-[200px] cursor-pointer"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* FRENTE */}
                <div 
                  className="absolute inset-0 rounded-[24px] p-6 text-white overflow-hidden shadow-2xl bg-gradient-to-br from-[#6C63FF] via-[#4A44CC] to-[#6C63FF] animate-shimmer-fast border border-white/10"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="absolute top-0 right-0 p-6 opacity-20">
                    <Shield size={80} strokeWidth={1} />
                  </div>
                  
                  <div className="flex flex-col h-full justify-between relative z-10">
                    <div className="flex justify-between items-start">
                      <span className="text-lg font-black italic tracking-tighter">CIDADÃO<span className="text-secondary">+</span></span>
                      <div className="size-8 rounded-md bg-gradient-gold opacity-80" /> {/* Chip */}
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-bold mb-0.5">{user.nome}</h4>
                      <p className="text-[10px] opacity-70 font-mono tracking-widest">Nº #{user.numero_membro || '00847'}</p>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[8px] uppercase tracking-widest opacity-50">Válido até</p>
                        <p className="text-xs font-mono">06/2027</p>
                      </div>
                      <div className="size-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                        <span className="text-[10px] font-black">C+</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* VERSO */}
                <div 
                  className="absolute inset-0 rounded-[24px] p-6 bg-white border border-border-custom flex flex-col items-center justify-center gap-3 shadow-2xl"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <div className="p-2 bg-white rounded-xl shadow-inner border border-gray-100">
                    <QRCodeSVG value={user.qr_code_token || "DEMO"} size={110} />
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight text-center">
                    Apresente para validar desconto
                  </p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); saveCard(); }}
                    className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-full bg-primary/5 border border-primary/10"
                  >
                    <Download size={14} />
                    Salvar
                  </button>
                </div>
              </motion.div>
            </div>
          ) : (
            <div 
              onClick={handleUpgrade}
              className="relative w-full h-[200px] rounded-[24px] border-2 border-dashed border-white/10 bg-bg-card flex flex-col items-center justify-center p-8 text-center gap-4 group cursor-pointer hover:border-primary/40 transition-all"
            >
              <div className="absolute inset-0 backdrop-blur-sm bg-black/20 rounded-[24px]" />
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-text-muted group-hover:text-primary transition-colors">
                  <LockKeyhole size={32} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-tight">Clube Cidadão+ Bloqueado</h4>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Assine para liberar benefícios</p>
                </div>
                <button className="bg-white text-black text-[10px] font-black px-6 py-2.5 rounded-full uppercase tracking-widest">
                  Desbloquear agora
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Seções de Perfil */}
        <div className="space-y-8">
          <ProfileSection title="Minha Atividade">
            <ProfileItem icon={<ShoppingBag className="text-primary" />} title="Meus Pedidos" sub="Histórico de compras" />
            <ProfileItem icon={<Megaphone className="text-secondary" />} title="Denúncias" sub="Minhas ocorrências" />
            <ProfileItem icon={<Calendar className="text-success" />} title="Meus Eventos" sub="Interesses e confirmados" />
            <ProfileItem icon={<ShieldAlert className="text-danger" />} title="Alertas" sub="Minhas contribuições" />
          </ProfileSection>

          <ProfileSection title="Meu Clube">
            <ProfileItem icon={<Ticket className="text-gold" />} title="Carteira de Benefícios" sub="Seu cartão virtual" />
            <ProfileItem icon={<Users className="text-primary" />} title="Parceiros" sub="Onde conseguir descontos" />
            <ProfileItem icon={<History className="text-text-secondary" />} title="Histórico" sub="Últimos usos do clube" />
          </ProfileSection>

          <ProfileSection title="Configurações">
            <ProfileItem icon={<UserIcon className="text-text-muted" />} title="Editar Perfil" />
            <ProfileItem icon={<Lock className="text-text-muted" />} title="Segurança" sub="Alterar senha" />
            <ProfileItem icon={<Shield className="text-text-muted" />} title="Vizinho Seguro" sub="Contatos de confiança" />
            <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group">
              <div className="size-10 rounded-xl bg-danger/10 flex items-center justify-center text-danger group-active:scale-90 transition-transform">
                <LogOutIcon size={20} />
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-sm font-bold text-danger">Sair da conta</h4>
              </div>
              <ChevronRight size={16} className="text-text-muted" />
            </button>
          </ProfileSection>
        </div>
      </div>
    </div>
  );
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2 mb-3 italic">{title}</h3>
      <div className="bg-bg-card rounded-3xl border border-white/5 overflow-hidden divide-y divide-white/5 shadow-sm">
        {children}
      </div>
    </div>
  );
}

function ProfileItem({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <button className="w-full flex items-center gap-4 p-4 hover:bg-white/5 active:bg-white/5 transition-all group">
      <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center group-active:scale-90 transition-transform">
        {icon}
      </div>
      <div className="flex-1 text-left">
        <h4 className="text-sm font-bold text-text-primary">{title}</h4>
        {sub && <p className="text-[10px] text-text-muted font-medium uppercase tracking-tight">{sub}</p>}
      </div>
      <ChevronRight size={16} className="text-text-muted group-hover:translate-x-1 transition-transform" />
    </button>
  );
}
