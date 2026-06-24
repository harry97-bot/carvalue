-- ===== carvalue 초기 스키마 (RLS + 익명 인증 기반) =====
create type ownership_type as enum ('owned','lease','rent');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  consent_lead boolean not null default false,        -- 리드 전달 동의 (opt-in)
  consent_marketing boolean not null default false,   -- 마케팅 수신 동의 (opt-in)
  created_at timestamptz not null default now()
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  make text not null,
  model text not null,
  trim text,
  year int not null,
  mileage int not null default 0,
  ownership ownership_type not null default 'owned',
  purchase_price int,
  term_end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.valuations (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  estimated_value int not null,
  low_value int not null,
  high_value int not null,
  mileage_at int not null,
  method text not null default 'depreciation_model_v1',
  computed_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  channel text not null,                              -- 'nowcar' | 'buyback' | 'insurance'
  score int,
  snapshot jsonb,
  status text not null default 'new',
  consented_at timestamptz,
  created_at timestamptz not null default now()
);

create index on public.vehicles(user_id);
create index on public.valuations(vehicle_id);
create index on public.leads(user_id);

-- ===== RLS =====
alter table public.profiles  enable row level security;
alter table public.vehicles  enable row level security;
alter table public.valuations enable row level security;
alter table public.leads     enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own vehicles" on public.vehicles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own valuations" on public.valuations
  for all
  using (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.user_id = auth.uid()))
  with check (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.user_id = auth.uid()));

create policy "own leads" on public.leads
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== 트리거: 가입 시 프로필 자동 생성 =====
create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- ===== 트리거: updated_at 자동 갱신 =====
create function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create trigger vehicles_touch
  before update on public.vehicles for each row execute function public.touch_updated_at();