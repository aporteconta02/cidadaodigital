import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Route } from '../routes/auth';
import { supabase } from '@/integrations/supabase/client';
import React from 'react';

// Forçar o carregamento do componente real se possível, ou mockar o comportamento do Router
const AuthPage = (Route as any).options?.component || (() => <div>Componente não carregado</div>);

describe('AuthPage', () => {
  it('deve estar definido', () => {
    expect(Route).toBeDefined();
  });

  it('deve exibir erros de validação quando campos estão vazios', async () => {
    // Se o Route for uma função mock, invocamos ela para pegar as opções
    const component = typeof Route === 'function' ? (Route as any)().options.component : (Route as any).options.component;
    
    render(React.createElement(component));
    
    // Mudar para modo cadastro
    const registerButton = screen.getByText(/ainda não tem conta\? cadastre-se/i);
    fireEvent.click(registerButton);
    
    // Clicar em registrar sem preencher nada
    const submitButton = screen.getByText(/criar minha conta/i);
    fireEvent.click(submitButton);
    
    expect(await screen.findByText(/preencha todos os campos obrigatórios/i)).toBeInTheDocument();
  });
});
