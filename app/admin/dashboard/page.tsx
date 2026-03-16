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
};

type CourseApp = {
  application_id: number;
  applications: {
    id: number;
    name: string;
  } | null;
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [viewCourseId, setViewCourseId] = useState<string | null>(null);
  const [courseApps, setCourseApps] = useState<CourseApp[]>([]);
  const [impersonateCourseId, setImpersonateCourseId] = useState<string | null>(
    null
  );

  const router = useRouter();

  // ---------- 現在の閲覧ゴルフ場 ----------
  const currentCourseId =
    impersonateCourseId ??
    (profile?.role === "super_admin"
      ? viewCourseId
      : profile?.golf_course_id);

  // ---------- 初期ロード ----------
  useEffect(() => {
    const loadInitial = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        router.push("/login");
        return;
      }

      // プロフィール取得
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, role, golf_course_id")
        .eq("id", user.id)
        .single();

      if (profileError || !profileData) {
        console.error(profileError);
        return;
      }

      setProfile(profileData);

      // ゴルフ場一覧取得
      const { data: coursesData, error: coursesError } = await supabase
        .from("golf_courses")
        .select("id, name")
        .order("name");

      if (coursesError) {
        console.error(coursesError);
        return;
      }

      setCourses(coursesData ?? []);
    };

    loadInitial();
  }, [router]);

  // ---------- ゴルフ場のアプリ取得 ----------
  useEffect(() => {
    if (!currentCourseId) return;

    const loadApps = async () => {
      const { data, error } = await supabase
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
        .eq("golf_course_id", currentCourseId)
        .returns<CourseApp[]>();

      if (error) {
        console.error(error);
        return;
      }

      setCourseApps(data ?? []);
    };

    loadApps();
  }, [viewCourseId, profile, impersonateCourseId]);

  if (!profile) return <div>読み込み中...</div>;

  // ---------- ゴルフ場データ表示 ----------
  const renderCourseData = (courseId: string) => {
    const target = courses.find((c) => c.id === courseId);

    if (!target) return <p className="text-gray-500">該当データなし</p>;

    return (
      <div className="p-4 border rounded mt-4 space-y-2">
        <p>名前: {target.name}</p>
        <p>golf_course_id: {target.id}</p>

        <div className="mt-3">
          <p className="font-semibold">使用中のアプリケーション</p>

          {courseApps.length === 0 ? (
            <p className="text-gray-400 text-sm">なし</p>
          ) : (
            <ul className="list-disc ml-5">
              {courseApps.map((rel) => (
                <li key={rel.application_id}>
                  {rel.applications?.name ?? "不明"}
                </li>
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

      {/* impersonate表示 */}
      {impersonateCourseId && (
        <div className="bg-yellow-100 border p-3 mt-4 rounded">
          <p className="text-sm">
            現在このゴルフ場の管理者として閲覧しています
          </p>

          <button
            className="mt-2 px-3 py-1 bg-gray-600 text-white rounded"
            onClick={() => setImpersonateCourseId(null)}
          >
            管理者モードに戻る
          </button>
        </div>
      )}

      {profile.role === "super_admin" ? (
        <div className="mt-6">
          <h2 className="text-xl mb-4">ゴルフ場を選択</h2>

          <select
            className="border p-2 rounded"
            value={viewCourseId ?? ""}
            onChange={(e) => setViewCourseId(e.target.value)}
          >
            <option value="">選択してください</option>

            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>

          {/* impersonateボタン */}
          <div className="mt-3">
            <button
              disabled={!viewCourseId}
              className="px-3 py-1 bg-blue-600 text-white rounded disabled:bg-gray-400"
              onClick={() => {
                if (viewCourseId) {
                  setImpersonateCourseId(viewCourseId);
                }
              }}
            >
              このゴルフ場としてログイン
            </button>
          </div>

          {/* ゴルフ場データ */}
          {currentCourseId && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold">ゴルフ場データ</h2>
              {renderCourseData(currentCourseId)}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6">
          <h2 className="text-xl">あなたのゴルフ場のデータ</h2>
          {currentCourseId && renderCourseData(currentCourseId)}
        </div>
      )}
    </>
  );
}