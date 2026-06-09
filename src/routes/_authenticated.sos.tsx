import { createFileRoute } from "@tanstack/react-router";
import { ShieldAlert, AlertTriangle, Phone, ExternalLink, Siren } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/sos")({
  component: SOSPage,
});

function SOSPage() {
  const contacts = [
    { name: "Polícia Militar", phone: "190", icon: <Siren size={24} /> },
    { name: "SAMU", phone: "192", icon: <Phone size={24} /> },
    { name: "Bombeiros", phone: "193", icon: <Phone size={24} /> },
  ];

  return (
    <div className="p-6 space-y-8 pb-32 animate-in slide-in-from-bottom-20 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black font-display text-sos tracking-tighter uppercase">Central de Emergência</h2>
        <p className="text-sm text-muted-foreground">Utilize apenas em situações reais de risco.</p>
      </div>

      {/* Main Panic Button */}
      <div className="flex flex-col items-center justify-center py-10">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="sos-pulse size-48 rounded-full bg-sos flex flex-col items-center justify-center text-white border-8 border-white/10 shadow-[0_0_50px_rgba(255,45,45,0.4)]"
        >
          <ShieldAlert size={64} strokeWidth={2.5} />
          <span className="text-xl font-black mt-2 uppercase tracking-tighter">Pânico</span>
        </motion.button>
        <p className="mt-6 text-xs font-bold text-muted-foreground text-center max-w-[200px] leading-relaxed uppercase tracking-widest">
          Aciona vizinhos e autoridades próximas via GPS
        </p>
      </div>

      {/* Quick Contacts */}
      <div className="space-y-4 pt-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-2">Telefones Úteis</h3>
        <div className="grid grid-cols-1 gap-3">
          {contacts.map((contact, i) => (
            <a 
              key={i}
              href={`tel:${contact.phone}`}
              className="flex items-center justify-between p-5 rounded-2xl bg-card border border-border hover:bg-card-hover transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="text-sos">{contact.icon}</div>
                <div>
                  <h4 className="font-bold text-sm">{contact.name}</h4>
                  <p className="text-xs text-sos font-black">{contact.phone}</p>
                </div>
              </div>
              <ExternalLink size={16} className="text-muted-foreground opacity-30" />
            </a>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="p-4 bg-muted/30 rounded-2xl border border-white/5 flex gap-4 items-start">
        <AlertTriangle className="text-premium shrink-0" size={20} />
        <div>
          <h5 className="text-[10px] font-black uppercase tracking-widest text-premium mb-1">Atenção</h5>
          <p className="text-[10px] text-muted-foreground leading-normal font-bold">Ao acionar o botão de pânico, sua localização será compartilhada em tempo real com a rede de vizinhos e órgãos de segurança.</p>
        </div>
      </div>
    </div>
  );
}
