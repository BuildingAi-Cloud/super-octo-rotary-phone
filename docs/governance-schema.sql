-- Governance & E-Voting schema
-- Run in Supabase SQL editor.

create table if not exists governance_votes (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  description text,
  status text default 'SCHEDULED',
  deadline timestamptz,
  quorum int default 50,
  participation int default 0,
  created_by text,
  created_at timestamptz default now(),
  building_id text,
  deleted_at timestamptz
);

create table if not exists governance_vote_options (
  id uuid primary key default gen_random_uuid(),
  vote_id uuid references governance_votes(id) on delete cascade,
  label text not null,
  count int default 0
);

create table if not exists governance_meeting_agenda (
  id uuid primary key default gen_random_uuid(),
  vote_id uuid references governance_votes(id) on delete cascade,
  item text not null,
  order_index int default 0
);

create table if not exists governance_casts (
  id uuid primary key default gen_random_uuid(),
  vote_id uuid references governance_votes(id) on delete cascade,
  option_id uuid references governance_vote_options(id) on delete cascade,
  voter_id text not null,
  casted_at timestamptz default now(),
  unique(vote_id, voter_id)
);

create table if not exists governance_audit_log (
  id uuid primary key default gen_random_uuid(),
  vote_id uuid references governance_votes(id) on delete set null,
  action text,
  performed_by text,
  timestamp timestamptz default now()
);

create index if not exists governance_votes_status_idx on governance_votes(status);
create index if not exists governance_votes_deleted_at_idx on governance_votes(deleted_at);
create index if not exists governance_casts_vote_id_idx on governance_casts(vote_id);
