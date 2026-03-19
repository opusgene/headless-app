// app/layout.tsx

import { Providers } from "./providers";
import { ImpersonateProvider } from "@/context/impersonateContext";
import type { ReactNode } from "react";

export const metadata = {
  title: "Golf Admin",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <Providers>
          <ImpersonateProvider>
            {children}
          </ImpersonateProvider>
        </Providers>
      </body>
    </html>
  );
}