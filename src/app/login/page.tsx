"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/profile";
  const supabase = createClient();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setMsg("");
    if (!email || !password) {
      setMsg("이메일과 비밀번호를 입력해 주세요.");
      return;
    }
    setBusy(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setMsg("이메일 또는 비밀번호를 확인해 주세요.");
      router.push(next);
      router.refresh();
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nickname: nickname || undefined } },
      });
      setBusy(false);
      if (error) return setMsg(error.message);
      if (data.session) {
        router.push(next);
        router.refresh();
      } else {
        setMsg("가입 확인 메일을 보냈어요. 메일 인증 후 로그인해 주세요.");
        setMode("signin");
      }
    }
  }

  return (
    <div className="app-shell px-6 pt-20 pb-10 min-h-dvh flex flex-col">
      <Link href="/" className="text-blue text-2xl font-extrabold tracking-tight">carvalue</Link>
      <p className="text-ink-muted text-sm mt-1 mb-10">내 차의 가치를 찾다</p>

      <h1 className="text-2xl font-extrabold mb-6">
        {mode === "signin" ? "로그인" : "회원가입"}
      </h1>

      <div className="space-y-3">
        {mode === "signup" && (
          <Field label="닉네임 (선택)" value={nickname} onChange={setNickname} placeholder="카밸러" />
        )}
        <Field label="이메일" value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
        <Field label="비밀번호" value={password} onChange={setPassword} placeholder="6자 이상" type="password" />
      </div>

      {msg && <p className="text-sm text-up mt-4">{msg}</p>}

      <button
        onClick={submit}
        disabled={busy}
        className="mt-6 bg-blue text-white font-bold text-[17px] rounded-2xl py-4 disabled:opacity-60"
      >
        {busy ? "처리 중..." : mode === "signin" ? "로그인" : "가입하고 100P 받기"}
      </button>

      <button
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setMsg("");
        }}
        className="mt-4 text-ink-sub text-sm font-medium"
      >
        {mode === "signin" ? "아직 회원이 아니신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-[13px] font-semibold text-ink-sub block mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-card border border-line rounded-xl px-4 py-3.5 text-[16px] font-medium outline-none focus:border-blue"
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
