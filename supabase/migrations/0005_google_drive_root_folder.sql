-- Pasta raiz do Google Drive usada pelo navegador de pastas do editor de
-- mockup (substitui o Picker nativo) — a navegação fica travada dentro
-- dela e de suas subpastas.
alter table site_settings add column google_drive_root_folder_id text;
