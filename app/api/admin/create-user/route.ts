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
      golfCourseCode,
    } = body;

    /* ============================
     * ① ゴルフ場 作成
     * ============================ */

    if (!golfCourseName) {
      throw new Error("golfCourseName is required");
    }

    if (!golfCourseCode) {
      throw new Error("URL（code）は必須です");
    }
    
    // 英数字・ハイフンのみ許可
    if (!/^[a-zA-Z0-9-]+$/.test(golfCourseCode)) {
      throw new Error("URLは英数字とハイフンのみ使用できます");
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
          code: golfCourseCode,
        })
        .select("id, name, code")
        .single();
    
    // 👇 ここに入れる
    if (golfError) {
      // 23505 = unique_violation
      if ((golfError as any).code === "23505") {
        throw new Error("このURLは既に使用されています");
      }
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
