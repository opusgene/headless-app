// app/api/admin/fairway-guide/[golfCourseSlug]/route.ts

import { NextResponse } from "next/server";
import { supabasePublic } from "@/lib/supabase/public";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ golfCourseSlug: string }> }
) {
  try {
    const { golfCourseSlug } = await params;

    // ゴルフ場取得
    const { data: golfCourse, error: golfCourseError } =
      await supabasePublic
        .from("golf_courses")
        .select("id")
        .eq("code", golfCourseSlug)
        .single();

    if (golfCourseError || !golfCourse) {
      return NextResponse.json(
        { message: "ゴルフ場が見つかりません。" },
        { status: 404 }
      );
    }

    // フェアウェイ利用案内取得
    const { data: guide, error: guideError } =
      await supabasePublic
        .from("fairway_guides")
        .select(`
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
        `)
        .eq("golf_course_id", golfCourse.id)
        .single();

    if (guideError || !guide) {
      return NextResponse.json(
        { message: "フェアウェイ利用案内が登録されていません。" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: guide.status,
      okMessage: guide.ok_message,
      ngMessage: guide.ng_message,
      showPriceTable: guide.show_price_table,
      memberLabel: guide.member_label,
      visitorLabel: guide.visitor_label,
      memberPriceWeekday: guide.member_price_weekday,
      memberPriceHoliday: guide.member_price_holiday,
      visitorPriceWeekday: guide.visitor_price_weekday,
      visitorPriceHoliday: guide.visitor_price_holiday,
      updatedAt: guide.updated_at,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "サーバーエラー" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ golfCourseSlug: string }> }
) {
  try {
    const { golfCourseSlug } = await params;

    const body = await request.json();

    // ゴルフ場取得
    const { data: golfCourse, error: golfCourseError } =
      await supabasePublic
        .from("golf_courses")
        .select("id")
        .eq("code", golfCourseSlug)
        .single();

    if (golfCourseError || !golfCourse) {
      return NextResponse.json(
        { message: "ゴルフ場が見つかりません。" },
        { status: 404 }
      );
    }

    const { data, error } = await supabaseAdmin
    .from("fairway_guides")
      .upsert(
        {
          golf_course_id: golfCourse.id,

          status: body.status,
          ok_message: body.okMessage,
          ng_message: body.ngMessage,
          
          show_price_table: body.showPriceTable,

          member_label: body.memberLabel,
          visitor_label: body.visitorLabel,

          member_price_weekday: body.memberPriceWeekday,
          member_price_holiday: body.memberPriceHoliday,

          visitor_price_weekday: body.visitorPriceWeekday,
          visitor_price_holiday: body.visitorPriceHoliday,

          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "golf_course_id",
        }
      )
      .select()
      .single();

    if (error) {
      console.error(error);

      return NextResponse.json(
        {
          message: "保存に失敗しました。",
          error,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      message: "保存しました。",
      updatedAt: data.updated_at,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "サーバーエラー",
      },
      {
        status: 500,
      }
    );
  }
}