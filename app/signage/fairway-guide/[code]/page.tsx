"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type FairwayStatus = "ok" | "ng";

type FairwayGuide = {
  courseName: string;
  status: FairwayStatus;
  freeMessage: string;
  memberPrice?: number;
  visitorPrice?: number;
  updatedAt?: string;
};

export default function FairwayGuideSignagePage() {
  const params = useParams<{ code: string }>();
  const code = params?.code;

  const [data, setData] = useState<FairwayGuide | null>(null);
  const [loading, setLoading] = useState(true);

  const apiUrl = useMemo(() => {
    return `/api/signage/fairway-guide/${code}`;
  }, [code]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const res = await fetch(apiUrl, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("データの取得に失敗しました。");
        }

        const json = await res.json();

        setData({
          courseName: json.courseName ?? "ゴルフ場",
          status: json.status,
          freeMessage: json.freeMessage,
          memberPrice: json.memberPrice,
          visitorPrice: json.visitorPrice,
          updatedAt: json.updatedAt,
        });
      } catch (error) {
        console.error("フェアウェイ利用案内取得エラー:", error);
      } finally {
        setLoading(false);
      }
    }

    if (code) {
      fetchData();
    }
  }, [apiUrl, code]);

  if (loading || !data) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-white">
        読み込み中...
      </div>
    );
  }

  const isOk = data.status === "ok";

  return (
    <div
      className={`w-full h-screen flex flex-col items-center justify-center text-white px-10 text-center transition-colors duration-300 ${
        isOk ? "bg-green-700" : "bg-red-700"
      }`}
    >
      <div className="text-3xl font-bold mb-6">
        本日のFW乗り入れ
      </div>

      <div className="text-7xl font-extrabold mb-8">
        {isOk ? "OK" : "NG"}
      </div>

      <div className="text-xl whitespace-pre-wrap mb-10">
        {data.freeMessage}
      </div>

      {isOk && (
        <div className="text-lg space-y-2">
          <div className="font-semibold">
            ご利用料金（お一人様）
          </div>
          <div>メンバー　{data.memberPrice}円（税込）</div>
          <div>ビジター　{data.visitorPrice}円（税込）</div>
        </div>
      )}

      {data.updatedAt && (
        <div className="absolute bottom-4 text-xs opacity-70">
          更新: {new Date(data.updatedAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}