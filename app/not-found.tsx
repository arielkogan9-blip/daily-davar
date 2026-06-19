import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "80vh", padding: "0 20px",
      textAlign: "center", fontFamily: "Lora, Georgia, serif",
    }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>📜</div>
      <div style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 80, fontWeight: 700, color: "var(--navy)",
        lineHeight: 1, marginBottom: 8,
      }}>
        404
      </div>
      <div style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 26, fontWeight: 600, color: "var(--navy)", marginBottom: 12,
      }}>
        Page not found
      </div>
      <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 360, marginBottom: 32 }}>
        This page has wandered into the wilderness. Let&apos;s bring you back to today&apos;s question.
      </p>
      <Link href="/" style={{
        background: "var(--navy)", color: "var(--gold-pale)",
        borderRadius: 8, padding: "13px 32px",
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 17, fontWeight: 600, letterSpacing: "1px",
        textDecoration: "none",
      }}>
        Back to Daily Davar →
      </Link>
    </div>
  );
}
