"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useImpersonate } from "@/context/impersonateContext";

type Profile = {
  id: string;
  name: string;
  role: string;
};

type MenuItem = {
  label: string;
  href: string;
  roles: string[];
};

export default function LayoutContent({ children }: { children: ReactNode }) {
  const { impersonateCourseId, setImpersonateCourseId } = useImpersonate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [courseName, setCourseName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 👇 追加（これが本質）
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const effectiveRole = impersonateCourseId ? "course_admin" : profile?.role;

  // ------------------------------
  // ユーザー取得
  // ------------------------------
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

  // ------------------------------
  // ゴルフ場名取得
  // ------------------------------
  useEffect(() => {
    const loadCourse = async () => {
      if (!impersonateCourseId) {
        setCourseName(null);
        return;
      }

      const { data } = await supabase
        .from("golf_courses")
        .select("name")
        .eq("id", impersonateCourseId)
        .single();

      setCourseName(data?.name ?? null);
    };

    loadCourse();
  }, [impersonateCourseId]);

  // ------------------------------
  // メニュー
  // ------------------------------
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
      label: "ゴルフ場へメッセージ送信",
      href: "/admin/test",
      roles: ["super_admin"],
    },
    {
      label: "メッセージの確認",
      href: "/admin/test",
      roles: ["course_admin"],
    },
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
  ];

  const visibleMenu = menu.filter(
    (item) => effectiveRole && item.roles.includes(effectiveRole)
  );

  // ------------------------------
  // UI
  // ------------------------------
  return (
    <div className="flex flex-col h-screen">
      {/* ヘッダー */}
      <header className="h-14 border-b px-4 flex items-center bg-gray-100">
        {/* 👇 ハンバーガー（モバイルのみ） */}
        <button
          className="
    md:hidden
    mr-3
    px-3 py-1.5
    text-xs
    font-medium
    border border-gray-300
    rounded-md
    bg-white
    shadow-sm
    active:scale-95
    transition
  "
          onClick={() => setIsSidebarOpen(true)}
        >
          ☰ Menu
        </button>

        <span className="font-bold">Golf Admin</span>

        <span className="ml-auto text-sm text-gray-600">
          {loading ? "読み込み中..." : `${profile?.name} (${effectiveRole})`}
        </span>
      </header>

      {/* impersonateバナー */}
      {impersonateCourseId && (
        <div className="bg-yellow-100 border-b px-6 py-2 flex items-center text-sm">
          <span>
            現在、{courseName ?? "読み込み中..."}の管理者として閲覧しています
          </span>

          <button
            onClick={() => {
              setImpersonateCourseId(null);
              router.replace("/admin/dashboard");
            }}
            className="ml-4 text-blue-600 underline"
          >
            管理者モードに戻る
          </button>
        </div>
      )}

      <div className="flex flex-1 relative">
        {/* 👇 オーバーレイ */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* 👇 サイドバー（ここが本質） */}
        <aside
          className={`
            fixed top-0 left-0 h-full w-64 bg-white z-50
            transform transition-transform duration-200
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 md:static md:block
            border-r p-4
          `}
        >
          {/* 閉じるボタン */}
          <button
            className="md:hidden mb-4 text-right w-full"
            onClick={() => setIsSidebarOpen(false)}
          >
            ✕
          </button>

          <ul className="space-y-1">
            {visibleMenu.map((item) => {
              const active = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)} // 👈 モバイルで閉じる
                    className={`block px-3 py-2 rounded text-sm ${
                      active
                        ? "bg-blue-600 text-white"
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
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-gray-100">
          {loading ? <div>読み込み中...</div> : children}
        </main>
      </div>
    </div>
  );
}
