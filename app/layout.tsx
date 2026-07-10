// app/layout.tsx

import { Providers } from "./providers";
import { ImpersonateProvider } from "@/context/impersonateContext";
import type { ReactNode } from "react";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

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
      <body className={notoSansJP.className}>
        <Providers>
          <ImpersonateProvider>
            {children}
          </ImpersonateProvider>
        </Providers>
      </body>
    </html>
  );
}