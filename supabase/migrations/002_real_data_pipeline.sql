alter table sources add column if not exists api_key_env text;
alter table sources add column if not exists connector_status text not null default 'planned';
alter table sources add column if not exists collector_notes text not null default '';

alter table cron_runs add column if not exists collected_event_count integer not null default 0;
alter table cron_runs add column if not exists collected_indicator_count integer not null default 0;
alter table cron_runs add column if not exists persisted_event_count integer not null default 0;
alter table cron_runs add column if not exists persisted_indicator_count integer not null default 0;

create index if not exists cron_runs_created_idx on cron_runs (created_at desc);
