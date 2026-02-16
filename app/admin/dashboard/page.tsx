"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Stats = {
  users: number;
  courses: number;
  tournaments: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    users: 0,
    courses: 0,
    tournaments: 0,
  });

  useEffect(() => {
    (async () => {
      const [usersRes, coursesRes, tournamentsRes] = await Promise.all([
        supabase.from("profiles").select("id"),
        supabase.from("courses").select("id"),
        supabase.from("tournaments").select("id"),
      ]);

      setStats({
        users: usersRes.data?.length ?? 0,
        courses: coursesRes.data?.length ?? 0,
        tournaments: tournamentsRes.data?.length ?? 0,
      });
    })();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ユーザー数 */}
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="text-sm text-gray-500 mb-1">ユーザー数</div>
          <div className="text-3xl font-bold">{stats.users}</div>
        </div>

        {/* ゴルフ場数 */}
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="text-sm text-gray-500 mb-1">ゴルフ場数</div>
          <div className="text-3xl font-bold">{stats.courses}</div>
        </div>

        {/* 大会数 */}
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="text-sm text-gray-500 mb-1">大会数</div>
          <div className="text-3xl font-bold">{stats.tournaments}</div>
        </div>
      </div>
    </div>
  );
}
