import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import crypto from "crypto"; // ✅ 追加

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

    /* ✅ ① ゴルフ場 新規作成（golf_course_id を自動生成） */
    const golfCourseId = crypto.randomUUID();

    const { data: golfCourse, error: golfError } =
      await supabaseAdmin
        .from("golf_courses")
        .insert({
          name: golfCourseName,
          golf_course_id: golfCourseId, // ✅ これが今回の修正ポイント
        })
        .select()
        .single();

    if (golfError) throw golfError;

    /* ✅ ② Auth ユーザー作成 */
    const { data: userData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) throw authError;

    const userId = userData.user.id;

    /* ✅ ③ profiles 作成（golf_course_id で紐付ける） */
    const { error: profileError } =
      await supabaseAdmin.from("profiles").insert({
        id: userId,
        name,
        role,
        golf_course_id: golfCourseId, // ✅ id ではなく golf_course_id
      });

    if (profileError) throw profileError;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
