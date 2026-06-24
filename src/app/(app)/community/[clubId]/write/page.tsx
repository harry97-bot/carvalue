import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PostComposer from "@/components/PostComposer";

export default async function WritePage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/community/${clubId}/write`);

  return (
    <div className="px-5 pt-12">
      <Link href={`/community/${clubId}`} className="text-ink-muted text-sm">‹ 취소</Link>
      <h1 className="text-[22px] font-extrabold tracking-tight mt-3 mb-5">글쓰기</h1>
      <PostComposer clubId={clubId} />
    </div>
  );
}
