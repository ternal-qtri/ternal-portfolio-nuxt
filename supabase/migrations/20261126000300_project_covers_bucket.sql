-- Public bucket for project cover images. Anyone can view by URL; only admins can upload, replace or delete.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-covers', 'project-covers', true, 2 * 1024 * 1024, array['image/webp', 'image/jpeg', 'image/png']);

create policy "admin upload covers" on storage.objects for insert to authenticated
  with check (bucket_id = 'project-covers' and (select private.is_admin()));
create policy "admin update covers" on storage.objects for update to authenticated
  using (bucket_id = 'project-covers' and (select private.is_admin()))
  with check (bucket_id = 'project-covers' and (select private.is_admin()));
create policy "admin delete covers" on storage.objects for delete to authenticated
  using (bucket_id = 'project-covers' and (select private.is_admin()));
-- Admins can list the bucket (public URLs work without any select policy).
create policy "admin list covers" on storage.objects for select to authenticated
  using (bucket_id = 'project-covers' and (select private.is_admin()));
