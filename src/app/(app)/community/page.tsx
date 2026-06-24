import { createClient } from "@/lib/supabase/server";
import { num } from "@/lib/format";
import type { Club, DriveCourse } from "@/lib/types";

export default async function CommunityPage() {
  const supabase = await createClient();
  const [{ data: clubs }, { data: courses }] = await Promise.all([
    supabase.from("clubs").select("*").order("member_count", { ascending: false }),
    supabase.from("drive_courses").select("*").eq("is_active", true).order("rating", { ascending: false }).limit(5),
  ]);

  return (
    <div className="px-5 pt-12">
      <h1 className="text-[22px] font-extrabold tracking-tight mb-5">커뮤니티</h1>

      <section className="mb-7">
        <h2 className="text-[17px] font-bold mb-2">자동차 소모임</h2>
        <div className="space-y-2">
          {(clubs as Club[] | null)?.map((c) => (
            <div key={c.id} className="bg-card border border-line rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <p className="font-bold text-[15px]">{c.name}</p>
                <span className="text-xs text-ink-muted">멤버 {num(c.member_count)}명</span>
              </div>
              {c.description && <p className="text-ink-muted text-sm mt-1">{c.description}</p>}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-[17px] font-bold mb-2">드라이브 코스</h2>
        <div className="space-y-2">
          {(courses as DriveCourse[] | null)?.map((d) => (
            <div key={d.id} className="bg-card border border-line rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-[15px]">{d.title}</p>
                <p className="text-ink-muted text-xs mt-0.5">
                  {d.region} · {d.theme} · {d.duration_minutes}분 · 난이도 {d.difficulty}
                </p>
              </div>
              <span className="text-blue font-bold text-sm">★ {d.rating}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
