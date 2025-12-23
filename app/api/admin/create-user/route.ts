import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * ゴルフ場管理者 新規登録 API
 *
 * 処理の流れ
 * 1. golf_courses を作成（DBが id を生成）
 * 2. Auth ユーザー作成
 * 3. profiles に golf_course_id で紐付け
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      email,
      password,
      name,
      role,
      golfCourseName,
    } = body;

    /* ============================
     * ① ゴルフ場 作成
     * ============================ */

    if (!golfCourseName) {
      throw new Error("golfCourseName is required");
    }

    // code は NOT NULL のため必ず生成する
    // 例: "ゴルフ場B" → "GOLF場B" → "GOLF場B"
    const code = golfCourseName
      .replace(/\s+/g, "")
      .toUpperCase()
      .slice(0, 20);

    const { data: golfCourse, error: golfError } =
      await supabaseAdmin
        .from("golf_courses")
        .insert({
          name: golfCourseName,
          code,
        })
        .select("id, name, code")
        .single();

    if (golfError) {
      throw golfError;
    }

    /* ============================
     * ② Auth ユーザー作成
     * ============================ */

    const { data: userData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      throw authError;
    }

    const userId = userData.user.id;

    /* ============================
     * ③ profiles 作成
     * ============================ */

    const { error: profileError } =
      await supabaseAdmin
        .from("profiles")
        .insert({
          id: userId,
          name,
          role,
          golf_course_id: golfCourse.id, // ← DBが生成した id を使う
        });

    if (profileError) {
      throw profileError;
    }

    /* ============================
     * 完了
     * ============================ */

    return NextResponse.json({
      success: true,
      golfCourse: {
        id: golfCourse.id,
        name: golfCourse.name,
        code: golfCourse.code,
      },
      userId,
    });

  } catch (error: any) {
    console.error("create-user error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}
