import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers/SessionProvider";
import ThemeInit from "@/components/ThemeInit";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Daily Davar | דָּבָר",
  description: "A daily Jewish knowledge game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeInit />
        <Providers>
          <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
            {children}
          </div>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
