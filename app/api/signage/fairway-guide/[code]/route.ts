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
      return NextResponse.json(
        {
          message: "ゴルフ場が見つかりません。",
          golfCourseError,
        },
        { status: 404 }
      );
    }

    // フェアウェイ案内取得（single()を外して切り分け）
    const { data: guide, error: guideError } = await supabase
      .from("fairway_guides")
      .select(`
        status,
        free_message,
        member_price,
        visitor_price,
        updated_at
      `)
      .eq("golf_course_id", golfCourse.id);

    // 取得結果をそのまま返す
    return NextResponse.json({
      golfCourse,
      guide,
      guideError,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "サーバーエラー",
        error,
      },
      { status: 500 }
    );
  }
}