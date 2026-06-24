-- 트리거 전용 SECURITY DEFINER 함수의 외부 RPC 노출 차단 (트리거 작동에는 영향 없음)
revoke execute on function public.handle_new_user() from public, anon, authenticated;