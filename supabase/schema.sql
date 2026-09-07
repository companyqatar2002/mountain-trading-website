-- ============================================================
-- Mountain Trading & Contracting W.L.L — Supabase schema
-- Run this once in Supabase: Dashboard > SQL Editor > New query
-- ============================================================

-- 1. PROFILES table (extends Supabase's built-in auth.users with a role)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Anyone logged in can read all profiles (needed to show names/roles in the portal)
create policy "Logged-in users can view profiles"
  on public.profiles for select
  using (auth.role() = 'authenticated');

-- Admins can update any profile (e.g. promote/demote roles)
create policy "Admins can update profiles"
  on public.profiles for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Note: inserting new profiles is done by the admin-create-user Edge Function
-- using the service_role key, which bypasses RLS by design — so no insert
-- policy is needed for normal logged-in users.


-- 2. DOCUMENTS table (metadata for files admin imports)
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'General',
  file_path text not null,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.documents enable row level security;

-- Any logged-in user (admin or normal user) can view/download documents
create policy "Logged-in users can view documents"
  on public.documents for select
  using (auth.role() = 'authenticated');

-- Only admins can add documents
create policy "Admins can insert documents"
  on public.documents for insert
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Only admins can delete documents
create policy "Admins can delete documents"
  on public.documents for delete
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );


-- 3. CONTACT MESSAGES table (public contact form submissions)
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Anyone (including anonymous website visitors) can submit the contact form
create policy "Anyone can send a message"
  on public.contact_messages for insert
  with check (true);

-- Only logged-in admins can read submitted messages
create policy "Admins can view messages"
  on public.contact_messages for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );


-- 4. STORAGE bucket for document files (private — accessed only via signed URLs)
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "Logged-in users can read document files"
  on storage.objects for select
  using (bucket_id = 'documents' and auth.role() = 'authenticated');

create policy "Admins can upload document files"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Admins can delete document files"
  on storage.objects for delete
  using (
    bucket_id = 'documents'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );


-- ============================================================
-- 5. Create your first admin account
-- ============================================================
-- Step A: Dashboard > Authentication > Users > Add user
--         (enter an email + password, tick "Auto Confirm User")
-- Step B: copy the new user's UUID, then run this (edit the values):
--
-- insert into public.profiles (id, full_name, role)
-- values ('paste-user-uuid-here', 'Gousul Hoque Chowdhury', 'admin');
-- ============================================================
