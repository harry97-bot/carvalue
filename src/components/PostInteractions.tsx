"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export interface CommentItem {
  id: string;
  content: string;
  created_at: string;
  nickname: string;
}

export default function PostInteractions({
  postId,
  clubId,
  initialLiked,
  initialLikeCount,
  initialComments,
  isLoggedIn,
}: {
  postId: string;
  clubId: string;
  initialLiked: boolean;
  initialLikeCount: number;
  initialComments: CommentItem[];
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  function requireLogin() {
    router.push(`/login?next=/community/${clubId}/${postId}`);
  }

  async function like() {
    if (!isLoggedIn) return requireLogin();
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    await supabase.rpc("toggle_like", { p_target_type: "post", p_target_id: postId });
  }

  async function addComment() {
    if (!isLoggedIn) return requireLogin();
    if (!text.trim() || busy) return;
    setBusy(true);
    const { data, error } = await supabase.rpc("create_comment", {
      p_post_id: postId,
      p_content: text.trim(),
    });
    setBusy(false);
    if (error) return;
    const id = (data as { comment_id?: string })?.comment_id ?? Math.random().toString();
    setComments((prev) => [...prev, { id, content: text.trim(), created_at: "", nickname: "나" }]);
    setText("");
    router.refresh();
  }

  return (
    <div>
      <button
        onClick={like}
        className="flex items-center gap-1.5 mt-4 mb-6 px-4 py-2 rounded-full border font-semibold text-sm"
        style={{
          borderColor: liked ? "var(--color-up)" : "var(--color-line)",
          color: liked ? "var(--color-up)" : "var(--color-ink-muted)",
          background: liked ? "#fef2f2" : "var(--color-card)",
        }}
      >
        {liked ? "♥" : "♡"} 좋아요 {likeCount}
      </button>

      <div className="border-t border-line pt-4">
        <h2 className="font-bold text-[15px] mb-3">댓글 {comments.length}</h2>
        <div className="space-y-3 mb-4">
          {comments.length === 0 && <p className="text-ink-muted text-sm">첫 댓글을 남겨보세요.</p>}
          {comments.map((c) => (
            <div key={c.id} className="bg-card border border-line rounded-xl p-3.5">
              <p className="text-xs font-bold text-ink-sub mb-1">{c.nickname}</p>
              <p className="text-sm text-ink">{c.content}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isLoggedIn ? "댓글 달기 (+5P)" : "로그인 후 댓글 가능"}
            className="flex-1 bg-card border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-blue"
          />
          <button onClick={addComment} disabled={busy} className="bg-blue text-white font-bold text-sm px-5 rounded-xl disabled:opacity-60">
            등록
          </button>
        </div>
      </div>
    </div>
  );
}
