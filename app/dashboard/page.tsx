"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]); // ← ゴルフ場データ用
  const router = useRouter();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

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

  // ---- デバッグログ ----
  console.log("🎯 全 courses =", courses);
  console.log("🎯 selectedCourseId =", selectedCourseId);
  console.log(
    "🎯 フィルタ結果 =",
    courses.filter((c) => c.id === selectedCourseId)
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">管理画面</h1>
      <p className="mt-4">
        ログイン中: {profile.name} ({profile.role})
      </p>

      {profile.role === "super_admin" ? (
        <div className="mt-6">
          {/* ▼ ゴルフ場セレクト ▼ */}
          <div className="mt-4">
            <label className="block mb-2 font-medium">ゴルフ場を選択</label>
            <select
              className="border p-2 rounded"
              value={selectedCourseId ?? ""}
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              <option value="">選択してください</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          {/* ▼ 選択されたゴルフ場のデータ表示 ▼ */}
          {selectedCourseId && (
            <div className="mt-6 p-4 border rounded">
              <h2 className="text-xl mb-2">選択されたゴルフ場のデータ</h2>
              {courses
                .filter((c) => c.id.trim === selectedCourseId)
                .map((c) => (
                  <div key={c.id}>
                    <p>ID: {c.id}</p>
                    <p>名前: {c.name}</p>
                  </div>
                ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6">
          <h2 className="text-xl">あなたのゴルフ場のデータ</h2>
          {courses
            .filter((c) => c.golf_course_id === profile.golf_course_id)
            .map((c) => (
              <div key={c.golf_course_id}>{c.name}</div>
            ))}
        </div>
      )}
    </div>
  );
}
