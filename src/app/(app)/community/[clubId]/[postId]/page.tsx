import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PostInteractions, { type CommentItem } from "@/components/PostInteractions";

interface CommentRow {
  id: string;
  content: string;
  created_at: string;
  is_deleted: boolean;
  profiles: { nickname: string } | null;
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ clubId: string; postId: string }>;
}) {
  const { clubId, postId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post } = await supabase
    .from("posts")
    .select("id, title, content, like_count, created_at, profiles(nickname)")
    .eq("id", postId)
    .eq("is_deleted", false)
    .single();
  if (!post) notFound();

  const { data: commentRows } = await supabase
    .from("comments")
    .select("id, content, created_at, is_deleted, profiles(nickname)")
    .eq("post_id", postId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: true });

  const comments: CommentItem[] = ((commentRows as unknown as CommentRow[] | null) ?? []).map((c) => ({
    id: c.id,
    content: c.content,
    created_at: c.created_at,
    nickname: c.profiles?.nickname ?? "익명",
  }));

  let liked = false;
  if (user) {
    const { data: l } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("target_type", "post")
      .eq("target_id", postId)
      .maybeSingle();
    liked = !!l;
  }

  const author = (post as unknown as { profiles: { nickname: string } | null }).profiles?.nickname ?? "익명";

  return (
    <div className="px-5 pt-12">
      <Link href={`/community/${clubId}`} className="text-ink-muted text-sm">‹ 목록</Link>
      <h1 className="text-xl font-extrabold mt-3 mb-1">{post.title}</h1>
      <p className="text-ink-muted text-xs mb-4">{author}</p>
      <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-ink-sub">{post.content}</p>

      <PostInteractions
        postId={postId}
        clubId={clubId}
        initialLiked={liked}
        initialLikeCount={post.like_count}
        initialComments={comments}
        isLoggedIn={!!user}
      />
    </div>
  );
}
