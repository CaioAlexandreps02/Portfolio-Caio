-- Conexão persistente com o Google Drive (refresh token) — ver portfolio-spec.md
-- Sem NENHUMA policy de RLS (nem pra "authenticated"): só a service role,
-- usada nas rotas server-side, pode ler/escrever aqui. O refresh token
-- nunca deve chegar no navegador.
create table google_drive_connection (
  id integer primary key default 1,
  refresh_token text,
  connected_at timestamptz,
  constraint google_drive_connection_singleton check (id = 1)
);

alter table google_drive_connection enable row level security;
