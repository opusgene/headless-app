"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useImpersonate } from "@/context/impersonateContext";

type Application = {
  id: number;
  name: string;
  route_path: string | null;
};

export default function AppsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // golf_courses.id
  const [courseId, setCourseId] = useState<string | null>(null);

  // golf_courses.code
  const [courseCode, setCourseCode] = useState<string | null>(null);

  const router = useRouter();
  const { impersonateCourseId } = useImpersonate();

  useEffect(() => {
    const loadApps = async () => {
      setLoading(true);

      // =========================
      // ログインユーザー取得
      // =========================
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        router.push("/login");
        return;
      }

      // =========================
      // profile取得
      // =========================
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

      // =========================
      // impersonate考慮
      // =========================
      const effectiveCourseId =
        impersonateCourseId ?? profile?.golf_course_id;

      if (!effectiveCourseId) {
        console.warn("コース未選択");
        setApps([]);
        setLoading(false);
        return;
      }

      setCourseId(effectiveCourseId);

      // =========================
      // golf_courses.code取得
      // =========================
      const { data: golfCourse, error: golfCourseError } =
        await supabase
          .from("golf_courses")
          .select("code")
          .eq("id", effectiveCourseId)
          .single();

      if (golfCourseError) {
        console.error(
          "ゴルフ場コード取得エラー:",
          golfCourseError
        );
      } else {
        setCourseCode(golfCourse?.code ?? null);
      }

      // =========================
      // 利用可能アプリ取得
      // =========================
      const { data, error } = await supabase
        .from("applications")
        .select(
          `
          id,
          name,
          route_path,
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

  // =========================
  // route_path置換関数
  // =========================
  const compileRoutePath = (
    routePath: string,
    params: {
      courseId?: string;
      code?: string;
    }
  ) => {
    return routePath
      .replaceAll("{courseId}", params.courseId ?? "")
      .replaceAll("{code}", params.code ?? "");
  };

  // =========================
  // アプリクリック
  // =========================
  const handleAppClick = (app: Application) => {
    if (!app.route_path) {
      alert("遷移先URLが設定されていません");
      return;
    }

    const path = compileRoutePath(app.route_path, {
      courseId: courseId ?? "",
      code: courseCode ?? "",
    });

    router.push(path);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        利用可能アプリ一覧
      </h1>

      {loading ? (
        <p>読み込み中...</p>
      ) : !apps.length ? (
        <p>利用できるアプリがありません。</p>
      ) : (
        <ul className="space-y-2">
          {apps.map((app) => (
            <li
              key={app.id}
              className="border p-3 rounded hover:bg-gray-50 cursor-pointer transition"
              onClick={() => handleAppClick(app)}
            >
              {app.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}