-- ============================================================
-- CANADA IMMIGRATION SERVICES
-- ADMINISTRATOR SECURITY STRUCTURE
-- ============================================================

create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'admin'
    check (role in ('admin', 'super_admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_admin_users_active
on public.admin_users(is_active);

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_users
    where id = auth.uid()
      and is_active = true
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_users
    where id = auth.uid()
      and role = 'super_admin'
      and is_active = true
  );
$$;

create policy "Admins can view their own admin profile"
on public.admin_users
for select
to authenticated
using (
  id = auth.uid()
);

create policy "Super admins can view admin profiles"
on public.admin_users
for select
to authenticated
using (
  public.is_super_admin()
);

create policy "Super admins can create admin profiles"
on public.admin_users
for insert
to authenticated
with check (
  public.is_super_admin()
);

create policy "Super admins can update admin profiles"
on public.admin_users
for update
to authenticated
using (
  public.is_super_admin()
)
with check (
  public.is_super_admin()
);

create policy "Super admins can delete admin profiles"
on public.admin_users
for delete
to authenticated
using (
  public.is_super_admin()
);

create trigger set_admin_users_updated_at
before update on public.admin_users
for each row
execute function public.set_updated_at();
