-- GREVA CRM Schema + RLS
-- Run this in Supabase SQL Editor (never use service role in app code)

-- Users (extends auth.users; id = auth.uid())
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  role text not null check (role in ('super_admin', 'employee')),
  created_at timestamptz default now()
);

-- Leads
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  source text,
  status text not null default 'new' check (status in ('new','contacted','follow_up','closed','lost')),
  deal_value numeric default 0,
  assigned_to uuid references public.users(id) on delete set null,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz default now()
);

-- Notes
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  note_text text not null,
  created_at timestamptz default now()
);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  assigned_to uuid not null references public.users(id) on delete cascade,
  due_date date,
  status text not null default 'pending' check (status in ('pending','completed'))
);

-- Indexes
create index if not exists idx_leads_assigned_to on public.leads(assigned_to);
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_notes_lead_id on public.notes(lead_id);
create index if not exists idx_tasks_assigned_to on public.tasks(assigned_to);
create index if not exists idx_tasks_lead_id on public.tasks(lead_id);

-- RLS: enable
alter table public.users enable row level security;
alter table public.leads enable row level security;
alter table public.notes enable row level security;
alter table public.tasks enable row level security;

-- Helper: get current user's role
create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

-- USERS: all authenticated can read users (for assign dropdowns etc); only super_admin can insert/update
create policy "users_select_authenticated"
  on public.users for select
  to authenticated
  using (true);

create policy "users_insert_super_admin"
  on public.users for insert
  to authenticated
  with check (public.get_my_role() = 'super_admin');

create policy "users_update_super_admin"
  on public.users for update
  to authenticated
  using (public.get_my_role() = 'super_admin');

-- LEADS: super_admin all; employee only assigned
create policy "leads_select_super_admin"
  on public.leads for select
  to authenticated
  using (public.get_my_role() = 'super_admin');

create policy "leads_select_employee_assigned"
  on public.leads for select
  to authenticated
  using (
    public.get_my_role() = 'employee'
    and assigned_to = auth.uid()
  );

create policy "leads_insert_super_admin"
  on public.leads for insert
  to authenticated
  with check (public.get_my_role() = 'super_admin');

create policy "leads_update_super_admin"
  on public.leads for update
  to authenticated
  using (public.get_my_role() = 'super_admin');

create policy "leads_update_employee_assigned"
  on public.leads for update
  to authenticated
  using (
    public.get_my_role() = 'employee'
    and assigned_to = auth.uid()
  );

create policy "leads_delete_super_admin"
  on public.leads for delete
  to authenticated
  using (public.get_my_role() = 'super_admin');

-- NOTES: super_admin all; employee only for leads assigned to them
create policy "notes_select_super_admin"
  on public.notes for select
  to authenticated
  using (public.get_my_role() = 'super_admin');

create policy "notes_select_employee_lead_assigned"
  on public.notes for select
  to authenticated
  using (
    public.get_my_role() = 'employee'
    and exists (
      select 1 from public.leads l
      where l.id = notes.lead_id and l.assigned_to = auth.uid()
    )
  );

create policy "notes_insert_super_admin"
  on public.notes for insert
  to authenticated
  with check (public.get_my_role() = 'super_admin');

create policy "notes_insert_employee_lead_assigned"
  on public.notes for insert
  to authenticated
  with check (
    public.get_my_role() = 'employee'
    and user_id = auth.uid()
    and exists (
      select 1 from public.leads l
      where l.id = lead_id and l.assigned_to = auth.uid()
    )
  );

create policy "notes_delete_super_admin"
  on public.notes for delete
  to authenticated
  using (public.get_my_role() = 'super_admin');

-- TASKS: super_admin all; employee only own tasks
create policy "tasks_select_super_admin"
  on public.tasks for select
  to authenticated
  using (public.get_my_role() = 'super_admin');

create policy "tasks_select_employee_own"
  on public.tasks for select
  to authenticated
  using (
    public.get_my_role() = 'employee'
    and assigned_to = auth.uid()
  );

create policy "tasks_insert_super_admin"
  on public.tasks for insert
  to authenticated
  with check (public.get_my_role() = 'super_admin');

create policy "tasks_update_super_admin"
  on public.tasks for update
  to authenticated
  using (public.get_my_role() = 'super_admin');

create policy "tasks_update_employee_own"
  on public.tasks for update
  to authenticated
  using (
    public.get_my_role() = 'employee'
    and assigned_to = auth.uid()
  );

create policy "tasks_delete_super_admin"
  on public.tasks for delete
  to authenticated
  using (public.get_my_role() = 'super_admin');

-- Trigger: create users row on signup (optional; you can also create via admin only)
-- Uncomment if you want first user to self-register as super_admin (not recommended for production)
-- create or replace function public.handle_new_user()
-- returns trigger language plpgsql security definer set search_path = public
-- as $$
-- begin
--   insert into public.users (id, name, role)
--   values (new.id, new.raw_user_meta_data->>'name', 'employee');
--   return new;
-- end;
-- $$;
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute function public.handle_new_user();
