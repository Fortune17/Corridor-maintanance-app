-- ==============================================================================
-- Corridor Hill Student Residence Maintenance Management System
-- Supabase PostgreSQL Migration, Schemas, Indexes & Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. ENUMS
create type user_role as enum ('student', 'staff', 'admin');
create type request_priority as enum ('Low', 'Normal', 'High', 'Urgent');
create type request_status as enum (
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Awaiting Parts',
  'Resolved',
  'Closed'
);
create type comment_visibility as enum ('student_visible', 'staff_only');

-- 2. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null unique,
  role user_role not null default 'student',
  student_number text,
  phone_number text,
  room_number text,
  building text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. MAINTENANCE REQUESTS TABLE
create table if not exists public.maintenance_requests (
  id uuid default uuid_generate_v4() primary key,
  reference_number text not null unique,
  student_id uuid references public.profiles(id) on delete restrict not null,
  title text not null,
  description text not null,
  category text not null,
  building text not null,
  room_number text not null,
  priority request_priority not null default 'Normal',
  status request_status not null default 'Submitted',
  assigned_to uuid references public.profiles(id) on delete set null,
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

-- 4. REQUEST COMMENTS TABLE
create table if not exists public.request_comments (
  id uuid default uuid_generate_v4() primary key,
  request_id uuid references public.maintenance_requests(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete set null not null,
  comment text not null,
  visibility comment_visibility not null default 'student_visible',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. REQUEST ATTACHMENTS TABLE
create table if not exists public.request_attachments (
  id uuid default uuid_generate_v4() primary key,
  request_id uuid references public.maintenance_requests(id) on delete cascade not null,
  uploaded_by uuid references public.profiles(id) on delete set null not null,
  storage_path text not null,
  file_name text not null,
  file_type text not null,
  file_size bigint,
  is_completion_proof boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. REQUEST HISTORY AUDIT TRAIL TABLE
create table if not exists public.request_history (
  id uuid default uuid_generate_v4() primary key,
  request_id uuid references public.maintenance_requests(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete set null not null,
  action text not null,
  previous_value text,
  new_value text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

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
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.maintenance_requests enable row level security;
alter table public.request_comments enable row level security;
alter table public.request_attachments enable row level security;
alter table public.request_history enable row level security;
alter table public.notifications enable row level security;

-- Helper function to check if user is staff or admin
create or replace function public.is_staff()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('staff', 'admin')
  );
end;
$$ language plpgsql security definer;

-- PROFILES POLICIES
create policy "Users can view all staff and own profile"
  on public.profiles for select
  using (auth.uid() = id or role in ('staff', 'admin'));

create policy "Users can update only their own profile details"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

-- MAINTENANCE REQUESTS POLICIES
create policy "Students can view only their own requests; Staff can view all"
  on public.maintenance_requests for select
  using (student_id = auth.uid() or public.is_staff());

create policy "Students can insert requests for themselves"
  on public.maintenance_requests for insert
  with check (student_id = auth.uid());

create policy "Staff can update requests"
  on public.maintenance_requests for update
  using (public.is_staff());

create policy "Students can confirm resolution or reopen their own requests"
  on public.maintenance_requests for update
  using (student_id = auth.uid());

-- COMMENTS POLICIES
create policy "Students can read only student_visible comments for their requests; Staff can read all"
  on public.request_comments for select
  using (
    public.is_staff()
    or (
      visibility = 'student_visible'
      and exists (
        select 1 from public.maintenance_requests
        where id = request_comments.request_id and student_id = auth.uid()
      )
    )
  );

create policy "Students can insert student_visible comments on their requests"
  on public.request_comments for insert
  with check (
    author_id = auth.uid()
    and visibility = 'student_visible'
    and exists (
      select 1 from public.maintenance_requests
      where id = request_id and student_id = auth.uid()
    )
  );

create policy "Staff can insert comments of any visibility"
  on public.request_comments for insert
  with check (public.is_staff() and author_id = auth.uid());

-- NOTIFICATIONS POLICIES
create policy "Users can only view and update their own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "Users can mark own notifications as read"
  on public.notifications for update
  using (user_id = auth.uid());
