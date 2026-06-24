import { createClient } from "@/lib/supabase/server";
import type { PartnerLink } from "@/lib/types";
import MyCarClient from "@/components/MyCarClient";

export default async function MyCarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: partners } = await supabase
    .from("partner_links")
    .select("*")
    .eq("partner_type", "nowcar")
    .limit(1);
  const nowcar = (partners as PartnerLink[] | null)?.[0];

  return (
    <div className="px-5 pt-12">
      <h1 className="text-[22px] font-extrabold tracking-tight mb-1">내 차의 가치</h1>
      <p className="text-ink-muted text-sm mb-5">차량 정보를 넣으면 예상 시세를 알려드려요</p>
      <MyCarClient nowcarUrl={nowcar?.url ?? null} isLoggedIn={!!user} />
    </div>
  );
}
