# Civana Privates — Handshake Required (Guest Accept/Decline)

This is a **Next.js (App Router) + Supabase** app for private class requests.

## Key behavior (your update)
- **Handshake is mandatory.**
- Programs Leader must send a **counter-offer**.
- Guest must **Accept** or **Decline**.
- If the guest declines → status becomes **`declined_by_guest`** (final) and that request is closed; guest must submit a new request.

## Roles
- `guest`: can create and view own requests; can edit only while `pending`; can accept/decline counter-offers.
- `front_desk`: read-only access to requests.
- `programs_leader`: can manage requests, create counter-offers, manage reference tables (classes/instructors/locations).

## Setup
1) Create a Supabase project.
2) In Supabase SQL Editor, run:
- `supabase/migrations/0001_init.sql`
3) Enable email magic links in Supabase Auth.
4) Create a user for staff, then update their profile role:
```sql
update public.profiles set role='programs_leader' where email='leader@civana.com';
update public.profiles set role='front_desk' where email='frontdesk@civana.com';
```
5) Configure environment variables:
- copy `.env.example` to `.env.local`
- set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`

## Run locally
```bash
npm i
npm run dev
```

## Notifications
Email (optional) uses Resend and SMS uses Twilio. If env vars are not set, notifications are skipped safely.
