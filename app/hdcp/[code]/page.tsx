// app/hdcp/[code]/page.tsx
export const dynamic = "force-dynamic";

import { supabasePublic } from "@/lib/supabase/public";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  // 🔑 必ず await する
  const { code } = await params;

  // ① ゴルフ場取得（code → 1件）
  const { data: course, error: courseError } = await supabasePublic
    .from("golf_courses")
    .select("id, name")
    .eq("code", code)
    .single();

  if (courseError || !course) {
    notFound();
  }

  // ② スコア取得（golf_course_id）
  const { data: scores, error: scoresError } = await supabasePublic
    .from("hdcp_scores_public")
    .select("id, player_name, hdcp, display_order")
    .eq("golf_course_id", course.id)
    .order("display_order", { ascending: true, nullsFirst: false })
    .order("player_name", { ascending: true });

  if (scoresError) {
    throw new Error(scoresError.message);
  }

  // ③ 表示（まずは確認用）
  return (
    <pre>
      {JSON.stringify(
        {
          code,
          course,
          scores,
        },
        null,
        2
      )}
    </pre>
  );
}
