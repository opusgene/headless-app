// app/signage/hdcp/[courseId]/page.tsx
import { createClient } from '@/lib/supabase/server';

export default async function HdcpSignagePage({
  params,
}: {
  params: { courseId: string };
}) {
  const supabase =  await createClient();

  const { data, error } = await supabase
    .from('hdcp_scores_public')
    .select('player_name, hdcp')
    .eq('golf_course_id', params.courseId)
    .order('display_order', { ascending: true });

  if (error) {
    return <p>表示エラー</p>;
  }

  return (
    <div className="h-screen bg-black text-white p-12">
      <h1 className="text-4xl mb-8">HDCP表</h1>

      <table className="w-full text-3xl">
        <tbody>
          {data?.map((row) => (
            <tr key={row.player_name}>
              <td className="py-3">{row.player_name}</td>
              <td className="py-3 text-right">
                {row.hdcp ?? '未定'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
