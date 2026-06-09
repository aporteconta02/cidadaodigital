export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alertas_seguranca: {
        Row: {
          ativo: boolean | null
          bairro: string | null
          confirmacoes: number | null
          criado_em: string | null
          descricao: string | null
          expira_em: string | null
          id: string
          latitude: number | null
          longitude: number | null
          tipo: string
          usuario_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          bairro?: string | null
          confirmacoes?: number | null
          criado_em?: string | null
          descricao?: string | null
          expira_em?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          tipo: string
          usuario_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          bairro?: string | null
          confirmacoes?: number | null
          criado_em?: string | null
          descricao?: string | null
          expira_em?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          tipo?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alertas_seguranca_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      denuncias: {
        Row: {
          categoria: string
          confirmacoes: number | null
          criado_em: string | null
          descricao: string | null
          endereco: string | null
          foto_url: string | null
          id: string
          latitude: number | null
          longitude: number | null
          status: string | null
          usuario_id: string | null
        }
        Insert: {
          categoria: string
          confirmacoes?: number | null
          criado_em?: string | null
          descricao?: string | null
          endereco?: string | null
          foto_url?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          status?: string | null
          usuario_id?: string | null
        }
        Update: {
          categoria?: string
          confirmacoes?: number | null
          criado_em?: string | null
          descricao?: string | null
          endereco?: string | null
          foto_url?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          status?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "denuncias_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          aprovado: boolean | null
          banner_url: string | null
          categoria: string | null
          criado_em: string | null
          data_evento: string
          descricao: string | null
          destaque: boolean | null
          endereco: string | null
          gratuito: boolean | null
          id: string
          local_nome: string | null
          preco_ingresso: number | null
          titulo: string
          usuario_id: string | null
        }
        Insert: {
          aprovado?: boolean | null
          banner_url?: string | null
          categoria?: string | null
          criado_em?: string | null
          data_evento: string
          descricao?: string | null
          destaque?: boolean | null
          endereco?: string | null
          gratuito?: boolean | null
          id?: string
          local_nome?: string | null
          preco_ingresso?: number | null
          titulo: string
          usuario_id?: string | null
        }
        Update: {
          aprovado?: boolean | null
          banner_url?: string | null
          categoria?: string | null
          criado_em?: string | null
          data_evento?: string
          descricao?: string | null
          destaque?: boolean | null
          endereco?: string | null
          gratuito?: boolean | null
          id?: string
          local_nome?: string | null
          preco_ingresso?: number | null
          titulo?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          created_at: string
          description: string | null
          id: string
          location_lat: number | null
          location_lng: number | null
          status: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          status?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          status?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      itens_pedido: {
        Row: {
          id: string
          pedido_id: string | null
          preco_unitario: number
          produto_id: string | null
          quantidade: number
        }
        Insert: {
          id?: string
          pedido_id?: string | null
          preco_unitario: number
          produto_id?: string | null
          quantidade: number
        }
        Update: {
          id?: string
          pedido_id?: string | null
          preco_unitario?: number
          produto_id?: string | null
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "itens_pedido_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_pedido_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      lojas: {
        Row: {
          aprovada: boolean | null
          ativo: boolean | null
          banner_url: string | null
          categoria: string
          criado_em: string | null
          descricao: string | null
          destaque: boolean | null
          endereco: string | null
          id: string
          logo_url: string | null
          nome: string
          plano: string | null
          telefone: string | null
          usuario_id: string | null
        }
        Insert: {
          aprovada?: boolean | null
          ativo?: boolean | null
          banner_url?: string | null
          categoria: string
          criado_em?: string | null
          descricao?: string | null
          destaque?: boolean | null
          endereco?: string | null
          id?: string
          logo_url?: string | null
          nome: string
          plano?: string | null
          telefone?: string | null
          usuario_id?: string | null
        }
        Update: {
          aprovada?: boolean | null
          ativo?: boolean | null
          banner_url?: string | null
          categoria?: string
          criado_em?: string | null
          descricao?: string | null
          destaque?: boolean | null
          endereco?: string | null
          id?: string
          logo_url?: string | null
          nome?: string
          plano?: string | null
          telefone?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lojas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          comprador_id: string | null
          criado_em: string | null
          endereco_entrega: string | null
          id: string
          loja_id: string | null
          observacao: string | null
          status: string | null
          tipo_entrega: string | null
          total: number
        }
        Insert: {
          comprador_id?: string | null
          criado_em?: string | null
          endereco_entrega?: string | null
          id?: string
          loja_id?: string | null
          observacao?: string | null
          status?: string | null
          tipo_entrega?: string | null
          total: number
        }
        Update: {
          comprador_id?: string | null
          criado_em?: string | null
          endereco_entrega?: string | null
          id?: string
          loja_id?: string | null
          observacao?: string | null
          status?: string | null
          tipo_entrega?: string | null
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_comprador_id_fkey"
            columns: ["comprador_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          criado_em: string | null
          descricao: string | null
          estoque: number | null
          foto_url: string | null
          id: string
          loja_id: string | null
          nome: string
          preco: number
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          criado_em?: string | null
          descricao?: string | null
          estoque?: number | null
          foto_url?: string | null
          id?: string
          loja_id?: string | null
          nome: string
          preco: number
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          criado_em?: string | null
          descricao?: string | null
          estoque?: number | null
          foto_url?: string | null
          id?: string
          loja_id?: string | null
          nome?: string
          preco?: number
        }
        Relationships: [
          {
            foreignKeyName: "produtos_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          neighborhood: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          neighborhood?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          neighborhood?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          assinante_plus: boolean | null
          ativo: boolean | null
          auth_id: string | null
          avatar_url: string | null
          bairro: string
          cidade: string
          criado_em: string | null
          email: string
          id: string
          is_admin: boolean | null
          nome: string
          numero_membro: string | null
          qr_code_token: string | null
          telefone: string
          tipo: string
          validade_assinatura: string | null
        }
        Insert: {
          assinante_plus?: boolean | null
          ativo?: boolean | null
          auth_id?: string | null
          avatar_url?: string | null
          bairro: string
          cidade: string
          criado_em?: string | null
          email: string
          id?: string
          is_admin?: boolean | null
          nome: string
          numero_membro?: string | null
          qr_code_token?: string | null
          telefone: string
          tipo: string
          validade_assinatura?: string | null
        }
        Update: {
          assinante_plus?: boolean | null
          ativo?: boolean | null
          auth_id?: string | null
          avatar_url?: string | null
          bairro?: string
          cidade?: string
          criado_em?: string | null
          email?: string
          id?: string
          is_admin?: boolean | null
          nome?: string
          numero_membro?: string | null
          qr_code_token?: string | null
          telefone?: string
          tipo?: string
          validade_assinatura?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
