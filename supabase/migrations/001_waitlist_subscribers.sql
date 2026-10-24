-- MILEZERO waitlist: double opt-in and unsubscribe support.
-- Run in Supabase SQL Editor. Browser clients receive no table access; the server uses SUPABASE_SECRET_KEY.

create table if not exists public.waitlist_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  consent_version text not null,
  consented_at timestamptz not null,
  confirmed_at timestamptz null,
  unsubscribed_at timestamptz null,
  verification_token_hash text null,
  verification_expires_at timestamptz null,
  unsubscribe_token_hash text not null,
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint waitlist_subscribers_email_format check (email = lower(email) and position('@' in email) > 1)
);

create index if not exists waitlist_subscribers_verification_token_idx
  on public.waitlist_subscribers (verification_token_hash)
  where verification_token_hash is not null;

create index if not exists waitlist_subscribers_unsubscribe_token_idx
  on public.waitlist_subscribers (unsubscribe_token_hash)
  where unsubscribe_token_hash is not null;

alter table public.waitlist_subscribers enable row level security;

-- Intentionally do not add anon/authenticated policies. Only the server's secret key can access this table.
revoke all on table public.waitlist_subscribers from anon, authenticated;
grant select, insert, update, delete on table public.waitlist_subscribers to service_role;

create or replace function public.set_waitlist_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists waitlist_subscribers_updated_at on public.waitlist_subscribers;
create trigger waitlist_subscribers_updated_at
before update on public.waitlist_subscribers
for each row execute function public.set_waitlist_updated_at();

comment on table public.waitlist_subscribers is
  'MILEZERO marketing waitlist. Pending subscribers must confirm by email; unsubscribe records are retained only to respect opt-out requests.';
