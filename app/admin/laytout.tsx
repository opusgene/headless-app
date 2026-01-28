// app/(admin)/layout.tsx
"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);
    })();
  }, [router]);

  if (!profile) return <div>読み込み中...</div>;

  return (
    <div className="flex flex-col h-screen">
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

        {/* メイン */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
