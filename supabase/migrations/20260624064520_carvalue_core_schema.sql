-- ===== 공통 updated_at 트리거 =====
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- ===== 4.1 profiles =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  uid text unique not null,
  nickname text not null,
  profile_image_url text,
  background_image_url text,
  bio text,
  main_car_id uuid,
  points integer not null default 0,
  role text not null default 'user' check (role in ('user','moderator','admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ===== 4.2 user_cars =====
create table public.user_cars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  brand text not null,
  model text not null,
  trim text,
  year integer not null,
  mileage integer not null default 0,
  fuel_type text,
  purchase_price integer,
  accident_status text default 'unknown' check (accident_status in ('none','minor','accident','unknown')),
  is_main boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ===== 4.3 car_value_estimates =====
create table public.car_value_estimates (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.user_cars(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  original_price integer,
  estimated_min_price integer,
  estimated_max_price integer,
  depreciation_rate_min numeric,
  depreciation_rate_max numeric,
  source text default 'internal_estimate',
  created_at timestamptz default now()
);

-- ===== 4.4 votes =====
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null check (category in ('brand','model','trim','option','design','lifestyle')),
  option_a text not null,
  option_b text not null,
  option_a_image_url text,
  option_b_image_url text,
  brand text, model text, trim text,
  reward_points integer not null default 10,
  votes_a integer not null default 0,
  votes_b integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  is_active boolean default true,
  starts_at timestamptz default now(),
  ends_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ===== 4.5 vote_responses =====
create table public.vote_responses (
  id uuid primary key default gen_random_uuid(),
  vote_id uuid not null references public.votes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  selected_option text not null check (selected_option in ('A','B')),
  points_given integer not null default 0,
  created_at timestamptz default now(),
  unique(vote_id, user_id)
);

-- ===== 4.6 point_transactions =====
create table public.point_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  transaction_type text not null check (transaction_type in ('earn','spend','adjust')),
  amount integer not null,
  reason text not null,
  reference_type text,
  reference_id uuid,
  created_at timestamptz default now()
);

-- ===== 4.7 badges / 4.8 user_badges =====
create table public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null, description text, image_url text,
  condition_type text, condition_value integer,
  rarity text default 'normal', is_active boolean default true,
  created_at timestamptz default now()
);
create table public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  acquired_at timestamptz default now(),
  is_featured boolean default false,
  unique(user_id, badge_id)
);

-- ===== 4.9 shop_items / 4.10 user_items =====
create table public.shop_items (
  id uuid primary key default gen_random_uuid(),
  name text not null, description text,
  item_type text not null check (item_type in ('profile_frame','profile_background','car_card_skin','nickname_effect','emote')),
  image_url text, price_points integer not null,
  rarity text default 'normal', is_limited boolean default false, is_active boolean default true,
  created_at timestamptz default now()
);
create table public.user_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id uuid not null references public.shop_items(id) on delete cascade,
  purchased_at timestamptz default now(),
  is_equipped boolean default false,
  unique(user_id, item_id)
);

-- ===== 4.11 clubs / 4.12 club_members =====
create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null, description text,
  category text not null, brand text, model text, region text,
  cover_image_url text,
  owner_id uuid references public.profiles(id) on delete set null,
  member_count integer default 0, is_active boolean default true,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table public.club_members (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz default now(),
  unique(club_id, user_id)
);

-- ===== 4.13 posts / 4.14 comments =====
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references public.clubs(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  title text not null, content text not null,
  image_urls text[],
  like_count integer default 0, comment_count integer default 0,
  is_notice boolean default false, is_deleted boolean default false,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  content text not null,
  parent_comment_id uuid references public.comments(id) on delete cascade,
  is_deleted boolean default false,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

-- ===== 4.15 likes / 4.16 reports =====
create table public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null, target_id uuid not null,
  created_at timestamptz default now(),
  unique(user_id, target_type, target_id)
);
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null, target_id uuid not null,
  reason text not null, status text default 'pending', admin_note text,
  created_at timestamptz default now(), resolved_at timestamptz
);

-- ===== 4.17 drive_courses / 4.18 saved_drive_courses =====
create table public.drive_courses (
  id uuid primary key default gen_random_uuid(),
  title text not null, description text, region text, theme text,
  distance_km numeric, duration_minutes integer, difficulty text,
  recommended_car_type text, image_url text, map_url text,
  rating numeric default 0, is_active boolean default true,
  created_at timestamptz default now()
);
create table public.saved_drive_courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  drive_course_id uuid not null references public.drive_courses(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, drive_course_id)
);

-- ===== 4.19 partner_links =====
create table public.partner_links (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  partner_type text not null check (partner_type in ('nowcar','oilnice','ads','external')),
  url text not null, description text, is_active boolean default true,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

-- main_car_id FK (user_cars 생성 후 연결)
alter table public.profiles
  add constraint profiles_main_car_fk foreign key (main_car_id) references public.user_cars(id) on delete set null;

-- ===== 인덱스 =====
create index idx_profiles_uid on public.profiles(uid);
create index idx_user_cars_user_id on public.user_cars(user_id);
create index idx_votes_category on public.votes(category);
create index idx_votes_active on public.votes(is_active);
create index idx_vote_responses_vote_id on public.vote_responses(vote_id);
create index idx_vote_responses_user_id on public.vote_responses(user_id);
create index idx_posts_club_id on public.posts(club_id);
create index idx_posts_user_id on public.posts(user_id);
create index idx_comments_post_id on public.comments(post_id);
create index idx_club_members_club_id on public.club_members(club_id);
create index idx_point_transactions_user_id on public.point_transactions(user_id);

-- ===== updated_at 트리거 =====
create trigger t_profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger t_user_cars_updated before update on public.user_cars for each row execute function public.set_updated_at();
create trigger t_votes_updated before update on public.votes for each row execute function public.set_updated_at();
create trigger t_clubs_updated before update on public.clubs for each row execute function public.set_updated_at();
create trigger t_posts_updated before update on public.posts for each row execute function public.set_updated_at();
create trigger t_comments_updated before update on public.comments for each row execute function public.set_updated_at();
create trigger t_partner_links_updated before update on public.partner_links for each row execute function public.set_updated_at();