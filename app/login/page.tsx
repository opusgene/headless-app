"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useImpersonate } from "@/context/impersonateContext";

export default function LoginPage() {
  const router = useRouter();
  const { setImpersonateCourseId } = useImpersonate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 🔥 ここ追加
  useEffect(() => {
    setImpersonateCourseId(null);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setError(error.message);
    else router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-80">
        <h1 className="text-2xl font-bold text-center">ログイン</h1>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">メールアドレス</label>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">パスワード</label>
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          ログイン
        </button>
      </form>
    </div>
  );
}
