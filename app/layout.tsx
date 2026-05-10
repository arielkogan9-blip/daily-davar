import type { Metadata } from "next";
import "./globals.css";

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
        <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
