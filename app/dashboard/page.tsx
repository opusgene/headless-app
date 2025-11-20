"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      console.log("🔥 useEffect started");
  
      const { data: userData, error: userError } = await supabase.auth.getUser();
      console.log("✅ auth.getUser() 結果:", userData, userError);
      console.log("✅ auth uid:", userData.user?.id);
  
      const user = userData.user;
      if (!user) {
        console.log("🚫 userがnullのためログインページへ");
        router.push("/login");
        return;
      }
  
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
  
      console.log("🎯 profiles取得結果:", profilesData, profilesError);
  
      if (!profilesError && profilesData) {
        setProfile(profilesData);
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
