-- =====================================================
-- HANDSHAKE MODE RPCs
-- =====================================================

-- Helper: validate time conflicts
create or replace function check_private_conflict(
  p_start timestamptz,
  p_end timestamptz,
  p_instructor uuid,
  p_location uuid,
  p_request_id uuid default null
)
returns boolean
language plpgsql
as $$
begin
  return exists (
    select 1
    from private_requests r
    where r.status = 'approved'
      and (p_request_id is null or r.id <> p_request_id)
      and (
        (r.approved_start_datetime, r.approved_end_datetime)
        overlaps
        (p_start, p_end)
      )
      and (
        r.instructor_id = p_instructor
        or r.location_id = p_location
      )
  );
end;
$$;


-- =====================================================
-- LEADER SEND COUNTER OFFER
-- =====================================================
create or replace function leader_send_counter_offer(
  p_request_id uuid,
  p_start timestamptz,
  p_end timestamptz,
  p_price numeric,
  p_location uuid,
  p_instructor uuid
)
returns void
language plpgsql
security definer
as $$
begin
  -- Validate conflict BEFORE proposing
  if check_private_conflict(p_start, p_end, p_instructor, p_location, p_request_id) then
    raise exception 'Schedule conflict detected';
  end if;

  update private_requests
  set
    status = 'counter_proposed',
    proposed_start_datetime = p_start,
    proposed_end_datetime = p_end,
    proposed_price = p_price,
    proposed_location_id = p_location,
    proposed_instructor_id = p_instructor,
    proposed_at = now()
  where id = p_request_id
    and status = 'pending';
end;
$$;


-- =====================================================
-- GUEST ACCEPT COUNTER OFFER
-- =====================================================
create or replace function guest_accept_counter_offer(
  p_request_id uuid
)
returns void
language plpgsql
security definer
as $$
declare
  v_start timestamptz;
  v_end timestamptz;
  v_price numeric;
  v_location uuid;
  v_instructor uuid;
begin

  select
    proposed_start_datetime,
    proposed_end_datetime,
    proposed_price,
    proposed_location_id,
    proposed_instructor_id
  into
    v_start,
    v_end,
    v_price,
    v_location,
    v_instructor
  from private_requests
  where id = p_request_id
    and status = 'counter_proposed';

  if v_start is null then
    raise exception 'No counter offer found';
  end if;

  -- Validate again to prevent race condition
  if check_private_conflict(v_start, v_end, v_instructor, v_location, p_request_id) then
    raise exception 'Schedule conflict detected during acceptance';
  end if;

  update private_requests
  set
    status = 'approved',
    approved_start_datetime = v_start,
    approved_end_datetime = v_end,
    final_price = v_price,
    location_id = v_location,
    instructor_id = v_instructor
  where id = p_request_id;
end;
$$;


-- =====================================================
-- GUEST DECLINE COUNTER OFFER (FINAL STATE)
-- =====================================================
create or replace function guest_decline_counter_offer(
  p_request_id uuid
)
returns void
language plpgsql
security definer
as $$
begin
  update private_requests
  set status = 'declined_by_guest'
  where id = p_request_id
    and status = 'counter_proposed';
end;
$$;


-- =====================================================
-- LEADER REJECT REQUEST
-- =====================================================
create or replace function leader_reject_request(
  p_request_id uuid
)
returns void
language plpgsql
security definer
as $$
begin
  update private_requests
  set status = 'rejected'
  where id = p_request_id
    and status in ('pending','counter_proposed');
end;
$$;
