"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CheckInButton() {
  const router = useRouter();
  const supabase = createClient();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function checkIn() {
    setBusy(true);
    const { data } = await supabase.rpc("check_in");
    setBusy(false);
    const s = data as { status?: string };
    setMsg(s?.status === "ok" ? "출석 완료! +10P" : "오늘은 이미 출석했어요");
    router.refresh();
    setTimeout(() => setMsg(""), 2000);
  }

  return (
    <>
      <button
        onClick={checkIn}
        disabled={busy}
        className="flex-1 bg-blue text-white font-bold rounded-xl py-3.5 disabled:opacity-60"
      >
        출석 체크 +10P
      </button>
      {msg && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-ink text-white text-sm font-semibold px-4 py-2.5 rounded-full z-50">
          {msg}
        </div>
      )}
    </>
  );
}
