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
  avatar_url?: string;
  is_admin: boolean;
  ativo: boolean;
  criado_em: string;
}

interface AuthState {
  profile: UserProfile | null;
  session: any | null;
  setProfile: (profile: UserProfile | null) => void;
  setSession: (session: any | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      profile: null,
      session: null,
      setProfile: (profile) => set({ profile }),
      setSession: (session) => set({ session }),
      logout: () => set({ profile: null, session: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
