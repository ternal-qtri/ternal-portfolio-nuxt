-- Portfolio schema: public read for content, writes only for admins, anonymous insert for contact messages.

-- ───────── Admin ─────────
-- Admin accounts live in Supabase Auth; this table marks which auth users may edit content.
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;

create function public.touch_updated_at() returns trigger
language plpgsql set search_path = ''
as $$ begin new.updated_at = now(); return new; end $$;

-- ───────── Profile (single row) ─────────
create table public.profile (
  id boolean primary key default true check (id), -- forces exactly one row
  name text not null,
  birth_year smallint not null check (birth_year between 1950 and 2100),
  role text not null,
  school text not null,
  major text not null,
  main_tools text not null,
  gpa numeric(3, 2) check (gpa between 0 and 4),
  tagline text not null,
  email text check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text check (phone ~ '^[0-9+ ]{8,15}$'),
  github_url text,
  linkedin_url text,
  quest_title text not null,
  updated_at timestamptz not null default now()
);

create table public.quest_steps (
  id bigint generated always as identity primary key,
  position smallint not null default 0,
  text text not null,
  state text not null default 'todo' check (state in ('done', 'now', 'todo'))
);

-- ───────── Skills ─────────
create table public.skill_categories (
  id bigint generated always as identity primary key,
  name text not null unique,
  short_name text not null,
  description text not null default '',
  position smallint not null default 0
);

create table public.skills (
  id bigint generated always as identity primary key,
  category_id bigint not null references public.skill_categories (id) on delete cascade,
  name text not null,
  proficiency smallint not null check (proficiency between 1 and 5), -- 1 Cơ bản … 5 Chuyên sâu (labels live in the app)
  icon_url text,
  featured boolean not null default false, -- shown in the homepage hotbar
  position smallint not null default 0,
  unique (category_id, name)
);
create index on public.skills (category_id, position);

-- ───────── Projects ─────────
create table public.projects (
  id bigint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  subtitle text not null default '',
  role text not null default '',
  started_on date not null, -- month precision: store the 1st of the month
  ended_on date check (ended_on is null or ended_on >= started_on), -- null = ongoing
  summary text not null default '',
  github_url text,
  cover_url text,
  video_url text, -- YouTube link; null hides the demo section
  published boolean not null default false,
  position smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger projects_updated_at before update on public.projects
  for each row execute function public.touch_updated_at();
create trigger profile_updated_at before update on public.profile
  for each row execute function public.touch_updated_at();

create table public.project_tags (
  project_id bigint not null references public.projects (id) on delete cascade,
  name text not null,
  position smallint not null default 0,
  primary key (project_id, name)
);

create table public.project_features (
  id bigint generated always as identity primary key,
  project_id bigint not null references public.projects (id) on delete cascade,
  position smallint not null default 0,
  title text not null,
  detail text not null default ''
);
create index on public.project_features (project_id, position);

create table public.project_challenges (
  id bigint generated always as identity primary key,
  project_id bigint not null references public.projects (id) on delete cascade,
  position smallint not null default 0,
  problem text not null,
  solution text not null
);
create index on public.project_challenges (project_id, position);

create table public.project_lessons (
  id bigint generated always as identity primary key,
  project_id bigint not null references public.projects (id) on delete cascade,
  position smallint not null default 0,
  content text not null
);
create index on public.project_lessons (project_id, position);

-- ───────── Contact messages ─────────
create table public.contact_messages (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 80),
  email text not null check (char_length(email) <= 120 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  message text not null check (char_length(message) between 10 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index on public.contact_messages (created_at desc);

-- ───────── Row Level Security ─────────
alter table public.admins             enable row level security;
alter table public.profile            enable row level security;
alter table public.quest_steps        enable row level security;
alter table public.skill_categories   enable row level security;
alter table public.skills             enable row level security;
alter table public.projects           enable row level security;
alter table public.project_tags       enable row level security;
alter table public.project_features   enable row level security;
alter table public.project_challenges enable row level security;
alter table public.project_lessons    enable row level security;
alter table public.contact_messages   enable row level security;

-- admins: an admin can see the list; nobody edits it through the API (add rows in the dashboard / SQL editor).
create policy "admins read" on public.admins for select to authenticated using ((select public.is_admin()));

-- Content everyone can read; only admins write.
do $$
declare t text;
begin
  foreach t in array array['profile', 'quest_steps', 'skill_categories', 'skills'] loop
    execute format('create policy "public read" on public.%I for select using (true)', t);
    execute format('create policy "admin write" on public.%I for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t);
  end loop;
end $$;

-- Projects: visitors only see published ones (and their child rows); admins see everything.
create policy "public read" on public.projects for select
  using (published or (select public.is_admin()));
create policy "admin write" on public.projects for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

do $$
declare t text;
begin
  foreach t in array array['project_tags', 'project_features', 'project_challenges', 'project_lessons'] loop
    execute format('create policy "public read" on public.%I for select using (exists (select 1 from public.projects p where p.id = project_id and (p.published or (select public.is_admin()))))', t);
    execute format('create policy "admin write" on public.%I for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t);
  end loop;
end $$;

-- Contact: anyone may send (column checks above validate it); only admins read, mark read, or delete.
-- shortcut: no rate limiting on inserts, add a captcha or server-side throttle if spam shows up.
create policy "anyone send" on public.contact_messages for insert to anon, authenticated with check (read_at is null);
create policy "admin read" on public.contact_messages for select to authenticated using ((select public.is_admin()));
create policy "admin update" on public.contact_messages for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin delete" on public.contact_messages for delete to authenticated using ((select public.is_admin()));
