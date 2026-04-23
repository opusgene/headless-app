"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useImpersonate } from "@/context/impersonateContext";

export default function CourseSettingsPage() {
  const { impersonateCourseId } = useImpersonate();

  const [courseId, setCourseId] = useState<string | null>(null);
  const [adminId, setAdminId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [adminName, setAdminName] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const loadCourse = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        router.push("/login");
        return;
      }

      // ログインユーザー（コース特定用）
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, golf_course_id, role")
        .eq("id", user.id)
        .single();

      if (!profile) return;

      const effectiveCourseId =
        impersonateCourseId ?? profile.golf_course_id;

      if (!effectiveCourseId) {
        if (profile.role === "super_admin") {
          router.replace("/admin/dashboard");
          return;
        }

        alert("ゴルフ場が見つかりません");
        return;
      }

      setCourseId(effectiveCourseId);

      // =========================
      // ゴルフ場名
      // =========================
      const { data: course } = await supabase
        .from("golf_courses")
        .select("name")
        .eq("id", effectiveCourseId)
        .single();

      if (course) {
        setName(course.name ?? "");
      }

      // =========================
      // ★ここが本体：管理者取得（統一ロジック）
      // =========================
      const { data: adminProfile, error } = await supabase
        .from("profiles")
        .select("id, name")
        .eq("golf_course_id", effectiveCourseId)
        .eq("role", "course_admin")
        .maybeSingle();

      if (error) {
        console.error(error);
      }

      if (adminProfile) {
        setAdminName(adminProfile.name ?? "");
        setAdminId(adminProfile.id);
      } else {
        setAdminName("");
        setAdminId(null);
      }

      setLoading(false);
    };

    loadCourse();
  }, [router, impersonateCourseId]);

  const handleSave = async () => {
    if (!courseId || !adminId) return;

    // パスワードチェック
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        alert("現在のパスワードを入力してください");
        return;
      }

      if (newPassword !== confirmPassword) {
        alert("新しいパスワードが一致しません");
        return;
      }

      if (newPassword.length < 6) {
        alert("パスワードは6文字以上にしてください");
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email;

      const { error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email!,
          password: currentPassword,
        });

      if (signInError) {
        alert("現在のパスワードが違います");
        return;
      }
    }

    // =========================
    // 更新処理
    // =========================
    const [courseRes, profileRes] = await Promise.all([
      supabase
        .from("golf_courses")
        .update({ name })
        .eq("id", courseId),

      supabase
        .from("profiles")
        .update({ name: adminName })
        .eq("id", adminId),
    ]);

    console.log("courseRes:", courseRes);
    console.log("profileRes:", profileRes);
    console.log("profileRes.error:", profileRes.error);

    if (courseRes.error || profileRes.error) {
      alert("保存失敗");
      return;
    }

    // パスワード更新
    if (newPassword) {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        alert("パスワード更新失敗");
        return;
      }
    }

    alert("保存成功");
    window.location.reload();
  };

  if (loading) return <div>読み込み中...</div>;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">ゴルフ場基本情報</h1>

      <div className="space-y-4">
        {/* ゴルフ場名 */}
        <div>
          <label className="block text-sm mb-1">ゴルフ場正式名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* 管理者名 */}
        <div>
          <label className="block text-sm mb-1">管理者名</label>
          <input
            type="text"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        {!impersonateCourseId && (
          <div className="pt-6">
            <div className="border rounded-lg p-4 bg-gray-50">
              <h2 className="text-lg font-semibold mb-4">
                パスワードの変更はこちら
              </h2>

              <div className="space-y-3">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="border p-2 rounded w-full bg-white"
                  placeholder="現在のパスワード"
                />

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="border p-2 rounded w-full bg-white"
                  placeholder="新しいパスワード"
                />

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  className="border p-2 rounded w-full bg-white"
                  placeholder="新しいパスワード（確認）"
                />
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
        >
          保存
        </button>
      </div>
    </div>
  );
}