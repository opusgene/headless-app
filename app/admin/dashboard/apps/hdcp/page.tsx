"use client";

import { useRouter } from "next/navigation";

export default function HdcpPage() {
  const router = useRouter();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">HDCP表管理</h1>

      <div className="space-y-4">
        <button
          className="border px-4 py-2 rounded"
          onClick={() => router.push("/admin/dashboard/apps/hdcp/upload")}
        >
          CSVをアップロード
        </button>

        <button
          className="border px-4 py-2 rounded"
          onClick={() => router.push("/admin/dashboard/apps/hdcp/view")}
        >
          CSVデータ一覧を見る
        </button>
      </div>
    </div>
  );
}