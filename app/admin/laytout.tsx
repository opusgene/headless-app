"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    (async () => {
      // 認証チェック
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) {
        router.push("/login");
        return;
      }

      // プロフィール取得
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);
    })();
  }, [router]);

  if (!profile) return <div>読み込み中...</div>;

  const menu = [
    { label: "ダッシュボード", href: "/admin/dashboard" },
    { label: "ゴルフ場管理", href: "/admin/courses" },
    { label: "HDCP表", href: "/admin/hdcp" },
    { label: "チャンピオンボード", href: "/admin/champions" },
    { label: "ユーザー", href: "/admin/users" },
    { label: "設定", href: "/admin/settings" },
  ];

  // return (
  //   <div className="flex flex-col h-screen">
  //     {/* ヘッダー */}
  //     <header className="h-14 border-b px-6 flex items-center bg-white">
  //       <span className="font-bold">Golf Admin</span>

  //       <span className="ml-auto text-sm text-gray-600">
  //         {profile.name} ({profile.role})
  //       </span>
  //     </header>

  //     {/* ボディ */}
  //     <div className="flex flex-1">
  //       {/* サイドバー */}
  //       <aside className="w-64 border-r p-4 bg-gray-50">
  //         <ul className="space-y-1">
  //           {menu.map((item) => {
  //             const active = pathname.startsWith(item.href);

  //             return (
  //               <li key={item.href}>
  //                 <Link
  //                   href={item.href}
  //                   className={`block px-3 py-2 rounded text-sm ${
  //                     active
  //                       ? "bg-blue-600 text-white font-semibold"
  //                       : "text-gray-700 hover:bg-gray-200"
  //                   }`}
  //                 >
  //                   {item.label}
  //                 </Link>
  //               </li>
  //             );
  //           })}
  //         </ul>
  //       </aside>

  //       {/* メイン */}
  //       <main className="flex-1 p-8 overflow-y-auto bg-gray-100">
  //         {children}
  //       </main>
  //     </div>
  //   </div>
  // );
  return (
    <div style={{ background: "red", color: "white", padding: 40 }}>
      ADMIN LAYOUT
      {children}
    </div>
  );
   
}
