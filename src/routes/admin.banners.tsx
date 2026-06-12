import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Image as ImageIcon, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  XCircle, 
  Link as LinkIcon,
  Calendar,
  X,
  Upload,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/banners")({
  component: AdminBanners,
});

function AdminBanners() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [newBanner, setNewBanner] = useState({
    titulo: "",
    link_destino: "",
    data_inicio: format(new Date(), 'yyyy-MM-dd'),
    data_fim: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    imagem_url: "",
    loja_id: null
  });

  const fetchBanners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .order("posicao", { ascending: true });

    if (!error) setBanners(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('banners')
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Erro no upload da imagem");
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath);
      
      setNewBanner({ ...newBanner, imagem_url: publicUrl });
      toast.success("Imagem enviada!");
    }
    setUploading(false);
  };

  const createBanner = async () => {
    if (!newBanner.imagem_url || !newBanner.titulo) {
      toast.error("Preencha título e imagem");
      return;
    }

    const { error } = await supabase.from("banners").insert({
      ...newBanner,
      posicao: banners.length + 1,
      ativo: true
    });

    if (error) {
      toast.error("Erro ao salvar banner");
    } else {
      toast.success("Banner adicionado!");
      setShowAddModal(false);
      fetchBanners();
      setNewBanner({
        titulo: "",
        link_destino: "",
        data_inicio: format(new Date(), 'yyyy-MM-dd'),
        data_fim: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        imagem_url: "",
        loja_id: null
      });
    }
  };

  const toggleStatus = async (banner: any) => {
    const { error } = await supabase.from("banners").update({ ativo: !banner.ativo }).eq("id", banner.id);
    if (!error) {
      toast.success("Status atualizado");
      fetchBanners();
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("Deseja realmente excluir este banner?")) return;
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (!error) {
      toast.success("Banner excluído");
      fetchBanners();
    }
  };

  const movePosition = async (banner: any, direction: 'up' | 'down') => {
    const currentIndex = banners.findIndex(b => b.id === banner.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const targetBanner = banners[targetIndex];

    // Swap positions
    const { error: err1 } = await supabase.from("banners").update({ posicao: targetBanner.posicao }).eq("id", banner.id);
    const { error: err2 } = await supabase.from("banners").update({ posicao: banner.posicao }).eq("id", targetBanner.id);

    if (!err1 && !err2) {
      fetchBanners();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-space uppercase tracking-tight">Gestão de Banners</h2>
          <p className="text-text-muted text-sm font-bold uppercase tracking-widest mt-1">Controle os destaques rotativos da Home</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus size={18} /> Novo Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-48 bg-white/5 rounded-3xl animate-pulse" />)
        ) : banners.length === 0 ? (
          <div className="col-span-full py-12 text-center text-text-muted bg-white/5 rounded-3xl border border-dashed border-white/10 italic">Nenhum banner cadastrado</div>
        ) : (
          banners.map((banner, index) => (
            <div key={banner.id} className={cn(
              "bg-[#0A0A0F] border rounded-3xl overflow-hidden shadow-xl group transition-all",
              banner.ativo ? "border-white/5" : "border-danger/20 opacity-60 grayscale"
            )}>
               <div className="aspect-[21/9] relative group">
                  <img src={banner.imagem_url} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                     <button 
                        disabled={index === 0}
                        onClick={() => movePosition(banner, 'up')}
                        className="size-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center hover:bg-white/20 disabled:opacity-30"
                     >
                       <ArrowUp size={20} />
                     </button>
                     <button 
                        disabled={index === banners.length - 1}
                        onClick={() => movePosition(banner, 'down')}
                        className="size-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center hover:bg-white/20 disabled:opacity-30"
                     >
                       <ArrowDown size={20} />
                     </button>
                  </div>
                  {!banner.ativo && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-danger text-white text-[8px] font-black uppercase tracking-widest rounded-lg">Inativo</div>
                  )}
               </div>
               <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-tight truncate">{banner.titulo}</h3>
                    <div className="flex items-center gap-2 text-text-muted mt-1">
                       <LinkIcon size={12} />
                       <span className="text-[10px] font-medium truncate">{banner.link_destino || 'Sem link'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                     <div className="flex items-center gap-1.5 text-text-muted">
                        <Calendar size={12} />
                        <span className="text-[10px] font-bold">{format(new Date(banner.data_fim), 'dd/MM/yy')}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleStatus(banner)}
                          className={cn(
                            "p-2 rounded-xl transition-all",
                            banner.ativo ? "text-success hover:bg-success/10" : "text-warning hover:bg-warning/10"
                          )}
                        >
                           {banner.ativo ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        </button>
                        <button 
                          onClick={() => deleteBanner(banner.id)}
                          className="p-2 text-danger hover:bg-danger/10 rounded-xl transition-all"
                        >
                           <Trash2 size={16} />
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>

      {/* Add Banner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-[#0A0A0F] border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                 <h3 className="text-lg font-black italic uppercase tracking-tighter">Adicionar Banner</h3>
                 <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/5 rounded-full"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-6">
                 <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Imagem do Banner (21:9 recomendado)</label>
                    <div className="relative group aspect-[21/9] rounded-2xl overflow-hidden border-2 border-dashed border-white/10 hover:border-primary/50 transition-all">
                       {newBanner.imagem_url ? (
                         <>
                           <img src={newBanner.imagem_url} className="w-full h-full object-cover" alt="" />
                           <button 
                             onClick={() => setNewBanner({...newBanner, imagem_url: ""})}
                             className="absolute top-2 right-2 size-8 bg-black/50 rounded-full flex items-center justify-center text-white"
                           >
                              <X size={16} />
                           </button>
                         </>
                       ) : (
                         <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5">
                            {uploading ? (
                              <Loader2 size={24} className="text-primary animate-spin" />
                            ) : (
                              <>
                                <Upload size={24} className="text-text-muted mb-2" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Clique para enviar</span>
                              </>
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                         </label>
                       )}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Título / Identificação</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Campanha Black Friday"
                        value={newBanner.titulo}
                        onChange={e => setNewBanner({...newBanner, titulo: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Link de Destino</label>
                      <input 
                        type="text" 
                        placeholder="Ex: /market/loja-123 ou link externo"
                        value={newBanner.link_destino}
                        onChange={e => setNewBanner({...newBanner, link_destino: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Data Início</label>
                          <input 
                            type="date" 
                            value={newBanner.data_inicio}
                            onChange={e => setNewBanner({...newBanner, data_inicio: e.target.value})}
                            className="w-full bg-white/5 border border-white/5 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-primary/50"
                          />
                       </div>
                       <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Data Fim</label>
                          <input 
                            type="date" 
                            value={newBanner.data_fim}
                            onChange={e => setNewBanner({...newBanner, data_fim: e.target.value})}
                            className="w-full bg-white/5 border border-white/5 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-primary/50"
                          />
                       </div>
                    </div>
                 </div>
              </div>
              <div className="p-6 bg-white/[0.02] border-t border-white/5 flex gap-3">
                 <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">Cancelar</button>
                 <button onClick={createBanner} className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20">Salvar Banner</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}