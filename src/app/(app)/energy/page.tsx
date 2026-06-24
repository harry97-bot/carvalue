import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { PartnerLink } from "@/lib/types";

export default async function EnergyPage() {
  const supabase = await createClient();
  const { data: partners } = await supabase
    .from("partner_links")
    .select("*")
    .eq("partner_type", "oilnice")
    .limit(1);
  const oilnice = (partners as PartnerLink[] | null)?.[0];

  const cats = [
    { label: "주유소", emoji: "⛽", live: true },
    { label: "전기차 충전소", emoji: "🔌", live: true },
    { label: "LPG 충전소", emoji: "🫧", live: true },
    { label: "세차장", emoji: "🧼", live: false },
    { label: "정비소", emoji: "🔧", live: false },
  ];

  return (
    <div className="px-5 pt-12">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-[22px] font-extrabold tracking-tight">에너지맵</h1>
        <Link href="/" className="text-ink-muted text-sm">‹ 홈</Link>
      </div>
      <p className="text-ink-muted text-sm mb-5">가까운 주유소·충전소를 찾아보세요</p>

      <div className="grid grid-cols-2 gap-3">
        {cats.map((c) =>
          c.live && oilnice ? (
            <a
              key={c.label}
              href={oilnice.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-card border border-line rounded-2xl p-5 flex flex-col items-center gap-2"
            >
              <span className="text-3xl">{c.emoji}</span>
              <span className="font-bold text-sm">{c.label}</span>
              <span className="text-[11px] text-ink-muted">Oilnice 연결</span>
            </a>
          ) : (
            <div key={c.label} className="bg-card border border-line rounded-2xl p-5 flex flex-col items-center gap-2 opacity-60">
              <span className="text-3xl">{c.emoji}</span>
              <span className="font-bold text-sm">{c.label}</span>
              <span className="text-[11px] text-ink-muted">준비 중</span>
            </div>
          ),
        )}
      </div>
      <p className="text-ink-muted text-xs mt-5">제휴: Oilnice</p>
    </div>
  );
}
