create or replace function public.register_car(
  p_brand text, p_model text, p_year int, p_mileage int,
  p_trim text default null, p_fuel text default null,
  p_price int default null, p_accident text default 'unknown',
  p_est_min int default null, p_est_max int default null,
  p_dep_min numeric default null, p_dep_max numeric default null
) returns json language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_car_id uuid; v_is_first boolean;
begin
  if v_uid is null then raise exception 'auth required'; end if;
  select count(*) = 0 into v_is_first from public.user_cars where user_id = v_uid;
  insert into public.user_cars(user_id, brand, model, trim, year, mileage, fuel_type, purchase_price, accident_status, is_main)
    values (v_uid, p_brand, p_model, p_trim, p_year, p_mileage, p_fuel, p_price, coalesce(p_accident,'unknown'), v_is_first)
    returning id into v_car_id;
  insert into public.car_value_estimates(car_id, user_id, original_price, estimated_min_price, estimated_max_price, depreciation_rate_min, depreciation_rate_max)
    values (v_car_id, v_uid, p_price, p_est_min, p_est_max, p_dep_min, p_dep_max);
  if v_is_first then
    update public.profiles set main_car_id = v_car_id where id = v_uid;
    perform public.award_points(v_uid, 50, '차량 등록', 'user_car', v_car_id);
  end if;
  return json_build_object('status','ok','car_id', v_car_id, 'points', case when v_is_first then 50 else 0 end);
end; $$;
grant execute on function public.register_car(text,text,int,int,text,text,int,text,int,int,numeric,numeric) to authenticated;
revoke execute on function public.register_car(text,text,int,int,text,text,int,text,int,int,numeric,numeric) from public, anon;