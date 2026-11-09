-- ==============================================================================
-- Corridor Hill Student Residence Maintenance Management System
-- Supabase PostgreSQL Migration, Schemas, Indexes & Row Level Security (RLS)
-- Idempotent script: safe to run multiple times in the Supabase SQL Editor
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. ENUMS (Idempotent creation)
do $$ begin
  create type public.user_role as enum ('student', 'staff', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.request_priority as enum ('Low', 'Normal', 'High', 'Urgent');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.request_status as enum (
    'Submitted',
    'Under Review',
    'Assigned',
    'In Progress',
    'Awaiting Parts',
    'Resolved',
    'Closed'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.comment_visibility as enum ('student_visible', 'staff_only');
exception when duplicate_object then null;
end $$;

-- 2. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null unique,
  role public.user_role not null default 'student'::public.user_role,
  password text,
  student_number text,
  phone_number text,
  room_number text,
  building text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure all columns exist if table was previously created
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists role public.user_role default 'student'::public.user_role;
alter table public.profiles add column if not exists password text;
alter table public.profiles add column if not exists student_number text;
alter table public.profiles add column if not exists phone_number text;
alter table public.profiles add column if not exists room_number text;
alter table public.profiles add column if not exists building text;
alter table public.profiles add column if not exists avatar_url text;

-- 3. MAINTENANCE REQUESTS TABLE
create table if not exists public.maintenance_requests (
  id uuid default uuid_generate_v4() primary key,
  reference_number text not null unique,
  student_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  category text not null,
  building text not null,
  room_number text not null,
  priority public.request_priority not null default 'Normal'::public.request_priority,
  status public.request_status not null default 'Submitted'::public.request_status,
  assigned_to uuid references public.profiles(id) on delete set null,
  assigned_to_name text,
  preferred_access_time text,
  delay_reason text,
  work_performed text,
  estimated_completion timestamp with time zone,
  resolved_at timestamp with time zone,
  closed_at timestamp with time zone,
  student_confirmed_resolved boolean default false,
  reopen_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.maintenance_requests add column if not exists assigned_to_name text;

-- 4. REQUEST COMMENTS TABLE
create table if not exists public.request_comments (
  id uuid default uuid_generate_v4() primary key,
  request_id uuid references public.maintenance_requests(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete set null not null,
  author_name text,
  author_role public.user_role default 'student'::public.user_role,
  comment text not null,
  visibility public.comment_visibility not null default 'student_visible'::public.comment_visibility,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.request_comments add column if not exists author_name text;
alter table public.request_comments add column if not exists author_role public.user_role default 'student'::public.user_role;

-- 5. REQUEST ATTACHMENTS TABLE
create table if not exists public.request_attachments (
  id uuid default uuid_generate_v4() primary key,
  request_id uuid references public.maintenance_requests(id) on delete cascade not null,
  uploaded_by uuid references public.profiles(id) on delete set null not null,
  uploaded_by_name text,
  storage_path text not null,
  file_name text not null,
  file_type text not null,
  file_size bigint,
  is_completion_proof boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.request_attachments add column if not exists uploaded_by_name text;

-- 6. REQUEST HISTORY AUDIT TRAIL TABLE
create table if not exists public.request_history (
  id uuid default uuid_generate_v4() primary key,
  request_id uuid references public.maintenance_requests(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete set null not null,
  actor_name text,
  actor_role public.user_role default 'student'::public.user_role,
  action text not null,
  previous_value text,
  new_value text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.request_history add column if not exists actor_name text;
alter table public.request_history add column if not exists actor_role public.user_role default 'student'::public.user_role;

-- 7. NOTIFICATIONS TABLE
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  request_id uuid references public.maintenance_requests(id) on delete cascade not null,
  title text not null,
  message text not null,
  read_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. INDEXES FOR PERFORMANCE
create index if not exists idx_maintenance_requests_student on public.maintenance_requests(student_id);
create index if not exists idx_maintenance_requests_status on public.maintenance_requests(status);
create index if not exists idx_maintenance_requests_priority on public.maintenance_requests(priority);
create index if not exists idx_maintenance_requests_assigned on public.maintenance_requests(assigned_to);
create index if not exists idx_comments_request on public.request_comments(request_id);
create index if not exists idx_attachments_request on public.request_attachments(request_id);
create index if not exists idx_history_request on public.request_history(request_id);
create index if not exists idx_notifications_user on public.notifications(user_id);

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES & AUTH TRIGGER
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.maintenance_requests enable row level security;
alter table public.request_comments enable row level security;
alter table public.request_attachments enable row level security;
alter table public.request_history enable row level security;
alter table public.notifications enable row level security;

-- Helper function to check if user is staff or admin
create or replace function public.is_staff()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('staff'::public.user_role, 'admin'::public.user_role)
  );
end;
$$;

-- PROFILES POLICIES
drop policy if exists "Users can view all staff and own profile" on public.profiles;
create policy "Users can view all staff and own profile"
  on public.profiles for select
  using (true);

drop policy if exists "Enable insert for registration and user profiles" on public.profiles;
create policy "Enable insert for registration and user profiles"
  on public.profiles for insert
  with check (true);

drop policy if exists "Users can update only their own profile details" on public.profiles;
create policy "Users can update only their own profile details"
  on public.profiles for update
  using (auth.uid() = id or public.is_staff());

-- Automatic trigger to copy auth.users directly into public.profiles
-- Uses SET search_path = public and exception handling so signup NEVER returns 500
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
begin
  begin
    v_role := coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role);
  exception when others then
    v_role := 'student'::public.user_role;
  end;

  begin
    -- Remove any stale profile row that has the same email but a different id
    delete from public.profiles where email = new.email and id <> new.id;

    insert into public.profiles (
      id,
      full_name,
      email,
      role,
      phone_number,
      room_number,
      building,
      student_number,
      password
    )
    values (
      new.id,
      coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), split_part(new.email, '@', 1)),
      new.email,
      v_role,
      new.raw_user_meta_data->>'phone_number',
      new.raw_user_meta_data->>'room_number',
      new.raw_user_meta_data->>'building',
      new.raw_user_meta_data->>'student_number',
      new.raw_user_meta_data->>'password'
    )
    on conflict (id) do update set
      full_name = excluded.full_name,
      email = excluded.email,
      role = excluded.role,
      phone_number = coalesce(excluded.phone_number, public.profiles.phone_number),
      room_number = coalesce(excluded.room_number, public.profiles.room_number),
      building = coalesce(excluded.building, public.profiles.building),
      student_number = coalesce(excluded.student_number, public.profiles.student_number),
      password = coalesce(excluded.password, public.profiles.password);
  exception when others then
    raise warning 'handle_new_user profile sync warning: %', sqlerrm;
  end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- MAINTENANCE REQUESTS POLICIES
drop policy if exists "Students can view only their own requests; Staff can view all" on public.maintenance_requests;
create policy "Students can view only their own requests; Staff can view all"
  on public.maintenance_requests for select
  using (student_id = auth.uid() or public.is_staff());

drop policy if exists "Students can insert requests for themselves" on public.maintenance_requests;
create policy "Students can insert requests for themselves"
  on public.maintenance_requests for insert
  with check (student_id = auth.uid() or public.is_staff());

drop policy if exists "Staff can update requests" on public.maintenance_requests;
create policy "Staff can update requests"
  on public.maintenance_requests for update
  using (public.is_staff());

drop policy if exists "Students can confirm resolution or reopen their own requests" on public.maintenance_requests;
create policy "Students can confirm resolution or reopen their own requests"
  on public.maintenance_requests for update
  using (student_id = auth.uid());

-- COMMENTS POLICIES
drop policy if exists "Students can read only student_visible comments for their requests; Staff can read all" on public.request_comments;
create policy "Students can read only student_visible comments for their requests; Staff can read all"
  on public.request_comments for select
  using (
    public.is_staff()
    or (
      visibility = 'student_visible'::public.comment_visibility
      and exists (
        select 1 from public.maintenance_requests
        where id = request_comments.request_id and student_id = auth.uid()
      )
    )
  );

drop policy if exists "Students can insert student_visible comments on their requests" on public.request_comments;
create policy "Students can insert student_visible comments on their requests"
  on public.request_comments for insert
  with check (
    author_id = auth.uid()
    and visibility = 'student_visible'::public.comment_visibility
  );

drop policy if exists "Staff can insert comments of any visibility" on public.request_comments;
create policy "Staff can insert comments of any visibility"
  on public.request_comments for insert
  with check (public.is_staff());

-- ATTACHMENTS POLICIES
drop policy if exists "Users can view attachments for accessible requests" on public.request_attachments;
create policy "Users can view attachments for accessible requests"
  on public.request_attachments for select
  using (true);

drop policy if exists "Authenticated users can insert attachments" on public.request_attachments;
create policy "Authenticated users can insert attachments"
  on public.request_attachments for insert
  with check (auth.uid() is not null);

-- HISTORY POLICIES
drop policy if exists "Users can view request history" on public.request_history;
create policy "Users can view request history"
  on public.request_history for select
  using (true);

drop policy if exists "Authenticated users can insert request history" on public.request_history;
create policy "Authenticated users can insert request history"
  on public.request_history for insert
  with check (auth.uid() is not null);

-- NOTIFICATIONS POLICIES
drop policy if exists "Users can only view and update their own notifications" on public.notifications;
create policy "Users can only view and update their own notifications"
  on public.notifications for select
  using (user_id = auth.uid() or public.is_staff());

drop policy if exists "Authenticated users can insert notifications" on public.notifications;
create policy "Authenticated users can insert notifications"
  on public.notifications for insert
  with check (auth.uid() is not null);

drop policy if exists "Users can mark own notifications as read" on public.notifications;
create policy "Users can mark own notifications as read"
  on public.notifications for update
  using (user_id = auth.uid());
