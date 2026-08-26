-- =============================================================================
-- Agendamento Meta — 0007: funcoes do worker
--
-- Todas SECURITY DEFINER e executaveis apenas por service_role: e a Edge
-- Function publicar-tick quem chama, nunca o front.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Passo 1: promove posts agendados vencidos e garante os alvos
-- ---------------------------------------------------------------------------
create or replace function public.promover_posts_agendados()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_post  record;
  v_qtd   integer := 0;
  v_alvos integer;
begin
  for v_post in
    update public.posts p
       set status = 'publicando'
     where p.id in (
       select id
         from public.posts
        where status = 'agendado'
          and agendado_para <= now()
        order by agendado_para
        for update skip locked
        limit 200
     )
    returning p.id, p.cliente_id
  loop
    -- Alvos ja criados no agendamento (destinos escolhidos no editor) mandam.
    -- O fallback "todas as contas ativas do cliente" so vale quando nao ha nenhum.
    insert into public.post_alvos (post_id, conta_social_id, estado, proxima_tentativa_em)
    select v_post.id, c.id, 'pendente', now()
      from public.contas_sociais c
     where c.cliente_id = v_post.cliente_id
       and c.ativo
       and not exists (select 1 from public.post_alvos a where a.post_id = v_post.id)
    on conflict (post_id, conta_social_id) do nothing;

    -- Alvos pre-criados so ficam elegiveis agora.
    update public.post_alvos
       set proxima_tentativa_em = now()
     where post_id = v_post.id
       and estado = 'pendente'
       and (proxima_tentativa_em is null or proxima_tentativa_em > now());

    select count(*) into v_alvos
      from public.post_alvos a
     where a.post_id = v_post.id and a.estado <> 'cancelado';

    if v_alvos = 0 then
      -- Nao existe alvo onde pendurar o erro: a falha vai no proprio post.
      update public.posts
         set status = 'falhou',
             erro_mensagem = 'Post agendado sem nenhuma conta de destino ativa. '
                             || 'Vincule uma conta ao cliente e reagende.'
       where id = v_post.id;
    else
      v_qtd := v_qtd + 1;
    end if;
  end loop;

  return v_qtd;
end;
$$;

-- ---------------------------------------------------------------------------
-- Passo 2: reivindica um lote com lease. Transacao curta; o HTTP roda fora.
-- ---------------------------------------------------------------------------
create or replace function public.reivindicar_alvos(
  p_lote           integer default 20,
  p_lock           uuid    default gen_random_uuid(),
  p_lease_segundos integer default 120
)
returns setof public.post_alvos
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.post_alvos a
     set lock_token    = p_lock,
         bloqueado_ate = now() + make_interval(secs => greatest(p_lease_segundos, 30))
   where a.id in (
     select f.id
       from public.post_alvos f
       join public.posts p on p.id = f.post_id
      where f.estado not in ('publicado', 'falhou', 'cancelado')
        and (f.proxima_tentativa_em is null or f.proxima_tentativa_em <= now())
        and (f.bloqueado_ate is null or f.bloqueado_ate <= now())
        and p.status = 'publicando'
      order by f.proxima_tentativa_em nulls first
      limit greatest(p_lote, 1)
      for update of f skip locked
   )
  returning a.*;
$$;

-- Reprocesso manual de um alvo (botao "tentar novamente" do monitor da fila).
create or replace function public.reivindicar_alvo(
  p_alvo_id        uuid,
  p_lock           uuid    default gen_random_uuid(),
  p_lease_segundos integer default 120
)
returns setof public.post_alvos
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- O post volta para "publicando" para que o alvo seja elegivel de novo.
  update public.posts p
     set status = 'publicando', erro_mensagem = null
    from public.post_alvos a
   where a.id = p_alvo_id
     and p.id = a.post_id
     and p.status in ('falhou', 'publicado_parcial');

  return query
  update public.post_alvos a
     set lock_token    = p_lock,
         bloqueado_ate = now() + make_interval(secs => greatest(p_lease_segundos, 30)),
         -- Retry manual zera o backoff, mas nunca ressuscita algo ja publicado.
         proxima_tentativa_em = now(),
         tentativas    = 0,
         estado        = case when a.estado = 'falhou' and a.container_id is null
                              then 'pendente'::public.estado_alvo
                              else a.estado end
   where a.id = p_alvo_id
     and a.estado not in ('publicado', 'cancelado')
     and (a.bloqueado_ate is null or a.bloqueado_ate <= now())
  returning a.*;
end;
$$;

