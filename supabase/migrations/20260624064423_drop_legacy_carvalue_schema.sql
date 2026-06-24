-- 구 단일기능 스키마 폐기 (CARVALUE 플랫폼 전면 재구축)
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists vehicles_touch on public.vehicles;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.touch_updated_at() cascade;
drop table if exists public.leads cascade;
drop table if exists public.valuations cascade;
drop table if exists public.vehicles cascade;
drop table if exists public.profiles cascade;
drop type if exists ownership_type cascade;