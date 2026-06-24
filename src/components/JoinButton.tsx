"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function JoinButton({
  clubId,
  initialJoined,
  isLoggedIn,
}: {
  clubId: string;
  initialJoined: boolean;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [joined, setJoined] = useState(initialJoined);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!isLoggedIn) {
      router.push(`/login?next=/community/${clubId}`);
      return;
    }
    setBusy(true);
    await supabase.rpc(joined ? "leave_club" : "join_club", { p_club_id: clubId });
    setBusy(false);
    setJoined(!joined);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className="px-5 py-2.5 rounded-xl font-bold text-sm disabled:opacity-60"
      style={{
        background: joined ? "var(--color-bg)" : "var(--color-blue)",
        color: joined ? "var(--color-ink-muted)" : "#fff",
      }}
    >
      {joined ? "가입됨" : "가입하기"}
    </button>
  );
}
