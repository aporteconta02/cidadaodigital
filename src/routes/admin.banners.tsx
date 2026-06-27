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

    if (!error) {
      const resolved = await Promise.all((data || []).map(async (b: any) => {
        if (!b.imagem_url || /^https?:\/\//i.test(b.imagem_url)) return b;
        const { data: s } = await supabase.storage.from('banners').createSignedUrl(b.imagem_url, 3600);
        return { ...b, imagem_url: s?.signedUrl ?? b.imagem_url };
      }));
      setBanners(resolved);
    }
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
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('banners')
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Erro no upload da imagem");
    } else {
      // Store the storage path; signed URLs are generated on read.
      setNewBanner({ ...newBanner, imagem_url: filePath });
      toast.success("Imagem enviada!");
    }
    setUploading(false);
  };

  const [signedPreview, setSignedPreview] = useState<string>("");
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!newBanner.imagem_url) { setSignedPreview(""); return; }
      if (/^https?:\/\//i.test(newBanner.imagem_url)) { setSignedPreview(newBanner.imagem_url); return; }
      const { data } = await supabase.storage.from('banners').createSignedUrl(newBanner.imagem_url, 3600);
      if (!cancelled) setSignedPreview(data?.signedUrl ?? "");
    })();
    return () => { cancelled = true; };
  }, [newBanner.imagem_url]);

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
          <h2 className="text-2xl font-bold font-inter uppercase tracking-tight">Gestão de Banners</h2>
          <p className="text-admin-text-secondary text-sm font-semibold mt-1">Controle os destaques rotativos da Home</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary hover:bg-admin-primary/90 text-admin-text h-9 px-4 rounded-lg text-xs font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus size={18} /> Novo Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-48 bg-admin-border-light rounded-lg animate-pulse" />)
        ) : banners.length === 0 ? (
          <div className="col-span-full py-12 text-center text-admin-text-secondary bg-admin-border-light rounded-lg border border-dashed border-admin-border-light ">Nenhum banner cadastrado</div>
        ) : (
          banners.map((banner, index) => (
            <div key={banner.id} className={cn(
              "bg-admin-surface border rounded-lg overflow-hidden shadow-sm group transition-all",
              banner.ativo ? "border-admin-border-light" : "border-admin-danger/20 opacity-60 grayscale"
            )}>
               <div className="aspect-[21/9] relative group">
                  <img src={banner.imagem_url} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-admin-text/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                     <button 
                        disabled={index === 0}
                        onClick={() => movePosition(banner, 'up')}
                        className="size-10 bg-admin-border-light backdrop-blur-md rounded-lg flex items-center justify-center hover:bg-admin-hover disabled:opacity-30"
                     >
                       <ArrowUp size={20} />
                     </button>
                     <button 
                        disabled={index === banners.length - 1}
                        onClick={() => movePosition(banner, 'down')}
                        className="size-10 bg-admin-border-light backdrop-blur-md rounded-lg flex items-center justify-center hover:bg-admin-hover disabled:opacity-30"
                     >
                       <ArrowDown size={20} />
                     </button>
                  </div>
                  {!banner.ativo && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-danger text-admin-text text-[8px] font-semibold rounded-lg">Inativo</div>
                  )}
               </div>
               <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-tight truncate">{banner.titulo}</h3>
                    <div className="flex items-center gap-2 text-admin-text-secondary mt-1">
                       <LinkIcon size={12} />
                       <span className="text-[10px] font-medium truncate">{banner.link_destino || 'Sem link'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-admin-border-light">
                     <div className="flex items-center gap-1.5 text-admin-text-secondary">
                        <Calendar size={12} />
                        <span className="text-[10px] font-bold">{format(new Date(banner.data_fim), 'dd/MM/yy')}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleStatus(banner)}
                          className={cn(
                            "p-2 rounded-lg transition-all",
                            banner.ativo ? "text-admin-success hover:bg-admin-success/10" : "text-admin-warning hover:bg-admin-warning/10"
                          )}
                        >
                           {banner.ativo ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        </button>
                        <button 
                          onClick={() => deleteBanner(banner.id)}
                          className="p-2 text-admin-danger hover:bg-admin-danger/10 rounded-lg transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-admin-text/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-admin-surface border border-admin-border-light w-full max-w-lg rounded-lg overflow-hidden shadow-lg animate-in zoom-in-95 duration-300">
              <div className="p-6 border-b border-admin-border-light flex items-center justify-between">
                 <h3 className="text-lg font-semibold  uppercase tracking-tighter">Adicionar Banner</h3>
                 <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-admin-border-light rounded-full"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-6">
                 <div>
                    <label className="text-[10px] font-semibold text-admin-text-secondary mb-2 block">Imagem do Banner (21:9 recomendado)</label>
                    <div className="relative group aspect-[21/9] rounded-lg overflow-hidden border-2 border-dashed border-admin-border-light hover:border-admin-primary/50 transition-all">
                       {newBanner.imagem_url ? (
                         <>
                           <img src={newBanner.imagem_url} className="w-full h-full object-cover" alt="" />
                           <button 
                             onClick={() => setNewBanner({...newBanner, imagem_url: ""})}
                             className="absolute top-2 right-2 size-8 bg-black/50 rounded-full flex items-center justify-center text-admin-text"
                           >
                              <X size={16} />
                           </button>
                         </>
                       ) : (
                         <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-admin-border-light">
                            {uploading ? (
                              <Loader2 size={24} className="text-admin-primary animate-spin" />
                            ) : (
                              <>
                                <Upload size={24} className="text-admin-text-secondary mb-2" />
                                <span className="text-[10px] font-semibold text-admin-text-secondary">Clique para enviar</span>
                              </>
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                         </label>
                       )}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-semibold text-admin-text-secondary mb-2 block">Título / Identificação</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Campanha Black Friday"
                        value={newBanner.titulo}
                        onChange={e => setNewBanner({...newBanner, titulo: e.target.value})}
                        className="w-full bg-admin-border-light border border-admin-border-light rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-admin-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-admin-text-secondary mb-2 block">Link de Destino</label>
                      <input 
                        type="text" 
                        placeholder="Ex: /market/loja-123 ou link externo"
                        value={newBanner.link_destino}
                        onChange={e => setNewBanner({...newBanner, link_destino: e.target.value})}
                        className="w-full bg-admin-border-light border border-admin-border-light rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-admin-primary/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-[10px] font-semibold text-admin-text-secondary mb-2 block">Data Início</label>
                          <input 
                            type="date" 
                            value={newBanner.data_inicio}
                            onChange={e => setNewBanner({...newBanner, data_inicio: e.target.value})}
                            className="w-full bg-admin-border-light border border-admin-border-light rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-admin-primary/50"
                          />
                       </div>
                       <div>
                          <label className="text-[10px] font-semibold text-admin-text-secondary mb-2 block">Data Fim</label>
                          <input 
                            type="date" 
                            value={newBanner.data_fim}
                            onChange={e => setNewBanner({...newBanner, data_fim: e.target.value})}
                            className="w-full bg-admin-border-light border border-admin-border-light rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-admin-primary/50"
                          />
                       </div>
                    </div>
                 </div>
              </div>
              <div className="p-6 bg-admin-hover border-t border-admin-border-light flex gap-3">
                 <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-admin-border-light hover:bg-admin-border-light rounded-lg text-xs font-semibold transition-all">Cancelar</button>
                 <button onClick={createBanner} className="flex-1 py-3 bg-primary hover:bg-admin-primary/90 text-admin-text rounded-lg text-xs font-semibold transition-all shadow-lg shadow-primary/20">Salvar Banner</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}