-- Schema inicial do portfólio — ver C:\Caio\portfolio\portfolio-spec.md

create type project_type as enum ('design', 'video', 'sistemas', 'sites', 'social_media');
create type project_status as enum ('draft', 'published', 'archived');

create table projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  type project_type not null,
  description text not null default '',
  cover_url text,
  media_urls text[] not null default '{}',
  video_embed text,
  metrics text,
  metrics_highlights jsonb not null default '[]',
  external_url text,
  featured boolean not null default false,
  status project_status not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table site_settings (
  id integer primary key default 1,
  about_bio text,
  about_photo_url text,
  whatsapp_number text,
  linkedin_url text,
  email text,
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1)
);

insert into site_settings (id) values (1);

create table tracked_links (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  project_id uuid references projects(id) on delete set null,
  label text not null,
  destination_url text not null,
  click_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- updated_at automático em projects/site_settings
create function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_set_updated_at
  before update on projects
  for each row execute function set_updated_at();

create trigger site_settings_set_updated_at
  before update on site_settings
  for each row execute function set_updated_at();

-- RLS
alter table projects enable row level security;
alter table site_settings enable row level security;
alter table tracked_links enable row level security;

create policy "projetos publicados são públicos"
  on projects for select
  using (status = 'published');

create policy "autenticado lê todos os projetos"
  on projects for select
  to authenticated
  using (true);

create policy "autenticado escreve projetos"
  on projects for all
  to authenticated
  using (true)
  with check (true);

create policy "site_settings é público para leitura"
  on site_settings for select
  using (true);

create policy "autenticado escreve site_settings"
  on site_settings for update
  to authenticated
  using (true)
  with check (true);

create policy "autenticado gerencia tracked_links"
  on tracked_links for all
  to authenticated
  using (true)
  with check (true);

-- Nenhuma policy de select pública em tracked_links: a rota /go/[code]
-- usa o client com service role (ver src/lib/supabase/service.ts), que
-- ignora RLS.
