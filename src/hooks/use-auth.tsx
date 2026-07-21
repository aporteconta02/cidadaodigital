import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
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
  validade_assinatura: string;
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
  const { profile, setProfile, setSession, setHydrated } = useAuthStore();
  const [loading, setLoading] = useState(true);

  const refreshUsuario = useCallback(async () => {
    try {
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
    } catch (error) {
      console.error('AuthProvider: failed to refresh user', error);
      setProfile(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [setProfile, setSession]);

  useEffect(() => {
    let mounted = true;

    // Hard cap: never let the app sit on a spinner forever due to a hung
    // getSession() or profile fetch. If we haven't resolved in 4s, unblock.
    const safetyTimer = window.setTimeout(() => {
      if (mounted) setLoading(false);
    }, 4000);

    Promise.resolve(useAuthStore.persist.rehydrate()).finally(() => {
      if (!mounted) return;
      setHydrated(true);
      refreshUsuario();
    });


    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Ignora eventos ruidosos que causam re-fetch em loop
      if (event !== 'SIGNED_IN' && event !== 'SIGNED_OUT' && event !== 'USER_UPDATED') return;
      try {
        if (session) {
          setSession(session);
          const { data } = await supabase
            .from('usuarios')
            .select('*')
            .eq('auth_id', session.user.id)
            .maybeSingle();
          
          if (data) {
            const current = useAuthStore.getState().profile;
            if (!current || current.id !== (data as any).id) {
              setProfile(data as UserProfile);
            }
          }
        } else {
          setProfile(null);
          setSession(null);
        }
      } catch (error) {
        console.error('AuthProvider: auth state change failed', error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      window.clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [refreshUsuario, setHydrated, setProfile, setSession]);


  const value = useMemo(() => ({
    usuario: profile as UserProfile | null,
    loading,
    isAdmin: !!profile?.is_admin,
    isAssinante: !!profile?.assinante_plus,
    refreshUsuario,
  }), [profile, loading, refreshUsuario]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
