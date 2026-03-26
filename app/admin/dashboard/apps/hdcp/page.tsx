"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function HdcpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URLから取得
  const courseId = searchParams.get("courseId");
  console.log("HdcpPage courseId:", courseId);

  // URL生成（必須チェック込み）
  const buildUrl = (path: string) => {
    if (!courseId) {
      alert("コースが選択されていません");
      return null;
    }
    return `${path}?courseId=${courseId}`;
  };

  const handleNavigate = (path: string) => {
    const url = buildUrl(path);
    if (url) {
      router.push(url);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">HDCP表管理</h1>

      <div className="space-y-4">
        <button
          className="border px-4 py-2 rounded"
          onClick={() =>
            handleNavigate("/admin/dashboard/apps/hdcp/upload")
          }
        >
          CSVをアップロード
        </button>

        <button
          className="border px-4 py-2 rounded"
          onClick={() =>
            handleNavigate("/admin/dashboard/apps/hdcp/view")
          }
        >
          CSVデータ一覧を見る
        </button>
      </div>

      {/* デバッグ用（必要なら表示） */}
      {!courseId && (
        <p className="text-red-500 mt-4">
          コースが選択されていません（URLにcourseIdがありません）
        </p>
      )}
    </div>
  );
}