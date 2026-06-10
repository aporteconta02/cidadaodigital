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

  // Error states
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) newErrors.email = "E-mail obrigatório";
    else if (!emailRegex.test(email.trim())) newErrors.email = "E-mail inválido";

    if (!password) newErrors.password = "Senha obrigatória";
    else if (password.length < 6) newErrors.password = "A senha deve ter no mínimo 6 caracteres";

    if (!isLogin) {
      if (!fullName.trim()) newErrors.fullName = "Nome obrigatório";
      if (!phone.trim()) newErrors.phone = "Telefone obrigatório";
      if (!city.trim()) newErrors.city = "Cidade obrigatória";
      if (!neighborhood.trim()) newErrors.neighborhood = "Bairro obrigatório";
      if (password !== confirmPassword) newErrors.confirmPassword = "As senhas não coincidem";
      if (!termsAccepted) newErrors.terms = "Você precisa aceitar os termos";
      
      if (accountType === 'comerciante') {
        if (!shopName.trim()) newErrors.shopName = "Nome da loja obrigatório";
        if (!shopCategory.trim()) newErrors.shopCategory = "Categoria obrigatória";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      if (isLogin) {
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
      } else {
        // 1. Criar conta no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password
        });

        if (authError) {
          let msg = "Erro ao criar conta. Tente novamente.";
          if (authError.message.includes("User already registered")) msg = "Este e-mail já está cadastrado";
          if (authError.message.includes("Password should be at least 6 characters")) msg = "A senha deve ter no mínimo 6 caracteres";
          if (authError.message.includes("Invalid email")) msg = "E-mail inválido";
          throw new Error(msg);
        }

        if (!authData.user) throw new Error("Erro ao obter dados do usuário");
        const userId = authData.user.id;

        // 2. Gerar número de membro e token QR
        const numeroMembro = '#' + Math.floor(10000 + Math.random() * 90000).toString();
        const qrCodeToken = crypto.randomUUID();

        // 3. Inserir na tabela usuarios
        const { error: userError } = await supabase.from('usuarios').insert({
          auth_id: userId,
          nome: fullName,
          email: email.trim(),
          telefone: phone,
          cidade: city,
          bairro: neighborhood,
          tipo: accountType,
          assinante_plus: false,
          numero_membro: numeroMembro,
          qr_code_token: qrCodeToken,
          is_admin: false,
          ativo: true
        });

        if (userError) {
          console.error("User insert error:", userError);
          throw new Error("Erro ao salvar perfil. Tente novamente.");
        }

        // 4. Se comerciante, inserir loja
        if (accountType === 'comerciante') {
          const { error: lojaError } = await supabase.from('lojas').insert({
            usuario_id: userId,
            nome: shopName,
            categoria: shopCategory,
            aprovada: false,
            plano: 'gratuito',
            ativo: true
          });
          if (lojaError) {
            console.error("Loja insert error:", lojaError);
            throw new Error("Erro ao salvar dados da loja. Tente novamente.");
          }
        }

        toast.success("Conta criada com sucesso!");
        
        if (!authData.session) {
          setCheckEmail(true);
        } else {
          navigate({ to: "/dashboard" });
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
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
                  error={errors.fullName}
                />
              </>
            )}

            <InputField 
              icon={<Mail size={18} />} 
              type="email" 
              placeholder="E-mail" 
              value={email} 
              onChange={setEmail} 
              error={errors.email}
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
                    className={cn(
                      "w-full bg-card border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all",
                      errors.phone && "border-red-500 ring-red-500/10"
                    )}
                  />
                  {errors.phone && <p className="text-red-500 text-[10px] mt-1 ml-2 font-bold">{errors.phone}</p>}
               </div>
            )}

            {!isLogin && (
              <div className="grid grid-cols-2 gap-3">
                <InputField 
                  icon={<Building2 size={18} />} 
                  placeholder="Cidade" 
                  value={city} 
                  onChange={setCity} 
                  error={errors.city}
                />
                <InputField 
                  icon={<MapPin size={18} />} 
                  placeholder="Bairro" 
                  value={neighborhood} 
                  onChange={setNeighborhood} 
                  error={errors.neighborhood}
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
                  error={errors.shopName}
                />
                <InputField 
                  icon={<Building2 size={18} />} 
                  placeholder="Categoria (Ex: Padaria, Farmácia)" 
                  value={shopCategory} 
                  onChange={setShopCategory} 
                  error={errors.shopCategory}
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
                className={cn(
                  "w-full bg-card border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all",
                  errors.password && "border-red-500 ring-red-500/10"
                )}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.password && <p className="text-red-500 text-[10px] mt-1 ml-2 font-bold">{errors.password}</p>}
            </div>

            {!isLogin && (
              <InputField 
                icon={<Lock size={18} />} 
                type="password" 
                placeholder="Confirmar senha" 
                value={confirmPassword} 
                onChange={setConfirmPassword} 
                error={errors.confirmPassword}
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
              <div className="px-2 py-2">
                <div className="flex items-start gap-3">
                  <button 
                    type="button"
                    onClick={() => setTermsAccepted(!termsAccepted)}
                    className={cn(
                      "mt-0.5 size-5 rounded border flex items-center justify-center transition-all",
                      termsAccepted ? "bg-primary border-primary text-primary-foreground" : "bg-card border-white/10",
                      errors.terms && "border-red-500"
                    )}
                  >
                    {termsAccepted && <CheckCircle2 size={14} strokeWidth={3} />}
                  </button>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    Li e aceito os <span className="text-primary font-bold">Termos de Uso</span> e a <span className="text-primary font-bold">Política de Privacidade</span> do Cidadão+.
                  </p>
                </div>
                {errors.terms && <p className="text-red-500 text-[10px] mt-1 ml-8 font-bold">{errors.terms}</p>}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-black py-5 rounded-2xl shadow-standard text-lg uppercase tracking-wider active:scale-95 transition-all mt-4 disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? "Criando conta..." : (isLogin ? "Entrar na Conta" : "Criar Minha Conta")}
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

function InputField({ icon, placeholder, type = "text", value, onChange, error }: any) {
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
        className={cn(
          "w-full bg-card border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all",
          error && "border-red-500 ring-red-500/10"
        )}
      />
      {error && <p className="text-red-500 text-[10px] mt-1 ml-2 font-bold">{error}</p>}
    </div>
  );
}
