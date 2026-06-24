-- UPDATE 정책 WITH CHECK 강화 (소유권 우회 방지)
drop policy p_posts_upd on public.posts;
create policy p_posts_upd on public.posts for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy p_comments_upd on public.comments;
create policy p_comments_upd on public.comments for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy p_clubs_upd on public.clubs;
create policy p_clubs_upd on public.clubs for update
  using (auth.uid() = owner_id or public.is_admin())
  with check (auth.uid() = owner_id or public.is_admin());

-- 포인트 관련 함수 anon 차단 (로그인 사용자만)
revoke execute on function public.submit_vote(uuid, text) from public, anon;
revoke execute on function public.purchase_item(uuid) from public, anon;