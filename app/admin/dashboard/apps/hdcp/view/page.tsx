import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type HdcpScore = {
  id: string;
  player_name: string;
  hdcp: number | null;
};

export default async function HdcpViewPage({
  searchParams,
}: {
  searchParams: { courseId?: string };
}) {
  const supabase = await createClient();

  // 🔐 ログインチェック
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 👤 自分のコース取得
  const { data: profile } = await supabase
    .from("profiles")
    .select("golf_course_id")
    .eq("id", user.id)
    .single();

  // 🎯 impersonate or 自分
  const effectiveCourseId =
    searchParams.courseId ?? profile?.golf_course_id;

  if (!effectiveCourseId) {
    return <p>コースが選択されていません</p>;
  }

  // 📦 コース単位で取得
  const { data: scores, error } = await supabase
    .from("hdcp_scores")
    .select("id, player_name, hdcp")
    .eq("golf_course_id", effectiveCourseId) // ← ここが本質
    .order("player_name", { ascending: true });

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">HDCP 一覧</h1>

      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="p-2 text-left">プレイヤー名</th>
            <th className="p-2 text-left">HDCP</th>
          </tr>
        </thead>
        <tbody>
          {scores?.map((row: HdcpScore) => (
            <tr key={row.id} className="border-b">
              <td className="p-2">{row.player_name}</td>
              <td className="p-2">{row.hdcp ?? "未定"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}