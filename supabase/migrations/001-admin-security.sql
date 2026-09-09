-- Mountain Trading & Contracting W.L.L
-- Migration 001: Admin security and management rules
-- Run once in Supabase SQL Editor.

-- The database, not only the browser UI, enforces that at least one
-- administrator always remains in the system.
create or replace function public.prevent_last_admin_removal()
returns trigger
language plpgsql
as $$
begin
  if old.role = 'admin'
     and (tg_op = 'DELETE' or new.role <> 'admin')
     and not exists (
       select 1
       from public.profiles
       where role = 'admin' and id <> old.id
     ) then
    raise exception 'At least one Admin user must remain in the system.'
      using errcode = 'P0001';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_require_admin on public.profiles;

create trigger profiles_require_admin
before update of role or delete on public.profiles
for each row execute function public.prevent_last_admin_removal();

-- Admins may maintain document metadata. Existing document insert/delete
-- policies are left unchanged.
drop policy if exists "Admins can update documents" on public.documents;
create policy "Admins can update documents"
  on public.documents for update to authenticated
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

-- Only Admins may remove public contact enquiries.
drop policy if exists "Admins can delete contact messages" on public.contact_messages;
create policy "Admins can delete contact messages"
  on public.contact_messages for delete to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
