import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getIncidents } from "@/lib/incidents.functions";
import { useServerFn } from "@tanstack/react-start";
import { MapPin, Clock, MoreVertical, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/comunidade")({
  component: ComunidadePage,
});

function ComunidadePage() {
  const fetchIncidents = useServerFn(getIncidents);
  const { data } = useSuspenseQuery({
    queryKey: ["incidents"],
    queryFn: () => fetchIncidents(),
  });

  return (
    <div className="p-6 space-y-6 pb-32 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black font-display tracking-tight uppercase">Mural do Bairro</h2>
        <button className="bg-primary/20 text-primary p-2 rounded-lg">
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {data?.incidents && data.incidents.length > 0 ? (
          data.incidents.map((incident: any) => (
            <div key={incident.id} className="bg-card border border-border rounded-2xl p-4 shadow-standard">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                  incident.type === 'ALERTA' ? 'bg-sos/20 text-sos' : 'bg-secondary/20 text-secondary'
                }`}>
                  {incident.type}
                </span>
                <button className="text-muted-foreground"><MoreVertical size={16} /></button>
              </div>
              <h3 className="font-bold mb-1">{incident.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{incident.description}</p>
              
              <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <MapPin size={12} />
                  <span>200m de você</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>Há 5 min</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <p>Nenhuma ocorrência registrada no momento.</p>
          </div>
        )}

        {/* Mock Static Examples if empty */}
        {(!data?.incidents || data.incidents.length === 0) && [
          { type: 'ALERTA', title: 'Iluminação Pública', desc: 'Lâmpada queimada na Rua Oscar Freire, altura do 1200.', color: 'bg-sos/20 text-sos' },
          { type: 'INFO', title: 'Feira Livre', desc: 'Amanhã tem feira na praça central das 07h às 13h.', color: 'bg-secondary/20 text-secondary' }
        ].map((mock, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-4 shadow-standard opacity-80">
            <div className="flex justify-between items-start mb-2">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${mock.color}`}>
                {mock.type}
              </span>
            </div>
            <h3 className="font-bold mb-1">{mock.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{mock.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
