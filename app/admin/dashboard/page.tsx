"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      const { data: coursesData } = await supabase
        .from("golf_courses")
        .select("*");

      setCourses(coursesData ?? []);
    })();
  }, []);

  if (!profile) return null;

  const renderCourseData = (courseId: string) => {
    const target = courses.find((c) => c.golf_course_id === courseId);
    if (!target) return <p className="text-gray-500">該当データなし</p>;

    return (
      <div className="p-4 border rounded mt-4">
        <p>名前: {target.name}</p>
        <p>golf_course_id: {target.golf_course_id}</p>
      </div>
    );
  };

  return (
    <>
      <h1 className="text-2xl font-bold">ダッシュボード</h1>

      {profile.role === "super_admin" ? (
        <div className="mt-6">
          <h2 className="text-xl mb-4">ゴルフ場を選択</h2>

          <select
            className="border p-2 rounded"
            value={selectedCourseId ?? ""}
            onChange={(e) => setSelectedCourseId(e.target.value)}
          >
            <option value="">選択してください</option>
            {courses.map((course) => (
              <option key={course.id} value={course.golf_course_id}>
                {course.name}
              </option>
            ))}
          </select>

          {selectedCourseId && renderCourseData(selectedCourseId)}
        </div>
      ) : (
        <div className="mt-6">
          <h2 className="text-xl">あなたのゴルフ場のデータ</h2>
          {renderCourseData(profile.golf_course_id)}
        </div>
      )}
    </>
  );
}
