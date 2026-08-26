-- =============================================================================
-- Agendamento Meta — 0009: pg_cron dispara publicar-tick a cada minuto
--
-- PRE-REQUISITO: as duas chaves abaixo precisam existir no Vault ANTES de
-- rodar esta migration (ver README-agendamento-meta.md):
--
--   select vault.create_secret('https://<ref>.supabase.co/functions/v1/publicar-tick',
--                              'publicar_tick_url');
--   select vault.create_secret('<TICK_SECRET>', 'tick_secret');
--
-- O tick e stateless: acorda, avanca cada item UM passo e devolve o controle.
-- Nunca ha sleep/polling dentro de uma invocacao.
-- =============================================================================

do $$
begin
  if not exists (select 1 from vault.decrypted_secrets where name = 'publicar_tick_url') then
    raise exception
      'Cadastre a chave "publicar_tick_url" no Vault antes de agendar o cron. Veja o README.';
  end if;
  if not exists (select 1 from vault.decrypted_secrets where name = 'tick_secret') then
    raise exception
      'Cadastre a chave "tick_secret" no Vault antes de agendar o cron. Veja o README.';
  end if;
end $$;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'publicar-tick') then
    perform cron.unschedule('publicar-tick');
  end if;
end $$;

select cron.schedule(
  'publicar-tick',
  '* * * * *',
  $cron$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'publicar_tick_url'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-tick-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'tick_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 55000
  );
  $cron$
);

-- pg_net acumula respostas; sem isso a tabela cresce para sempre.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'limpar-respostas-net') then
    perform cron.unschedule('limpar-respostas-net');
  end if;
end $$;

select cron.schedule(
  'limpar-respostas-net',
  '17 4 * * *',
  $cron$ delete from net._http_response where created < now() - interval '3 days' $cron$
);
