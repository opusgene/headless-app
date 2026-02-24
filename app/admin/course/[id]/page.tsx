"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";

type Application = {
  id: string;
  name: string;
};

export default function CourseApplicationsPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [courseName, setCourseName] = useState("");
  const [apps, setApps] = useState<Application[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      // ゴルフ場名
      const { data: course } = await supabase
        .from("golf_courses")
        .select("name")
        .eq("id", courseId)
        .single();

      setCourseName(course?.name ?? "");

      // 全アプリ
      const { data: allApps } = await supabase
        .from("applications")
        .select("*")
        .order("id");

      setApps(allApps ?? []);

      // 許可アプリ
      const { data: relations } = await supabase
        .from("golf_course_applications")
        .select("application_id")
        .eq("golf_course_id", courseId);

      setChecked(relations?.map((r) => r.application_id) ?? []);
    };

    load();
  }, [courseId]);

  const toggle = (appId: string) => {
    setChecked((prev) =>
      prev.includes(appId)
        ? prev.filter((id) => id !== appId)
        : [...prev, appId]
    );
  };

  const save = async () => {
    // 全削除
    await supabase
      .from("golf_course_applications")
      .delete()
      .eq("golf_course_id", courseId);

    // 再insert
    const inserts = checked.map((appId) => ({
      golf_course_id: courseId,
      application_id: appId,
    }));

    if (inserts.length > 0) {
      await supabase.from("golf_course_applications").insert(inserts);
    }

    alert("保存しました");
    router.push("/admin/course");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{courseName} のアプリ管理</h1>

      <div className="space-y-3">
        {apps.map((app) => (
          <label key={app.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={checked.includes(app.id)}
              onChange={() => toggle(app.id)}
            />
            {app.name}
          </label>
        ))}
      </div>

      <button
        onClick={save}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded cursor-pointer"
      >
        保存
      </button>
    </div>
  );
}
