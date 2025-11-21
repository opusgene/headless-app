"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]); // ← ゴルフ場データ用
  const router = useRouter();

  useEffect(() => {
    (async () => {
      console.log("🔥 useEffect started");

      // ---------- 認証取得 ----------
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        router.push("/login");
        return;
      }

      // ---------- プロフィール取得 ----------
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profilesData);

      // ---------- ゴルフ場情報を取得（RLSなし）----------
      const { data: coursesData, error: coursesError } = await supabase
        .from("golf_courses")
        .select("*");

      console.log("🎯 golf_courses:", coursesData, coursesError);

      if (coursesData) {
        setCourses(coursesData);
      }
    })();
  }, [router]);

  if (!profile) return <div>読み込み中...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">管理画面</h1>
      <p className="mt-4">ログイン中: {profile.name} ({profile.role})</p>

      {profile.role === "super_admin" ? (
        <div className="mt-6">
          <h2 className="text-xl">全ゴルフ場のデータ</h2>
          {courses.map((c) => (
            <div key={c.id}>{c.name}</div>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <h2 className="text-xl">あなたのゴルフ場のデータ</h2>
          {courses
            .filter((c) => c.id === profile.golf_course_id)
            .map((c) => (
              <div key={c.id}>{c.name}</div>
            ))}
        </div>
      )}
    </div>
  );
}
