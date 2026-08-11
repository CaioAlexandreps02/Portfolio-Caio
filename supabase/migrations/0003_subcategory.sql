-- Subcategoria dentro de "design" (Impressos) e tipo de peça impressa (Folder) — ver portfolio-spec.md
create type project_subcategory as enum ('impressos');
create type print_piece_type as enum ('folder');

alter table projects add column subcategory project_subcategory;
alter table projects add column print_piece_type print_piece_type;
