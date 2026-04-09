-- Marketplace listings schema for tenant portal API
-- Apply in Supabase SQL editor or migrations pipeline.

create table if not exists public.marketplace_listings (
  id uuid primary key,
  category text not null,
  title text not null,
  description text not null,
  suite text not null,
  posted_by_user_id text not null,
  posted_by_name text not null,
  price text,
  is_free boolean not null default false,
  interests integer not null default 0,
  contact_preference text not null default 'in_app',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketplace_category_check
    check (category in ('For Sale', 'Free / Giveaway', 'Services', 'Lost & Found', 'Housing Swap')),
  constraint marketplace_contact_preference_check
    check (contact_preference in ('in_app', 'show_email', 'show_phone')),
  constraint marketplace_status_check
    check (status in ('active', 'archived'))
);

create index if not exists marketplace_listings_status_created_idx
  on public.marketplace_listings (status, created_at desc);

create index if not exists marketplace_listings_category_status_idx
  on public.marketplace_listings (category, status);
