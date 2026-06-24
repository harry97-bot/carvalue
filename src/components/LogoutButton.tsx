"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }
  return (
    <button onClick={logout} className="w-full bg-bg text-ink-muted font-semibold rounded-xl py-3.5 mt-2">
      로그아웃
    </button>
  );
}
