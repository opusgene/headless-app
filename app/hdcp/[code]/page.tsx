// app/hdcp/[code]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type Props = {
  params: {
    code: string;
  };
};

export default async function HdcpPublicPage({ params }: Props) {
  const supabase = await createClient();
  const code = params.code;

  // ① code → golf_course_id を取得
  const { data: course, error: courseError } = await supabase
    .from("golf_courses")
    .select("id, name")
    .eq("code", code)
    .single();

  if (courseError || !course) {
    notFound();
  }

  // ② golf_course_id で HDCP 公開データ取得
  const { data: scores, error: scoresError } = await supabase
    .from("hdcp_scores_public")
    .select("id, player_name, hdcp")
    .eq("golf_course_id", course.id)
    .order("player_name", { ascending: true });

  if (scoresError) {
    return <p>Error: {scoresError.message}</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {course.name} HDCP表
      </h1>

      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="p-2 text-left">プレイヤー名</th>
            <th className="p-2 text-left">HDCP</th>
          </tr>
        </thead>
        <tbody>
          {scores && scores.length > 0 ? (
            scores.map((row) => (
              <tr key={row.id} className="border-b">
                <td className="p-2">{row.player_name}</td>
                <td className="p-2">
                  {row.hdcp === null ? "未定" : row.hdcp}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} className="p-4 text-gray-500">
                データがありません
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// app/hdcp/[code]/page.tsx
// import { createClient } from "@/lib/supabase/server";

// export default async function HdcpPublicPage({
//   params,
// }: {
//   params: { code: string };
// }) {
//   const supabase = await createClient();
//   const code = params.code;

//   // 🔴 ここが「どこに書くかわからない」と言っていた部分
//   const { data: courses, error } = await supabase
//     .from("golf_courses")
//     .select("id, code");

//   console.log("ALL COURSES", courses);
//   console.log("ERROR", error);

//   return (
//     <div>
//       <h1>HDCP CODE: {code}</h1>
//     </div>
//   );
// }
