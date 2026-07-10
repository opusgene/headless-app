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
    <>
      <header className="fw-entry__header" />

      <main className="fw-entry">
        <div className="fw-entry__inner inner">
          <div className="fw-entry__heading">本日のFW乗り入れ</div>

          <div
            className={`fw-entry__status ${
              !isOk ? "fw-entry__status--ng" : ""
            }`}
          >
            <div
              className={`fw-entry__status-text ${
                !isOk ? "fw-entry__status-text--ng" : ""
              }`}
            >
              {isOk ? (
                <img src="/images/common/fw-entry-ok.jpg" alt="OK" />
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
      </main>

      <footer className="fw-entry__footer" />
    </>
  );
}
