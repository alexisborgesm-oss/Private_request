-- Civana Privates (Handshake required)
-- Run in Supabase SQL Editor.

create extension if not exists pgcrypto;

-- Roles
create type public.app_role as enum ('guest','front_desk','programs_leader');
create type public.request_status as enum ('pending','counter_proposed','approved','rejected','declined_by_guest');

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  first_name text not null,
  last_name text not null,
  phone text not null,
  reservation_number text,
  room_number text,
  role public.app_role not null default 'guest',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

-- Reference tables
create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.instructors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.private_classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_minutes int not null default 60,
  base_price int not null default 150,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Main request table
create table if not exists public.private_requests (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.private_classes(id),
  party_size int not null check (party_size > 0),
  requested_datetime timestamptz not null,
  guest_message text,

  status public.request_status not null default 'pending',

  -- leader counter-offer (handshake)
  proposed_start_datetime timestamptz,
  proposed_end_datetime timestamptz,
  proposed_price int,
  proposed_location_id uuid references public.locations(id),
  proposed_instructor_id uuid references public.instructors(id),

  -- final (only after guest accepts)
  approved_start_datetime timestamptz,
  approved_end_datetime timestamptz,
  final_price int,
  location_id uuid references public.locations(id),
  instructor_id uuid references public.instructors(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_private_requests_updated_at on public.private_requests;
create trigger trg_private_requests_updated_at before update on public.private_requests
for each row execute function public.set_updated_at();

-- Helper: current role
create or replace function public.current_role()
returns public.app_role
language sql
stable
as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'guest'::public.app_role);
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.locations enable row level security;
alter table public.instructors enable row level security;
alter table public.private_classes enable row level security;
alter table public.private_requests enable row level security;

-- Profiles
create policy "profiles_self_read" on public.profiles
for select using (id = auth.uid() or public.current_role() in ('front_desk','programs_leader'));

create policy "profiles_self_write" on public.profiles
for insert with check (id = auth.uid());

create policy "profiles_self_update" on public.profiles
for update using (id = auth.uid()) with check (id = auth.uid());

-- Allow leaders to set roles (optional admin by SQL)
create policy "profiles_staff_update" on public.profiles
for update using (public.current_role() = 'programs_leader');

-- Reference tables readable by anyone authenticated
create policy "ref_read" on public.locations for select using (auth.role() = 'authenticated');
create policy "ref_read2" on public.instructors for select using (auth.role() = 'authenticated');
create policy "ref_read3" on public.private_classes for select using (auth.role() = 'authenticated');

-- Only leaders can mutate reference tables
create policy "ref_write_locations" on public.locations
for all using (public.current_role() = 'programs_leader') with check (public.current_role() = 'programs_leader');

create policy "ref_write_instructors" on public.instructors
for all using (public.current_role() = 'programs_leader') with check (public.current_role() = 'programs_leader');

create policy "ref_write_classes" on public.private_classes
for all using (public.current_role() = 'programs_leader') with check (public.current_role() = 'programs_leader');

-- Requests
create policy "guest_read_own" on public.private_requests
for select using (guest_id = auth.uid() or public.current_role() in ('front_desk','programs_leader'));

create policy "guest_create" on public.private_requests
for insert with check (guest_id = auth.uid());

create policy "guest_update_pending" on public.private_requests
for update using (guest_id = auth.uid() and status = 'pending')
with check (guest_id = auth.uid() and status = 'pending');

create policy "staff_read_all" on public.private_requests
for select using (public.current_role() in ('front_desk','programs_leader'));

create policy "leader_update_all" on public.private_requests
for update using (public.current_role() = 'programs_leader')
with check (public.current_role() = 'programs_leader');

-- RPC: leader proposes counter-offer
create or replace function public.leader_propose_counter_offer(
  p_request_id uuid,
  p_start text,
  p_end text,
  p_price int,
  p_location_id uuid,
  p_instructor_id uuid
) returns void
language plpgsql
security definer
as $$
begin
  if public.current_role() <> 'programs_leader' then
    raise exception 'Not authorized';
  end if;

  update public.private_requests
  set
    status = 'counter_proposed',
    proposed_start_datetime = p_start::timestamptz,
    proposed_end_datetime = p_end::timestamptz,
    proposed_price = p_price,
    proposed_location_id = p_location_id,
    proposed_instructor_id = p_instructor_id
  where id = p_request_id and status = 'pending';

  if not found then
    raise exception 'Request not found or not pending';
  end if;
end;
$$;

-- RPC: guest accepts counter-offer -> final approval
create or replace function public.guest_accept_counter_offer(p_request_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  r public.private_requests;
begin
  select * into r from public.private_requests where id = p_request_id;
  if r.id is null then
    raise exception 'Request not found';
  end if;
  if r.guest_id <> auth.uid() then
    raise exception 'Not authorized';
  end if;
  if r.status <> 'counter_proposed' then
    raise exception 'No counter-offer to accept';
  end if;

  update public.private_requests
  set
    status = 'approved',
    approved_start_datetime = r.proposed_start_datetime,
    approved_end_datetime = r.proposed_end_datetime,
    final_price = r.proposed_price,
    location_id = r.proposed_location_id,
    instructor_id = r.proposed_instructor_id
  where id = p_request_id;
end;
$$;

-- RPC: guest declines counter-offer -> final declined_by_guest
create or replace function public.guest_decline_counter_offer(p_request_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  r public.private_requests;
begin
  select * into r from public.private_requests where id = p_request_id;
  if r.id is null then
    raise exception 'Request not found';
  end if;
  if r.guest_id <> auth.uid() then
    raise exception 'Not authorized';
  end if;
  if r.status <> 'counter_proposed' then
    raise exception 'No counter-offer to decline';
  end if;

  update public.private_requests
  set status = 'declined_by_guest'
  where id = p_request_id;
end;
$$;

-- Seed minimal data
insert into public.locations (name, active)
values ('Sonoran Studio', true), ('Movement Studio', true)
on conflict do nothing;

insert into public.instructors (name, active)
values ('TBD', true)
on conflict do nothing;

insert into public.private_classes (name, description, duration_minutes, base_price, active)
values
  ('Private Yoga', '1:1 or small group yoga session.', 60, 150, true),
  ('Private Meditation', 'Guided meditation tailored to guest goals.', 45, 120, true)
on conflict do nothing;
