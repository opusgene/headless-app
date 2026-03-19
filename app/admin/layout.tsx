// app/admin/layout.tsx

import { ReactNode, Suspense } from "react";
import LayoutContent from "./LayoutContent";
import "../globals.css";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  );
}