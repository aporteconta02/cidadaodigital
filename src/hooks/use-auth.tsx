import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from './use-auth-store';

interface UserProfile {
  id: string;
  auth_id: string;
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  bairro: string;
  tipo: string;
  assinante_plus: boolean;
  numero_membro: string;
  qr_code_token: string;
  avatar_url?: string;
  is_admin: boolean;
  ativo: boolean;
  criado_em: string;
}

interface AuthContextType {
  usuario: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isAssinante: boolean;
  refreshUsuario: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { profile, setProfile, setSession } = useAuthStore();
  const [loading, setLoading] = useState(true);

  const refreshUsuario = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      setSession(session);
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_id', session.user.id)
        .maybeSingle();

      if (!error && data) {
        setProfile(data as UserProfile);
      }
    } else {
      setProfile(null);
      setSession(null);
    }
    setLoading(false);
  }, [setProfile, setSession]);

  useEffect(() => {
    refreshUsuario();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setSession(session);
        const { data } = await supabase
          .from('usuarios')
          .select('*')
          .eq('auth_id', session.user.id)
          .maybeSingle();
        
        if (data) {
          setProfile(data as UserProfile);
        }
      } else {
        setProfile(null);
        setSession(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshUsuario, setProfile, setSession]);

  const value = {
    usuario: profile as UserProfile | null,
    loading,
    isAdmin: !!profile?.is_admin,
    isAssinante: !!profile?.assinante_plus,
    refreshUsuario,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
