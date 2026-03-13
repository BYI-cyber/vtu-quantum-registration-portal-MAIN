# Supabase Setup Guide — NQSS 2026 Registration Portal (Updated)

## Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New Project**, give it a name (e.g., `nqss-2026`), set a database password, and click **Create**.

## Step 2: Create the Registrations Table
Go to **SQL Editor** and paste the following updated schema:

```sql
create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  full_name text not null,
  email text not null,
  date_of_birth date,
  whatsapp text not null,
  institution text not null,
  group_name text,
  academic_category text not null,
  event_type text not null,
  track_domain text,
  accommodation text not null,
  eid_url text,
  ticket_url text,
  project_upload_url text
);

-- Allow anonymous inserts (for the form)
alter table public.registrations enable row level security;

create policy "Allow anon inserts"
  on public.registrations
  for insert
  to anon
  with check (true);
```

Click **Run**.

## Step 3: Allow Anonymous Uploads (Storage Policies)
By default, Supabase blocks uploads from the general public. You must run this SQL to allow users to upload their IDs and photos:

```sql
-- Allow anyone to upload to our specific buckets
create policy "Allow public uploads"
  on storage.objects
  for insert
  to anon
  with check (bucket_id in ('eid-uploads', 'ticket-uploads', 'poster-uploads', 'qubithon-uploads'));
```

Click **Run** in the SQL Editor.

## Step 4: Create Storage Buckets
Go to **Storage → New Bucket**. You must create exactly these four buckets, and **CHECK "Public Bucket"** for all of them:

1. `eid-uploads`
2. `ticket-uploads`
3. `poster-uploads`
4. `qubithon-uploads`

## Step 5: Get Your Credentials
Go to **Settings → API**:
- Copy **Project URL** → paste into `.env` as `VITE_SUPABASE_URL`
- Copy **anon public key** → paste into `.env` as `VITE_SUPABASE_ANON_KEY`
