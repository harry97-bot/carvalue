import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { num } from "@/lib/format";
import type { ShopItem, Profile } from "@/lib/types";
import ShopClient from "@/components/ShopClient";

export default async function ShopPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: items } = await supabase
    .from("shop_items")
    .select("*")
    .eq("is_active", true)
    .order("price_points", { ascending: true });

  let points = 0;
  let ownedIds: string[] = [];
  if (user) {
    const { data: p } = await supabase.from("profiles").select("points").eq("id", user.id).single();
    points = (p as Pick<Profile, "points"> | null)?.points ?? 0;
    const { data: owned } = await supabase.from("user_items").select("item_id").eq("user_id", user.id);
    ownedIds = (owned ?? []).map((o) => o.item_id as string);
  }

  return (
    <div className="px-5 pt-12">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-[22px] font-extrabold tracking-tight">상점</h1>
        <Link href="/profile" className="text-ink-muted text-sm">‹ 프로필</Link>
      </div>
      <p className="text-ink-muted text-sm mb-5">포인트로 프로필을 꾸며보세요 (현금 결제 없음)</p>

      <ShopClient
        items={(items as ShopItem[]) ?? []}
        initialOwned={ownedIds}
        initialPoints={points}
        isLoggedIn={!!user}
      />
    </div>
  );
}
