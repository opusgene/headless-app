"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      console.log("🔥 useEffect started")

      const { data: userData, error: userError } = await supabase.auth.getUser()
      console.log("✅ 現在ログイン中のユーザー:", userData, userError)

      const user = userData.user;
      if (!user) {
        console.log("🚫 userがnullのためログインページへ")
        router.push("/login");
        return;
      }

      // profiles テーブルから自分の行を取得
      const { data, error } = await supabase
        .from("profiles")
        .select("id, role, golf_course_id, name")
        .eq("id", user.id)
        .single();
        console.log("🎯 profiles取得結果:", data, error);

      if (error) {
        console.error("profiles fetch error:", error);
      } else {
        console.log("🎯 取得したプロフィール:", data)
        setProfile(data);
      }
    })();
  }, [router]);

  if (!profile) return <div>読み込み中...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">管理画面</h1>
      <p className="mt-4">ログイン中: {profile.name} ({profile.role})</p>

      {profile.role === "super_admin" ? (
        <div className="mt-6">スーパー管理者用の全体表示をここに出す</div>
      ) : (
        <div className="mt-6">ゴルフ場 {profile.golf_course_id} のデータだけ表示</div>
      )}
    </div>
  );
}
