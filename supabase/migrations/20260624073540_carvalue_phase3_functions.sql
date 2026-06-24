-- 소모임 가입
create or replace function public.join_club(p_club_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_id uuid;
begin
  if v_uid is null then raise exception 'auth required'; end if;
  insert into public.club_members(club_id, user_id) values (p_club_id, v_uid)
    on conflict (club_id, user_id) do nothing returning id into v_id;
  if v_id is not null then
    update public.clubs set member_count = member_count + 1 where id = p_club_id;
    return json_build_object('status','ok','joined',true);
  end if;
  return json_build_object('status','already_member','joined',true);
end; $$;
grant execute on function public.join_club(uuid) to authenticated;
revoke execute on function public.join_club(uuid) from public, anon;

-- 소모임 탈퇴
create or replace function public.leave_club(p_club_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_cnt int;
begin
  if v_uid is null then raise exception 'auth required'; end if;
  delete from public.club_members where club_id = p_club_id and user_id = v_uid;
  get diagnostics v_cnt = row_count;
  if v_cnt > 0 then update public.clubs set member_count = greatest(member_count - 1, 0) where id = p_club_id; end if;
  return json_build_object('status','ok','joined',false);
end; $$;
grant execute on function public.leave_club(uuid) to authenticated;
revoke execute on function public.leave_club(uuid) from public, anon;

-- 게시글 작성 (+20P)
create or replace function public.create_post(p_club_id uuid, p_title text, p_content text)
returns json language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_id uuid;
begin
  if v_uid is null then raise exception 'auth required'; end if;
  if length(coalesce(p_title,'')) = 0 or length(coalesce(p_content,'')) = 0 then raise exception 'empty'; end if;
  insert into public.posts(club_id, user_id, title, content) values (p_club_id, v_uid, p_title, p_content) returning id into v_id;
  perform public.award_points(v_uid, 20, '게시글 작성', 'post', v_id);
  return json_build_object('status','ok','post_id', v_id, 'points', 20);
end; $$;
grant execute on function public.create_post(uuid, text, text) to authenticated;
revoke execute on function public.create_post(uuid, text, text) from public, anon;

-- 댓글 작성 (+5P)
create or replace function public.create_comment(p_post_id uuid, p_content text, p_parent uuid default null)
returns json language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_id uuid;
begin
  if v_uid is null then raise exception 'auth required'; end if;
  if length(coalesce(p_content,'')) = 0 then raise exception 'empty'; end if;
  insert into public.comments(post_id, user_id, content, parent_comment_id) values (p_post_id, v_uid, p_content, p_parent) returning id into v_id;
  update public.posts set comment_count = comment_count + 1 where id = p_post_id;
  perform public.award_points(v_uid, 5, '댓글 작성', 'comment', v_id);
  return json_build_object('status','ok','comment_id', v_id, 'points', 5);
end; $$;
grant execute on function public.create_comment(uuid, text, uuid) to authenticated;
revoke execute on function public.create_comment(uuid, text, uuid) from public, anon;

-- 좋아요 토글
create or replace function public.toggle_like(p_target_type text, p_target_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_cnt int;
begin
  if v_uid is null then raise exception 'auth required'; end if;
  delete from public.likes where user_id = v_uid and target_type = p_target_type and target_id = p_target_id;
  get diagnostics v_cnt = row_count;
  if v_cnt > 0 then
    if p_target_type = 'post' then update public.posts set like_count = greatest(like_count - 1, 0) where id = p_target_id; end if;
    return json_build_object('status','ok','liked',false);
  end if;
  insert into public.likes(user_id, target_type, target_id) values (v_uid, p_target_type, p_target_id);
  if p_target_type = 'post' then update public.posts set like_count = like_count + 1 where id = p_target_id; end if;
  return json_build_object('status','ok','liked',true);
end; $$;
grant execute on function public.toggle_like(text, uuid) to authenticated;
revoke execute on function public.toggle_like(text, uuid) from public, anon;