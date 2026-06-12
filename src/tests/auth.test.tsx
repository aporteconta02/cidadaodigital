import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Route } from '../routes/auth';
import { supabase } from '@/integrations/supabase/client';
import React from 'react';

// Acessar o componente interno da Rota
const component = (Route as any).options.component;

describe('AuthPage', () => {
  it('deve exibir erros de validação quando campos estão vazios', async () => {
    render(React.createElement(component));
    
    // Mudar para modo cadastro
    const registerButton = screen.getByText(/ainda não tem conta\? cadastre-se/i);
    fireEvent.click(registerButton);
    
    // Clicar em registrar sem preencher nada
    const submitButton = screen.getByText(/criar minha conta/i);
    fireEvent.click(submitButton);
    
    expect(await screen.findByText(/preencha todos os campos obrigatórios/i)).toBeInTheDocument();
  });

  it('deve exibir erro se a senha for curta', async () => {
    render(React.createElement(component));
    
    // Mudar para modo cadastro
    fireEvent.click(screen.getByText(/ainda não tem conta\? cadastre-se/i));
    
    // Preencher campos com senha curta
    fireEvent.change(screen.getByPlaceholderText(/nome completo/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText(/e-mail/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/telefone/i), { target: { value: '11999999999' } });
    fireEvent.change(screen.getByPlaceholderText(/cidade/i), { target: { value: 'São Paulo' } });
    fireEvent.change(screen.getByPlaceholderText(/bairro/i), { target: { value: 'Centro' } });
    fireEvent.change(screen.getByPlaceholderText(/^senha$/i), { target: { value: '123' } });
    fireEvent.change(screen.getByPlaceholderText(/confirmar senha/i), { target: { value: '123' } });
    
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByText(/criar minha conta/i));
    
    expect(await screen.findByText(/a senha deve ter no mínimo 6 caracteres/i)).toBeInTheDocument();
  });

  it('deve realizar o cadastro com sucesso', async () => {
    const mockSignUp = vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: { id: '123' } } as any,
      error: null
    });
    
    const mockUpsert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabase.from).mockReturnValue({
      upsert: mockUpsert,
      insert: vi.fn().mockReturnThis(),
    } as any);

    render(React.createElement(component));
    
    // Mudar para modo cadastro
    fireEvent.click(screen.getByText(/ainda não tem conta\? cadastre-se/i));
    
    // Preencher todos os campos
    fireEvent.change(screen.getByPlaceholderText(/nome completo/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText(/e-mail/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/telefone/i), { target: { value: '11999999999' } });
    fireEvent.change(screen.getByPlaceholderText(/cidade/i), { target: { value: 'São Paulo' } });
    fireEvent.change(screen.getByPlaceholderText(/bairro/i), { target: { value: 'Centro' } });
    fireEvent.change(screen.getByPlaceholderText(/^senha$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText(/confirmar senha/i), { target: { value: 'password123' } });
    
    // Aceitar termos
    fireEvent.click(screen.getByRole('checkbox'));
    
    // Submit
    fireEvent.click(screen.getByText(/criar minha conta/i));
    
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalled();
      expect(mockUpsert).toHaveBeenCalled();
    });
  });
});
