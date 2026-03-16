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

const [activeProfile, setActiveProfile] = useState<Profile | null>(null);

type MenuItem = {
  label: string;
  href: string;
  roles: string[];
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
  
      const impersonatedUserId = localStorage.getItem("impersonatedUserId");
      const targetUserId = impersonatedUserId ?? user.id;
  
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", targetUserId)
        .single();
  
      setProfile(profileData);
      setActiveProfile(profileData);
      setLoading(false);
    };
  
    load();
  }, [router]);

  const menu: MenuItem[] = [
    {
      label: "ダッシュボード",
      href: "/admin/dashboard",
      roles: ["course_admin", "super_admin"],
    },
    {
      label: "ゴルフ場の新規作成",
      href: "/admin/dashboard/users/new",
      roles: ["super_admin"],
    },
    {
      label: "ゴルフ場のアプリケーション管理",
      href: "/admin/course",
      roles: ["super_admin"],
    },
    {
      label: "ゴルフ場の担当者としてログイン",
      href: "/admin/test",
      roles: ["super_admin"],
    },
    {
      label: "ゴルフ場へメッセージ送信",
      href: "/admin/test",
      roles: ["super_admin"],
    },
    { label: "メッセージの確認", href: "/admin/test", roles: ["course_admin"] },
    {
      label: "基本設定の表示・編集",
      href: "/admin/dashboard/settings",
      roles: ["course_admin"],
    },
    {
      label: "利用アプリケーションの表示・編集",
      href: "/admin/dashboard/apps",
      roles: ["course_admin"],
    },
    {
      label: "ログイン",
      href: "/login",
      roles: ["course_admin", "super_admin"],
    },
  ];

  // 👇 roleでフィルタ
  const visibleMenu = menu.filter(
    (item) => activeProfile && item.roles.includes(activeProfile.role)
  );

  return (
    <div className="flex flex-col h-screen">
      {/* ヘッダー */}
      <header className="h-14 border-b border-gray-300 px-6 flex items-center bg-gradient-to-b from-gray-100 to-gray-200">
        <span className="font-bold">Golf Admin</span>

        <span className="ml-auto text-sm text-gray-600">
          {loading ? "読み込み中..." : `${activeProfile?.name} (${activeProfile?.role})`}
        </span>
      </header>

      {/* ボディ */}
      <div className="flex flex-1">
        {/* サイドバー */}
        <aside className="w-64 border-r border-gray-300 p-4 bg-gradient-to-b from-gray-200 to-gray-300">
          <ul className="space-y-1">
            {visibleMenu.map((item) => {
              const active = pathname === item.href;

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
