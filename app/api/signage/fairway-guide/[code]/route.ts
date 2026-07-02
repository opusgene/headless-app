// app/api/signage/fairway-guide/[code]/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const supabase = await createClient();

    // ゴルフ場取得
    const { data: golfCourse, error: golfCourseError } = await supabase
      .from("golf_courses")
      .select("id, name")
      .eq("code", code)
      .single();

    if (golfCourseError || !golfCourse) {
      console.error("Golf course not found:", golfCourseError);

      return NextResponse.json(
        { message: "ゴルフ場が見つかりません。" },
        { status: 404 }
      );
    }

    // フェアウェイ案内取得
    const { data: guide, error: guideError } = await supabase
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
      console.error("Fairway guide not found:", guideError);

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
    console.error("Unexpected error:", error);

    return NextResponse.json(
      { message: "サーバーエラー" },
      { status: 500 }
    );
  }
}