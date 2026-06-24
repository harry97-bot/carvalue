"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { votePercent, num } from "@/lib/format";
import { VOTE_CATEGORY_LABEL, type Vote } from "@/lib/types";

const CATEGORIES: Array<{ key: string; label: string }> = [
  { key: "all", label: "전체" },
  { key: "brand", label: "제조사" },
  { key: "model", label: "모델" },
  { key: "trim", label: "트림" },
  { key: "option", label: "옵션" },
  { key: "design", label: "디자인" },
];

export default function VoteList({
  initialVotes,
  initialVoted,
  isLoggedIn,
}: {
  initialVotes: Vote[];
  initialVoted: Record<string, "A" | "B">;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [votes, setVotes] = useState(initialVotes);
  const [voted, setVoted] = useState(initialVoted);
  const [cat, setCat] = useState("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = cat === "all" ? votes : votes.filter((v) => v.category === cat);

  async function castVote(vote: Vote, option: "A" | "B") {
    if (!isLoggedIn) {
      router.push("/login?next=/vote");
      return;
    }
    if (voted[vote.id] || busy) return;
    setBusy(vote.id);
    const { data, error } = await supabase.rpc("submit_vote", {
      p_vote_id: vote.id,
      p_option: option,
    });
    setBusy(null);
    if (error) {
      setToast("잠시 후 다시 시도해 주세요");
      return;
    }
    const status = (data as { status: string; points?: number })?.status;
    if (status === "ok") {
      setVoted((prev) => ({ ...prev, [vote.id]: option }));
      setVotes((prev) =>
        prev.map((v) =>
          v.id === vote.id
            ? { ...v, votes_a: v.votes_a + (option === "A" ? 1 : 0), votes_b: v.votes_b + (option === "B" ? 1 : 0) }
            : v,
        ),
      );
      setToast(`+${vote.reward_points}P 지급 완료`);
    } else if (status === "already_voted") {
      setVoted((prev) => ({ ...prev, [vote.id]: option }));
    }
    setTimeout(() => setToast(null), 1800);
  }

  return (
    <div>
      {/* 카테고리 탭 */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 -mx-5 px-5">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCat(c.key)}
            className="whitespace-nowrap px-3.5 py-2 rounded-full text-sm font-semibold border"
            style={{
              background: cat === c.key ? "var(--color-blue)" : "var(--color-card)",
              color: cat === c.key ? "#fff" : "var(--color-ink-sub)",
              borderColor: cat === c.key ? "var(--color-blue)" : "var(--color-line)",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((v) => {
          const hasVoted = !!voted[v.id];
          const pct = votePercent(v.votes_a, v.votes_b);
          return (
            <div key={v.id} className="bg-card rounded-2xl p-5 border border-line">
              <span className="text-[11px] font-bold text-blue bg-blue-soft px-2 py-1 rounded-md">
                {VOTE_CATEGORY_LABEL[v.category]}
              </span>
              <p className="font-bold text-[16px] mt-2.5 mb-3">{v.title}</p>

              {hasVoted ? (
                <div className="space-y-2">
                  <ResultBar label={v.option_a} pct={pct.a} mine={voted[v.id] === "A"} />
                  <ResultBar label={v.option_b} pct={pct.b} mine={voted[v.id] === "B"} />
                  <p className="text-xs text-ink-muted pt-1">{num(v.votes_a + v.votes_b)}명 참여</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <OptionButton label={v.option_a} onClick={() => castVote(v, "A")} disabled={busy === v.id} />
                  <OptionButton label={v.option_b} onClick={() => castVote(v, "B")} disabled={busy === v.id} />
                </div>
              )}
              {!hasVoted && (
                <p className="text-xs text-ink-muted mt-2.5">투표 참여 시 +{v.reward_points}P</p>
              )}
            </div>
          );
        })}
      </div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-ink text-white text-sm font-semibold px-4 py-2.5 rounded-full z-50">
          {toast}
        </div>
      )}
    </div>
  );
}

function OptionButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="py-4 rounded-xl bg-bg font-bold text-ink active:scale-[0.98] transition disabled:opacity-50"
    >
      {label}
    </button>
  );
}

function ResultBar({ label, pct, mine }: { label: string; pct: number; mine: boolean }) {
  return (
    <div className="relative h-11 rounded-xl overflow-hidden bg-bg">
      <div className="absolute inset-y-0 left-0" style={{ width: `${pct}%`, background: mine ? "var(--color-blue)" : "var(--color-blue-soft)" }} />
      <div className="absolute inset-0 flex items-center justify-between px-4">
        <span className="text-sm font-bold" style={{ color: mine ? "#fff" : "var(--color-ink)" }}>
          {label} {mine && "✓"}
        </span>
        <span className="text-sm font-extrabold" style={{ color: mine ? "#fff" : "var(--color-blue)" }}>
          {pct}%
        </span>
      </div>
    </div>
  );
}
