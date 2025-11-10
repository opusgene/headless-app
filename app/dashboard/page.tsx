"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/login");
      else setUser(data.user);
    });
  }, [router]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">ダッシュボード</h1>
      {user && <p className="mt-4">ログイン中: {user.email}</p>}
    </div>
  );
}
