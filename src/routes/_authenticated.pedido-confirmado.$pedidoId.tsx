import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/pedido-confirmado/$pedidoId")({
  component: ConfirmadoPage,
});

function ConfirmadoPage() {
  const { pedidoId } = useParams({ from: '/_authenticated/pedido-confirmado/$pedidoId' });
  const short = pedidoId.slice(0, 8).toUpperCase();

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-6 text-center pb-32">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.6 }}
        className="size-24 rounded-full bg-success/10 text-success flex items-center justify-center mb-6">
        <CheckCircle2 size={56} />
      </motion.div>
      <h1 className="text-2xl font-black mb-2">Pedido confirmado!</h1>
      <p className="text-text-muted text-sm mb-1">Seu pedido foi enviado para a loja.</p>
      <div className="mt-6 px-4 py-3 bg-bg-card border border-white/5 rounded-lg">
        <div className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Número do pedido</div>
        <div className="font-mono text-lg font-bold text-primary">#{short}</div>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs mt-8">
        <Link to="/pedidos" className="h-11 leading-[44px] bg-primary text-white font-bold rounded-lg">Meus pedidos</Link>
        <Link to="/comercio" className="h-11 leading-[44px] bg-white/5 text-text-secondary font-bold rounded-lg">Voltar ao comércio</Link>
      </div>
    </div>
  );
}
