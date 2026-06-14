create extension if not exists pgcrypto;

create table if not exists sources (
  id text primary key,
  name text not null,
  type text not null,
  reliability text not null,
  docs_url text not null,
  base_url text not null,
  api_key_required boolean not null default false,
  api_key_env text,
  connector_status text not null default 'planned',
  layers text[] not null default '{}',
  cadence text not null,
  collector_notes text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists events (
  id text primary key,
  time timestamptz not null,
  title text not null,
  url text not null,
  source_type text not null,
  related_layers text[] not null,
  related_nodes text[] not null,
  description text not null,
  direction text not null check (direction in ('positive', 'negative', 'neutral', 'mixed', 'uncertain')),
  strength smallint not null check (strength between 1 and 5),
  horizon text not null check (horizon in ('short', 'medium', 'long', 'structural')),
  assets text[] not null default '{}',
  confidence numeric(4,3) not null check (confidence >= 0 and confidence <= 1),
  included_in_export boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists events_time_idx on events (time desc);
create index if not exists events_layers_idx on events using gin (related_layers);
create index if not exists events_nodes_idx on events using gin (related_nodes);

create table if not exists indicators (
  id text primary key,
  name text not null,
  value text not null,
  unit text,
  change text not null default '',
  direction text not null check (direction in ('up', 'down', 'flat')),
  layer text not null,
  url text not null,
  source_type text not null,
  updated_at timestamptz not null,
  sparkline numeric[] not null default '{}',
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists indicators_updated_idx on indicators (updated_at desc);
create index if not exists indicators_layer_idx on indicators (layer);

create table if not exists graph_nodes (
  id text primary key,
  label text not null,
  layer text not null,
  score numeric,
  x numeric not null,
  y numeric not null,
  created_at timestamptz not null default now()
);

create table if not exists graph_edges (
  id text primary key,
  source text not null references graph_nodes(id) on delete cascade,
  target text not null references graph_nodes(id) on delete cascade,
  direction text not null check (direction in ('positive', 'negative', 'neutral', 'mixed', 'uncertain')),
  strength text not null check (strength in ('weak', 'medium', 'strong')),
  channel text not null,
  created_at timestamptz not null default now()
);

create table if not exists skill_exports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  file_name text not null,
  event_count integer not null default 0,
  indicator_count integer not null default 0,
  manifest jsonb not null default '{}'::jsonb
);

create table if not exists cron_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  ok boolean not null default false,
  mode text not null default 'supabase',
  source_count integer not null default 0,
  event_count integer not null default 0,
  indicator_count integer not null default 0,
  collected_event_count integer not null default 0,
  collected_indicator_count integer not null default 0,
  persisted_event_count integer not null default 0,
  persisted_indicator_count integer not null default 0,
  errors jsonb not null default '[]'::jsonb
);

alter table sources enable row level security;
alter table events enable row level security;
alter table indicators enable row level security;
alter table graph_nodes enable row level security;
alter table graph_edges enable row level security;
alter table skill_exports enable row level security;
alter table cron_runs enable row level security;
