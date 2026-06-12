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
  Megaphone,
  MapPin,
  Smartphone,
  ScanLine
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Html5QrcodeScanner } from "html5-qrcode";

export const Route = createFileRoute("/_authenticated/perfil")({
  component: PerfilPage,
});

function PerfilPage() {
  const { usuario, refreshUsuario } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isPartnersModalOpen, setIsPartnersModalOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Edit Profile State
  const [editForm, setEditForm] = useState({
    nome: usuario?.nome || "",
    telefone: usuario?.telefone || "",
    cidade: usuario?.cidade || "",
    bairro: usuario?.bairro || ""
  });

  // Password State
  const [passwords, setPasswords] = useState({
    atual: "",
    nova: "",
    confirmar: ""
  });

  // Partners State
  const [partners, setPartners] = useState<any[]>([]);

  useEffect(() => {
    if (usuario) {
      setEditForm({
        nome: usuario.nome,
        telefone: usuario.telefone,
        cidade: usuario.cidade,
        bairro: usuario.bairro
      });
    }
  }, [usuario]);

  const handleLogout = async () => {
    const confirm = window.confirm("Deseja sair da sua conta?");
    if (!confirm) return;
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !usuario) return;

    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${usuario.id}-${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('avatares')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('avatares')
        .getPublicUrl(data.path);

      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ avatar_url: publicUrl })
        .eq('id', usuario.id);

      if (updateError) throw updateError;
      
      await refreshUsuario();
      toast.success("Avatar atualizado!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao fazer upload do avatar");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!usuario) return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from('usuarios')
        .update({ 
          assinante_plus: true,
          validade_assinatura: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          numero_membro: usuario.numero_membro || `MBR${Math.floor(Math.random() * 90000) + 10000}`,
          qr_code_token: usuario.qr_code_token || crypto.randomUUID()
        })
        .eq('id', usuario.id);

      if (error) throw error;
      await refreshUsuario();
      toast.success("Bem-vindo ao Clube Cidadão+! 🎉");
    } catch (error) {
      toast.error("Erro ao ativar assinatura");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!usuario) return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from('usuarios')
        .update(editForm)
        .eq('id', usuario.id);

      if (error) throw error;
      await refreshUsuario();
      setIsEditModalOpen(false);
      toast.success("Perfil atualizado!");
    } catch (error) {
      toast.error("Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.nova !== passwords.confirmar) {
      return toast.error("As senhas não coincidem");
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password: passwords.nova });
      if (error) throw error;
      setIsSecurityModalOpen(false);
      setPasswords({ atual: "", nova: "", confirmar: "" });
      toast.success("Senha alterada com sucesso!");
    } catch (error) {
      toast.error("Erro ao alterar senha");
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    const { data } = await supabase
      .from('parceiros_clube')
      .select('*, lojas(*)')
      .eq('ativo', true);
    setPartners(data || []);
  };

  const startScanner = () => {
    setIsQRScannerOpen(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
      scanner.render(onScanSuccess, onScanError);
      
      async function onScanSuccess(decodedText: string) {
        scanner.clear();
        setIsQRScannerOpen(false);
        
        const { data: member, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('qr_code_token', decodedText)
          .maybeSingle();

        if (error || !member) {
          return toast.error("❌ QR Code inválido");
        }

        if (!member.assinante_plus) {
          return toast.error("⚠️ Assinatura inativa");
        }

        const validade = new Date(member.validade_assinatura as string);
        if (validade < new Date()) {
          return toast.warning("⚠️ Assinatura vencida");
        }

        toast.success(`✅ ${member.nome} — Membro #${member.numero_membro} — Válido até ${validade.toLocaleDateString()}`);
        
        // Log validation
        await supabase.from('validacoes_qr').insert({
          validador_id: usuario?.id as string,
          membro_id: member.id,
          resultado: 'sucesso'
        });
      }

      function onScanError(err: any) {
        // console.warn(err);
      }
    }, 100);
  };

  const saveCard = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current);
      const link = document.createElement('a');
      link.download = 'carteirinha-cidadao-plus.png';
      link.href = dataUrl;
      link.click();
      toast.success("Carteirinha salva!");
    } catch (err) {
      toast.error("Erro ao salvar imagem");
    }
  };

  if (!usuario) return null;

  return (
    <div className="min-h-screen bg-bg-primary pb-32">
      {/* Header Perfil */}
      <div className="bg-gradient-hero p-8 pt-12 rounded-b-[40px] shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="relative group mb-4">
            <div className="size-24 rounded-full border-[3px] border-white shadow-xl overflow-hidden bg-white/20 flex items-center justify-center">
              {usuario.avatar_url ? (
                <img src={usuario.avatar_url} className="size-full object-cover" alt="Perfil" />
              ) : (
                <span className="text-3xl font-black text-white">{usuario.nome.charAt(0)}</span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 size-8 rounded-full bg-white flex items-center justify-center shadow-md text-primary cursor-pointer active:scale-90 transition-transform">
              <Camera size={16} />
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
            </label>
          </div>
          
          <h2 className="text-xl font-bold text-white mb-1">{usuario.nome}</h2>
          <p className="text-white/70 text-sm mb-4">{usuario.cidade}, {usuario.bairro}</p>
          
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            <Crown size={12} className={usuario.assinante_plus ? "text-gold" : "text-white/40"} />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              {usuario.assinante_plus ? `MEMBRO PLUS #${usuario.numero_membro}` : 'MORADOR'}
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-8">
        {/* Carteirinha Digital */}
        <div className="mb-10">
          <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4 ml-2 italic">Sua Carteirinha</h3>
          
          {usuario.assinante_plus ? (
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
                  className="absolute inset-0 rounded-[24px] p-6 text-white overflow-hidden shadow-2xl bg-gradient-to-br from-[#6C63FF] via-[#4A44CC] to-[#6C63FF] border border-white/10"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="absolute top-0 right-0 p-6 opacity-20">
                    <Shield size={80} strokeWidth={1} />
                  </div>
                  
                  <div className="flex flex-col h-full justify-between relative z-10">
                    <div className="flex justify-between items-start">
                      <span className="text-lg font-black italic tracking-tighter">CIDADÃO<span className="text-secondary">+</span></span>
                      <div className="size-8 rounded-md bg-gradient-gold opacity-80" />
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-bold mb-0.5">{usuario.nome}</h4>
                      <p className="text-[10px] opacity-70 font-mono tracking-widest">Nº #{usuario.numero_membro || ''}</p>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[8px] uppercase tracking-widest opacity-50">Válido até</p>
                        <p className="text-xs font-mono">{usuario.validade_assinatura ? new Date(usuario.validade_assinatura as string).toLocaleDateString() : '--/--/----'}</p>
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
                        <QRCodeSVG value={(usuario.qr_code_token as string) || "DEMO"} size={110} />
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
              className="relative w-full h-[200px] rounded-[24px] border-2 border-dashed border-white/10 bg-bg-card flex flex-col items-center justify-center p-8 text-center gap-4 group cursor-pointer hover:border-primary/40 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 backdrop-blur-sm bg-black/40" />
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-text-muted group-hover:text-primary transition-colors">
                  <LockKeyhole size={32} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-tight">Clube Cidadão+ Bloqueado</h4>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1 italic">Assine por apenas R$ 9,90/mês</p>
                </div>
                <button className="bg-primary text-white text-[10px] font-black px-6 py-2.5 rounded-full uppercase tracking-widest shadow-glow">
                  Ativar agora
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Botão de Validar QR (Só Comerciantes) */}
        {usuario.tipo === 'comerciante' && (
          <div className="mb-8">
            <button 
              onClick={startScanner}
              className="w-full py-4 bg-secondary text-white rounded-3xl flex items-center justify-center gap-3 shadow-glow-secondary animate-pulse-slow"
            >
              <ScanLine size={24} />
              <span className="font-black uppercase tracking-widest text-sm italic">Validar Clube</span>
            </button>
          </div>
        )}

        {/* Seções de Perfil */}
        <div className="space-y-8">
          <ProfileSection title="Minha Atividade">
            <ProfileItem 
              icon={<ShoppingBag className="text-primary" />} 
              title="Meus Pedidos" 
              sub="Histórico de compras" 
              onClick={() => navigate({ to: "/comercio" })}
            />
            {usuario.tipo === 'comerciante' && (
              <ProfileItem 
                icon={<Store className="text-secondary" />} 
                title="Minha Loja" 
                sub="Gerenciar produtos e pedidos" 
                onClick={() => navigate({ to: "/comercio" })}
              />
            )}
            <ProfileItem 
              icon={<Megaphone className="text-secondary" />} 
              title="Minhas Denúncias" 
              sub="Acompanhe seus relatos" 
              onClick={() => navigate({ to: "/comunidade" })}
            />
          </ProfileSection>

          <ProfileSection title="Meu Clube">
            <ProfileItem 
              icon={<Users className="text-gold" />} 
              title="Parceiros do Clube" 
              sub="Onde conseguir descontos" 
              onClick={() => { fetchPartners(); setIsPartnersModalOpen(true); }}
            />
          </ProfileSection>

          <ProfileSection title="Configurações">
            <ProfileItem 
              icon={<UserIcon className="text-text-muted" />} 
              title="Editar Perfil" 
              onClick={() => setIsEditModalOpen(true)}
            />
            <ProfileItem 
              icon={<Lock className="text-text-muted" />} 
              title="Segurança" 
              sub="Alterar senha" 
              onClick={() => setIsSecurityModalOpen(true)}
            />
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

      {/* Modal Editar Perfil */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-bg-elevated border-border-custom rounded-t-[32px] sm:rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-white uppercase font-black italic">Editar Perfil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-text-muted">Nome Completo</label>
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" 
                value={editForm.nome}
                onChange={e => setEditForm({...editForm, nome: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-text-muted">Telefone</label>
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" 
                value={editForm.telefone}
                onChange={e => setEditForm({...editForm, telefone: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-text-muted">Cidade</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" 
                  value={editForm.cidade}
                  onChange={e => setEditForm({...editForm, cidade: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-text-muted">Bairro</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" 
                  value={editForm.bairro}
                  onChange={e => setEditForm({...editForm, bairro: e.target.value})}
                />
              </div>
            </div>
            <button 
              onClick={handleUpdateProfile}
              className="w-full py-4 bg-primary text-white font-black rounded-2xl uppercase tracking-widest mt-4"
              disabled={loading}
            >
              Salvar Alterações
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Segurança */}
      <Dialog open={isSecurityModalOpen} onOpenChange={setIsSecurityModalOpen}>
        <DialogContent className="bg-bg-elevated border-border-custom rounded-t-[32px] sm:rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-white uppercase font-black italic">Alterar Senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <input 
              type="password"
              placeholder="Nova Senha"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" 
              value={passwords.nova}
              onChange={e => setPasswords({...passwords, nova: e.target.value})}
            />
            <input 
              type="password"
              placeholder="Confirmar Nova Senha"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" 
              value={passwords.confirmar}
              onChange={e => setPasswords({...passwords, confirmar: e.target.value})}
            />
            <button 
              onClick={handleChangePassword}
              className="w-full py-4 bg-primary text-white font-black rounded-2xl uppercase tracking-widest mt-4"
              disabled={loading}
            >
              Atualizar Senha
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Parceiros */}
      <Dialog open={isPartnersModalOpen} onOpenChange={setIsPartnersModalOpen}>
        <DialogContent className="bg-bg-elevated border-border-custom rounded-t-[32px] sm:rounded-3xl p-0 overflow-hidden max-h-[80vh] flex flex-col">
          <DialogHeader className="p-6 border-b border-white/5">
            <DialogTitle className="text-white uppercase font-black italic">Parceiros do Clube</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {partners.map(p => (
              <div key={p.id} className="bg-white/5 rounded-3xl p-4 border border-white/5 flex gap-4 items-center">
                <div className="size-16 rounded-2xl bg-white overflow-hidden flex-shrink-0">
                  <img src={p.lojas?.logo_url} className="size-full object-cover" alt={p.lojas?.nome} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-white">{p.lojas?.nome}</h4>
                    <span className="bg-gold text-black text-[10px] font-black px-2 py-0.5 rounded-full">{p.desconto_percentual}% OFF</span>
                  </div>
                  <p className="text-[10px] text-text-muted leading-relaxed line-clamp-2">{p.descricao_beneficio}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Scanner QR */}
      <Dialog open={isQRScannerOpen} onOpenChange={setIsQRScannerOpen}>
        <DialogContent className="bg-black border-none p-0 max-w-none h-screen sm:h-[600px] flex flex-col items-center justify-center">
          <div id="reader" className="w-full max-w-sm"></div>
          <button 
            onClick={() => setIsQRScannerOpen(false)}
            className="absolute top-10 right-10 size-12 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-md"
          >
            <X size={24} />
          </button>
        </DialogContent>
      </Dialog>
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

function ProfileItem({ icon, title, sub, onClick }: { icon: React.ReactNode; title: string; sub?: string; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 hover:bg-white/5 active:bg-white/5 transition-all group"
    >
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
