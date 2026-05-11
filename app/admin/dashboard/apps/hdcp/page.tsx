"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function HdcpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URLから取得
  const courseId = searchParams.get("courseId");
  console.log("HdcpPage courseId:", courseId);

  // 表示モード
  const [displayMode, setDisplayMode] = useState("both");

  // 追加表示機能
  const [extraFeatures, setExtraFeatures] = useState({
    news: false,
    schedule: false,
    result: false,
    pastResult: false,
  });

  // URL生成
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

  // チェックボックス切り替え
  const handleFeatureChange = (key: keyof typeof extraFeatures) => {
    setExtraFeatures((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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
          HDCPデータをアップロード（CSV）
        </button>

        <button
          className="border px-4 py-2 rounded"
          onClick={() =>
            handleNavigate("/admin/dashboard/apps/hdcp/view")
          }
        >
          サイネージ配信画面を表示
        </button>
      </div>

      {/* 設定エリア */}
      <div className="space-y-6 mt-8 border p-4 rounded">

        {/* 表示モード */}
        <div>
          <h2 className="font-bold mb-2">表示モード選択</h2>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="displayMode"
                value="both"
                checked={displayMode === "both"}
                onChange={(e) => setDisplayMode(e.target.value)}
              />
              HDCP順 / 五十音順 切り替え
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="displayMode"
                value="hcp_only"
                checked={displayMode === "hcp_only"}
                onChange={(e) => setDisplayMode(e.target.value)}
              />
              HDCP順単体
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="displayMode"
                value="name_only"
                checked={displayMode === "name_only"}
                onChange={(e) => setDisplayMode(e.target.value)}
              />
              五十音順単体
            </label>
          </div>
        </div>

        {/* 追加表示機能 */}
        <div>
          <h2 className="font-bold mb-2">追加表示機能選択</h2>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={extraFeatures.news}
                onChange={() => handleFeatureChange("news")}
              />
              お知らせ
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={extraFeatures.schedule}
                onChange={() => handleFeatureChange("schedule")}
              />
              競技日程
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={extraFeatures.result}
                onChange={() => handleFeatureChange("result")}
              />
              競技結果
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={extraFeatures.pastResult}
                onChange={() => handleFeatureChange("pastResult")}
              />
              過去の競技結果
            </label>
          </div>
        </div>

        {/* デバッグ表示 */}
        <div className="text-sm text-gray-500">
          <p>displayMode: {displayMode}</p>

          <pre>
            {JSON.stringify(extraFeatures, null, 2)}
          </pre>
        </div>
      </div>

      {/* courseIdなし */}
      {!courseId && (
        <p className="text-red-500 mt-4">
          コースが選択されていません（URLにcourseIdがありません）
        </p>
      )}
    </div>
  );
}