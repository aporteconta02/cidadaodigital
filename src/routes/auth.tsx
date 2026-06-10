import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  Phone, 
  MapPin, 
  Building2, 
  Store, 
  ChevronLeft,
  Eye,
  EyeOff,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

type AccountType = 'morador' | 'comerciante' | 'entregador';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [accountType, setAccountType] = useState<AccountType>('morador');
  const [shopName, setShopName] = useState("");
  const [shopCategory, setShopCategory] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleCadastro = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setErro('');
    
    if (!fullName || !email || !phone || !city || !neighborhood || !password || !confirmPassword) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }
    if (password.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErro('As senhas não coincidem.');
      return;
    }
    if (!termsAccepted) {
      setErro('Você precisa aceitar os termos de uso.');
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          emailRedirectTo: undefined,
          data: { nome: fullName }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setErro('Este e-mail já está cadastrado. Faça login.');
        } else if (authError.message.includes('password')) {
          setErro('A senha deve ter no mínimo 6 caracteres.');
        } else if (authError.message.includes('email')) {
          setErro('E-mail inválido.');
        } else {
          setErro('Erro ao criar conta: ' + authError.message);
        }
        setLoading(false);
        return;
      }

      if (!authData || !authData.user) {
        setErro('Erro inesperado. Verifique se a confirmação de e-mail está desativada no Supabase Dashboard em Authentication > Providers > Email > desmarcar Confirm email.');
        setLoading(false);
        return;
      }

      const uid = authData.user.id;
      const numeroMembro = '#' + Math.floor(10000 + Math.random() * 90000).toString();
      const qrToken = crypto.randomUUID();

      const { error: insertError } = await supabase.from('usuarios').insert({
        auth_id: uid,
        nome: fullName.trim(),
        email: email.trim().toLowerCase(),
        telefone: phone.trim(),
        cidade: city.trim(),
        bairro: neighborhood.trim(),
        tipo: accountType,
        assinante_plus: false,
        numero_membro: numeroMembro,
        qr_code_token: qrToken,
        is_admin: false,
        ativo: true
      });

      if (insertError) {
        setErro('Conta criada mas erro ao salvar perfil: ' + insertError.message + '. Verifique as políticas RLS da tabela usuarios no Supabase.');
        setLoading(false);
        return;
      }

      if (accountType === 'comerciante' && shopName) {
        await supabase.from('lojas').insert({
          usuario_id: uid,
          nome: shopName.trim(),
          categoria: shopCategory || 'geral',
          aprovada: false,
          plano: 'gratuito',
          ativo: true
        });
      }

      setLoading(false);
      toast.success("Conta criada com sucesso!");
      navigate({ to: '/dashboard' });

    } catch (err: any) {
      setErro('Erro inesperado: ' + err.message);
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      });
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("E-mail ou senha incorretos");
        }
        throw error;
      }
      
      if (data.session) {
         navigate({ to: "/dashboard" });
      }
    } catch (error: any) {
      toast.error(error.message || "Erro na autenticação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background p-6">
      <div className="pt-8 mb-8 flex items-center justify-between">
        <button 
          onClick={() => isLogin ? navigate({ to: '/' }) : setIsLogin(true)}
          className="size-10 rounded-xl bg-card border border-white/5 flex items-center justify-center text-muted-foreground"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-black font-display tracking-tighter uppercase">
          CIDADÃO<span className="text-primary">+</span>
        </h1>
        <div className="size-10" />
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-black font-display tracking-tighter leading-none mb-2 uppercase">
            {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
          </h2>
          <p className="text-muted-foreground">
            {isLogin 
              ? "Acesse seu bairro e aproveite os benefícios." 
              : "Junte-se a milhares de vizinhos agora."}
          </p>
        </div>

        <form onSubmit={isLogin ? handleLogin : (e) => e.preventDefault()} className="space-y-4 pb-12">
          {!isLogin && (
            <>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <AccountTypeCard 
                  active={accountType === 'morador'} 
                  onClick={() => setAccountType('morador')}
                  icon={<UserIcon size={20} />}
                  label="Morador"
                />
                <AccountTypeCard 
                  active={accountType === 'comerciante'} 
                  onClick={() => setAccountType('comerciante')}
                  icon={<Store size={20} />}
                  label="Comércio"
                />
                <AccountTypeCard 
                  active={accountType === 'entregador'} 
                  onClick={() => setAccountType('entregador')}
                  icon={<Building2 size={20} />}
                  label="Entregador"
                />
              </div>

              <InputField 
                icon={<UserIcon size={18} />} 
                placeholder="Nome completo" 
                value={fullName} 
                onChange={setFullName} 
              />
            </>
          )}

          <InputField 
            icon={<Mail size={18} />} 
            type="email" 
            placeholder="E-mail" 
            value={email} 
            onChange={setEmail} 
          />

          {!isLogin && (
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <Phone size={18} />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e: any) => setPhone(e.target.value)}
                placeholder="Telefone"
                className="w-full bg-card border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
              />
            </div>
          )}

          {!isLogin && (
            <div className="grid grid-cols-2 gap-3">
              <InputField 
                icon={<Building2 size={18} />} 
                placeholder="Cidade" 
                value={city} 
                onChange={setCity} 
              />
              <InputField 
                icon={<MapPin size={18} />} 
                placeholder="Bairro" 
                value={neighborhood} 
                onChange={setNeighborhood} 
              />
            </div>
          )}

          {accountType === 'comerciante' && !isLogin && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 pt-2"
            >
              <InputField 
                icon={<Store size={18} />} 
                placeholder="Nome da Loja" 
                value={shopName} 
                onChange={setShopName} 
              />
              <InputField 
                icon={<Building2 size={18} />} 
                placeholder="Categoria (Ex: Padaria, Farmácia)" 
                value={shopCategory} 
                onChange={setShopCategory} 
              />
            </motion.div>
          )}

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <Lock size={18} />
            </div>
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-card border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {!isLogin && (
            <InputField 
              icon={<Lock size={18} />} 
              type="password" 
              placeholder="Confirmar senha" 
              value={confirmPassword} 
              onChange={setConfirmPassword} 
            />
          )}

          {!isLogin && (
            <div className="px-2 py-2">
              <div className="flex items-start gap-3">
                <button 
                  type="button"
                  onClick={() => setTermsAccepted(!termsAccepted)}
                  className={cn(
                    "mt-0.5 size-5 rounded border flex items-center justify-center transition-all",
                    termsAccepted ? "bg-primary border-primary text-primary-foreground" : "bg-card border-white/10"
                  )}
                >
                  {termsAccepted && <CheckCircle2 size={14} strokeWidth={3} />}
                </button>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Li e aceito os <span className="text-primary font-bold">Termos de Uso</span> e a <span className="text-primary font-bold">Política de Privacidade</span> do Cidadão+.
                </p>
              </div>
            </div>
          )}

          {erro && (
            <div style={{color:'#FF4444', backgroundColor:'rgba(255,68,68,0.1)', border:'1px solid #FF4444', borderRadius:'8px', padding:'12px', marginBottom:'12px', fontSize:'14px'}}>
              {erro}
            </div>
          )}

          <button 
            type="button"
            onClick={isLogin ? handleLogin : handleCadastro}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-black py-5 rounded-2xl shadow-standard text-lg uppercase tracking-wider active:scale-95 transition-all mt-4 disabled:opacity-50 disabled:active:scale-100"
          >
            {loading ? (isLogin ? "Entrando..." : "Criando conta...") : (isLogin ? "Entrar na Conta" : "CRIAR MINHA CONTA")}
          </button>

          <div className="pt-6 text-center">
            <button 
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErro("");
              }}
              className="text-xs font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors"
            >
              {isLogin ? "Ainda não tem conta? Cadastre-se" : "Já possui conta? Faça login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AccountTypeCard({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
        active 
          ? "bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(0,196,255,0.1)]" 
          : "bg-card border-white/5 text-muted-foreground hover:bg-white/5"
      )}
    >
      <div className={cn("size-10 rounded-xl flex items-center justify-center border", active ? "bg-primary/20 border-primary/30" : "bg-background border-white/5")}>
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

function InputField({ icon, placeholder, type = "text", value, onChange }: any) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        {icon}
      </div>
      <input 
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-card border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
      />
    </div>
  );
}
