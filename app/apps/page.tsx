"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Application = {
  id: number;
  name: string;
};

export default function AppsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadApps = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        router.push("/login");
        return;
      }

      // プロフィール取得
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, golf_course_id")
        .eq("id", user.id)
        .single();

      if (!profile) return;

      if (profile.role !== "course_admin") {
        router.push("/dashboard");
        return;
      }

      // アプリ取得
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
        .eq("golf_course_applications.golf_course_id", profile.golf_course_id);

      setApps(data ?? []);
    };

    loadApps();
  }, [router]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">利用可能アプリ</h1>

      {apps.length === 0 ? (
        <p>利用できるアプリがありません</p>
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
