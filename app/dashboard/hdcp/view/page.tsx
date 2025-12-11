import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Database } from '@/supabase/types';

type HdcpScore = Database['public']['Tables']['hdcp_scores']['Row'];

export default async function HdcpViewPage() {
  const supabase = createClient();

  // --- ログインユーザー判定 ----------------------
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // --- HDCP スコア取得（RLS が自動でフィルタ）----
  const { data: scores, error } = await supabase
    .from('hdcp_scores')
    .select('*')
    .order('player_name', { ascending: true });

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
