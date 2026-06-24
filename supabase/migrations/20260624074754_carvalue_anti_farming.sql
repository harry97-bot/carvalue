-- 오늘 특정 사유로 적립한 횟수 (내부 전용)
create or replace function public.earned_today(p_user uuid, p_reason text)
returns int language sql security definer set search_path = public stable as $$
  select count(*)::int from public.point_transactions
  where user_id = p_user and reason = p_reason and transaction_type = 'earn'
    and created_at >= date_trunc('day', now());
$$;
revoke execute on function public.earned_today(uuid, text) from public, anon, authenticated;

-- 게시글 작성: 일 5건까지만 +20P (이후 작성은 되나 포인트 0)
create or replace function public.create_post(p_club_id uuid, p_title text, p_content text)
returns json language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_id uuid; v_award int := 20;
begin
  if v_uid is null then raise exception 'auth required'; end if;
  if length(coalesce(p_title,'')) = 0 or length(coalesce(p_content,'')) = 0 then raise exception 'empty'; end if;
  if public.earned_today(v_uid, '게시글 작성') >= 5 then v_award := 0; end if;
  insert into public.posts(club_id, user_id, title, content) values (p_club_id, v_uid, p_title, p_content) returning id into v_id;
  if v_award > 0 then perform public.award_points(v_uid, v_award, '게시글 작성', 'post', v_id); end if;
  return json_build_object('status','ok','post_id', v_id, 'points', v_award);
end; $$;
grant execute on function public.create_post(uuid, text, text) to authenticated;
revoke execute on function public.create_post(uuid, text, text) from public, anon;

-- 댓글 작성: 일 10건까지만 +5P
create or replace function public.create_comment(p_post_id uuid, p_content text, p_parent uuid default null)
returns json language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_id uuid; v_award int := 5;
begin
  if v_uid is null then raise exception 'auth required'; end if;
  if length(coalesce(p_content,'')) = 0 then raise exception 'empty'; end if;
  if public.earned_today(v_uid, '댓글 작성') >= 10 then v_award := 0; end if;
  insert into public.comments(post_id, user_id, content, parent_comment_id) values (p_post_id, v_uid, p_content, p_parent) returning id into v_id;
  update public.posts set comment_count = comment_count + 1 where id = p_post_id;
  if v_award > 0 then perform public.award_points(v_uid, v_award, '댓글 작성', 'comment', v_id); end if;
  return json_build_object('status','ok','comment_id', v_id, 'points', v_award);
end; $$;
grant execute on function public.create_comment(uuid, text, uuid) to authenticated;
revoke execute on function public.create_comment(uuid, text, uuid) from public, anon;

-- 출석 체크: 1일 1회 +10P
create or replace function public.check_in()
returns json language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'auth required'; end if;
  if public.earned_today(v_uid, '출석') >= 1 then return json_build_object('status','already','points',0); end if;
  perform public.award_points(v_uid, 10, '출석', null, null);
  return json_build_object('status','ok','points',10);
end; $$;
grant execute on function public.check_in() to authenticated;
revoke execute on function public.check_in() from public, anon;