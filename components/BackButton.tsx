"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      aria-label="Go back"
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--navy)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        fontFamily: "Lora, Georgia, serif",
        fontSize: 13,
        color: "var(--text-muted)",
        marginBottom: 20,
        transition: "color 0.12s",
      }}
    >
      ← Back
    </button>
  );
}
