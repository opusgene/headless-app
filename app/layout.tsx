// app/layout.tsx

import { Providers } from "./providers";

export const metadata = {
  title: "Golf Admin",
};
import type { ReactNode } from "react";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
