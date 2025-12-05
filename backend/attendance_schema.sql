-- Enable Row Level Security
alter table if exists public.subjects enable row level security;
alter table if exists public.timetable enable row level security;

-- SUBJECTS TABLE (Optimized with JSONB)
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(), -- Auto-link to logged-in user
  code text,
  name text not null,
  total_hours int default 0,
  present_hours int default 0,
  logs jsonb default '[]'::jsonb, -- Array of { date: "2024-01-01", status: "Present", slot: "1" }
  settings jsonb default '{"target": 75, "credits": 3}'::jsonb,
  created_at timestamptz default now()
);

-- TIMETABLE TABLE
create table if not exists public.timetable (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique default auth.uid(),
  schedule jsonb default '{}'::jsonb, -- Keyed by day: { "Monday": [{...}, {...}] }
  updated_at timestamptz default now()
);

-- RLS POLICIES (Users manage their own data)
create policy "Users can view their own subjects" 
  on public.subjects for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own subjects" 
  on public.subjects for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own subjects" 
  on public.subjects for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own subjects" 
  on public.subjects for delete 
  using (auth.uid() = user_id);

-- Timetable Policies
create policy "Users can view their own timetable" 
  on public.timetable for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own timetable" 
  on public.timetable for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own timetable" 
  on public.timetable for update 
  using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists subjects_user_id_idx on public.subjects(user_id);
