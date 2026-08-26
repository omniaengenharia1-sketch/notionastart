-- =============================================================================
-- Agendamento Meta — 0003: posts e midias
-- =============================================================================

create table if not exists public.posts (
  id                  uuid primary key default gen_random_uuid(),
  cliente_id          uuid not null references public.clientes(id) on delete restrict,
  titulo_interno      text not null check (length(btrim(titulo_interno)) > 0),
  tipo                public.tipo_post not null,
  legenda             text not null default '',
  primeiro_comentario text,
  agendado_para       timestamptz,
  status              public.status_post not null default 'rascunho',
  criado_por          uuid references auth.users(id) on delete set null,
  aprovado_por        uuid references auth.users(id) on delete set null,
  aprovado_em         timestamptz,
  -- Motivo legivel no nivel do post. Existe para nao haver falha silenciosa em
  -- casos que nao pertencem a nenhum alvo (ex.: post agendado sem destino ativo).
  erro_mensagem       text,
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now(),
  constraint posts_agendado_exige_data check (status <> 'agendado' or agendado_para is not null)
);

-- Query quente do passo 1 do worker.
create index if not exists posts_agendados_idx
  on public.posts (agendado_para) where status = 'agendado';
create index if not exists posts_cliente_idx
  on public.posts (cliente_id, agendado_para desc nulls last);
create index if not exists posts_aprovacao_idx
  on public.posts (cliente_id) where status = 'aguardando_aprovacao';

drop trigger if exists posts_atualizado_em on public.posts;
create trigger posts_atualizado_em
  before update on public.posts
  for each row execute function public.tg_set_atualizado_em();

-- ---------------------------------------------------------------------------
-- post_midias
-- ---------------------------------------------------------------------------
create table if not exists public.post_midias (
  id                uuid primary key default gen_random_uuid(),
  post_id           uuid not null references public.posts(id) on delete cascade,
  ordem             smallint not null check (ordem >= 0),
  storage_path      text not null,
  mime              text not null,
  largura           integer check (largura is null or largura > 0),
  altura            integer check (altura is null or altura > 0),
  duracao_segundos  numeric(10,3) check (duracao_segundos is null or duracao_segundos > 0),
  tamanho_bytes     bigint check (tamanho_bytes is null or tamanho_bytes > 0),
  criado_em         timestamptz not null default now(),
  unique (post_id, ordem)
);

create index if not exists post_midias_post_idx on public.post_midias (post_id, ordem);
