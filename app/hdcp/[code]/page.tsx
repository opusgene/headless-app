// app/hdcp/[code]/page.tsx
export const dynamic = "force-dynamic";

import { supabasePublic } from "@/lib/supabase/public";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: { code: string };
}) {
  // ① URL から code を取得
  const code = params.code;

  // ② golf_courses.code → id, name を取得
  const { data: course, error: courseError } = await supabasePublic
    .from("golf_courses")
    .select("id, name")
    .eq("code", code)
    .single();

  // if (courseError || !course) {
  //   notFound();
  // }

  // ③ hdcp_scores_public を golf_course_id で取得
  const { data: scores, error: scoresError } = await supabasePublic
    .from("hdcp_scores_public")
    .select("id, player_name, hdcp, display_order")
    .eq("golf_course_id", course.id)
    .order("display_order", { ascending: true, nullsFirst: false })
    .order("player_name", { ascending: true });

  if (scoresError) {
    throw new Error(scoresError.message);
  }

  // ④ まずは JSON 表示で確認
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
