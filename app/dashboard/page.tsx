"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import "./globals.css";

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
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

      // ---------- ゴルフ場情報を取得（RLSなし） ----------
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
    courses.filter((c) => c.golf_course_id === selectedCourseId)
  );

  // ---- 共通: ゴルフ場データの表示関数 ----
  const renderCourseData = (courseId: string) => {
    const target = courses.find((c) => c.golf_course_id === courseId);
    console.log("🎯 courseId =", courseId);
    if (!target) return <p className="text-gray-500">該当データなし</p>;

    return (
      <div className="p-4 border rounded mt-4">
        <p>名前: {target.name}</p>
        <p>golf_course_id: {target.golf_course_id}</p>
      </div>
    );
  };

  // return (
  //   <div className="p-8">
  //     <h1 className="text-2xl font-bold">管理画面</h1>
  //     <p className="mt-4">
  //       ログイン中: {profile.name} ({profile.role})
  //     </p>

  //     {/* super_admin の表示区分 */}
  //     {profile.role === "super_admin" ? (
  //       <div className="mt-6">
  //         <h2 className="text-xl mb-4">ゴルフ場を選択</h2>

  //         <select
  //           className="border p-2 rounded"
  //           value={selectedCourseId ?? ""}
  //           onChange={(e) => setSelectedCourseId(e.target.value)}
  //         >
  //           <option value="">選択してください</option>

  //           {courses.map((course) => (
  //             <option key={course.id} value={course.golf_course_id}>
  //               {course.name}
  //             </option>
  //           ))}
  //         </select>

  //         {selectedCourseId && (
  //           <div className="mt-6">
  //             <h2 className="text-lg font-semibold">
  //               選択されたゴルフ場のデータ
  //             </h2>
  //             {renderCourseData(selectedCourseId)}
  //           </div>
  //         )}
  //       </div>
  //     ) : (
  //       // course_admin の表示区分
  //       <div className="mt-6">
  //         <h2 className="text-xl">あなたのゴルフ場のデータ</h2>
  //         {renderCourseData(profile.golf_course_id)}
  //       </div>
  //     )}
  //   </div>
  // );
  return (
    // <div className="flex flex-col h-screen">
    <div className="bg-red-500 p-10 text-white">
      {/* ヘッダー */}
      <header className="h-14 border-b px-6 flex items-center">
        <span className="font-bold">管理画面</span>
        <span className="ml-auto text-sm text-gray-600">
          {profile.name} ({profile.role})
        </span>
      </header>

      {/* ボディ */}
      <div className="flex flex-1">
        {/* サイドメニュー */}
        <aside className="w-64 border-r p-4">
          <ul className="space-y-2">
            <li className="font-semibold">ダッシュボード</li>
            <li className="text-gray-500">ゴルフ場管理</li>
            <li className="text-gray-500">HDCP表</li>
            <li className="text-gray-500">チャンピオンボード</li>
            <li className="text-gray-500">設定</li>
          </ul>
        </aside>

        {/* メイン表示エリア */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* ↓↓↓ ここから下は、今の中身をほぼそのまま ↓↓↓ */}

          <h1 className="text-2xl font-bold">ダッシュボード</h1>

          {/* super_admin の表示区分 */}
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
            // course_admin の表示区分
            <div className="mt-6">
              <h2 className="text-xl">あなたのゴルフ場のデータ</h2>
              {renderCourseData(profile.golf_course_id)}
            </div>
          )}

          {/* ↑↑↑ ここまで既存ロジック ↑↑↑ */}
        </main>
      </div>
    </div>
  );
}
