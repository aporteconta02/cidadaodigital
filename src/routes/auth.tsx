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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (!isLogin && !termsAccepted) {
      toast.error("Você precisa aceitar os termos de uso");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error, data } = await supabase.auth.signInWithPassword({ 
          email: email.trim(), 
          password 
        });
        if (error) throw error;
        
        if (data.session) {
           navigate({ to: "/dashboard" });
        }
      } else {
        // Step 1: Sign up in Auth with all metadata
        // The trigger 'handle_new_user' will now handle creating the user record and the shop record
        const { error: signUpError, data: authData } = await supabase.auth.signUp({ 
          email: email.trim(), 
          password,
          options: {
            data: { 
              full_name: fullName,
              account_type: accountType,
              phone: phone,
              city: city,
              neighborhood: neighborhood,
              shop_name: shopName,
              shop_category: shopCategory
            }
          }
        });
        
        if (signUpError) throw signUpError;

        if (!authData.session && authData.user) {
          setCheckEmail(true);
          toast.success("Conta criada! Verifique seu e-mail.");
        } else if (authData.session) {
          navigate({ to: "/dashboard" });
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Erro na autenticação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background p-6">
      {/* Header */}
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
        <div className="size-10" /> {/* Spacer */}
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-black font-display tracking-tighter leading-none mb-2 uppercase">
            {checkEmail ? "Verifique seu e-mail" : (isLogin ? "Bem-vindo de volta" : "Crie sua conta")}
          </h2>
          <p className="text-muted-foreground">
            {checkEmail 
              ? `Enviamos um link de confirmação para ${email}.`
              : (isLogin 
                ? "Acesse seu bairro e aproveite os benefícios." 
                : "Junte-se a milhares de vizinhos agora.")}
          </p>
        </div>

        {checkEmail ? (
          <div className="space-y-6 text-center py-10">
             <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
                <Mail size={40} />
             </div>
             <button 
                onClick={() => setCheckEmail(false)}
                className="text-xs font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors"
             >
                Voltar para o Login
             </button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-4 pb-12">
            {!isLogin && (
              <>
                {/* Account Type Selection */}
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
                  required
                />
              </>
            )}

            <InputField 
              icon={<Mail size={18} />} 
              type="email" 
              placeholder="E-mail" 
              value={email} 
              onChange={setEmail} 
              required
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
                    required
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
                  required
                />
                <InputField 
                  icon={<MapPin size={18} />} 
                  placeholder="Bairro" 
                  value={neighborhood} 
                  onChange={setNeighborhood} 
                  required
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
                  required
                />
                <InputField 
                  icon={<Building2 size={18} />} 
                  placeholder="Categoria (Ex: Padaria, Farmácia)" 
                  value={shopCategory} 
                  onChange={setShopCategory} 
                  required
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
                required
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
                required
              />
            )}

            {isLogin && (
              <div className="flex justify-end px-2">
                <button 
                  type="button"
                  className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>
            )}

            {!isLogin && (
              <div className="flex items-start gap-3 px-2 py-2">
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
            )}

            <button 
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-black py-5 rounded-2xl shadow-standard text-lg uppercase tracking-wider active:scale-95 transition-all mt-4 disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? "Processando..." : (isLogin ? "Entrar na Conta" : "Criar Minha Conta")}
            </button>

            <div className="pt-6 text-center">
              <button 
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setCheckEmail(false);
                }}
                className="text-xs font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors"
              >
                {isLogin ? "Ainda não tem conta? Cadastre-se" : "Já possui conta? Faça login"}
              </button>
            </div>
          </form>
        )}
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

function InputField({ icon, placeholder, type = "text", value, onChange, required = false }: any) {
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
        required={required}
        className="w-full bg-card border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
      />
    </div>
  );
}
