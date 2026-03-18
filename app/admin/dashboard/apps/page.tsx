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
  const router = useRouter();
  const { impersonateCourseId } = useImpersonate();

  useEffect(() => {
    const loadApps = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        router.push("/login");
        return;
      }

      // impersonateされていない場合は弾く
      if (!impersonateCourseId) {
        console.log("コース未選択");
        return;
      }

      // アプリ取得（ここが本質）
      const { data } = await supabase
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
          impersonateCourseId
        );

      setApps(data ?? []);
    };

    loadApps();
  }, [router, impersonateCourseId]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">利用可能アプリ一覧</h1>

      {!impersonateCourseId ? (
        <p>コースを選択してください。</p>
      ) : apps.length === 0 ? (
        <p>利用できるアプリがありません。</p>
      ) : (
        <ul className="space-y-2">
          {apps.map((app) => (
            <li
              key={app.id}
              className="border p-3 rounded hover:bg-gray-50 cursor-pointer"
            >
              {app.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}