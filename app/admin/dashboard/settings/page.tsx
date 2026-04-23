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

      // ゴルフ場名
      const { data: course } = await supabase
        .from("golf_courses")
        .select("name")
        .eq("id", effectiveCourseId)
        .single();

      if (course) setName(course.name ?? "");

      // =========================
      // 管理者取得（重要改善）
      // =========================
      const { data: adminProfiles, error: adminError } = await supabase
        .from("profiles")
        .select("id, name")
        .eq("golf_course_id", effectiveCourseId)
        .eq("role", "course_admin")
        .order("created_at", { ascending: true })
        .limit(1);

      if (adminError) {
        console.error("admin fetch error:", adminError);
      }

      const adminProfile = adminProfiles?.[0];

      if (!adminProfile) {
        console.warn("adminProfile not found");
        setAdminId(null);
        setAdminName("");
      } else {
        setAdminId(adminProfile.id);
        setAdminName(adminProfile.name ?? "");
      }

      setLoading(false);
    };

    loadCourse();
  }, [router, impersonateCourseId]);

  const handleSave = async () => {
    if (!courseId) return;

    if (!adminId) {
      alert("管理者IDが取得できていません");
      return;
    }

    console.log("UPDATING adminId:", adminId);

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

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email!,
        password: currentPassword,
      });

      if (signInError) {
        alert("現在のパスワードが違います");
        return;
      }
    }

    // =========================
    // UPDATE
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
        <div>
          <label className="block text-sm mb-1">ゴルフ場正式名称</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 w-full"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">管理者名</label>
          <input
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            className="border p-2 w-full"
          />
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          保存
        </button>
      </div>
    </div>
  );
}