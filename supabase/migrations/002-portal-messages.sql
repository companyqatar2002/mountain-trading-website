-- Mountain Trading & Contracting W.L.L
-- Migration 002: Private portal messages
-- Run only after 001-admin-security.sql.
-- This table is for messages sent by signed-in users to Admins.
-- Do not expose public contact_messages records to ordinary Users.

create table if not exists public.portal_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null check (char_length(trim(subject)) between 1 and 160),
  message text not null check (char_length(trim(message)) between 1 and 5000),
  priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high', 'urgent')),
  is_read boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.portal_messages enable row level security;

-- A normal User can create a message only in their own name.
drop policy if exists "Users can send their own portal messages" on public.portal_messages;
create policy "Users can send their own portal messages"
  on public.portal_messages for insert to authenticated
  with check (sender_id = auth.uid());

-- Normal Users see only their own messages; Admins see every message.
drop policy if exists "Users read own messages and admins read all" on public.portal_messages;
create policy "Users read own messages and admins read all"
  on public.portal_messages for select to authenticated
  using (
    sender_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Only Admins may mark messages read or archive them.
drop policy if exists "Admins manage portal messages" on public.portal_messages;
create policy "Admins manage portal messages"
  on public.portal_messages for update to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Only Admins may permanently delete portal messages.
drop policy if exists "Admins delete portal messages" on public.portal_messages;
create policy "Admins delete portal messages"
  on public.portal_messages for delete to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create or replace function public.set_portal_message_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists portal_messages_set_updated_at on public.portal_messages;
create trigger portal_messages_set_updated_at
before update on public.portal_messages
for each row execute function public.set_portal_message_updated_at();
