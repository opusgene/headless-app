// app/signage/fairway-guide/[code]/page.tsx

import { notFound } from "next/navigation";
import { supabasePublic } from "@/lib/supabase/public";
import "../fairway-guide.css";

type FairwayStatus = "ok" | "ng";

export default async function FairwayGuideSignagePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  // ゴルフ場取得
  const { data: golfCourse, error: golfCourseError } = await supabasePublic
    .from("golf_courses")
    .select("id, name")
    .eq("code", code)
    .single();

  if (golfCourseError || !golfCourse) {
    notFound();
  }

  // フェアウェイ利用案内取得
  const { data: guide, error: guideError } = await supabasePublic
    .from("fairway_guides")
    .select(
      `
      status,
      ok_message,
      ng_message,
      show_price_table,
      member_label,
      visitor_label,
      member_price_weekday,
      member_price_holiday,
      visitor_price_weekday,
      visitor_price_holiday,
      updated_at
    `
    )
    .eq("golf_course_id", golfCourse.id)
    .single();

  if (guideError || !guide) {
    notFound();
  }

  const isOk = guide.status === "ok";

  return (
    // <div
    //   className={`w-full h-screen flex flex-col items-center justify-center text-white px-10 text-center transition-colors duration-300 ${
    //     isOk ? "bg-green-700" : "bg-red-700"
    //   }`}
    // >
    //   {/* タイトル */}
    //   <div className="text-3xl font-bold mb-6">
    //     本日のFW乗り入れ
    //   </div>

    //   {/* OK / NG */}
    //   <div className="text-7xl font-extrabold mb-8">
    //     {isOk ? "OK" : "NG"}
    //   </div>

    //   {/* メッセージ */}
    //   <div className="text-xl whitespace-pre-wrap mb-10">
    //     {isOk
    //       ? (guide.ok_message ?? "")
    //       : (guide.ng_message ?? "")}
    //   </div>

    //   {/* 料金表 */}
    //   {isOk && guide.show_price_table && (
    //     <div className="text-lg">
    //       <div className="font-semibold mb-3">
    //         ご利用料金（お一人様）
    //       </div>

    //       <table className="border-collapse mx-auto">
    //         <thead>
    //           <tr>
    //             <th className="px-6 py-2"></th>
    //             <th className="px-6 py-2">平日</th>
    //             <th className="px-6 py-2">土日祝</th>
    //           </tr>
    //         </thead>

    //         <tbody>
    //           <tr>
    //             <td className="px-6 py-2 text-left">
    //               {guide.member_label ?? "メンバー"}
    //             </td>
    //             <td className="px-6 py-2">
    //               {guide.member_price_weekday ?? 0}円（税込）
    //             </td>
    //             <td className="px-6 py-2">
    //               {guide.member_price_holiday ?? 0}円（税込）
    //             </td>
    //           </tr>

    //           <tr>
    //             <td className="px-6 py-2 text-left">
    //               {guide.visitor_label ?? "ビジター"}
    //             </td>
    //             <td className="px-6 py-2">
    //               {guide.visitor_price_weekday ?? 0}円（税込）
    //             </td>
    //             <td className="px-6 py-2">
    //               {guide.visitor_price_holiday ?? 0}円（税込）
    //             </td>
    //           </tr>
    //         </tbody>
    //       </table>
    //     </div>
    //   )}

    //   {/* 更新日時 */}
    //   {/* {guide.updated_at && (
    //     <div className="absolute bottom-4 text-xs opacity-70">
    //       更新：
    //       {new Date(guide.updated_at).toLocaleString("ja-JP")}
    //     </div>
    //   )} */}
    // </div>
    <div className="fw-entry">
      <div className="fw-entry__inner inner">
        <div className="fw-entry__heading">本日のFW乗り入れ</div>

        <div
          className={`fw-entry__status ${!isOk ? "fw-entry__status--ng" : ""}`}
        >
          <div
            className={`fw-entry__status-text ${
              !isOk ? "fw-entry__status-text--ng" : ""
            }`}
          >
            {isOk ? (
              <img src="/images/common/fw-entry-ok.png" alt="OK" />
            ) : (
              "NG"
            )}
          </div>
        </div>

        <div className="fw-entry__notice">
          {isOk ? guide.ok_message ?? "" : guide.ng_message ?? ""}
        </div>

        {isOk && guide.show_price_table && (
          <div className="fw-entry__price-box">
            <div className="fw-entry__price-heading">
              ご利用料金
              <span className="fw-entry__heading-note">（お一人様）</span>
            </div>

            <dl className="fw-entry__price-list">
              <div className="fw-entry__price-item">
                <dt className="fw-entry__price-label">
                  {guide.member_label ?? "メンバー"}
                </dt>
                <dd className="fw-entry__price-label">(平　日)</dd>

                <dd className="fw-entry__price-value">
                  {guide.member_price_weekday ?? 0}円
                  <span className="fw-entry__price-note">（税込）</span>
                </dd>
              </div>

              <div className="fw-entry__price-item">
                <dt className="fw-entry__price-label">
                  {guide.member_label ?? "メンバー"}
                </dt>
                <dd className="fw-entry__price-label">(土日祝)</dd>

                <dd className="fw-entry__price-value">
                  {guide.member_price_holiday ?? 0}円
                  <span className="fw-entry__price-note">（税込）</span>
                </dd>
              </div>

              <div className="fw-entry__price-item">
                <dt className="fw-entry__price-label">
                  {guide.visitor_label ?? "ビジター"}
                </dt>
                <dd className="fw-entry__price-label">(平　日)</dd>

                <dd className="fw-entry__price-value">
                  {guide.visitor_price_weekday ?? 0}円
                  <span className="fw-entry__price-note">（税込）</span>
                </dd>
              </div>

              <div className="fw-entry__price-item">
                <dt className="fw-entry__price-label">
                  {guide.visitor_label ?? "ビジター"}
                </dt>
                <dd className="fw-entry__price-label">(土日祝)</dd>

                <dd className="fw-entry__price-value">
                  {guide.visitor_price_holiday ?? 0}円
                  <span className="fw-entry__price-note">（税込）</span>
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
