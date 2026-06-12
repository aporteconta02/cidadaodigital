import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';

export interface Product {
  id: string;
  nome: string;
  preco: number;
  imagem_url?: string;
  loja_id: string;
}

export interface CartItem {
  produto: Product;
  quantidade: number;
  loja_id: string;
}

interface CartContextType {
  itens: CartItem[];
  adicionarItem: (produto: Product) => void;
  removerItem: (produtoId: string) => void;
  alterarQuantidade: (produtoId: string, qtd: number) => void;
  limparCarrinho: () => void;
  total: number;
  totalItens: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [itens, setItens] = useState<CartItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('cp-cart');
    if (saved) {
      try {
        setItens(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('cp-cart', JSON.stringify(itens));
  }, [itens]);

  const adicionarItem = (produto: Product) => {
    setItens(current => {
      const existing = current.find(item => item.produto.id === produto.id);
      if (existing) {
        return current.map(item =>
          item.produto.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }
      return [...current, { produto, quantidade: 1, loja_id: produto.loja_id }];
    });
  };

  const removerItem = (produtoId: string) => {
    setItens(current => current.filter(item => item.produto.id !== produtoId));
  };

  const alterarQuantidade = (produtoId: string, qtd: number) => {
    if (qtd <= 0) {
      removerItem(produtoId);
      return;
    }
    setItens(current =>
      current.map(item =>
        item.produto.id === produtoId ? { ...item, quantidade: qtd } : item
      )
    );
  };

  const limparCarrinho = () => setItens([]);

  const total = useMemo(() => 
    itens.reduce((acc, item) => acc + (item.produto.preco * item.quantidade), 0)
  , [itens]);

  const totalItens = useMemo(() => 
    itens.reduce((acc, item) => acc + item.quantidade, 0)
  , [itens]);

  return (
    <CartContext.Provider value={{
      itens,
      adicionarItem,
      removerItem,
      alterarQuantidade,
      limparCarrinho,
      total,
      totalItens
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
