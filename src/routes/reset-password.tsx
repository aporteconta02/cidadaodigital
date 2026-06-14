import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Eye, EyeOff, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [ready, setReady] = useState(false);

  // Supabase entrega o token no hash e o detectSessionInUrl cria a sessão de recovery.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    if (password.length < 6) {
      setErro("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setErro("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setErro("Erro ao atualizar senha: " + error.message);
      return;
    }
    toast.success("Senha alterada com sucesso!");
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary p-6 font-jakarta">
      <div className="pt-8 mb-8 flex items-center justify-between max-w-lg mx-auto w-full">
        <button
          onClick={() => navigate({ to: "/auth" })}
          className="size-11 rounded-md bg-bg-card border border-white/5 flex items-center justify-center text-text-secondary"
          aria-label="Voltar"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-black font-space tracking-tighter uppercase">
          CIDADÃO<span className="text-primary">.</span><span className="text-secondary">PLUS</span>
        </h1>
        <div className="w-11" />
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full">
        <h2 className="text-3xl font-bold text-text-primary mb-2">Nova senha</h2>
        <p className="text-text-secondary mb-8">Defina uma nova senha para sua conta.</p>

        {!ready ? (
          <div className="rounded-md bg-bg-card border border-white/5 p-4 text-text-secondary text-sm">
            Validando o link de recuperação... Se você abriu este link diretamente,
            solicite um novo e-mail de recuperação em "Esqueci minha senha".
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                <Lock size={18} />
              </div>
              <input
                type={show ? "text" : "password"}
                placeholder="Nova senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg-card border border-border-custom rounded-md min-h-[56px] py-4 pl-12 pr-12 text-sm font-bold text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-0 top-0 h-full w-14 flex items-center justify-center text-text-muted"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                <Lock size={18} />
              </div>
              <input
                type={show ? "text" : "password"}
                placeholder="Confirmar nova senha"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full bg-bg-card border border-border-custom rounded-md min-h-[56px] py-4 pl-12 pr-4 text-sm font-bold text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {erro && (
              <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-md p-3">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-text-primary font-bold min-h-[56px] rounded-md uppercase tracking-wider disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
