"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "80vh", padding: "0 20px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>⚠️</div>
      <div style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 28, fontWeight: 700, color: "var(--navy)", marginBottom: 10,
      }}>
        Something went wrong
      </div>
      <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 360, marginBottom: 28 }}>
        An unexpected error occurred. Please try again — if the problem persists, send us feedback.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={reset}
          style={{
            background: "var(--navy)", color: "var(--gold-pale)", border: "none",
            borderRadius: 8, padding: "12px 28px",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 16, fontWeight: 600, cursor: "pointer",
          }}
        >
          Try Again
        </button>
        <a href="/" style={{
          background: "none", border: "1.5px solid var(--border)",
          borderRadius: 8, padding: "12px 24px",
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 16, color: "var(--text-muted)", textDecoration: "none",
        }}>
          Go Home
        </a>
      </div>
    </div>
  );
}
