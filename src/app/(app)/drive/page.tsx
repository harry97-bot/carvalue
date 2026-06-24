import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { DriveCourse } from "@/lib/types";

export default async function DrivePage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("drive_courses")
    .select("*")
    .eq("is_active", true)
    .order("rating", { ascending: false });

  return (
    <div className="px-5 pt-12">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-[22px] font-extrabold tracking-tight">드라이브 코스</h1>
        <Link href="/" className="text-ink-muted text-sm">‹ 홈</Link>
      </div>
      <p className="text-ink-muted text-sm mb-5">오늘은 어디로 달려볼까요?</p>

      <div className="space-y-3">
        {(courses as DriveCourse[] | null)?.map((d) => (
          <Link key={d.id} href={`/drive/${d.id}`} className="block bg-card border border-line rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <p className="font-bold text-[16px]">{d.title}</p>
              <span className="text-blue font-bold text-sm">★ {d.rating}</span>
            </div>
            <div className="flex gap-1.5 mt-2">
              {[d.region, d.theme].filter(Boolean).map((t) => (
                <span key={t} className="text-[11px] font-semibold text-ink-sub bg-bg px-2 py-1 rounded-md">
                  {t}
                </span>
              ))}
            </div>
            <p className="text-ink-muted text-xs mt-2">
              {d.distance_km}km · {d.duration_minutes}분 · 난이도 {d.difficulty}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
