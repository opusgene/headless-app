"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useImpersonate } from "@/context/impersonateContext";

type Application = {
  id: number;
  name: string;
};

export default function AppsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState<string | null>(null); // ← 追加

  const router = useRouter();
  const { impersonateCourseId } = useImpersonate();

  useEffect(() => {
    const loadApps = async () => {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("golf_course_id, role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("プロフィール取得エラー:", profileError);
        setLoading(false);
        return;
      }

      // 🎯 有効なコースID
      const effectiveCourseId =
        impersonateCourseId ?? profile?.golf_course_id;

      if (!effectiveCourseId) {
        console.warn("コース未選択");
        setApps([]);
        setLoading(false);
        return;
      }

      setCourseId(effectiveCourseId); // ← ここ重要

      const { data, error } = await supabase
        .from("applications")
        .select(
          `
          id,
          name,
          golf_course_applications!inner (
            golf_course_id
          )
        `
        )
        .eq(
          "golf_course_applications.golf_course_id",
          effectiveCourseId
        );

      if (error) {
        console.error("アプリ取得エラー:", error);
        setApps([]);
      } else {
        setApps(data ?? []);
      }

      setLoading(false);
    };

    loadApps();
  }, [router, impersonateCourseId]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">利用可能アプリ一覧</h1>

      {loading ? (
        <p>読み込み中...</p>
      ) : !apps.length ? (
        <p>利用できるアプリがありません。</p>
      ) : (
        <ul className="space-y-2">
          {apps.map((app) => (
            <li
              key={app.id}
              className="border p-3 rounded hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                if (app.name === "HDCP表（タッチパネル形式）") {
                  if (!courseId) {
                    alert("コースが選択されていません");
                    return;
                  }

                  router.push(
                    `/admin/dashboard/apps/hdcp?courseId=${courseId}`
                  );
                }
              }}
            >
              {app.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}