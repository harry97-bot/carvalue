import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { DriveCourseDetail } from "@/lib/types";
import SaveCourseButton from "@/components/SaveCourseButton";

export default async function DriveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: course } = await supabase.from("drive_courses").select("*").eq("id", id).single();
  if (!course) notFound();
  const c = course as DriveCourseDetail;

  let saved = false;
  if (user) {
    const { data: s } = await supabase
      .from("saved_drive_courses")
      .select("id")
      .eq("user_id", user.id)
      .eq("drive_course_id", id)
      .maybeSingle();
    saved = !!s;
  }

  return (
    <div className="px-5 pt-12">
      <Link href="/drive" className="text-ink-muted text-sm">‹ 코스 목록</Link>
      <div className="h-40 rounded-2xl bg-blue-soft flex items-center justify-center text-5xl mt-3">🛣️</div>
      <h1 className="text-xl font-extrabold mt-4">{c.title}</h1>
      <div className="flex gap-1.5 mt-2">
        {[c.region, c.theme].filter(Boolean).map((t) => (
          <span key={t} className="text-[11px] font-semibold text-ink-sub bg-bg px-2 py-1 rounded-md">{t}</span>
        ))}
        <span className="text-[11px] font-bold text-blue">★ {c.rating}</span>
      </div>

      <div className="bg-card border border-line rounded-2xl p-5 mt-4 grid grid-cols-3 gap-2 text-center">
        <Info k="거리" v={`${c.distance_km}km`} />
        <Info k="소요시간" v={`${c.duration_minutes}분`} />
        <Info k="난이도" v={c.difficulty ?? "-"} />
      </div>

      {c.recommended_car_type && (
        <p className="text-ink-sub text-sm mt-4">추천 차량: <b>{c.recommended_car_type}</b></p>
      )}
      {c.description && <p className="text-ink-sub text-[15px] leading-relaxed mt-3">{c.description}</p>}

      <SaveCourseButton courseId={id} userId={user?.id ?? null} initialSaved={saved} />
    </div>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-ink-muted text-xs">{k}</p>
      <p className="font-bold text-[15px] mt-0.5">{v}</p>
    </div>
  );
}
