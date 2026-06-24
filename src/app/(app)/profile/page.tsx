import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { num } from "@/lib/format";
import type { Profile, UserCar } from "@/lib/types";
import LogoutButton from "@/components/LogoutButton";
import CheckInButton from "@/components/CheckInButton";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="px-5 pt-12">
        <h1 className="text-[22px] font-extrabold tracking-tight mb-1">프로필</h1>
        <div className="bg-card border border-line rounded-2xl p-7 mt-6 text-center">
          <p className="text-5xl mb-3">🚗</p>
          <p className="font-bold text-lg">로그인하고 시작하세요</p>
          <p className="text-ink-muted text-sm mt-1.5 mb-5">
            가입하면 UID 발급과 100P를 드려요.{"\n"}투표하고 포인트를 모아보세요.
          </p>
          <Link href="/login" className="block bg-blue text-white font-bold rounded-2xl py-4">
            로그인 / 회원가입
          </Link>
        </div>
      </div>
    );
  }

  const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const profile = profileData as Profile | null;

  let mainCar: UserCar | null = null;
  if (profile?.main_car_id) {
    const { data } = await supabase.from("user_cars").select("*").eq("id", profile.main_car_id).single();
    mainCar = data as UserCar | null;
  }

  const { data: txns } = await supabase
    .from("point_transactions")
    .select("amount, transaction_type, reason, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <div className="px-5 pt-12">
      <h1 className="text-[22px] font-extrabold tracking-tight mb-5">프로필</h1>

      {/* 프로필 카드 */}
      <div className="bg-card border border-line rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-soft flex items-center justify-center text-2xl">🙂</div>
          <div>
            <p className="font-extrabold text-lg">{profile?.nickname}</p>
            <p className="text-ink-muted text-xs font-mono mt-0.5">UID {profile?.uid}</p>
          </div>
        </div>
        <div className="bg-blue-soft rounded-xl p-4 mt-5 flex items-center justify-between">
          <span className="text-blue-dark font-semibold text-sm">보유 포인트</span>
          <span className="text-blue-dark font-black text-xl">{num(profile?.points ?? 0)}P</span>
        </div>
        {mainCar && (
          <div className="mt-4">
            <p className="text-ink-muted text-xs mb-1">대표 차량</p>
            <p className="font-bold">{mainCar.brand} {mainCar.model} <span className="text-ink-muted font-normal">({mainCar.year})</span></p>
          </div>
        )}
      </div>

      {/* 출석 + 상점 */}
      <div className="flex gap-2 mt-3">
        <CheckInButton />
        <Link href="/shop" className="flex-1 bg-bg text-ink-sub font-bold rounded-xl py-3.5 text-center">
          상점 가기
        </Link>
      </div>

      {/* 포인트 내역 */}
      <section className="mt-6">
        <h2 className="text-[17px] font-bold mb-2">포인트 내역</h2>
        <div className="bg-card border border-line rounded-2xl divide-y divide-line">
          {txns && txns.length > 0 ? (
            txns.map((t, i) => (
              <div key={i} className="flex justify-between items-center px-4 py-3.5">
                <span className="text-sm text-ink-sub">{t.reason}</span>
                <span className={`text-sm font-bold ${t.transaction_type === "spend" ? "text-ink-muted" : "text-blue"}`}>
                  {t.transaction_type === "spend" ? "-" : "+"}
                  {t.amount}P
                </span>
              </div>
            ))
          ) : (
            <p className="text-ink-muted text-sm px-4 py-5 text-center">아직 내역이 없어요</p>
          )}
        </div>
      </section>

      <div className="mt-6">
        <LogoutButton />
      </div>
    </div>
  );
}
