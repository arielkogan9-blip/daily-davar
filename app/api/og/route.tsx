import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAF5EC",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Navy banner top */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 12, background: "#18285A" }} />

        {/* Torah scroll emoji */}
        <div style={{ fontSize: 80, marginBottom: 20 }}>📜</div>

        {/* Title */}
        <div style={{
          fontSize: 72, fontWeight: 700, color: "#18285A",
          letterSpacing: "6px", textTransform: "uppercase", lineHeight: 0.95,
          marginBottom: 10,
        }}>
          Daily Davar
        </div>

        {/* Hebrew */}
        <div style={{ fontSize: 42, color: "#B8891E", letterSpacing: "12px", marginBottom: 28 }}>
          דָּבָר
        </div>

        {/* Divider */}
        <div style={{ width: 60, height: 3, background: "#B8891E", marginBottom: 28 }} />

        {/* Tagline */}
        <div style={{
          fontSize: 26, color: "#6B5F48",
          fontStyle: "italic", textAlign: "center", maxWidth: 700,
          lineHeight: 1.4,
        }}>
          A daily Jewish knowledge game tied to the Hebrew calendar
        </div>

        {/* Navy banner bottom */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 12, background: "#18285A" }} />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
