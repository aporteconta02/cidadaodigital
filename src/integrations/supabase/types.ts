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
      alerta_colaboracoes: {
        Row: {
          alerta_id: string
          created_at: string
          id: string
          texto: string
          tipo: string
          user_id: string
        }
        Insert: {
          alerta_id: string
          created_at?: string
          id?: string
          texto: string
          tipo: string
          user_id: string
        }
        Update: {
          alerta_id?: string
          created_at?: string
          id?: string
          texto?: string
          tipo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerta_colaboracoes_alerta_id_fkey"
            columns: ["alerta_id"]
            isOneToOne: false
            referencedRelation: "alertas_seguranca"
            referencedColumns: ["id"]
          },
        ]
      }
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
          observacao_resolucao: string | null
          resolvido: boolean
          resolvido_em: string | null
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
          observacao_resolucao?: string | null
          resolvido?: boolean
          resolvido_em?: string | null
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
          observacao_resolucao?: string | null
          resolvido?: boolean
          resolvido_em?: string | null
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
      banners: {
        Row: {
          ativo: boolean | null
          criado_em: string | null
          data_fim: string | null
          data_inicio: string | null
          id: string
          imagem_url: string
          link_destino: string | null
          loja_id: string | null
          posicao: number | null
          titulo: string | null
        }
        Insert: {
          ativo?: boolean | null
          criado_em?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          imagem_url: string
          link_destino?: string | null
          loja_id?: string | null
          posicao?: number | null
          titulo?: string | null
        }
        Update: {
          ativo?: boolean | null
          criado_em?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          imagem_url?: string
          link_destino?: string | null
          loja_id?: string | null
          posicao?: number | null
          titulo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "banners_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
        ]
      }
      contatos_confianca: {
        Row: {
          criado_em: string | null
          id: string
          nome: string
          telefone: string
          usuario_id: string
        }
        Insert: {
          criado_em?: string | null
          id?: string
          nome: string
          telefone: string
          usuario_id: string
        }
        Update: {
          criado_em?: string | null
          id?: string
          nome?: string
          telefone?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contatos_confianca_usuario_id_fkey"
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
          observacao_resolucao: string | null
          resolvido_em: string | null
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
          observacao_resolucao?: string | null
          resolvido_em?: string | null
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
          observacao_resolucao?: string | null
          resolvido_em?: string | null
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
      drivers: {
        Row: {
          avaliacao_media: number
          chave_pix: string
          cnh_foto_url: string
          created_at: string
          foto_url: string | null
          id: string
          modelo_veiculo: string
          motivo_recusa: string | null
          nome_completo: string
          online: boolean
          placa: string
          status_aprovacao: Database["public"]["Enums"]["driver_approval_status"]
          tipo_veiculo: Database["public"]["Enums"]["driver_vehicle_type"]
          total_corridas: number
          updated_at: string
          usuario_id: string
        }
        Insert: {
          avaliacao_media?: number
          chave_pix: string
          cnh_foto_url: string
          created_at?: string
          foto_url?: string | null
          id?: string
          modelo_veiculo: string
          motivo_recusa?: string | null
          nome_completo: string
          online?: boolean
          placa: string
          status_aprovacao?: Database["public"]["Enums"]["driver_approval_status"]
          tipo_veiculo: Database["public"]["Enums"]["driver_vehicle_type"]
          total_corridas?: number
          updated_at?: string
          usuario_id: string
        }
        Update: {
          avaliacao_media?: number
          chave_pix?: string
          cnh_foto_url?: string
          created_at?: string
          foto_url?: string | null
          id?: string
          modelo_veiculo?: string
          motivo_recusa?: string | null
          nome_completo?: string
          online?: boolean
          placa?: string
          status_aprovacao?: Database["public"]["Enums"]["driver_approval_status"]
          tipo_veiculo?: Database["public"]["Enums"]["driver_vehicle_type"]
          total_corridas?: number
          updated_at?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "drivers_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
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
      mural_avisos: {
        Row: {
          ativo: boolean | null
          bairro: string | null
          cidade: string | null
          criado_em: string | null
          foto_url: string | null
          id: string
          texto: string
          tipo: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          ativo?: boolean | null
          bairro?: string | null
          cidade?: string | null
          criado_em?: string | null
          foto_url?: string | null
          id?: string
          texto: string
          tipo: string
          titulo: string
          usuario_id: string
        }
        Update: {
          ativo?: boolean | null
          bairro?: string | null
          cidade?: string | null
          criado_em?: string | null
          foto_url?: string | null
          id?: string
          texto?: string
          tipo?: string
          titulo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mural_avisos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      parceiros_clube: {
        Row: {
          ativo: boolean | null
          desconto_percentual: number | null
          descricao_beneficio: string | null
          id: string
          loja_id: string
        }
        Insert: {
          ativo?: boolean | null
          desconto_percentual?: number | null
          descricao_beneficio?: string | null
          id?: string
          loja_id: string
        }
        Update: {
          ativo?: boolean | null
          desconto_percentual?: number | null
          descricao_beneficio?: string | null
          id?: string
          loja_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parceiros_clube_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
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
      pesquisas: {
        Row: {
          ativa: boolean | null
          categoria: string
          cidade: string | null
          criado_em: string | null
          descricao: string | null
          encerra_em: string | null
          id: string
          opcoes: Json | null
          tipo: string
          titulo: string
        }
        Insert: {
          ativa?: boolean | null
          categoria: string
          cidade?: string | null
          criado_em?: string | null
          descricao?: string | null
          encerra_em?: string | null
          id?: string
          opcoes?: Json | null
          tipo: string
          titulo: string
        }
        Update: {
          ativa?: boolean | null
          categoria?: string
          cidade?: string | null
          criado_em?: string | null
          descricao?: string | null
          encerra_em?: string | null
          id?: string
          opcoes?: Json | null
          tipo?: string
          titulo?: string
        }
        Relationships: []
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
      respostas_pesquisa: {
        Row: {
          bairro: string | null
          criado_em: string | null
          id: string
          pesquisa_id: string
          resposta: Json
          usuario_id: string
        }
        Insert: {
          bairro?: string | null
          criado_em?: string | null
          id?: string
          pesquisa_id: string
          resposta: Json
          usuario_id: string
        }
        Update: {
          bairro?: string | null
          criado_em?: string | null
          id?: string
          pesquisa_id?: string
          resposta?: Json
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "respostas_pesquisa_pesquisa_id_fkey"
            columns: ["pesquisa_id"]
            isOneToOne: false
            referencedRelation: "pesquisas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respostas_pesquisa_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_offers: {
        Row: {
          created_at: string
          driver_id: string
          id: string
          request_id: string
          status: Database["public"]["Enums"]["ride_offer_status"]
          updated_at: string
          valor: number
        }
        Insert: {
          created_at?: string
          driver_id: string
          id?: string
          request_id: string
          status?: Database["public"]["Enums"]["ride_offer_status"]
          updated_at?: string
          valor: number
        }
        Update: {
          created_at?: string
          driver_id?: string
          id?: string
          request_id?: string
          status?: Database["public"]["Enums"]["ride_offer_status"]
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "ride_offers_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_offers_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_offers_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "ride_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_ratings: {
        Row: {
          avaliado_id: string
          avaliador_id: string
          comentario: string | null
          created_at: string
          estrelas: number
          id: string
          request_id: string
          tipo: Database["public"]["Enums"]["ride_rating_type"]
        }
        Insert: {
          avaliado_id: string
          avaliador_id: string
          comentario?: string | null
          created_at?: string
          estrelas: number
          id?: string
          request_id: string
          tipo: Database["public"]["Enums"]["ride_rating_type"]
        }
        Update: {
          avaliado_id?: string
          avaliador_id?: string
          comentario?: string | null
          created_at?: string
          estrelas?: number
          id?: string
          request_id?: string
          tipo?: Database["public"]["Enums"]["ride_rating_type"]
        }
        Relationships: [
          {
            foreignKeyName: "ride_ratings_avaliado_id_fkey"
            columns: ["avaliado_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_ratings_avaliador_id_fkey"
            columns: ["avaliador_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_ratings_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "ride_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_requests: {
        Row: {
          cliente_id: string
          created_at: string
          destino: string
          driver_aceito_id: string | null
          id: string
          observacao: string | null
          oferta_aceita_id: string | null
          origem: string
          status: Database["public"]["Enums"]["ride_request_status"]
          tipo_servico: Database["public"]["Enums"]["ride_service_type"]
          updated_at: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          destino: string
          driver_aceito_id?: string | null
          id?: string
          observacao?: string | null
          oferta_aceita_id?: string | null
          origem: string
          status?: Database["public"]["Enums"]["ride_request_status"]
          tipo_servico: Database["public"]["Enums"]["ride_service_type"]
          updated_at?: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          destino?: string
          driver_aceito_id?: string | null
          id?: string
          observacao?: string | null
          oferta_aceita_id?: string | null
          origem?: string
          status?: Database["public"]["Enums"]["ride_request_status"]
          tipo_servico?: Database["public"]["Enums"]["ride_service_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ride_requests_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_requests_driver_aceito_id_fkey"
            columns: ["driver_aceito_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_requests_driver_aceito_id_fkey"
            columns: ["driver_aceito_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      sos_alerts: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          latitude: number | null
          longitude: number | null
          status: string | null
          tipo: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          status?: string | null
          tipo: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          status?: string | null
          tipo?: string
          user_id?: string | null
        }
        Relationships: []
      }
      telefones_uteis: {
        Row: {
          categoria: string
          cidade: string | null
          destaque: boolean | null
          id: string
          nome: string
          ordem: number | null
          telefone: string
        }
        Insert: {
          categoria: string
          cidade?: string | null
          destaque?: boolean | null
          id?: string
          nome: string
          ordem?: number | null
          telefone: string
        }
        Update: {
          categoria?: string
          cidade?: string | null
          destaque?: boolean | null
          id?: string
          nome?: string
          ordem?: number | null
          telefone?: string
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
      validacoes_qr: {
        Row: {
          criado_em: string | null
          id: string
          membro_id: string
          resultado: string | null
          validador_id: string
        }
        Insert: {
          criado_em?: string | null
          id?: string
          membro_id: string
          resultado?: string | null
          validador_id: string
        }
        Update: {
          criado_em?: string | null
          id?: string
          membro_id?: string
          resultado?: string | null
          validador_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "validacoes_qr_membro_id_fkey"
            columns: ["membro_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "validacoes_qr_validador_id_fkey"
            columns: ["validador_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      drivers_public: {
        Row: {
          avaliacao_media: number | null
          id: string | null
          modelo_veiculo: string | null
          online: boolean | null
          status_aprovacao:
            | Database["public"]["Enums"]["driver_approval_status"]
            | null
          tipo_veiculo:
            | Database["public"]["Enums"]["driver_vehicle_type"]
            | null
          total_corridas: number | null
          usuario_id: string | null
        }
        Insert: {
          avaliacao_media?: number | null
          id?: string | null
          modelo_veiculo?: string | null
          online?: boolean | null
          status_aprovacao?:
            | Database["public"]["Enums"]["driver_approval_status"]
            | null
          tipo_veiculo?:
            | Database["public"]["Enums"]["driver_vehicle_type"]
            | null
          total_corridas?: number | null
          usuario_id?: string | null
        }
        Update: {
          avaliacao_media?: number | null
          id?: string | null
          modelo_veiculo?: string | null
          online?: boolean | null
          status_aprovacao?:
            | Database["public"]["Enums"]["driver_approval_status"]
            | null
          tipo_veiculo?:
            | Database["public"]["Enums"]["driver_vehicle_type"]
            | null
          total_corridas?: number | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      current_usuario_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_confirmacoes: { Args: { alert_id: string }; Returns: undefined }
      is_approved_driver: { Args: { _usuario_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      driver_approval_status: "pendente" | "aprovado" | "recusado"
      driver_vehicle_type: "carro" | "moto" | "ambos"
      ride_offer_status: "pendente" | "aceita" | "recusada"
      ride_rating_type: "cliente_para_driver" | "driver_para_cliente"
      ride_request_status: "aberta" | "aceita" | "concluida" | "cancelada"
      ride_service_type: "carro" | "moto" | "entrega"
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
      driver_approval_status: ["pendente", "aprovado", "recusado"],
      driver_vehicle_type: ["carro", "moto", "ambos"],
      ride_offer_status: ["pendente", "aceita", "recusada"],
      ride_rating_type: ["cliente_para_driver", "driver_para_cliente"],
      ride_request_status: ["aberta", "aceita", "concluida", "cancelada"],
      ride_service_type: ["carro", "moto", "entrega"],
    },
  },
} as const
