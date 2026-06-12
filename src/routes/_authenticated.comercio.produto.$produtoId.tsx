import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ChevronLeft, Plus, Minus, Store } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/comercio/produto/$produtoId")({
  component: ProdutoPage,
});

function ProdutoPage() {
  const { produtoId } = useParams({ from: '/_authenticated/comercio/produto/$produtoId' });
  const [produto, setProduto] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { adicionarItem, alterarQuantidade, itens } = useCart();

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('produtos').select('*, lojas(*)').eq('id', produtoId).single();
      setProduto(data);
      setLoading(false);
    }
    fetchData();
  }, [produtoId]);

  if (loading) return <div className="p-10 text-center">Carregando...</div>;
  if (!produto) return <div className="p-10 text-center">Produto não encontrado</div>;

  const itemNoCarrinho = itens.find(i => i.produto.id === produto.id);

  return (
    <div className="pb-40 bg-bg-primary min-h-screen">
      <div className="relative h-[300px] bg-white/5">
        {produto.imagem_url && <img src={produto.imagem_url} className="w-full h-full object-cover" alt={produto.nome} />}
        <Link to="/comercio" className="absolute top-6 left-4 size-10 rounded-full bg-black/40 flex items-center justify-center text-white">
          <ChevronLeft size={20} />
        </Link>
      </div>

      <div className="px-5 pt-6 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">{produto.nome}</h1>
          <Link to={`/comercio/loja/${produto.loja_id}`} className="flex items-center gap-2 p-3 bg-bg-card rounded-md border border-white/5">
            <Store size={18} className="text-primary" />
            <span className="text-sm font-bold">{produto.lojas?.nome}</span>
          </Link>
        </div>

        <div>
          <h3 className="text-xs font-black uppercase text-primary mb-2">Descrição</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{produto.descricao}</p>
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-bg-primary/95 backdrop-blur-2xl border-t border-white/5 p-4">
        <div className="flex items-center gap-4 max-w-lg mx-auto">
          <div className="flex items-center gap-4 bg-bg-card rounded-md px-2 py-2 border border-white/5">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="size-8 rounded-full bg-white/5 flex items-center justify-center">
              <Minus size={16} />
            </button>
            <span className="text-lg font-bold w-4 text-center">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="size-8 rounded-full bg-white/5 flex items-center justify-center">
              <Plus size={16} />
            </button>
          </div>

          <button 
            onClick={() => {
              for(let i=0; i<quantity; i++) adicionarItem({ id: produto.id, nome: produto.nome, preco: produto.preco, imagem_url: produto.imagem_url, loja_id: produto.loja_id });
              toast.success("Adicionado ao carrinho!");
            }}
            className="flex-1 bg-secondary text-text-primary font-bold h-[52px] rounded-md shadow-glow flex items-center justify-center gap-2"
          >
             Pedir • R$ {(produto.preco * quantity).toFixed(2)}
          </button>
        </div>
      </footer>
    </div>
  );
}
