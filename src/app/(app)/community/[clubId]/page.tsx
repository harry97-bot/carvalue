import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { num } from "@/lib/format";
import JoinButton from "@/components/JoinButton";

interface PostRow {
  id: string;
  title: string;
  content: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  profiles: { nickname: string } | null;
}

export default async function ClubDetailPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: club } = await supabase.from("clubs").select("*").eq("id", clubId).single();
  if (!club) notFound();

  const { data: postsData } = await supabase
    .from("posts")
    .select("id, title, content, like_count, comment_count, created_at, profiles(nickname)")
    .eq("club_id", clubId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });
  const posts = (postsData ?? []) as unknown as PostRow[];

  let joined = false;
  if (user) {
    const { data: m } = await supabase
      .from("club_members")
      .select("id")
      .eq("club_id", clubId)
      .eq("user_id", user.id)
      .maybeSingle();
    joined = !!m;
  }

  return (
    <div className="px-5 pt-12">
      <Link href="/community" className="text-ink-muted text-sm">‹ 커뮤니티</Link>

      <div className="bg-card border border-line rounded-2xl p-5 mt-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold">{club.name}</h1>
            <p className="text-ink-muted text-sm mt-1">멤버 {num(club.member_count)}명</p>
          </div>
          <JoinButton clubId={clubId} initialJoined={joined} isLoggedIn={!!user} />
        </div>
        {club.description && <p className="text-ink-sub text-sm mt-3">{club.description}</p>}
      </div>

      <div className="flex items-center justify-between mt-6 mb-2">
        <h2 className="text-[17px] font-bold">게시글</h2>
        <Link href={`/community/${clubId}/write`} className="text-blue text-sm font-bold">
          글쓰기
        </Link>
      </div>

      <div className="space-y-2">
        {posts.length ? (
          posts.map((p) => (
            <Link key={p.id} href={`/community/${clubId}/${p.id}`} className="block bg-card border border-line rounded-2xl p-4">
              <p className="font-bold text-[15px]">{p.title}</p>
              <p className="text-ink-muted text-sm mt-1 line-clamp-2">{p.content}</p>
              <p className="text-ink-muted text-xs mt-2">
                {p.profiles?.nickname ?? "익명"} · ♥ {p.like_count} · 댓글 {p.comment_count}
              </p>
            </Link>
          ))
        ) : (
          <div className="bg-card border border-line rounded-2xl p-8 text-center">
            <p className="text-ink-muted text-sm">아직 게시글이 없어요. 첫 글을 남겨보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
}
