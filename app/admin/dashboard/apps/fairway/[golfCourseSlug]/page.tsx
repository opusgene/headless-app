"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type FairwayStatus = "ok" | "ng";

type FairwayGuideState = {
  status: FairwayStatus;
  okMessage: string;
  ngMessage: string;

  showPriceTable: boolean;

  memberLabel: string;
  visitorLabel: string;

  memberPriceWeekday: number;
  memberPriceHoliday: number;

  visitorPriceWeekday: number;
  visitorPriceHoliday: number;

  updatedAt?: string;
};

export default function FairwayGuideAdminPage() {
  const params = useParams<{ golfCourseSlug: string }>();
  const golfCourseSlug = params?.golfCourseSlug;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [state, setState] = useState<FairwayGuideState>({
    status: "ok",
    okMessage: "",
    ngMessage: "",

    showPriceTable: true,

    memberLabel: "メンバー",
    visitorLabel: "ビジター",

    memberPriceWeekday: 660,
    memberPriceHoliday: 660,

    visitorPriceWeekday: 880,
    visitorPriceHoliday: 880,
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

        const res = await fetch(apiUrl, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("failed to fetch");

        const data = await res.json();

        setState({
          status: data.status ?? "ok",
          okMessage: data.okMessage ?? "",
          ngMessage: data.ngMessage ?? "",

          showPriceTable: data.showPriceTable ?? true,

          memberLabel: data.memberLabel ?? "メンバー",
          visitorLabel: data.visitorLabel ?? "ビジター",

          memberPriceWeekday: data.memberPriceWeekday ?? 660,
          memberPriceHoliday: data.memberPriceHoliday ?? 660,

          visitorPriceWeekday: data.visitorPriceWeekday ?? 880,
          visitorPriceHoliday: data.visitorPriceHoliday ?? 880,

          updatedAt: data.updatedAt,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    if (golfCourseSlug) {
      fetchData();
    }
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

      const json = await res.json();

      console.log(json);

      if (!res.ok) {
        alert(JSON.stringify(json, null, 2));
        return;
      }

      setState((prev) => ({
        ...prev,
        updatedAt: json.updatedAt,
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
    return <div className="p-6 text-gray-500">読み込み中...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">フェアウェイ利用案内</h1>

        <p className="text-sm text-gray-500">slug: {golfCourseSlug}</p>

        {state.updatedAt && (
          <p className="text-xs text-gray-400">
            最終更新：
            {new Date(state.updatedAt).toLocaleString()}
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

      <div className="space-y-6 border rounded-lg p-6">
        <div>
          <label className="block font-medium mb-2">乗り入れ状態</label>

          <div className="flex gap-6">
            <label>
              <input
                type="radio"
                name="status"
                checked={state.status === "ok"}
                onChange={() =>
                  setState((s) => ({
                    ...s,
                    status: "ok",
                  }))
                }
              />
              <span className="ml-2">OK</span>
            </label>

            <label>
              <input
                type="radio"
                name="status"
                checked={state.status === "ng"}
                onChange={() =>
                  setState((s) => ({
                    ...s,
                    status: "ng",
                  }))
                }
              />
              <span className="ml-2">NG</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block font-medium mb-2">OK時メッセージ</label>

          <textarea
            className="w-full border rounded p-2 min-h-[120px]"
            value={state.okMessage}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                okMessage: e.target.value,
              }))
            }
          />
        </div>

        <div>
          <label className="block font-medium mb-2">NG時メッセージ</label>

          <textarea
            className="w-full border rounded p-2 min-h-[120px]"
            value={state.ngMessage}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                ngMessage: e.target.value,
              }))
            }
          />
        </div>

        {state.status === "ok" && (
          <>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={state.showPriceTable}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    showPriceTable: e.target.checked,
                  }))
                }
              />
              料金表を表示する
            </label>

            {state.showPriceTable && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-2">
                      メンバー名称
                    </label>

                    <input
                      className="w-full border rounded p-2"
                      value={state.memberLabel}
                      onChange={(e) =>
                        setState((s) => ({
                          ...s,
                          memberLabel: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-2">
                      ビジター名称
                    </label>

                    <input
                      className="w-full border rounded p-2"
                      value={state.visitorLabel}
                      onChange={(e) =>
                        setState((s) => ({
                          ...s,
                          visitorLabel: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th></th>
                      <th>平日</th>
                      <th>土日祝</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td>{state.memberLabel}</td>

                      <td>
                        <input
                          type="number"
                          className="w-full border rounded p-2"
                          value={state.memberPriceWeekday}
                          onChange={(e) =>
                            setState((s) => ({
                              ...s,
                              memberPriceWeekday: Number(e.target.value),
                            }))
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="number"
                          className="w-full border rounded p-2"
                          value={state.memberPriceHoliday}
                          onChange={(e) =>
                            setState((s) => ({
                              ...s,
                              memberPriceHoliday: Number(e.target.value),
                            }))
                          }
                        />
                      </td>
                    </tr>

                    <tr>
                      <td>{state.visitorLabel}</td>

                      <td>
                        <input
                          type="number"
                          className="w-full border rounded p-2"
                          value={state.visitorPriceWeekday}
                          onChange={(e) =>
                            setState((s) => ({
                              ...s,
                              visitorPriceWeekday: Number(e.target.value),
                            }))
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="number"
                          className="w-full border rounded p-2"
                          value={state.visitorPriceHoliday}
                          onChange={(e) =>
                            setState((s) => ({
                              ...s,
                              visitorPriceHoliday: Number(e.target.value),
                            }))
                          }
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2 bg-black text-white rounded disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存"}
        </button>
      </div>
    </div>
  );
}
