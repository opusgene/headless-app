"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type GolfCourse = {
  id: string;
  name: string;
  golf_course_id: string | null;
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<GolfCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      const { data, error } = await supabase
        .from("golf_courses")
        .select("*")
        .order("name");

      if (!error && data) {
        setCourses(data);
      }

      setLoading(false);
    };

    loadCourses();
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">ゴルフ場一覧</h1>

      {loading && <div>読み込み中...</div>}

      {!loading && (
        <table className="w-full border border-gray-300 bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">ID</th>
              <th className="p-3 border">ゴルフ場名</th>
            </tr>
          </thead>

          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50 cursor-pointer">
                <td className="p-3 border">{course.id}</td>
                <td className="p-3 border">
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {course.name}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
