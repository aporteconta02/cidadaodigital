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
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: (search.redirect as string) || undefined,
    }
  },
  component: AuthPage,
});

type AccountType = 'morador' | 'comerciante' | 'entregador';

function AuthPage() {
  const { redirect: redirectPath } = Route.useSearch();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  // Check if already logged in
  useState(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate({ to: '/dashboard' });
      }
    });
  });

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

    if (accountType === 'comerciante' && !shopName) {
      setErro('Nome da loja é obrigatório para comerciantes.');
      return;
    }

    setLoading(true);

    try {
      console.log("Iniciando signUp...");
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: { nome: fullName }
        }
      });

      if (authError) {
        console.error("Erro no signUp:", authError);
        if (authError.message.includes('already registered')) {
          setErro('Este e-mail já está cadastrado. Faça login.');
        } else {
          setErro(authError.message);
        }
        setLoading(false);
        return;
      }

      if (!authData || !authData.user) {
        setErro('Erro ao criar conta: Usuário não retornado. Verifique se a confirmação de e-mail está desativada no Supabase.');
        setLoading(false);
        return;
      }

      const uid = authData.user.id;
      console.log("Usuário criado no Auth:", uid);

      const numeroMembro = '#' + Math.floor(10000 + Math.random() * 90000).toString();
      const qrToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

      console.log("Inserindo no perfil usuarios...");
      const { error: insertError } = await supabase.from('usuarios').upsert({
        id: uid, 
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
      }, { onConflict: 'id' });

      if (insertError) {
        console.error("Erro no insert usuarios:", insertError);
        setErro('Erro ao salvar perfil: ' + insertError.message);
        setLoading(false);
        return;
      }

      if (accountType === 'comerciante' && shopName) {
        console.log("Inserindo loja...");
        const { error: shopError } = await supabase.from('lojas').upsert({
          usuario_id: uid,
          nome: shopName.trim(),
          categoria: shopCategory || 'geral',
          aprovada: false,
          plano: 'gratuito',
          ativo: true
        }, { onConflict: 'usuario_id' });
        
        if (shopError) {
          console.error("Erro no insert lojas:", shopError);
          // Não bloqueia o cadastro principal, mas avisa
          toast.error("Erro ao criar loja: " + shopError.message);
        }
      }

      console.log("Cadastro concluído com sucesso!");
      toast.success("Feito! 🎉");
      
      // Pequeno delay para garantir que o Auth atualizou a sessão
      setTimeout(() => {
        navigate({ to: '/dashboard' });
      }, 500);

    } catch (err: any) {
      console.error("Erro inesperado no cadastro:", err);
      setErro('Erro inesperado: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      });
      
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErro("Ops! E-mail ou senha incorretos. Tenta de novo?");
        } else {
          setErro("Ops! Algo deu errado. Tenta de novo?");
        }
        return;
      }
      
      if (data.session) {
         toast.success("Feito! ✅");
         // Se houver um redirecionamento pendente, use-o. 
         // Mas remova o protocolo/domínio se for um URL completo para evitar problemas com o TanStack Router
         let target: string = "/dashboard";
         if (redirectPath) {
           target = redirectPath;
         }
         navigate({ to: target as any });
      }
    } catch (error: any) {
      setErro(error.message || "Erro na autenticação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary p-[clamp(1rem,5vw,2rem)] overflow-x-hidden font-jakarta">
      <div className="pt-[clamp(2rem,8vh,4rem)] mb-[clamp(1.5rem,6vh,3rem)] flex items-center justify-between w-full max-w-lg mx-auto">
        <button 
          onClick={() => isLogin ? navigate({ to: '/' }) : setIsLogin(true)}
          className="min-w-[44px] min-h-[44px] rounded-md bg-bg-card border border-white/5 flex items-center justify-center text-text-secondary transition-colors active:scale-95 glass"
          aria-label="Voltar"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-[clamp(1.1rem,4vw,1.4rem)] font-black font-space tracking-tighter uppercase whitespace-nowrap">
          CIDADÃO<span className="text-primary">.</span><span className="text-secondary">PLUS</span>
        </h1>
        <div className="w-[44px]" aria-hidden="true" />
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full flex flex-col justify-center lg:justify-start">
        <div className="mb-[clamp(1.5rem,5vh,2.5rem)] text-center lg:text-left">
          <h2 className="hero-title text-text-primary tracking-tighter leading-tight mb-3 uppercase">
            {isLogin ? "Olá! 👋" : "Crie sua conta"}
          </h2>
          <p className="body-text text-text-secondary leading-relaxed max-w-[90%] mx-auto lg:mx-0">
            {isLogin 
              ? "Acesse seu bairro e aproveite os benefícios." 
              : "Junte-se a milhares de vizinhos agora."}
          </p>
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            isLogin ? handleLogin() : handleCadastro();
          }} 
          className="space-y-[clamp(0.75rem,3vh,1.25rem)] pb-12 w-full"
        >
          {!isLogin && (
            <div className="space-y-[clamp(1rem,4vh,1.5rem)]">
              <div className="grid grid-cols-3 gap-[clamp(0.5rem,2vw,1rem)] mb-2">
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
            </div>
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
                className="w-full bg-bg-card border border-border-custom rounded-md min-h-[56px] py-4 pl-12 pr-4 text-sm font-bold text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all glass"
              />
            </div>
          )}

          {!isLogin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[clamp(0.75rem,3vw,1rem)]">
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

          <AnimatePresence>
            {accountType === 'comerciante' && !isLogin && (
              <motion.div 
                initial={{ opacity: 0, height: 0, overflow: 'hidden' }} 
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-[clamp(0.75rem,3vh,1rem)] pt-2"
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
          </AnimatePresence>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              <Lock size={18} />
            </div>
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-bg-card border border-border-custom rounded-md min-h-[56px] py-4 pl-12 pr-12 text-sm font-bold text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all glass"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-0 h-full w-[56px] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
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
              <div className="flex items-start gap-4">
                <button 
                  type="button"
                  onClick={() => setTermsAccepted(!termsAccepted)}
                  className={cn(
                    "mt-1 min-w-[24px] min-h-[24px] rounded border flex items-center justify-center transition-all active:scale-90",
                    termsAccepted ? "bg-primary border-primary text-text-primary" : "bg-bg-card border-white/10"
                  )}
                  aria-checked={termsAccepted}
                  role="checkbox"
                >
                  {termsAccepted && <CheckCircle2 size={16} strokeWidth={3} />}
                </button>
                <p className="caption-text text-text-secondary leading-snug">
                  Li e aceito os <span className="text-primary font-bold">Termos de Uso</span> e a <span className="text-primary font-bold">Política de Privacidade</span> do Cidadão+.
                </p>
              </div>
            </div>
          )}

          <AnimatePresence>
            {erro && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{color:'#FF3B5C', backgroundColor:'rgba(255,59,92,0.1)', border:'1px solid #FF3B5C', borderRadius:'14px', padding:'16px', fontSize:'14px'}}
                className="font-medium"
              >
                {erro}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-text-primary font-bold min-h-[64px] rounded-md shadow-glow text-lg uppercase tracking-wider active:scale-[0.98] transition-all mt-4 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center"
          >
            {loading ? (isLogin ? "Entrando..." : "Criando conta...") : (isLogin ? "Entrar" : "CRIAR MINHA CONTA")}
          </button>

          <div className="pt-6 text-center">
            <button 
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErro("");
              }}
              className="min-h-[44px] px-4 micro-text text-text-muted uppercase tracking-widest hover:text-primary transition-colors active:scale-95 font-jakarta"
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
        "flex flex-col items-center gap-3 p-4 rounded-md border transition-all min-h-[110px] w-full glass",
        active 
          ? "bg-primary/10 border-primary text-primary shadow-glow" 
          : "bg-bg-card border-white/5 text-text-muted hover:bg-white/5"
      )}
    >
      <div className={cn("size-11 rounded-md flex items-center justify-center border transition-all", active ? "bg-primary/20 border-primary/30 scale-110" : "bg-bg-primary border-white/5")}>
        {icon}
      </div>
      <span className="micro-text uppercase tracking-widest text-center leading-tight font-jakarta">{label}</span>
    </button>
  );
}

function InputField({ icon, placeholder, type = "text", value, onChange }: any) {
  return (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none group-focus-within:text-primary transition-colors">
        {icon}
      </div>
      <input 
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-bg-card border border-border-custom rounded-md min-h-[56px] py-4 pl-12 pr-4 text-sm font-bold text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all glass"
      />
    </div>
  );
}
