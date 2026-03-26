"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function HdcpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 👇 URLから受け取る
  const courseId = searchParams.get("courseId");

  const buildUrl = (path: string) => {
    if (!courseId) return path;
    return `${path}?courseId=${courseId}`;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">HDCP表管理</h1>

      <div className="space-y-4">
        <button
          className="border px-4 py-2 rounded"
          onClick={() =>
            router.push(buildUrl("/admin/dashboard/apps/hdcp/upload"))
          }
        >
          CSVをアップロード
        </button>

        <button
          className="border px-4 py-2 rounded"
          onClick={() =>
            router.push(buildUrl("/admin/dashboard/apps/hdcp/view"))
          }
        >
          CSVデータ一覧を見る
        </button>
      </div>
    </div>
  );
}