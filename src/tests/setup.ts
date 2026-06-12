import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock do Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
    })),
  },
}));

// Mock do TanStack Router
vi.mock('@tanstack/react-router', () => ({
  createFileRoute: vi.fn(() => ({
    useSearch: vi.fn(() => ({ redirect: undefined })),
    useRouteContext: vi.fn(() => ({ profile: null })),
  })),
  useNavigate: vi.fn(() => vi.fn()),
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
  useRouter: vi.fn(() => ({ invalidate: vi.fn() })),
  useLocation: vi.fn(() => ({ pathname: '/' })),
}));
