## Nova aba TRANSPORTE — sistema de carona/entrega hiperlocal

Sistema completo com fluxo cliente ↔ motorista, ofertas em tempo real, aprovação de CNH pelo admin e avaliações. Pagamento fora do app.

---

### 1. Banco de dados (migration única)

**Tabelas novas (schema `public`):**

- `drivers`
  - `usuario_id` (FK → usuarios, unique), `nome_completo`, `foto_url`, `tipo_veiculo` (enum: `carro` | `moto` | `ambos`), `modelo_veiculo`, `placa`, `cnh_foto_url`, `chave_pix`
  - `status_aprovacao` (enum: `pendente` | `aprovado` | `recusado`), `motivo_recusa`
  - `online` (bool, default false), `avaliacao_media` (numeric, default 0), `total_corridas` (int, default 0)

- `ride_requests`
  - `cliente_id` (FK → usuarios), `tipo_servico` (enum: `carro` | `moto` | `entrega`)
  - `origem`, `destino`, `observacao`
  - `status` (enum: `aberta` | `aceita` | `concluida` | `cancelada`)
  - `driver_aceito_id` (FK → drivers, null), `oferta_aceita_id` (FK → ride_offers, null)

- `ride_offers`
  - `request_id` (FK → ride_requests, cascade), `driver_id` (FK → drivers)
  - `valor` (numeric), `status` (enum: `pendente` | `aceita` | `recusada`)
  - unique (request_id, driver_id)

- `ride_ratings`
  - `request_id` (FK → ride_requests), `avaliador_id`, `avaliado_id`
  - `tipo` (enum: `cliente_para_driver` | `driver_para_cliente`)
  - `estrelas` (1–5), `comentario`
  - unique (request_id, tipo)

**Bucket de storage:** `cnh-docs` (privado) — políticas: driver lê/escreve own folder; admin lê tudo.

**RLS (resumo):**
- `drivers`: SELECT próprio + admin; INSERT próprio; UPDATE próprio (exceto `status_aprovacao`/`avaliacao_media`); admin UPDATE total. Drivers `aprovado` + `online` visíveis para todos autenticados (colunas seguras).
- `ride_requests`: cliente CRUD próprio; drivers aprovados online SELECT abertas; admin SELECT all.
- `ride_offers`: driver INSERT/UPDATE próprias; cliente SELECT das suas requests; admin SELECT all.
- `ride_ratings`: INSERT pelo participante da corrida concluída; SELECT público (autenticados).

**Realtime:** `ALTER PUBLICATION supabase_realtime ADD TABLE ride_requests, ride_offers;`

**Triggers:**
- Após INSERT em `ride_ratings` tipo `cliente_para_driver` → recalcular `drivers.avaliacao_media` e `total_corridas`.
- `updated_at` automático em todas as tabelas.
- Validation trigger em `ride_offers`: bloquear inserção se request não está `aberta`.

**GRANTs:** `authenticated` em todas; `service_role` em todas.

---

### 2. Frontend

**Nova rota:** `src/routes/_authenticated.transporte.tsx`
- Tabs internas: **Solicitar** (cliente) | **Minhas corridas** | **Sou motorista** (se aprovado: dashboard online/offline + lista de solicitações abertas).
- Formulário de solicitação com seleção carro/moto/entrega.
- Lista de ofertas recebidas (cards) com botão "Aceitar" → mostra dados de contato.
- Realtime subscription em `ride_offers` filtrado por `request_id`.
- Avaliação por estrelas após conclusão.

**Cadastro de motorista:** seção dentro de `src/routes/_authenticated.perfil.tsx` (ou sub-rota) — formulário + upload de CNH + foto + status de aprovação.

**Painel admin:** `src/routes/admin.transporte.tsx`
- Aba "Motoristas pendentes" com botões Aprovar/Recusar.
- Aba "Corridas" com histórico.
- Aba "Avaliações".
- Adicionar link no `admin.tsx` sidebar.

**Menu principal:** adicionar ícone `Car` em `_authenticated.dashboard.tsx`.

---

### 3. Visual

- Dark + roxo elétrico (tokens existentes do app).
- Card "Aguardando ofertas..." com `animate-pulse`.
- Badge verde `bg-green-500` para Online.
- Estrelas com lucide `Star` (preenchidas conforme média).
- Layout de cards comparativos de ofertas (foto, nome, veículo, ⭐ média, R$ valor, botão Aceitar).

---

### 4. Pontos de atenção

- Pagamento **fora do app** — só exibimos chave Pix e telefone após aceite.
- Aprovação de CNH é **manual** pelo admin (validação humana).
- Drivers só veem solicitações se `status_aprovacao = 'aprovado'` AND `online = true` (enforçado por RLS via `has_role`-like helper `is_approved_online_driver(auth.uid())`).
- Foto de CNH em bucket privado; admin acessa via signed URL.

---

### Arquivos a criar/editar

**Novos:**
- `supabase/migrations/<timestamp>_transporte.sql`
- `src/routes/_authenticated.transporte.tsx`
- `src/routes/admin.transporte.tsx`
- `src/components/transporte/DriverSignup.tsx`
- `src/components/transporte/OfferCard.tsx`
- `src/components/transporte/RatingStars.tsx`

**Editados:**
- `src/routes/_authenticated.dashboard.tsx` (adicionar ícone TRANSPORTE)
- `src/routes/admin.tsx` (link admin)
- `src/routes/_authenticated.perfil.tsx` (entrada "Tornar-se motorista")

---

Confirma para eu começar? Se quiser ajustar algo (ex.: pagamento integrado, geolocalização com mapa em vez de texto livre, limite de ofertas por request), me diga antes.