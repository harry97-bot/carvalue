import { createClient } from "@/lib/supabase/server";
import type { Vote } from "@/lib/types";
import VoteList from "@/components/VoteList";

export default async function VotePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: votes } = await supabase
    .from("votes")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  let voted: Record<string, "A" | "B"> = {};
  if (user) {
    const { data: responses } = await supabase
      .from("vote_responses")
      .select("vote_id, selected_option")
      .eq("user_id", user.id);
    voted = Object.fromEntries((responses ?? []).map((r) => [r.vote_id, r.selected_option as "A" | "B"]));
  }

  return (
    <div className="px-5 pt-12">
      <h1 className="text-[22px] font-extrabold tracking-tight mb-1">오늘의 자동차 투표</h1>
      <p className="text-ink-muted text-sm mb-5">취향대로 고르고 포인트도 받아요</p>
      <VoteList initialVotes={(votes as Vote[]) ?? []} initialVoted={voted} isLoggedIn={!!user} />
    </div>
  );
}
