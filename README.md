# CARVALUE — 내 차의 가치를 찾다

자동차 소유자와 구매 예정자를 위한 종합 자동차 라이프 플랫폼.
내 차 시세 · A/B 투표 · 커뮤니티 · 포인트를 한 곳에서.

## 핵심 기능

- **홈** — 내 차 카드, 빠른 실행, 오늘의 투표, 인기 소모임
- **투표** — A/B 자동차 취향 투표(중복 방지), 참여 시 포인트 적립
- **내 차** — 차량 등록, 예상 시세(자체 감가 모델), 신차 견적(나우카) 연결
- **커뮤니티** — 차종/지역별 소모임, 드라이브 코스
- **프로필** — UID, 포인트, 활동 내역
- **포인트** — 가입 100P · 투표 10P · 차량등록 50P (전부 서버 DB 함수에서 처리)

## 기술 스택

| 레이어 | 선택 |
|---|---|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS v4 (Toss 스타일) |
| 백엔드/DB/인증 | Supabase (PostgreSQL · Auth · RLS) |
| 호스팅 | Vercel |

## 개발

```bash
npm install
# .env.local 에 Supabase 환경변수 설정
#   NEXT_PUBLIC_SUPABASE_URL=...
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
npm run dev      # http://localhost:3000
npm run build    # 프로덕션 빌드
```

## 데이터베이스

19개 테이블, 전 테이블 RLS 적용. 포인트·투표·차량등록은 `SECURITY DEFINER`
함수로 서버에서 원자적으로 처리(클라이언트 포인트 조작 차단).
설계 문서는 [`docs/`](./docs) 참조.

## 로드맵

- **Phase 1** ✅ 회원/UID/프로필/포인트/A·B 투표
- **Phase 2** 차량 등록·시세 고도화·나우카 연결
- **Phase 3** 커뮤니티 글쓰기·댓글·소모임
- **Phase 4** 에너지맵(Oilnice)·드라이브 코스·상점

---

내 차의 가치를 찾다 · **CARVALUE**
