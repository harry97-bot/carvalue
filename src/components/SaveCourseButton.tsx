"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SaveCourseButton({
  courseId,
  userId,
  initialSaved,
}: {
  courseId: string;
  userId: string | null;
  initialSaved: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!userId) {
      router.push(`/login?next=/drive/${courseId}`);
      return;
    }
    setBusy(true);
    if (saved) {
      await supabase
        .from("saved_drive_courses")
        .delete()
        .eq("user_id", userId)
        .eq("drive_course_id", courseId);
    } else {
      await supabase.from("saved_drive_courses").insert({ user_id: userId, drive_course_id: courseId });
    }
    setBusy(false);
    setSaved(!saved);
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className="w-full mt-5 font-bold rounded-2xl py-4 border disabled:opacity-60"
      style={{
        background: saved ? "var(--color-blue-soft)" : "var(--color-blue)",
        color: saved ? "var(--color-blue-dark)" : "#fff",
        borderColor: "transparent",
      }}
    >
      {saved ? "★ 저장됨" : "☆ 코스 저장하기"}
    </button>
  );
}
