import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

interface AuthState {
  profile: UserProfile | null;
  session: any | null;
  isHydrated: boolean;
  setProfile: (profile: UserProfile | null) => void;
  setSession: (session: any | null) => void;
  setHydrated: (isHydrated: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      profile: null,
      session: null,
      isHydrated: false,
      setProfile: (profile: UserProfile | null) => set({ profile }),
      setSession: (session: any | null) => set({ session }),
      setHydrated: (isHydrated: boolean) => set({ isHydrated }),
      logout: () => set({ profile: null, session: null }),
    }),
    {
      name: 'auth-storage',
      skipHydration: true,
      partialize: (state) => ({ profile: state.profile, session: state.session }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
