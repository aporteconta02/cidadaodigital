import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

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
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
    })),
  },
}));

// Mock do TanStack Router
vi.mock('@tanstack/react-router', () => {
  return {
    createFileRoute: vi.fn((path) => {
      return (options) => {
        const route = {
          useSearch: vi.fn(() => ({ redirect: undefined })),
          useRouteContext: vi.fn(() => ({ profile: null })),
          options: options,
        };
        const routeFn = vi.fn(() => route);
        Object.assign(routeFn, route);
        return routeFn;
      };
    }),
    useNavigate: vi.fn(() => vi.fn()),
    Link: ({ children, ...props }: any) => React.createElement('a', props, children),
    useRouter: vi.fn(() => ({ invalidate: vi.fn() })),
    useLocation: vi.fn(() => ({ pathname: '/' })),
  };
});

// Mock do Sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));
