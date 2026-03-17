import { ReactNode, Suspense } from "react";
import { ImpersonateProvider } from "@/context/impersonateContext";
import LayoutContent from "./LayoutContent";

import "../globals.css";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ImpersonateProvider>
        <LayoutContent>{children}</LayoutContent>
      </ImpersonateProvider>
    </Suspense>
  );
}