import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      email,
      password,
      name,
      role,       // "admin" | "staff"
      golfCourseName,
    } = body;

    /* ① ゴルフ場 新規作成 */
    const { data: golfCourse, error: golfError } =
      await supabaseAdmin
        .from("golf_courses")
        .insert({ name: golfCourseName })
        .select()
        .single();

    if (golfError) throw golfError;

    /* ② Auth ユーザー作成 */
    const { data: userData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) throw authError;

    const userId = userData.user.id;

    /* ③ profiles 作成（ゴルフ場と紐付け） */
    const { error: profileError } =
      await supabaseAdmin.from("profiles").insert({
        id: userId,
        name,
        role,
        golf_course_id: golfCourse.id,
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
