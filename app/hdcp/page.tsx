import { supabasePublic } from "@/lib/supabase/public";

type HdcpScore = {
  id: string;
  player_name: string;
  hdcp: number | null;
  display_order: number | null;
};

export default async function HdcpPublicPage() {
  const { data, error } = await supabasePublic
    .from("hdcp_scores_public")
    .select("id, player_name, hdcp, display_order")
    .order("display_order", { ascending: true, nullsFirst: false })
    .order("player_name", { ascending: true });

  if (error) {
    return <p>データ取得エラー: {error.message}</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">HDCP 表</h1>

      <table className="w-full border-collapse text-xl">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3">名前</th>
            <th className="text-right p-3">HDCP</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((row) => (
            <tr key={row.id} className="border-b">
              <td className="p-3">{row.player_name}</td>
              <td className="p-3 text-right">
                {row.hdcp ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
