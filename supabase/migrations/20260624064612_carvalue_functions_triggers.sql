-- ===== UID 시퀀스 (동시가입 충돌 방지) =====
create sequence if not exists public.uid_seq start 1;

-- ===== 가입 트리거: profiles 생성 + UID + 100P =====
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare new_uid text; nick text;
begin
  new_uid := 'CV-2026-' || lpad(nextval('public.uid_seq')::text, 6, '0');
  nick := coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1), '카밸러');
  insert into public.profiles(id, uid, nickname, points) values (new.id, new_uid, nick, 100);
  insert into public.point_transactions(user_id, transaction_type, amount, reason)
    values (new.id, 'earn', 100, '회원가입');
  return new;
end; $$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ===== 포인트 적립/차감 (내부 전용) =====
create or replace function public.award_points(p_user uuid, p_amount int, p_reason text, p_ref_type text default null, p_ref_id uuid default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.point_transactions(user_id, transaction_type, amount, reason, reference_type, reference_id)
    values (p_user, case when p_amount >= 0 then 'earn' else 'spend' end, abs(p_amount), p_reason, p_ref_type, p_ref_id);
  update public.profiles set points = points + p_amount where id = p_user;
end; $$;
revoke execute on function public.award_points(uuid,int,text,text,uuid) from public, anon, authenticated;

-- ===== 투표 참여 (중복방지 + 집계 + 10P) =====
create or replace function public.submit_vote(p_vote_id uuid, p_option text)
returns json language plpgsql security definer set search_path = public as $$
declare v_reward int; v_uid uuid := auth.uid(); v_resp_id uuid;
begin
  if v_uid is null then raise exception 'auth required'; end if;
  if p_option not in ('A','B') then raise exception 'invalid option'; end if;
  select reward_points into v_reward from public.votes where id = p_vote_id and is_active = true;
  if v_reward is null then raise exception 'vote not found'; end if;
  insert into public.vote_responses(vote_id, user_id, selected_option, points_given)
    values (p_vote_id, v_uid, p_option, v_reward)
    on conflict (vote_id, user_id) do nothing
    returning id into v_resp_id;
  if v_resp_id is null then return json_build_object('status','already_voted'); end if;
  if p_option = 'A' then update public.votes set votes_a = votes_a + 1 where id = p_vote_id;
  else update public.votes set votes_b = votes_b + 1 where id = p_vote_id; end if;
  perform public.award_points(v_uid, v_reward, '투표 참여', 'vote', p_vote_id);
  return json_build_object('status','ok','points', v_reward, 'option', p_option);
end; $$;
grant execute on function public.submit_vote(uuid, text) to authenticated;

-- ===== 상점 구매 (잔액검증 + 차감) =====
create or replace function public.purchase_item(p_item_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_price int; v_balance int; v_row uuid;
begin
  if v_uid is null then raise exception 'auth required'; end if;
  select price_points into v_price from public.shop_items where id = p_item_id and is_active = true;
  if v_price is null then raise exception 'item not found'; end if;
  select points into v_balance from public.profiles where id = v_uid;
  if v_balance < v_price then return json_build_object('status','insufficient_points'); end if;
  insert into public.user_items(user_id, item_id) values (v_uid, p_item_id)
    on conflict (user_id, item_id) do nothing returning id into v_row;
  if v_row is null then return json_build_object('status','already_owned'); end if;
  perform public.award_points(v_uid, -v_price, '상점 구매', 'shop_item', p_item_id);
  return json_build_object('status','ok');
end; $$;
grant execute on function public.purchase_item(uuid) to authenticated;