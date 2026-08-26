-- =============================================================================
-- Agendamento Meta — 0005: aprovacao do cliente
-- =============================================================================

create table if not exists public.aprovacao_comentarios (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts(id) on delete cascade,
  autor_tipo  public.autor_tipo not null,
  autor_nome  text not null check (length(btrim(autor_nome)) > 0),
  texto       text not null check (length(btrim(texto)) > 0),
  criado_em   timestamptz not null default now()
);

create index if not exists aprovacao_comentarios_post_idx
  on public.aprovacao_comentarios (post_id, criado_em);

-- ---------------------------------------------------------------------------
-- links_aprovacao — portal do cliente por link, sem cadastro.
-- Guardamos o HASH do token, nunca o valor: mesmo principio do token da Meta.
-- ---------------------------------------------------------------------------
create table if not exists public.links_aprovacao (
  id          uuid primary key default gen_random_uuid(),
  cliente_id  uuid not null references public.clientes(id) on delete cascade,
  token_hash  text not null unique,
  criado_por  uuid references auth.users(id) on delete set null,
  expira_em   timestamptz not null,
  revogado    boolean not null default false,
  criado_em   timestamptz not null default now()
);

create index if not exists links_aprovacao_cliente_idx
  on public.links_aprovacao (cliente_id) where not revogado;

comment on column public.links_aprovacao.token_hash is
  'sha256 hex do token. O valor em claro so existe uma vez, no retorno de criar_link_aprovacao().';

-- Gera o link e devolve o token em claro UMA unica vez.
create or replace function public.criar_link_aprovacao(
  p_cliente_id uuid,
  p_dias       integer default 14
)
returns table (link_id uuid, token text, expira_em timestamptz)
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_token   text;
  v_expira  timestamptz;
  v_id      uuid;
begin
  if not public.usuario_edita() then
    raise exception 'Sem permissao para criar link de aprovacao.';
  end if;

  v_token  := encode(extensions.gen_random_bytes(32), 'hex');
  v_expira := now() + make_interval(days => greatest(p_dias, 1));

  insert into public.links_aprovacao (cliente_id, token_hash, criado_por, expira_em)
  values (p_cliente_id, encode(extensions.digest(v_token, 'sha256'), 'hex'), auth.uid(), v_expira)
  returning id into v_id;

  return query select v_id, v_token, v_expira;
end;
$$;

revoke all on function public.criar_link_aprovacao(uuid, integer) from public, anon;
grant execute on function public.criar_link_aprovacao(uuid, integer) to authenticated;
