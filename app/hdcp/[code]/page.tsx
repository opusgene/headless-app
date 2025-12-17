// app/hdcp/[code]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type PageProps = {
  params: { code: string };
};

export default async function HdcpPublicPage({ params }: PageProps) {
  const supabase = await createClient();

  // ① code → golf_course_id(uuid) に変換
  const { data: course, error: courseError } = await supabase
    .from("golf_courses")
    .select("id, name")
    .eq("code", params.code)
    .single();

  if (courseError || !course) {
    notFound();
  }

  // ② uuid で HDCP データ取得
  const { data: scores, error } = await supabase
    .from("hdcp_scores_public")
    .select("id, player_name, hdcp")
    .eq("golf_course_id", course.id)
    .order("player_name");

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{course.name} HDCP 表</h1>

      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">プレイヤー名</th>
            <th className="p-2 text-left">HDCP</th>
          </tr>
        </thead>
        <tbody>
          {scores?.map((row) => (
            <tr key={row.id} className="border-t">
              <td className="p-2">{row.player_name}</td>
              <td className="p-2">{row.hdcp ?? "未定"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
