// app/dashboard/hdcp/view/page.tsx
import Link from "next/link";

export default function HdcpView() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">HDCP 表（表示専用）</h1>

      <p className="mb-6">ここに HDCP の一覧が表示されます。</p>

      <Link
        href="/dashboard/hdcp"
        className="text-blue-600 underline"
      >
        ← 管理画面に戻る
      </Link>
    </div>
  );
}
