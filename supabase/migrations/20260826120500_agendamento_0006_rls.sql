-- =============================================================================
-- Agendamento Meta — 0006: RLS em todas as tabelas
--
-- Modelo confirmado:
--   - Time interno: qualquer usuario com perfil ativo LE todos os clientes;
--     admin/social ESCREVEM. Nao ha tabela de vinculo por cliente.
--   - Portal do cliente: anon NAO tem policy nenhuma. O acesso por link com
--     token passa pela Edge Function portal-aprovacao com service role.
--   - service_role ignora RLS por definicao — e o unico caminho do worker.
-- =============================================================================

alter table public.clientes              enable row level security;
alter table public.contas_sociais        enable row level security;
alter table public.perfis                enable row level security;
alter table public.posts                 enable row level security;
alter table public.post_midias           enable row level security;
alter table public.post_alvos            enable row level security;
alter table public.publicacao_eventos    enable row level security;
alter table public.aprovacao_comentarios enable row level security;
alter table public.links_aprovacao       enable row level security;

-- Nenhuma superficie anonima no Postgres.
revoke all on public.clientes              from anon;
revoke all on public.contas_sociais        from anon;
revoke all on public.perfis                from anon;
revoke all on public.posts                 from anon;
revoke all on public.post_midias           from anon;
revoke all on public.post_alvos            from anon;
revoke all on public.publicacao_eventos    from anon;
revoke all on public.aprovacao_comentarios from anon;
revoke all on public.links_aprovacao       from anon;

-- ---------------------------------------------------------------------------
-- perfis
-- ---------------------------------------------------------------------------
drop policy if exists perfis_le_proprio on public.perfis;
create policy perfis_le_proprio on public.perfis
  for select to authenticated
  using (user_id = auth.uid() or public.usuario_admin());

drop policy if exists perfis_admin_escreve on public.perfis;
create policy perfis_admin_escreve on public.perfis
  for all to authenticated
  using (public.usuario_admin())
  with check (public.usuario_admin());

-- ---------------------------------------------------------------------------
-- Tabelas operacionais: leitura para perfil ativo, escrita para admin/social
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'clientes', 'contas_sociais', 'posts', 'post_midias',
    'post_alvos', 'aprovacao_comentarios', 'links_aprovacao'
  ] loop
    execute format('drop policy if exists %I on public.%I', t || '_le', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.usuario_ativo())',
      t || '_le', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_escreve', t);
    execute format(
      'create policy %I on public.%I for all to authenticated '
      'using (public.usuario_edita()) with check (public.usuario_edita())',
      t || '_escreve', t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- publicacao_eventos: leitura para o time (e o que salva o debug),
-- escrita so pelo worker via service_role. Sem policy de insert/update/delete.
-- ---------------------------------------------------------------------------
drop policy if exists publicacao_eventos_le on public.publicacao_eventos;
create policy publicacao_eventos_le on public.publicacao_eventos
  for select to authenticated
  using (public.usuario_ativo());
