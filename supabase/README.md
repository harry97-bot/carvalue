# CARVALUE — Supabase 스키마 백업

이 디렉터리는 운영 Supabase 프로젝트(`zukjeitiyetamxuoxdes`, region ap-northeast-2)에
**실제 적용된** 마이그레이션을 그대로 보존한 재해 복구(DR) 백업이다.

각 파일은 `supabase_migrations.schema_migrations`에 기록된 원본 SQL을 **base64 무손실 전송 +
md5 대조**로 추출했다. 즉 운영 DB의 적용 상태와 바이트 단위로 동일하다.

## 마이그레이션 (적용 순서)

| 버전 | 이름 | 내용 |
|---|---|---|
| 20260624045202 | init_carvalue_schema | 초기(레거시) 스키마 |
| 20260624045951 | harden_security_definer_fn | SECURITY DEFINER 함수 실행권한 회수 |
| 20260624064423 | drop_legacy_carvalue_schema | 레거시 스키마 제거 |
| 20260624064520 | carvalue_core_schema | **핵심 19테이블 + 인덱스 + updated_at 트리거** |
| 20260624064612 | carvalue_functions_triggers | 가입/UID/포인트/투표/구매 함수·트리거 |
| 20260624064707 | carvalue_rls_policies | 전 테이블 RLS 정책 + is_admin() |
| 20260624064908 | carvalue_rls_hardening | UPDATE WITH CHECK 보강, anon 실행권한 회수 |
| 20260624065414 | carvalue_register_car_fn | 차량 등록(register_car) 함수 |
| 20260624073540 | carvalue_phase3_functions | 소모임/게시글/댓글/좋아요 함수 |
| 20260624074754 | carvalue_anti_farming | 포인트 어뷰징 방지(일일 적립 상한) + 출석체크 |

`seed.sql` — 투표·뱃지·상점·소모임·드라이브코스·제휴링크 기준/샘플 데이터.

## 복원 방법

### A) Supabase CLI (권장)
```bash
supabase link --project-ref <new-project-ref>
supabase db push            # migrations/ 순서대로 적용
psql "$DATABASE_URL" -f supabase/seed.sql   # 시드(선택)
```

### B) 수동
`migrations/`의 파일을 **파일명(타임스탬프) 오름차순**으로 psql에 순서대로 실행한 뒤,
필요 시 `seed.sql`을 실행한다.

> ⚠️ 포인트/투표/구매/차량등록은 모두 `SECURITY DEFINER` DB 함수에서 원자적으로 처리된다.
> 클라이언트는 포인트를 직접 변경하지 못한다. (설계 문서 `docs/` 참조)
