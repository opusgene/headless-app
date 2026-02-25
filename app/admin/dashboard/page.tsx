"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Application = {
  id: string;
  name: string;
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const router = useRouter();
  const [apps, setApps] = useState<Application[]>([]);

  useEffect(() => {
    (async () => {
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

      // ---------- ゴルフ場取得 ----------
      const { data: coursesData } = await supabase
        .from("golf_courses")
        .select("*");

      setCourses(coursesData ?? []);
    })();
  }, [router]);

  if (!profile) return <div>読み込み中...</div>;

  // ゴルフ場データ表示
  const renderCourseData = (courseId: string) => {
    const target = courses.find((c) => c.golf_course_id === courseId);
    if (!target) return <p className="text-gray-500">該当データなし</p>;

    return (
      <div className="p-4 border rounded mt-4">
        <p>名前: {target.name}</p>
        <p>golf_course_id: {target.golf_course_id}</p>
      </div>
    );
  };

  return (
    <>
      <h1 className="text-2xl font-bold">ダッシュボード</h1>

      {profile.role === "super_admin" ? (
        <div className="mt-6">
          <h2 className="text-xl mb-4">ゴルフ場を選択</h2>

          <select
            className="border p-2 rounded"
            value={selectedCourseId ?? ""}
            onChange={(e) => setSelectedCourseId(e.target.value)}
          >
            <option value="">選択してください</option>
            {courses.map((course) => (
              <option key={course.id} value={course.golf_course_id}>
                {course.name}
              </option>
            ))}
          </select>

          {selectedCourseId && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold">
                選択されたゴルフ場のデータ
              </h2>
              {renderCourseData(selectedCourseId)}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6">
          <h2 className="text-xl">あなたのゴルフ場のデータ</h2>
          {/* {renderCourseData(profile.golf_course_id)} */}
          <div className="space-y-3">
            {apps.map((app) => (
              <label
                key={app.id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <p>{app.name}</p>
              </label>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
