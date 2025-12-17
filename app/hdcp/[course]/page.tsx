import { supabasePublic } from "@/lib/supabase/public";

export default async function HdcpPublicPage({
  params,
}: {
  params: { course: string };
}) {
  const { data, error } = await supabasePublic
    .from("hdcp_scores_public")
    .select("player_name, hdcp")
    .eq("golf_course_code", params.course)
    .order("player_name");

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        HDCP 表（{params.course}）
      </h1>

      <table className="w-full text-xl">
        <tbody>
          {data?.map((row, i) => (
            <tr key={i}>
              <td className="p-3">{row.player_name}</td>
              <td className="p-3 text-right">{row.hdcp ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
