"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type Application = {
  id: number;
  name: string;
};

type GolfCourse = {
  id: string;
  name: string;
  applications?: Application[]; // 割り当てられたアプリケーション
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<GolfCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      // ゴルフ場を取得
      const { data: courseData, error: courseError } = await supabase
        .from("golf_courses")
        .select("*")
        .order("name");

      if (courseError || !courseData) {
        console.error(courseError);
        setLoading(false);
        return;
      }

      // golf_course_applications からアプリケーションを取得
      const { data: gcaData, error: gcaError } = await supabase
        .from("golf_course_applications")
        .select("golf_course_id, application_id, applications(name)")
        .order("golf_course_id");

      if (gcaError || !gcaData) {
        console.error(gcaError);
        setLoading(false);
        return;
      }

      // 各ゴルフ場にアプリケーションを紐付け
      const coursesWithApps: GolfCourse[] = courseData.map((course) => {
        const assignedApps = gcaData
          .filter((gca: any) => gca.golf_course_id === course.id)
          .map((gca: any) => ({
            id: gca.application_id,
            name: gca.applications.name,
          }));

        return {
          ...course,
          applications: assignedApps,
        };
      });

      setCourses(coursesWithApps);
      setLoading(false);
    };

    loadCourses();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">ゴルフ場一覧</h1>

      {loading && <div>読み込み中...</div>}

      {!loading && (
        <table className="w-full border border-gray-300 bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">ゴルフ場名</th>
              <th className="p-3 border">割り当てアプリケーション</th>
            </tr>
          </thead>

          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50 cursor-pointer">
                <td className="p-3 border">
                  <Link
                    href={`/admin/course/${course.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {course.name}
                  </Link>
                </td>
                <td className="p-3 border">
                  {course.applications && course.applications.length > 0
                    ? course.applications.map((app) => app.name).join(", ")
                    : "なし"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
