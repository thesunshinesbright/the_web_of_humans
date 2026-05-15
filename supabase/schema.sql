-- ============================================================
-- Human Memory Graph — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id           uuid references auth.users(id) on delete cascade primary key,
  username     text unique,
  reputation   integer default 0,
  created_at   timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- TAGS
-- ============================================================
create table public.tags (
  id    uuid default uuid_generate_v4() primary key,
  name  text unique not null
);

-- ============================================================
-- NODES
-- ============================================================
create table public.nodes (
  id              uuid default uuid_generate_v4() primary key,
  title           text not null,
  slug            text unique not null,
  description     text not null,
  node_type       text not null check (node_type in (
                    'fact','belief','experience','heuristic',
                    'cultural','profession','emotion','sensory'
                  )),
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz default now(),
  ad_safe         boolean default true,
  sensitive_topic boolean default false
);

create index idx_nodes_slug on public.nodes(slug);
create index idx_nodes_type on public.nodes(node_type);
create index idx_nodes_created_at on public.nodes(created_at desc);

-- Full-text search index
alter table public.nodes add column if not exists
  search_vector tsvector generated always as (
    to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,''))
  ) stored;
create index idx_nodes_search on public.nodes using gin(search_vector);

-- ============================================================
-- NODE_TAGS
-- ============================================================
create table public.node_tags (
  node_id uuid references public.nodes(id) on delete cascade,
  tag_id  uuid references public.tags(id) on delete cascade,
  primary key (node_id, tag_id)
);

-- ============================================================
-- EDGES
-- ============================================================
create table public.edges (
  id                uuid default uuid_generate_v4() primary key,
  source_id         uuid references public.nodes(id) on delete cascade not null,
  target_id         uuid references public.nodes(id) on delete cascade not null,
  relationship_type text not null check (relationship_type in (
                      'associated_with','emotionally_linked_to','profession_specific_to',
                      'commonly_confused_with','sensory_association','remembered_with',
                      'caused_by','opposite_of'
                    )),
  strength          float check (strength >= 0 and strength <= 1) default 0.5,
  created_by        uuid references public.profiles(id) on delete set null,
  created_at        timestamptz default now(),
  unique(source_id, target_id, relationship_type)
);

create index idx_edges_source on public.edges(source_id);
create index idx_edges_target on public.edges(target_id);

-- ============================================================
-- VOTES
-- ============================================================
create table public.votes (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  node_id     uuid references public.nodes(id) on delete cascade not null,
  vote_value  integer check (vote_value in (-1, 1)) not null,
  created_at  timestamptz default now(),
  unique(user_id, node_id)
);

create index idx_votes_node on public.votes(node_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.nodes enable row level security;
alter table public.edges enable row level security;
alter table public.votes enable row level security;
alter table public.tags enable row level security;
alter table public.node_tags enable row level security;

-- Profiles: anyone can read, only owner can update
create policy "profiles_read" on public.profiles for select using (true);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Nodes: anyone can read, auth users can insert
create policy "nodes_read" on public.nodes for select using (true);
create policy "nodes_insert" on public.nodes for insert with check (auth.uid() is not null);
create policy "nodes_update" on public.nodes for update using (auth.uid() = created_by);

-- Edges: anyone can read, auth users can insert
create policy "edges_read" on public.edges for select using (true);
create policy "edges_insert" on public.edges for insert with check (auth.uid() is not null);
create policy "edges_update" on public.edges for update using (auth.uid() = created_by);

-- Votes: anyone can read, auth users can manage their own
create policy "votes_read" on public.votes for select using (true);
create policy "votes_insert" on public.votes for insert with check (auth.uid() = user_id);
create policy "votes_update" on public.votes for update using (auth.uid() = user_id);
create policy "votes_delete" on public.votes for delete using (auth.uid() = user_id);

-- Tags: public read
create policy "tags_read" on public.tags for select using (true);
create policy "node_tags_read" on public.node_tags for select using (true);
