"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { estimateValue, type ValuationResult } from "@/lib/depreciation";
import { manwon } from "@/lib/format";

export default function MyCarClient({
  nowcarUrl,
  isLoggedIn,
}: {
  nowcarUrl: string | null;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [f, setF] = useState({ brand: "", model: "", year: "", mileage: "", price: "" });
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [err, setErr] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [toast, setToast] = useState("");

  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  function calc() {
    setErr("");
    setSaveState("idle");
    const year = parseInt(f.year, 10);
    const mileage = parseInt(f.mileage.replace(/,/g, ""), 10);
    const price = parseInt(f.price.replace(/,/g, ""), 10);
    if (!f.brand || !f.model || !year || !mileage || !price) {
      setErr("모든 항목을 입력해 주세요.");
      return;
    }
    setResult(estimateValue(price, year, mileage));
  }

  async function save() {
    if (!result) return;
    if (!isLoggedIn) {
      router.push("/login?next=/my-car");
      return;
    }
    setSaveState("saving");
    const { data, error } = await supabase.rpc("register_car", {
      p_brand: f.brand,
      p_model: f.model,
      p_year: parseInt(f.year, 10),
      p_mileage: parseInt(f.mileage.replace(/,/g, ""), 10),
      p_price: parseInt(f.price.replace(/,/g, ""), 10),
      p_est_min: result.low,
      p_est_max: result.high,
      p_dep_min: result.depMin,
      p_dep_max: result.depMax,
    });
    if (error) {
      setSaveState("idle");
      setToast("저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
      setTimeout(() => setToast(""), 2000);
      return;
    }
    setSaveState("saved");
    const pts = (data as { points?: number })?.points ?? 0;
    if (pts > 0) {
      setToast(`내 차고에 저장 · +${pts}P`);
      setTimeout(() => setToast(""), 2200);
    }
    router.refresh();
  }

  return (
    <div>
      <div className="space-y-3">
        <Field label="제조사" value={f.brand} onChange={set("brand")} placeholder="예: 현대" />
        <Field label="모델" value={f.model} onChange={set("model")} placeholder="예: 그랜저" />
        <Field label="연식" value={f.year} onChange={set("year")} placeholder="예: 2021" suffix="년" numeric />
        <Field label="주행거리" value={f.mileage} onChange={set("mileage")} placeholder="예: 45000" suffix="km" numeric />
        <Field label="신차 가격" value={f.price} onChange={set("price")} placeholder="예: 3800" suffix="만원" numeric />
      </div>

      {err && <p className="text-up text-sm mt-3">{err}</p>}

      <button onClick={calc} className="w-full mt-4 bg-blue text-white font-bold text-[17px] rounded-2xl py-4 active:scale-[0.99] transition">
        내 차 시세 보기
      </button>

      {result && (
        <>
          <div className="bg-card border border-line rounded-2xl p-6 mt-6">
            <p className="text-ink-muted text-sm font-medium">예상 시세</p>
            <p className="text-[38px] font-black tracking-tight mt-1">{manwon(result.estimate)}</p>
            <p className="text-blue font-semibold mt-1">{manwon(result.low)} ~ {manwon(result.high)}</p>
            <div className="h-px bg-line my-5" />
            <Row k="차령" v={`${result.age}년`} />
            <Row k="신차가 대비 잔존율" v={`약 ${result.retentionPct}%`} />
            <Row k="감가율" v={`${result.depMin}% ~ ${result.depMax}%`} />
            <p className="text-ink-muted text-xs mt-4 leading-relaxed">
              실거래가가 아닌 추정치입니다. 실제 시세는 차량 상태·옵션·지역에 따라 달라질 수 있습니다.
            </p>
            <button
              onClick={save}
              disabled={saveState === "saving" || saveState === "saved"}
              className="w-full mt-4 bg-bg text-ink-sub font-bold rounded-xl py-3.5 disabled:opacity-60"
            >
              {saveState === "saved" ? "✓ 내 차고에 저장됨" : saveState === "saving" ? "저장 중..." : "내 차고에 저장하기"}
            </button>
          </div>

          {/* 신차 갈아타기 제휴 카드 */}
          <div className="bg-blue-soft rounded-2xl p-5 mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold text-blue bg-card px-2 py-1 rounded-md">광고·제휴</span>
            </div>
            <p className="font-extrabold text-[18px]">지금 신차로 갈아타기 좋은 시점일까요?</p>
            <p className="text-ink-sub text-sm mt-1.5 mb-4">
              내 차 시세와 신차 월 납입금을 비교해 보세요.
            </p>
            {nowcarUrl && (
              <a href={nowcarUrl} target="_blank" rel="noopener noreferrer" className="block text-center bg-blue text-white font-bold rounded-xl py-4">
                신차 견적 · 월 납입 비교
              </a>
            )}
          </div>
        </>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-ink text-white text-sm font-semibold px-4 py-2.5 rounded-full z-50">
          {toast}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  suffix,
  numeric,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: string;
  numeric?: boolean;
}) {
  return (
    <div>
      <label className="text-[13px] font-semibold text-ink-sub block mb-1.5">{label}</label>
      <div className="flex items-center bg-card border border-line rounded-xl px-4 focus-within:border-blue">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={numeric ? "numeric" : "text"}
          className="flex-1 py-3.5 text-[16px] font-medium outline-none bg-transparent"
        />
        {suffix && <span className="text-ink-muted text-[15px] font-medium ml-1">{suffix}</span>}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-ink-muted text-sm">{k}</span>
      <span className="text-ink-sub text-sm font-bold">{v}</span>
    </div>
  );
}
