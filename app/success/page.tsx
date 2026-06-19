import Link from "next/link";

export default function SuccessPage() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "80vh", padding: "0 20px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: 56, marginBottom: 20 }}>🎉</div>
      <div style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 36, fontWeight: 700, color: "var(--navy)", marginBottom: 12,
      }}>
        Welcome to Daily Davar!
      </div>
      <p style={{
        fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7,
        maxWidth: 400, marginBottom: 12,
      }}>
        Your subscription is active. Your new tier will appear the next time you sign in.
      </p>
      <p style={{
        fontSize: 13, color: "var(--gold)", fontStyle: "italic", marginBottom: 32,
      }}>
        דָּבָר — A word, a study, a day.
      </p>
      <Link
        href="/"
        style={{
          background: "var(--navy)", color: "var(--gold-pale)",
          padding: "14px 36px", borderRadius: 8,
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 18, fontWeight: 600, textDecoration: "none",
          letterSpacing: "0.5px",
        }}
      >
        Start Playing →
      </Link>
    </div>
  );
}
