"use client";

import { useState } from "react";

export default function NewUserPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    role: "course_admin",
    golfCourseName: "",
    golfCourseCode: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (data.success) {
      alert("登録完了！");
    } else {
      alert("エラー：" + data.error);
    }
  };

  return (
    <div className="p-6 max-w-md">
      <h1 className="text-xl font-bold mb-4">ゴルフ管理者 新規登録</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="メールアドレス"
          className="border p-2 w-full"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          placeholder="初期パスワード"
          className="border p-2 w-full"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <input
          placeholder="名前"
          className="border p-2 w-full"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <select
          className="border p-2 w-full"
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="admin">管理者</option>
          <option value="staff">スタッフ</option>
        </select>

        <input
          placeholder="新規ゴルフ場名"
          className="border p-2 w-full"
          onChange={(e) =>
            setForm({
              ...form,
              golfCourseName: e.target.value,
            })
          }
        />
        
        <input
          placeholder="公開URL（英数字・例: golfb）"
          className="border p-2 w-full"
          value={form.golfCourseCode}
          onChange={(e) =>
            setForm({
              ...form,
              golfCourseCode: e.target.value,
            })
          }
        />

        <button type="submit" className="bg-black text-white px-4 py-2">
          登録
        </button>
      </form>
    </div>
  );
}
