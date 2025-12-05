"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const router = useRouter();

  // ✅ super_admin 用：新規ユーザー作成フォームの state
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    role: "course_admin",
    golf_course_id: "",
  });

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

      // ---------- ゴルフ場一覧取得 ----------
      const { data: coursesData } = await supabase
        .from("golf_courses")
        .select("*");

      if (coursesData) {
        setCourses(coursesData);
      }
    })();
  }, [router]);

  if (!profile) return <div>読み込み中...</div>;

  // ✅ フォーム送信（今はconsole.logだけ）
  const handleCreateUser = () => {
    console.log("🎯 作成予定ユーザー:", newUser);
    alert("※いまはまだ作成処理は未接続です（console.log を確認）");
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">管理画面</h1>
      <p className="mt-4">
        ログイン中: {profile.name} ({profile.role})
      </p>

      {/* ✅ super_admin 専用：新規ユーザー作成フォーム */}
      {profile.role === "super_admin" && (
        <div className="mt-8 p-6 border rounded">
          <h2 className="text-xl font-bold mb-4">新しい管理ユーザーを作成</h2>

          {/* メールアドレス */}
          <div className="mb-4">
            <label className="block mb-1">メールアドレス</label>
            <input
              className="border p-2 rounded w-full"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
            />
          </div>

          {/* 名前 */}
          <div className="mb-4">
            <label className="block mb-1">名前</label>
            <input
              className="border p-2 rounded w-full"
              value={newUser.name}
              onChange={(e) =>
                setNewUser({ ...newUser, name: e.target.value })
              }
            />
          </div>

          {/* 権限 */}
          <div className="mb-4">
            <label className="block mb-1">権限</label>
            <select
              className="border p-2 rounded w-full"
              value={newUser.role}
              onChange={(e) =>
                setNewUser({ ...newUser, role: e.target.value })
              }
            >
              <option value="course_admin">ゴルフ場管理者</option>
              <option value="super_admin">スーパー管理者</option>
            </select>
          </div>

          {/* ゴルフ場選択 */}
          <div className="mb-6">
            <label className="block mb-1">紐づけるゴルフ場</label>
            <select
              className="border p-2 rounded w-full"
              value={newUser.golf_course_id}
              onChange={(e) =>
                setNewUser({ ...newUser, golf_course_id: e.target.value })
              }
            >
              <option value="">選択してください</option>
              {courses.map((c) => (
                <option key={c.id} value={c.golf_course_id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCreateUser}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            ユーザー作成（仮）
          </button>
        </div>
      )}

      {/* ✅ ゴルフ場管理者用の既存表示 */}
      {profile.role === "course_admin" && (
        <div className="mt-6">
          <h2 className="text-xl">あなたのゴルフ場のデータ</h2>
          {courses
            .filter((c) => c.golf_course_id === profile.golf_course_id)
            .map((c) => (
              <div key={c.id}>{c.name}</div>
            ))}
        </div>
      )}
    </div>
  );
}
