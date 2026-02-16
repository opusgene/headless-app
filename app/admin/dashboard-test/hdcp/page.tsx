// app/dashboard/hdcp/page.tsx
import Link from "next/link";

export default function HdcpDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">HDCP表 管理画面</h1>

      <p className="mb-6">ここではHDCP表の登録・管理ができます。</p>

      {/* ▼ HDCP 表示ページへのリンク */}
      <Link
        href="/dashboard/hdcp/view"
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        HDCP表を表示する
      </Link>
    </div>
  );
}
