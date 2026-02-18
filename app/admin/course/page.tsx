"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Application = {
  id: string;
  applicant_name: string;
  created_at: string;
  golf_course_id: string;
};

type GolfCourse = {
  id: string;
  name: string;
  applications?: Application[]; // 追加
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<GolfCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      // golf_courses を取得
      const { data: courseData, error: courseError } = await supabase
        .from("golf_courses")
        .select("*")
        .order("name");

      if (courseError || !courseData) {
        console.error(courseError);
        setLoading(false);
        return;
      }

      // golf_course_applications を取得
      const { data: appData, error: appError } = await supabase
        .from("golf_course_applications")
        .select("*");

      if (appError || !appData) {
        console.error(appError);
        setLoading(false);
        return;
      }

      // 各ゴルフ場にアプリケーションを紐付け
      const coursesWithApplications: GolfCourse[] = courseData.map((course) => ({
        ...course,
        applications: appData.filter((app: Application) => app.golf_course_id === course.id),
      }));

      setCourses(coursesWithApplications);
      setLoading(false);
    };

    loadCourses();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">ゴルフ場一覧とアプリケーション</h1>

      {loading && <div>読み込み中...</div>}

      {!loading && (
        <div className="space-y-6">
          {courses.map((course) => (
            <div key={course.id} className="border rounded p-4 shadow-sm">
              <h2 className="text-lg font-semibold">{course.name}</h2>

              {course.applications && course.applications.length > 0 ? (
                <ul className="list-disc pl-5 mt-2">
                  {course.applications.map((app) => (
                    <li key={app.id}>
                      {app.applicant_name}（申込日:{" "}
                      {new Date(app.created_at).toLocaleDateString()}）
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mt-2">まだアプリケーションはありません。</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
