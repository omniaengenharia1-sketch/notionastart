-- =============================================================================
-- Agendamento Meta — 0004: post_alvos (maquina de estados) e log append-only
-- =============================================================================

create table if not exists public.post_alvos (
  id                    uuid primary key default gen_random_uuid(),
  post_id               uuid not null references public.posts(id) on delete cascade,
  conta_social_id       uuid not null references public.contas_sociais(id) on delete restrict,
  estado                public.estado_alvo not null default 'pendente',
  container_id          text,
  container_children    jsonb,
  media_id_publicado    text,
  publicado_em          timestamptz,
  tentativas            smallint not null default 0,
  proxima_tentativa_em  timestamptz,
  erro_codigo           text,
  erro_familia          public.familia_erro,
  erro_mensagem         text,
  -- Lease de execucao: a reivindicacao acontece numa transacao curta
  -- (UPDATE ... FOR UPDATE SKIP LOCKED) e o trabalho HTTP roda fora dela.
  lock_token            uuid,
  bloqueado_ate         timestamptz,
  criado_em             timestamptz not null default now(),
  atualizado_em         timestamptz not null default now(),
  -- Torna a criacao de alvos idempotente sob execucoes concorrentes do tick.
  unique (post_id, conta_social_id)
);

comment on table public.post_alvos is
  'Uma linha por post x conta de destino. E aqui que vive a maquina de estados.';
comment on column public.post_alvos.bloqueado_ate is
  'Lease. Vencido e devolvido a fila por liberar_leases_vencidos(), exceto em '
  '"publicando", que vai para reconciliacao — nunca para retry cego.';

-- Query quente do worker.
create index if not exists post_alvos_fila_idx
  on public.post_alvos (estado, proxima_tentativa_em)
  where estado not in ('publicado', 'falhou', 'cancelado');

create index if not exists post_alvos_lease_idx
  on public.post_alvos (bloqueado_ate) where bloqueado_ate is not null;

create index if not exists post_alvos_post_idx on public.post_alvos (post_id);
create index if not exists post_alvos_conta_idx on public.post_alvos (conta_social_id, publicado_em desc);

drop trigger if exists post_alvos_atualizado_em on public.post_alvos;
create trigger post_alvos_atualizado_em
  before update on public.post_alvos
  for each row execute function public.tg_set_atualizado_em();

-- ---------------------------------------------------------------------------
-- publicacao_eventos — log append-only de tudo que foi mandado/recebido da Meta
-- ---------------------------------------------------------------------------

-- Sem ON DELETE CASCADE de proposito: o log impede a delecao fisica de um alvo.
-- Posts se cancelam, nao se apagam.
create table if not exists public.publicacao_eventos (
  id            bigint generated always as identity primary key,
  post_alvo_id  uuid not null references public.post_alvos(id),
  evento        text not null,
  payload       jsonb not null default '{}'::jsonb,
  criado_em     timestamptz not null default now()
);

create index if not exists publicacao_eventos_alvo_idx
  on public.publicacao_eventos (post_alvo_id, criado_em desc);
create index if not exists publicacao_eventos_evento_idx
  on public.publicacao_eventos (evento, criado_em desc);

-- Redacao de segredos: defesa em profundidade. O adapter ja nao envia token,
-- mas nada garante que uma URL assinada ou um header nao escorregue no payload.
create or replace function public.redigir_segredos(p jsonb)
returns jsonb
language plpgsql
immutable
as $$
declare
  chave      text;
  valor      jsonb;
  item       jsonb;
  resultado  jsonb;
  sensiveis  text[] := array[
    'access_token', 'token', 'authorization', 'client_secret',
    'service_role_key', 'apikey', 'api_key', 'x-tick-secret', 'tick_secret'
  ];
begin
  if p is null then
    return null;
  end if;

  case jsonb_typeof(p)
    when 'object' then
      resultado := '{}'::jsonb;
      for chave, valor in select * from jsonb_each(p) loop
        if lower(chave) = any (sensiveis) then
          resultado := resultado || jsonb_build_object(chave, '[redigido]');
        else
          resultado := resultado || jsonb_build_object(chave, public.redigir_segredos(valor));
        end if;
      end loop;
      return resultado;

    when 'array' then
      resultado := '[]'::jsonb;
      for item in select * from jsonb_array_elements(p) loop
        resultado := resultado || jsonb_build_array(public.redigir_segredos(item));
      end loop;
      return resultado;

    when 'string' then
      -- tokens que viajam em query string
      return to_jsonb(
        regexp_replace(p #>> '{}', '(access_token=)[^&"[:space:]]+', '\1[redigido]', 'g')
      );

    else
      return p;
  end case;
end;
$$;

create or replace function public.tg_redigir_payload()
returns trigger
language plpgsql
as $$
begin
  new.payload := public.redigir_segredos(new.payload);
  return new;
end;
$$;

drop trigger if exists publicacao_eventos_redigir on public.publicacao_eventos;
create trigger publicacao_eventos_redigir
  before insert on public.publicacao_eventos
  for each row execute function public.tg_redigir_payload();

create or replace function public.tg_bloquear_mutacao()
returns trigger
language plpgsql
as $$
begin
  raise exception 'publicacao_eventos e append-only: % nao e permitido', tg_op;
end;
$$;

drop trigger if exists publicacao_eventos_append_only on public.publicacao_eventos;
create trigger publicacao_eventos_append_only
  before update or delete on public.publicacao_eventos
  for each row execute function public.tg_bloquear_mutacao();
