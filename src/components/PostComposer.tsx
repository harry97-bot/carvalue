"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PostComposer({ clubId }: { clubId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    setErr("");
    if (!title.trim() || !content.trim()) {
      setErr("제목과 내용을 입력해 주세요.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.rpc("create_post", {
      p_club_id: clubId,
      p_title: title.trim(),
      p_content: content.trim(),
    });
    setBusy(false);
    if (error) {
      setErr("등록에 실패했어요. 다시 시도해 주세요.");
      return;
    }
    const postId = (data as { post_id?: string })?.post_id;
    router.push(postId ? `/community/${clubId}/${postId}` : `/community/${clubId}`);
    router.refresh();
  }

  return (
    <div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목"
        className="w-full bg-card border border-line rounded-xl px-4 py-3.5 text-[16px] font-bold outline-none focus:border-blue mb-3"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="내용을 입력하세요"
        rows={10}
        className="w-full bg-card border border-line rounded-xl px-4 py-3.5 text-[15px] outline-none focus:border-blue resize-none"
      />
      {err && <p className="text-up text-sm mt-2">{err}</p>}
      <button
        onClick={submit}
        disabled={busy}
        className="w-full mt-4 bg-blue text-white font-bold text-[16px] rounded-2xl py-4 disabled:opacity-60"
      >
        {busy ? "등록 중..." : "등록하고 +20P 받기"}
      </button>
    </div>
  );
}
