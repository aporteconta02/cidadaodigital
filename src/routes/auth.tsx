import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, User as UserIcon, Shield } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error, data } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) throw error;
        // In reality, profiles are often handled via triggers, but here we keep it simple
        if (data.user) {
           await supabase.from('profiles').insert({
             id: data.user.id,
             full_name: fullName
           });
        }
      }
      navigate({ to: "/dashboard" });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-8 pt-20 animate-in slide-in-from-bottom-10 duration-500">
      <div className="mb-12">
        <h1 className="text-4xl font-black font-display text-primary tracking-tighter mb-2">
          CIDADÃO<span className="text-secondary">+</span>
        </h1>
        <p className="text-muted-foreground">O super app do seu bairro.</p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        {!isLogin && (
          <div className="relative">
            <UserIcon className="absolute left-3 top-3 text-muted-foreground" size={18} />
            <input 
              required
              placeholder="Nome completo" 
              className="w-full bg-card border border-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        )}
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-muted-foreground" size={18} />
          <input 
            required
            type="email"
            placeholder="E-mail" 
            className="w-full bg-card border border-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-3 text-muted-foreground" size={18} />
          <input 
            required
            type="password"
            placeholder="Senha" 
            className="w-full bg-card border border-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button 
          disabled={loading}
          className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl shadow-standard hover:opacity-90 active:scale-95 transition-all mt-4"
        >
          {loading ? "Processando..." : (isLogin ? "Entrar" : "Criar Conta")}
        </button>
      </form>

      <div className="mt-8 text-center">
        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="text-xs font-bold text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors"
        >
          {isLogin ? "Não tem uma conta? Cadastre-se" : "Já tem uma conta? Faça Login"}
        </button>
      </div>
      
      <div className="mt-auto pt-10 flex items-center justify-center gap-2 text-muted-foreground opacity-50">
        <Shield size={16} />
        <span className="text-[10px] uppercase font-bold tracking-widest">Conexão Segura</span>
      </div>
    </div>
  );
}
