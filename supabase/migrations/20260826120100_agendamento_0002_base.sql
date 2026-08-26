-- =============================================================================
-- Agendamento Meta — 0002: clientes, contas sociais e perfis
-- =============================================================================

-- ---------------------------------------------------------------------------
-- clientes
-- ---------------------------------------------------------------------------
create table if not exists public.clientes (
  id             uuid primary key default gen_random_uuid(),
  nome           text not null check (length(btrim(nome)) > 0),
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  -- Fuso apenas para renderizacao no front. Toda data e timestamptz (UTC no banco).
  -- Nao ha CHECK contra pg_timezone_names porque a consulta nao e IMMUTABLE;
  -- a validacao acontece na aplicacao.
  fuso_horario   text not null default 'America/Sao_Paulo',
  ativo          boolean not null default true,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);

comment on column public.clientes.fuso_horario is
  'IANA tz do cliente, usado so para renderizar. O agendamento vive em timestamptz.';

drop trigger if exists clientes_atualizado_em on public.clientes;
create trigger clientes_atualizado_em
  before update on public.clientes
  for each row execute function public.tg_set_atualizado_em();

-- ---------------------------------------------------------------------------
-- contas_sociais
-- ---------------------------------------------------------------------------
create table if not exists public.contas_sociais (
  id             uuid primary key default gen_random_uuid(),
  cliente_id     uuid not null references public.clientes(id) on delete cascade,
  plataforma     public.plataforma_social not null,
  nome_exibicao  text not null,
  ig_user_id     text,
  page_id        text,
  -- Referencia (nome da chave no Vault), NUNCA o valor do token.
  -- Nulo => usa o token de System User global do BM da Astart
  -- (chave 'meta_system_user_token'). Preenchido => cliente com token proprio.
  token_ref      text,
  ativo          boolean not null default true,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now(),
  constraint contas_sociais_ids_por_plataforma check (
    (plataforma = 'instagram' and ig_user_id is not null)
    or
    (plataforma = 'facebook'  and page_id    is not null)
  )
);

comment on column public.contas_sociais.token_ref is
  'Nome da chave no Supabase Vault. Nulo = token de System User do BM da Astart.';

create unique index if not exists contas_sociais_ig_user_id_key
  on public.contas_sociais (ig_user_id) where ig_user_id is not null;
create unique index if not exists contas_sociais_page_id_key
  on public.contas_sociais (page_id) where page_id is not null;
create index if not exists contas_sociais_cliente_idx
  on public.contas_sociais (cliente_id) where ativo;

drop trigger if exists contas_sociais_atualizado_em on public.contas_sociais;
create trigger contas_sociais_atualizado_em
  before update on public.contas_sociais
  for each row execute function public.tg_set_atualizado_em();

-- ---------------------------------------------------------------------------
-- perfis (time interno da Astart)
-- ---------------------------------------------------------------------------
create table if not exists public.perfis (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  nome           text,
  papel          public.papel_perfil not null default 'social',
  ativo          boolean not null default true,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);

drop trigger if exists perfis_atualizado_em on public.perfis;
create trigger perfis_atualizado_em
  before update on public.perfis
  for each row execute function public.tg_set_atualizado_em();

-- ---------------------------------------------------------------------------
-- Helpers de RLS (SECURITY DEFINER porque perfis tambem tem RLS)
-- ---------------------------------------------------------------------------
create or replace function public.usuario_ativo()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.perfis p
     where p.user_id = auth.uid() and p.ativo
  );
$$;

create or replace function public.usuario_edita()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.perfis p
     where p.user_id = auth.uid()
       and p.ativo
       and p.papel in ('admin', 'social')
  );
$$;

create or replace function public.usuario_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.perfis p
     where p.user_id = auth.uid() and p.ativo and p.papel = 'admin'
  );
$$;
