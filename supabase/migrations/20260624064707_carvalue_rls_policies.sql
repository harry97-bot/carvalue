-- 관리자/모더레이터 판별
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role in ('admin','moderator'));
$$;
grant execute on function public.is_admin() to authenticated, anon;

-- RLS 활성화
alter table public.profiles            enable row level security;
alter table public.user_cars           enable row level security;
alter table public.car_value_estimates enable row level security;
alter table public.votes               enable row level security;
alter table public.vote_responses      enable row level security;
alter table public.point_transactions  enable row level security;
alter table public.badges              enable row level security;
alter table public.user_badges         enable row level security;
alter table public.shop_items          enable row level security;
alter table public.user_items          enable row level security;
alter table public.clubs               enable row level security;
alter table public.club_members        enable row level security;
alter table public.posts               enable row level security;
alter table public.comments            enable row level security;
alter table public.likes               enable row level security;
alter table public.reports             enable row level security;
alter table public.drive_courses       enable row level security;
alter table public.saved_drive_courses enable row level security;
alter table public.partner_links       enable row level security;

-- profiles: 공개 읽기, 본인 수정
create policy p_profiles_read on public.profiles for select using (true);
create policy p_profiles_update on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- user_cars: 본인 전체 + 대표차량 공개 읽기
create policy p_cars_read on public.user_cars for select using (auth.uid() = user_id or is_main = true);
create policy p_cars_ins on public.user_cars for insert with check (auth.uid() = user_id);
create policy p_cars_upd on public.user_cars for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy p_cars_del on public.user_cars for delete using (auth.uid() = user_id);

-- car_value_estimates: 본인
create policy p_cve_read on public.car_value_estimates for select using (auth.uid() = user_id);
create policy p_cve_ins on public.car_value_estimates for insert with check (auth.uid() = user_id);

-- votes: 공개 읽기, 관리자 생성/수정
create policy p_votes_read on public.votes for select using (true);
create policy p_votes_admin on public.votes for all using (public.is_admin()) with check (public.is_admin());

-- vote_responses: 본인 조회 (쓰기는 submit_vote 함수 전용)
create policy p_vr_read on public.vote_responses for select using (auth.uid() = user_id);

-- point_transactions: 본인 조회 (쓰기는 함수 전용)
create policy p_pt_read on public.point_transactions for select using (auth.uid() = user_id);

-- badges / shop_items: 공개 읽기, 관리자 관리
create policy p_badges_read on public.badges for select using (true);
create policy p_badges_admin on public.badges for all using (public.is_admin()) with check (public.is_admin());
create policy p_shop_read on public.shop_items for select using (true);
create policy p_shop_admin on public.shop_items for all using (public.is_admin()) with check (public.is_admin());

-- user_badges / user_items: 공개 읽기(프로필 표시), 쓰기는 함수 전용
create policy p_ub_read on public.user_badges for select using (true);
create policy p_ui_read on public.user_items for select using (auth.uid() = user_id);

-- clubs: 공개 읽기, 로그인 생성, 소유자 수정
create policy p_clubs_read on public.clubs for select using (true);
create policy p_clubs_ins on public.clubs for insert with check (auth.uid() = owner_id);
create policy p_clubs_upd on public.clubs for update using (auth.uid() = owner_id or public.is_admin()) with check (true);

-- club_members: 공개 읽기, 본인 가입/탈퇴
create policy p_cm_read on public.club_members for select using (true);
create policy p_cm_ins on public.club_members for insert with check (auth.uid() = user_id);
create policy p_cm_del on public.club_members for delete using (auth.uid() = user_id);

-- posts: 공개 읽기(미삭제), 로그인 작성, 본인/관리자 수정·삭제
create policy p_posts_read on public.posts for select using (is_deleted = false or auth.uid() = user_id or public.is_admin());
create policy p_posts_ins on public.posts for insert with check (auth.uid() = user_id);
create policy p_posts_upd on public.posts for update using (auth.uid() = user_id or public.is_admin()) with check (true);
create policy p_posts_del on public.posts for delete using (auth.uid() = user_id or public.is_admin());

-- comments
create policy p_comments_read on public.comments for select using (is_deleted = false or auth.uid() = user_id or public.is_admin());
create policy p_comments_ins on public.comments for insert with check (auth.uid() = user_id);
create policy p_comments_upd on public.comments for update using (auth.uid() = user_id or public.is_admin()) with check (true);
create policy p_comments_del on public.comments for delete using (auth.uid() = user_id or public.is_admin());

-- likes: 공개 읽기, 본인 추가/삭제
create policy p_likes_read on public.likes for select using (true);
create policy p_likes_ins on public.likes for insert with check (auth.uid() = user_id);
create policy p_likes_del on public.likes for delete using (auth.uid() = user_id);

-- reports: 본인/관리자 조회, 본인 신고
create policy p_reports_read on public.reports for select using (auth.uid() = reporter_id or public.is_admin());
create policy p_reports_ins on public.reports for insert with check (auth.uid() = reporter_id);

-- drive_courses: 공개 읽기, 관리자 관리
create policy p_dc_read on public.drive_courses for select using (true);
create policy p_dc_admin on public.drive_courses for all using (public.is_admin()) with check (public.is_admin());

-- saved_drive_courses: 본인
create policy p_sdc_read on public.saved_drive_courses for select using (auth.uid() = user_id);
create policy p_sdc_ins on public.saved_drive_courses for insert with check (auth.uid() = user_id);
create policy p_sdc_del on public.saved_drive_courses for delete using (auth.uid() = user_id);

-- partner_links: 활성 항목 공개 읽기, 관리자 관리
create policy p_pl_read on public.partner_links for select using (is_active = true or public.is_admin());
create policy p_pl_admin on public.partner_links for all using (public.is_admin()) with check (public.is_admin());