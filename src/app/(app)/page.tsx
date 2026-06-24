import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { votePercent, num } from "@/lib/format";
import type { Vote, Club, PartnerLink, Profile } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    profile = data as Profile | null;
  }

  const [{ data: votes }, { data: clubs }, { data: partners }] = await Promise.all([
    supabase.from("votes").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(1),
    supabase.from("clubs").select("*").order("member_count", { ascending: false }).limit(3),
    supabase.from("partner_links").select("*").eq("is_active", true),
  ]);

  const featured = (votes?.[0] as Vote) ?? null;
  const nowcar = (partners as PartnerLink[] | null)?.find((p) => p.partner_type === "nowcar");
  const oilnice = (partners as PartnerLink[] | null)?.find((p) => p.partner_type === "oilnice");

  const quick = [
    { label: "내 차 시세", href: "/my-car", emoji: "🚘", external: false },
    { label: "신차 견적", href: nowcar?.url ?? "/my-car", emoji: "🆕", external: true },
    { label: "에너지맵", href: oilnice?.url ?? "/community", emoji: "⛽", external: true },
    { label: "드라이브 코스", href: "/community", emoji: "🛣️", external: false },
  ];

  return (
    <div className="px-5 pt-12">
      {/* 헤더 */}
      <header className="mb-5">
        <p className="text-[15px] text-ink-sub font-medium">
          {profile ? `${profile.nickname}님, 안녕하세요` : "안녕하세요"}
        </p>
        <h1 className="text-[22px] font-extrabold tracking-tight mt-0.5">
          내 차의 가치를 찾아볼까요?
        </h1>
      </header>

      {/* 내 차 카드 */}
      <Link href="/my-car" className="block bg-blue-soft rounded-2xl p-5 mb-4">
        <p className="text-blue-dark text-sm font-bold">내 차 가치 확인</p>
        <p className="text-ink text-lg font-extrabold mt-1">내 차 등록하고 시세 확인하기</p>
        <p className="text-ink-sub text-sm mt-1">연식·주행거리만 넣으면 예상 시세가 나와요 →</p>
      </Link>

      {/* 빠른 실행 */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {quick.map((q) =>
          q.external ? (
            <a key={q.label} href={q.href} target="_blank" rel="noopener noreferrer" className="bg-card rounded-2xl py-4 flex flex-col items-center gap-1.5 border border-line">
              <span className="text-2xl">{q.emoji}</span>
              <span className="text-[11px] font-semibold text-ink-sub text-center leading-tight">{q.label}</span>
            </a>
          ) : (
            <Link key={q.label} href={q.href} className="bg-card rounded-2xl py-4 flex flex-col items-center gap-1.5 border border-line">
              <span className="text-2xl">{q.emoji}</span>
              <span className="text-[11px] font-semibold text-ink-sub text-center leading-tight">{q.label}</span>
            </Link>
          ),
        )}
      </div>

      {/* 오늘의 투표 */}
      {featured && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[17px] font-bold">오늘의 투표</h2>
            <Link href="/vote" className="text-sm text-ink-muted">전체보기</Link>
          </div>
          <Link href="/vote" className="block bg-card rounded-2xl p-5 border border-line">
            <p className="font-bold text-[16px] mb-3">{featured.title}</p>
            {(() => {
              const pct = votePercent(featured.votes_a, featured.votes_b);
              return (
                <div className="space-y-2">
                  <VoteBar label={featured.option_a} pct={pct.a} />
                  <VoteBar label={featured.option_b} pct={pct.b} />
                </div>
              );
            })()}
            <p className="text-xs text-ink-muted mt-3">
              {num(featured.votes_a + featured.votes_b)}명 참여 · 투표하고 +{featured.reward_points}P
            </p>
          </Link>
        </section>
      )}

      {/* 인기 소모임 */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[17px] font-bold">인기 소모임</h2>
          <Link href="/community" className="text-sm text-ink-muted">전체보기</Link>
        </div>
        <div className="space-y-2">
          {(clubs as Club[] | null)?.map((c) => (
            <Link key={c.id} href="/community" className="flex items-center justify-between bg-card rounded-2xl p-4 border border-line">
              <div>
                <p className="font-bold text-[15px]">{c.name}</p>
                <p className="text-xs text-ink-muted mt-0.5">멤버 {num(c.member_count)}명</p>
              </div>
              <span className="text-ink-muted">›</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function VoteBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="relative h-9 rounded-lg overflow-hidden bg-bg">
      <div className="absolute inset-y-0 left-0 bg-blue-soft" style={{ width: `${pct}%` }} />
      <div className="absolute inset-0 flex items-center justify-between px-3">
        <span className="text-sm font-semibold text-ink">{label}</span>
        <span className="text-sm font-bold text-blue">{pct}%</span>
      </div>
    </div>
  );
}
