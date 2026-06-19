"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setErrorMsg("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setErrorMsg("Passwords do not match."); return; }

    setStatus("loading");
    setErrorMsg("");

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setStatus("error");
      setErrorMsg(data.error ?? "Something went wrong.");
    } else {
      setStatus("success");
      setTimeout(() => router.push("/"), 2500);
    }
  }

  const INPUT: React.CSSProperties = {
    width: "100%", padding: "11px 13px",
    border: "1.5px solid var(--border)", borderRadius: 8,
    fontFamily: "Lora, Georgia, serif", fontSize: 14,
    color: "var(--text)", background: "var(--card)",
    outline: "none", boxSizing: "border-box",
  };

  if (!token) {
    return (
      <p style={{ color: "var(--wrong)", textAlign: "center" }}>
        Invalid reset link. Please request a new one.
      </p>
    );
  }

  if (status === "success") {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
        <p style={{ color: "var(--correct)", fontSize: 15 }}>Password updated! Redirecting…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {errorMsg && (
        <div style={{ background: "var(--wrong-pale)", border: "1px solid var(--wrong)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--wrong)" }}>
          {errorMsg}
        </div>
      )}
      <input
        type="password" placeholder="New password (min 8 characters)"
        value={password} onChange={(e) => setPassword(e.target.value)}
        style={INPUT} required
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--navy)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
      />
      <input
        type="password" placeholder="Confirm new password"
        value={confirm} onChange={(e) => setConfirm(e.target.value)}
        style={INPUT} required
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--navy)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        style={{
          background: "var(--navy)", color: "var(--gold-pale)",
          border: "none", borderRadius: 8, padding: 13,
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 17, fontWeight: 600, cursor: status === "loading" ? "not-allowed" : "pointer",
          opacity: status === "loading" ? 0.65 : 1, marginTop: 4,
        }}
      >
        {status === "loading" ? "Saving…" : "Set New Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ maxWidth: 420, margin: "80px auto", padding: "0 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📜</div>
        <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>
          Reset Password
        </div>
      </div>
      <div style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: 14, padding: "28px 24px" }}>
        <Suspense fallback={<p style={{ textAlign: "center", color: "var(--text-muted)" }}>Loading…</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
