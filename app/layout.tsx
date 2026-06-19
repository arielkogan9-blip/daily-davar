import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers/SessionProvider";
import ThemeInit from "@/components/ThemeInit";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Daily Davar | דָּבָר",
  description: "A daily Jewish knowledge game tied to the Hebrew calendar. Answer one question each day across three difficulty levels — Aleph, Bet, and Gimel.",
  keywords: ["Jewish", "Torah", "parasha", "Hebrew calendar", "daily quiz", "Jewish learning"],
  metadataBase: new URL("https://daily-davar.vercel.app"),
  openGraph: {
    title: "Daily Davar | דָּבָר",
    description: "A daily Jewish knowledge game tied to the Hebrew calendar. One question, three levels, new every day.",
    url: "https://daily-davar.vercel.app",
    siteName: "Daily Davar",
    type: "website",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Daily Davar — A daily Jewish knowledge game" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Davar | דָּבָר",
    description: "A daily Jewish knowledge game tied to the Hebrew calendar.",
    images: ["/api/og"],
  },
  robots: { index: true, follow: true },
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
