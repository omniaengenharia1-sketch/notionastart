-- =============================================================================
-- Agendamento Meta — 0008: bucket de midias
--
-- Bucket PRIVADO. A Meta baixa o arquivo por signed URL de 2h gerada pela
-- Edge Function; nada fica publico.
-- Convencao de path: {cliente_id}/{post_id}/{ordem}-{arquivo}
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'midias-posts',
  'midias-posts',
  false,
  1073741824,  -- 1 GiB, folga para video na fase de Reels
  array['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists midias_posts_le on storage.objects;
create policy midias_posts_le on storage.objects
  for select to authenticated
  using (bucket_id = 'midias-posts' and public.usuario_ativo());

drop policy if exists midias_posts_escreve on storage.objects;
create policy midias_posts_escreve on storage.objects
  for insert to authenticated
  with check (bucket_id = 'midias-posts' and public.usuario_edita());

drop policy if exists midias_posts_atualiza on storage.objects;
create policy midias_posts_atualiza on storage.objects
  for update to authenticated
  using (bucket_id = 'midias-posts' and public.usuario_edita())
  with check (bucket_id = 'midias-posts' and public.usuario_edita());

drop policy if exists midias_posts_apaga on storage.objects;
create policy midias_posts_apaga on storage.objects
  for delete to authenticated
  using (bucket_id = 'midias-posts' and public.usuario_edita());
