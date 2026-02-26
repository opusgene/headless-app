"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Profile = {
  id: string;
  role: string;
  golf_course_id: string;
};

type Course = {
  id: string;
  name: string;
  golf_course_id: string;
};

type CourseApp = {
  application_id: string;
  applications: {
    id: string;
    name: string;
  }[];
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courseApps, setCourseApps] = useState<CourseApp[]>([]);

  const router = useRouter();

  // ---------- 初期ロード ----------
  useEffect(() => {
    (async () => {
      // 認証
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        router.push("/login");
        return;
      }

      // プロフィール
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      // ゴルフ場一覧
      const { data: coursesData } = await supabase
        .from("golf_courses")
        .select("*")
        .order("name");

      setCourses(coursesData ?? []);
    })();
  }, [router]);

  // ---------- 選択ゴルフ場のアプリ取得 ----------
  useEffect(() => {
    const courseId =
      profile?.role === "super_admin"
        ? selectedCourseId
        : profile?.golf_course_id;

    if (!courseId) return;

    const loadApps = async () => {
      const { data } = await supabase
        .from("golf_course_applications")
        .select(
          `
          application_id,
          applications (
            id,
            name
          )
        `
        )
        .eq("golf_course_id", courseId);

      setCourseApps(data ?? []);
    };

    loadApps();
  }, [selectedCourseId, profile]);

  if (!profile) return <div>読み込み中...</div>;

  // ---------- ゴルフ場データ表示 ----------
  const renderCourseData = (courseId: string) => {
    const target = courses.find((c) => c.id === courseId);
    if (!target) return <p className="text-gray-500">該当データなし</p>;

    return (
      <div className="p-4 border rounded mt-4 space-y-2">
        <p>名前: {target.name}</p>
        <p>golf_course_id: {target.golf_course_id}</p>

        <div className="mt-3">
          <p className="font-semibold">使用中のアプリケーション</p>

          {courseApps.length === 0 ? (
            <p className="text-gray-400 text-sm">なし</p>
          ) : (
            <ul className="list-disc ml-5">
              {courseApps.map((rel) => (
                <li key={rel.application_id}>{rel.applications?.[0]?.name}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  };

  // ---------- UI ----------
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
              <option key={course.id} value={course.id}>
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
          {renderCourseData(profile.golf_course_id)}
        </div>
      )}
    </>
  );
}
