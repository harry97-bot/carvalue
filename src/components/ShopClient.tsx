"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { num } from "@/lib/format";
import { ITEM_TYPE_LABEL, RARITY_COLOR, type ShopItem } from "@/lib/types";

export default function ShopClient({
  items,
  initialOwned,
  initialPoints,
  isLoggedIn,
}: {
  items: ShopItem[];
  initialOwned: string[];
  initialPoints: number;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [owned, setOwned] = useState<Set<string>>(new Set(initialOwned));
  const [points, setPoints] = useState(initialPoints);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  function flash(m: string) {
    setToast(m);
    setTimeout(() => setToast(""), 1800);
  }

  async function buy(item: ShopItem) {
    if (!isLoggedIn) {
      router.push("/login?next=/shop");
      return;
    }
    if (owned.has(item.id) || busy) return;
    if (points < item.price_points) {
      flash("포인트가 부족해요");
      return;
    }
    setBusy(item.id);
    const { data, error } = await supabase.rpc("purchase_item", { p_item_id: item.id });
    setBusy(null);
    const status = (data as { status?: string })?.status;
    if (error || (status && status !== "ok")) {
      flash(status === "insufficient_points" ? "포인트가 부족해요" : status === "already_owned" ? "이미 보유 중" : "잠시 후 다시 시도");
      return;
    }
    setOwned((prev) => new Set(prev).add(item.id));
    setPoints((p) => p - item.price_points);
    flash(`구매 완료! -${item.price_points}P`);
    router.refresh();
  }

  return (
    <div>
      {isLoggedIn && (
        <div className="bg-blue-soft rounded-xl p-4 mb-5 flex items-center justify-between">
          <span className="text-blue-dark font-semibold text-sm">보유 포인트</span>
          <span className="text-blue-dark font-black text-lg">{num(points)}P</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => {
          const has = owned.has(item.id);
          return (
            <div key={item.id} className="bg-card border border-line rounded-2xl p-4 flex flex-col">
              <div className="h-20 rounded-xl bg-bg flex items-center justify-center text-3xl mb-3">
                {item.item_type === "profile_frame" ? "🖼️" : item.item_type === "profile_background" ? "🌃" : item.item_type === "car_card_skin" ? "🏎️" : "✨"}
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-bold" style={{ color: RARITY_COLOR[item.rarity] ?? "#8b95a1" }}>
                  {item.rarity.toUpperCase()}
                </span>
                {item.is_limited && <span className="text-[10px] font-bold text-up">한정</span>}
              </div>
              <p className="font-bold text-[14px] leading-tight">{item.name}</p>
              <p className="text-ink-muted text-[11px] mt-0.5">{ITEM_TYPE_LABEL[item.item_type]}</p>
              <button
                onClick={() => buy(item)}
                disabled={has || busy === item.id}
                className="mt-3 py-2.5 rounded-xl font-bold text-sm"
                style={{
                  background: has ? "var(--color-bg)" : "var(--color-blue)",
                  color: has ? "var(--color-ink-muted)" : "#fff",
                }}
              >
                {has ? "보유 중" : `${num(item.price_points)}P`}
              </button>
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
