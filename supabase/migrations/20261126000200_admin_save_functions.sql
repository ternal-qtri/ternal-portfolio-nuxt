-- Admin save functions: a project (or the profile) and its child lists are replaced in ONE transaction,
-- so a failed insert can never leave a project with its features/tags deleted.
-- SECURITY INVOKER: RLS still applies, and the explicit is_admin() check gives a clear error.

create function public.save_project(p jsonb) returns bigint
language plpgsql security invoker set search_path = ''
as $$
declare pid bigint := nullif(p ->> 'id', '')::bigint;
begin
  if not private.is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;

  if pid is null then
    insert into public.projects (slug, title, subtitle, role, started_on, ended_on, summary, github_url, cover_url, video_url, published, position)
    values (p ->> 'slug', p ->> 'title', coalesce(p ->> 'subtitle', ''), coalesce(p ->> 'role', ''),
            (p ->> 'started_on')::date, nullif(p ->> 'ended_on', '')::date, coalesce(p ->> 'summary', ''),
            nullif(p ->> 'github_url', ''), nullif(p ->> 'cover_url', ''), nullif(p ->> 'video_url', ''),
            coalesce((p ->> 'published')::boolean, false), coalesce((p ->> 'position')::smallint, 0))
    returning id into pid;
  else
    update public.projects set
      slug = p ->> 'slug', title = p ->> 'title', subtitle = coalesce(p ->> 'subtitle', ''), role = coalesce(p ->> 'role', ''),
      started_on = (p ->> 'started_on')::date, ended_on = nullif(p ->> 'ended_on', '')::date, summary = coalesce(p ->> 'summary', ''),
      github_url = nullif(p ->> 'github_url', ''), cover_url = nullif(p ->> 'cover_url', ''), video_url = nullif(p ->> 'video_url', ''),
      published = coalesce((p ->> 'published')::boolean, false), position = coalesce((p ->> 'position')::smallint, 0)
    where id = pid;
    if not found then raise exception 'project % not found', pid using errcode = 'P0002'; end if;
  end if;

  delete from public.project_tags where project_id = pid;
  delete from public.project_features where project_id = pid;
  delete from public.project_challenges where project_id = pid;
  delete from public.project_lessons where project_id = pid;

  insert into public.project_tags (project_id, name, position)
    select pid, t.value, t.ord - 1 from jsonb_array_elements_text(coalesce(p -> 'tags', '[]')) with ordinality t(value, ord);
  insert into public.project_features (project_id, position, title, detail)
    select pid, e.ord - 1, e.value ->> 'title', coalesce(e.value ->> 'detail', '') from jsonb_array_elements(coalesce(p -> 'features', '[]')) with ordinality e(value, ord);
  insert into public.project_challenges (project_id, position, problem, solution)
    select pid, e.ord - 1, e.value ->> 'problem', e.value ->> 'solution' from jsonb_array_elements(coalesce(p -> 'challenges', '[]')) with ordinality e(value, ord);
  insert into public.project_lessons (project_id, position, content)
    select pid, t.ord - 1, t.value from jsonb_array_elements_text(coalesce(p -> 'lessons', '[]')) with ordinality t(value, ord);

  return pid;
end $$;

create function public.save_profile(p jsonb) returns void
language plpgsql security invoker set search_path = ''
as $$
begin
  if not private.is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;

  update public.profile set
    name = p ->> 'name', birth_year = (p ->> 'birth_year')::smallint, role = p ->> 'role', school = p ->> 'school',
    major = p ->> 'major', main_tools = p ->> 'main_tools', gpa = nullif(p ->> 'gpa', '')::numeric,
    tagline = p ->> 'tagline', email = nullif(p ->> 'email', ''), phone = nullif(p ->> 'phone', ''),
    github_url = nullif(p ->> 'github_url', ''), linkedin_url = nullif(p ->> 'linkedin_url', ''), quest_title = p ->> 'quest_title'
  where id;

  delete from public.quest_steps where true;
  insert into public.quest_steps (position, text, state)
    select e.ord - 1, e.value ->> 'text', e.value ->> 'state' from jsonb_array_elements(coalesce(p -> 'quest_steps', '[]')) with ordinality e(value, ord);
end $$;

revoke execute on function public.save_project(jsonb), public.save_profile(jsonb) from public, anon;
grant execute on function public.save_project(jsonb), public.save_profile(jsonb) to authenticated;
