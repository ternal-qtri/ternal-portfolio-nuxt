-- Advisor fixes after init:
-- 1. is_admin() was callable as /rest/v1/rpc/is_admin; move it to a schema PostgREST does not expose.
-- 2. "admin write" was FOR ALL, so SELECT ran two permissive policies; split it into insert/update/delete.

create schema if not exists private;
grant usage on schema private to anon, authenticated;
alter function public.is_admin() set schema private; -- existing policies reference it by oid, so they keep working

do $$
declare t text;
begin
  foreach t in array array['profile', 'quest_steps', 'skill_categories', 'skills', 'projects',
                           'project_tags', 'project_features', 'project_challenges', 'project_lessons'] loop
    execute format('drop policy "admin write" on public.%I', t);
    execute format('create policy "admin insert" on public.%I for insert to authenticated with check ((select private.is_admin()))', t);
    execute format('create policy "admin update" on public.%I for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))', t);
    execute format('create policy "admin delete" on public.%I for delete to authenticated using ((select private.is_admin()))', t);
  end loop;
end $$;
