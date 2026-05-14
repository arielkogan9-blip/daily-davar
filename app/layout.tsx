import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers/SessionProvider";

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
      {/* Inline script runs before paint — applies saved theme without a flash */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('dd_theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark');}catch(e){}`,
          }}
        />
      </head>
      <body>
        <Providers>
          <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
