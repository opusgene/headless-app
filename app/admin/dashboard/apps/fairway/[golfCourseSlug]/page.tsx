"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type FairwayStatus = "ok" | "ng";

type FairwayGuideState = {
  status: FairwayStatus;
  freeMessage: string;
  memberPrice: number;
  visitorPrice: number;
  updatedAt?: string;
};

export default function FairwayGuideAdminPage() {
  const params = useParams<{ golfCourseSlug: string }>();
  const golfCourseSlug = params?.golfCourseSlug;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [state, setState] = useState<FairwayGuideState>({
    status: "ok",
    freeMessage: "",
    memberPrice: 660,
    visitorPrice: 880,
  });

  const apiUrl = useMemo(() => {
    return `/api/admin/fairway-guide/${golfCourseSlug}`;
  }, [golfCourseSlug]);

  const signageUrl = useMemo(() => {
    return `/signage/fairway-guide/${golfCourseSlug}`;
  }, [golfCourseSlug]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const res = await fetch(apiUrl, { cache: "no-store" });
        if (!res.ok) throw new Error("failed to fetch");

        const data = await res.json();

        setState({
          status: data.status ?? "ok",
          freeMessage: data.freeMessage ?? "",
          memberPrice: data.memberPrice ?? 660,
          visitorPrice: data.visitorPrice ?? 880,
          updatedAt: data.updatedAt,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    if (golfCourseSlug) fetchData();
  }, [apiUrl, golfCourseSlug]);

  const onSave = async () => {
    try {
      setSaving(true);

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(state),
      });

      if (!res.ok) throw new Error("save failed");

      const data = await res.json();

      setState((prev) => ({
        ...prev,
        updatedAt: data.updatedAt,
      }));

      alert("保存しました");
    } catch (e) {
      console.error(e);
      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const openSignage = () => {
    window.open(signageUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-500">
        読み込み中...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          フェアウェイ利用案内
        </h1>
        <p className="text-sm text-gray-500">
          slug: {golfCourseSlug}
        </p>
        {state.updatedAt && (
          <p className="text-xs text-gray-400">
            最終更新: {new Date(state.updatedAt).toLocaleString()}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={openSignage}
          className="px-4 py-2 border rounded bg-white hover:bg-gray-50"
        >
          配信画面を見る
        </button>
      </div>

      <div className="space-y-4 border rounded-lg p-4">
        <div>
          <label className="block font-medium mb-2">
            乗り入れ状態
          </label>
          <div className="flex gap-4">
            <label>
              <input
                type="radio"
                checked={state.status === "ok"}
                onChange={() =>
                  setState((s) => ({ ...s, status: "ok" }))
                }
              />
              <span className="ml-2">OK</span>
            </label>

            <label>
              <input
                type="radio"
                checked={state.status === "ng"}
                onChange={() =>
                  setState((s) => ({ ...s, status: "ng" }))
                }
              />
              <span className="ml-2">NG</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block font-medium mb-2">
            自由テキスト
          </label>
          <textarea
            className="w-full border rounded p-2 min-h-[120px]"
            value={state.freeMessage}
            onChange={(e) =>
              setState((s) => ({ ...s, freeMessage: e.target.value }))
            }
          />
        </div>

        {state.status === "ok" && (
          <div className="space-y-3">
            <div>
              <label className="block font-medium mb-2">
                メンバー料金（円・税込）
              </label>
              <input
                type="number"
                className="w-full border rounded p-2"
                value={state.memberPrice}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    memberPrice: Number(e.target.value),
                  }))
                }
              />
            </div>

            <div>
              <label className="block font-medium mb-2">
                ビジター料金（円・税込）
              </label>
              <input
                type="number"
                className="w-full border rounded p-2"
                value={state.visitorPrice}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    visitorPrice: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存"}
        </button>
      </div>
    </div>
  );
}
