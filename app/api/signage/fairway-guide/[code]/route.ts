// app/api/signage/fairway-guide/[code]/route.ts

import { NextResponse } from "next/server";
import { supabasePublic } from "@/lib/supabase/public";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // ゴルフ場取得
    const { data: golfCourse, error: golfCourseError } =
      await supabasePublic
        .from("golf_courses")
        .select("id, name")
        .eq("code", code)
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
          free_message,
          member_price,
          visitor_price,
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
      courseName: golfCourse.name,
      status: guide.status,
      freeMessage: guide.free_message,
      memberPrice: guide.member_price,
      visitorPrice: guide.visitor_price,
      updatedAt: guide.updated_at,
    });
  } catch (error) {
    console.error("Fairway Guide API Error:", error);

    return NextResponse.json(
      { message: "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}