"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import "../globals.css"; // TailwindのグローバルCSS読み込み

type Profile = {
  id: string;
  name: string;
  role: string;
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);
      setLoading(false);
    };

    load();
  }, [router]);

  const menu = [
    { label: "ダッシュボード", href: "/admin/dashboard" },
    { label: "ゴルフ場管理", href: "/admin/courses" },
    { label: "HDCP表", href: "/admin/hdcp" },
    { label: "チャンピオンボード", href: "/admin/champions" },
    { label: "ユーザー", href: "/admin/users" },
    { label: "設定", href: "/admin/settings" },
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* ヘッダー */}
      <header className="h-14 border-b border-gray-300 px-6 flex items-center bg-gradient-to-b from-gray-100 to-gray-200">
        <span className="font-bold">Golf Admin</span>

        <span className="ml-auto text-sm text-gray-600">
          {loading ? "読み込み中..." : `${profile?.name} (${profile?.role})`}
        </span>
      </header>

      {/* ボディ */}
      <div className="flex flex-1">
        {/* サイドバー */}
        <aside className="w-64 border-r border-gray-300 p-4 bg-gradient-to-b from-gray-200 to-gray-300">
          <ul className="space-y-1">
            {menu.map((item) => {
              const active = pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block px-3 py-2 rounded text-sm ${
                      active
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* メイン */}
        <main className="flex-1 p-8 overflow-y-auto bg-gray-100">
          {loading ? <div>読み込み中...</div> : children}
        </main>
      </div>
    </div>
  );
}