-- ---------------------------------------------------------------------------
-- Leases vencidos: execucao anterior morreu no meio do passo.
--   container_criando -> volta a pendente (container orfao expira sozinho em 24h)
--   publicando        -> NAO volta para a fila. Fica claimavel e o worker
--                        reconcilia com a Meta antes de qualquer coisa.
-- ---------------------------------------------------------------------------
create or replace function public.liberar_leases_vencidos()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_qtd integer;
begin
  with liberados as (
    update public.post_alvos a
       set lock_token    = null,
           bloqueado_ate = null,
           tentativas    = a.tentativas + 1,
           proxima_tentativa_em = now(),
           estado = case when a.estado = 'container_criando'
                         then 'pendente'::public.estado_alvo
                         else a.estado end,
           erro_familia  = 'transitorio',
           erro_codigo   = 'lease_expirado',
           erro_mensagem = 'A execucao anterior foi interrompida antes de concluir '
                           || 'este passo. A fila retoma automaticamente.'
     where a.bloqueado_ate is not null
       and a.bloqueado_ate <= now()
       and a.estado not in ('publicado', 'falhou', 'cancelado')
    returning 1
  )
  select count(*) into v_qtd from liberados;
  return v_qtd;
end;
$$;

-- ---------------------------------------------------------------------------
-- Passo 4: status do post derivado dos alvos
-- ---------------------------------------------------------------------------
create or replace function public.recalcular_status_post(p_post_id uuid)
returns public.status_post
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_total integer;
  v_pend  integer;
  v_pub   integer;
  v_falha integer;
  v_novo  public.status_post;
begin
  select count(*),
         count(*) filter (where estado not in ('publicado', 'falhou', 'cancelado')),
         count(*) filter (where estado = 'publicado'),
         count(*) filter (where estado = 'falhou')
    into v_total, v_pend, v_pub, v_falha
    from public.post_alvos
   where post_id = p_post_id;

  -- Ainda ha alvo em voo: o post continua em "publicando".
  if v_total = 0 or v_pend > 0 then
    return (select status from public.posts where id = p_post_id);
  end if;

  if    v_pub > 0 and v_falha = 0 then v_novo := 'publicado';
  elsif v_pub > 0 and v_falha > 0 then v_novo := 'publicado_parcial';
  elsif v_falha > 0               then v_novo := 'falhou';
  else                                 v_novo := 'cancelado';
  end if;

  update public.posts
     set status = v_novo,
         erro_mensagem = case
           when v_novo in ('falhou', 'publicado_parcial') then (
             select string_agg(distinct a.erro_mensagem, ' | ')
               from public.post_alvos a
              where a.post_id = p_post_id
                and a.estado = 'falhou'
                and a.erro_mensagem is not null
           )
           else null
         end
   where id = p_post_id
     and status is distinct from v_novo;

  return v_novo;
end;
$$;

-- ---------------------------------------------------------------------------
-- Token: unica porta de saida do Vault. So service_role executa.
-- ---------------------------------------------------------------------------
create or replace function public.obter_token_conta(p_conta_social_id uuid)
returns table (
  conta_social_id uuid,
  plataforma      public.plataforma_social,
  ig_user_id      text,
  page_id         text,
  access_token    text
)
language plpgsql
security definer
set search_path = public, vault, pg_temp
as $$
declare
  v_conta public.contas_sociais%rowtype;
  v_ref   text;
  v_token text;
begin
  select * into v_conta from public.contas_sociais c where c.id = p_conta_social_id;

  if not found then
    raise exception 'Conta social % nao encontrada.', p_conta_social_id;
  end if;
  if not v_conta.ativo then
    raise exception 'A conta "%" esta inativa.', v_conta.nome_exibicao;
  end if;

  -- Sem token_ref => token de System User do BM da Astart.
  v_ref := coalesce(nullif(btrim(v_conta.token_ref), ''), 'meta_system_user_token');

  select s.decrypted_secret into v_token
    from vault.decrypted_secrets s
   where s.name = v_ref
   limit 1;

  if v_token is null or length(btrim(v_token)) = 0 then
    raise exception 'Token da Meta ausente no Vault (chave "%"). Cadastre o token antes de publicar.', v_ref;
  end if;

  return query
    select v_conta.id, v_conta.plataforma, v_conta.ig_user_id, v_conta.page_id, v_token;
end;
$$;

-- ---------------------------------------------------------------------------
-- Permissoes: nenhuma dessas funcoes e chamavel pelo front.
-- ---------------------------------------------------------------------------
do $$
declare
  f text;
begin
  foreach f in array array[
    'public.promover_posts_agendados()',
    'public.reivindicar_alvos(integer, uuid, integer)',
    'public.reivindicar_alvo(uuid, uuid, integer)',
    'public.liberar_leases_vencidos()',
    'public.recalcular_status_post(uuid)',
    'public.obter_token_conta(uuid)'
  ] loop
    execute format('revoke all on function %s from public, anon, authenticated', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;
end $$;
