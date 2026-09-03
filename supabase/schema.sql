-- =========================================================
-- JT SERVICE — Schéma Supabase pour la gestion des réalisations
-- À exécuter dans : Supabase → SQL Editor → New query → Run
-- =========================================================

-- 1) Table des réalisations -------------------------------------------------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  category    text not null check (category in ('residentiel','tertiaire','industriel','photovoltaique')),
  location    text not null default '',
  description text not null default '',
  image_url   text,
  published   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- 2) Active la sécurité au niveau des lignes (RLS) ---------------------------
alter table public.projects enable row level security;

-- Le grand public (site vitrine) peut seulement LIRE les réalisations publiées
create policy "Public peut lire les réalisations publiées"
  on public.projects
  for select
  to anon
  using (published = true);

-- Un utilisateur connecté (l'admin) peut tout lire, créer, modifier, supprimer
create policy "Admin connecté a un accès complet en lecture"
  on public.projects
  for select
  to authenticated
  using (true);

create policy "Admin connecté peut ajouter"
  on public.projects
  for insert
  to authenticated
  with check (true);

create policy "Admin connecté peut modifier"
  on public.projects
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Admin connecté peut supprimer"
  on public.projects
  for delete
  to authenticated
  using (true);

-- 3) Bucket de stockage pour les photos des réalisations ---------------------
-- (Le bucket doit aussi être créé manuellement dans Storage → New bucket
--  avec le nom exact "project-images" et l'option "Public bucket" activée —
--  voir SETUP.md pour le détail. Cette ligne le crée automatiquement si
--  l'extension storage est déjà initialisée.)
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

-- Tout le monde peut voir les images (nécessaire pour l'affichage public)
create policy "Public peut voir les images des réalisations"
  on storage.objects
  for select
  to anon
  using (bucket_id = 'project-images');

-- Seul l'admin connecté peut ajouter/modifier/supprimer des images
create policy "Admin connecté peut ajouter des images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'project-images');

create policy "Admin connecté peut modifier des images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'project-images');

create policy "Admin connecté peut supprimer des images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'project-images');
