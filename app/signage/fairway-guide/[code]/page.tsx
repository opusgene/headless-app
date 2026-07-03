// app/signage/fairway-guide/[code]/page.tsx

import { notFound } from "next/navigation";
import { supabasePublic } from "@/lib/supabase/public";

type FairwayStatus = "ok" | "ng";

export default async function FairwayGuideSignagePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  // ゴルフ場取得
  const { data: golfCourse, error: golfCourseError } =
    await supabasePublic
      .from("golf_courses")
      .select("id, name")
      .eq("code", code)
      .single();

  if (golfCourseError || !golfCourse) {
    notFound();
  }

  // フェアウェイ利用案内取得
  const { data: guide, error: guideError } =
    await supabasePublic
      .from("fairway_guides")
      .select(`
        status,
        free_message,
        member_price,
        visitor_price,
        updated_at
      `)
      .eq("golf_course_id", golfCourse.id)
      .single();

  if (guideError || !guide) {
    notFound();
  }

  const isOk = guide.status === "ok";

  return (
    <div
      className={`w-full h-screen flex flex-col items-center justify-center text-white px-10 text-center transition-colors duration-300 ${
        isOk ? "bg-green-700" : "bg-red-700"
      }`}
    >
      <div className="text-3xl font-bold mb-6">
        本日のFW乗り入れ
      </div>

      <div className="text-7xl font-extrabold mb-8">
        {isOk ? "OK" : "NG"}
      </div>

      <div className="text-xl whitespace-pre-wrap mb-10">
        {guide.free_message}
      </div>

      {isOk && (
        <div className="text-lg space-y-2">
          <div className="font-semibold">
            ご利用料金（お一人様）
          </div>
          <div>
            メンバー　{guide.member_price}円（税込）
          </div>
          <div>
            ビジター　{guide.visitor_price}円（税込）
          </div>
        </div>
      )}

      {guide.updated_at && (
        <div className="absolute bottom-4 text-xs opacity-70">
          更新：
          {new Date(guide.updated_at).toLocaleString("ja-JP")}
        </div>
      )}
    </div>
  );
}