-- =============================================================================
-- Agendamento Meta — 0001: extensoes e enums
-- =============================================================================

create extension if not exists pgcrypto  with schema extensions;
create extension if not exists pg_net    with schema extensions;
create extension if not exists pg_cron;
create extension if not exists supabase_vault with schema vault;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

do $$ begin
  create type public.plataforma_social as enum ('instagram', 'facebook');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.tipo_post as enum ('imagem', 'carrossel', 'reel', 'story');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.status_post as enum (
    'rascunho',
    'aguardando_aprovacao',
    'aprovado',
    'agendado',
    'publicando',
    'publicado',
    'publicado_parcial',
    'falhou',
    'cancelado'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.estado_alvo as enum (
    'pendente',
    'container_criando',
    'container_aguardando',
    'container_pronto',
    'publicando',
    'publicado',
    'falhou',
    'cancelado'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.familia_erro as enum ('transitorio', 'permanente');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.autor_tipo as enum ('agencia', 'cliente');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.papel_perfil as enum ('admin', 'social', 'leitura');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Trigger compartilhado de atualizado_em
-- ---------------------------------------------------------------------------

create or replace function public.tg_set_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;
