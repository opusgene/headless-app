"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function CourseSettingsPage() {
  const [courseId, setCourseId] = useState<string | null>(null);
  const [name, setName] = useState("");
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

      // プロフィール取得
      const { data: profile } = await supabase
        .from("profiles")
        .select("golf_course_id")
        .eq("id", user.id)
        .single();

      if (!profile) return;

      setCourseId(profile.golf_course_id);

      // ゴルフ場情報取得
      const { data: course } = await supabase
        .from("golf_courses")
        .select("name")
        .eq("id", profile.golf_course_id)
        .single();

      if (course) {
        setName(course.name ?? "");
      }

      setLoading(false);
    };

    loadCourse();
  }, [router]);

  const handleSave = async () => {
    console.log("保存ボタン押された");

    if (!courseId) {
      console.log("courseIdがない");
      return;
    }

    const { data, error } = await supabase
      .from("golf_courses")
      .update({ name })
      .eq("id", courseId)
      .select();

    console.log("update data:", data);
    console.log("update error:", error);

    if (error) {
      alert("保存失敗");
      return;
    }

    alert("保存成功");
  };
  
  if (loading) return <div>読み込み中...</div>;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">ゴルフ場基本情報</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1">ゴルフ場正式名称</label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded w-full"
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
