import { createClient } from "@/lib/supabase/server";
import { manwon } from "@/lib/format";
import type { PartnerLink } from "@/lib/types";
import MyCarClient from "@/components/MyCarClient";

interface CarRow {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  is_main: boolean;
  car_value_estimates: { estimated_min_price: number | null; estimated_max_price: number | null }[];
}

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

  let cars: CarRow[] = [];
  if (user) {
    const { data } = await supabase
      .from("user_cars")
      .select("id, brand, model, year, mileage, is_main, car_value_estimates(estimated_min_price, estimated_max_price)")
      .eq("user_id", user.id)
      .order("is_main", { ascending: false })
      .order("created_at", { ascending: false });
    cars = (data as CarRow[]) ?? [];
  }

  return (
    <div className="px-5 pt-12">
      <h1 className="text-[22px] font-extrabold tracking-tight mb-1">내 차의 가치</h1>
      <p className="text-ink-muted text-sm mb-5">차량 정보를 넣으면 예상 시세를 알려드려요</p>

      {cars.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[15px] font-bold mb-2">내 차고</h2>
          <div className="space-y-2">
            {cars.map((c) => {
              const est = c.car_value_estimates?.[0];
              return (
                <div key={c.id} className="bg-card border border-line rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[15px]">
                      {c.brand} {c.model} <span className="text-ink-muted font-normal">({c.year})</span>
                      {c.is_main && <span className="ml-2 text-[10px] font-bold text-blue bg-blue-soft px-1.5 py-0.5 rounded">대표</span>}
                    </p>
                  </div>
                  <p className="text-ink-muted text-xs mt-0.5">{c.mileage.toLocaleString("ko-KR")}km</p>
                  {est?.estimated_min_price != null && (
                    <p className="text-blue font-bold text-sm mt-1.5">
                      {manwon(est.estimated_min_price)} ~ {manwon(est.estimated_max_price ?? est.estimated_min_price)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <MyCarClient nowcarUrl={nowcar?.url ?? null} isLoggedIn={!!user} />
    </div>
  );
}
