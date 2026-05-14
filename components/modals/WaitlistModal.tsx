"use client";

import { useState } from "react";

type WaitlistModalProps = {
  tier: "plus" | "scholar";
  onClose: () => void;
};

const TIER_LABEL: Record<string, string> = {
  plus:    "Plus",
  scholar: "Scholar",
};

export default function WaitlistModal({ tier, onClose }: WaitlistModalProps) {
  const [email,  setEmail]  = useState("");
  const [state,  setState]  = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  const label = TIER_LABEL[tier] ?? tier;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setState("sending");
    setErrMsg("");
    try {
      const res  = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, tier }),
      });
      const data = await res.json();
      if (!res.ok && !data.alreadyJoined) {
        setState("error");
        setErrMsg(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setState("sent");
    } catch {
      setState("error");
      setErrMsg("Something went wrong. Please try again.");
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg)", borderRadius: 14,
          padding: "32px 28px", maxWidth: 400, width: "100%",
          boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
          position: "relative",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute", top: 14, right: 16,
            background: "none", border: "none", fontSize: 20,
            cursor: "pointer", color: "var(--text-muted)", lineHeight: 1, padding: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          ✕
        </button>

        {state === "sent" ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
            <div style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 26, fontWeight: 700, color: "var(--navy)", marginBottom: 12,
            }}>
              You&apos;re on the list!
            </div>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7 }}>
              We&apos;ll email you as soon as <strong>{label}</strong> launches.
              Thank you for your interest in Daily Davar.
            </p>
            <button
              onClick={onClose}
              style={{
                marginTop: 24, background: "var(--navy)", color: "var(--gold-pale)",
                border: "none", borderRadius: 8, padding: "12px 28px",
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 16, fontWeight: 600, cursor: "pointer",
              }}
            >
              Back to Daily Davar
            </button>
          </div>
        ) : (
          <>
            <div style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 26, fontWeight: 700, color: "var(--navy)", marginBottom: 6,
            }}>
              Join the Waitlist
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 20 }}>
              Be first to know when <strong>Daily Davar {label}</strong> launches.
              No spam — one email when it&apos;s ready.
            </p>

            {/* Tier chip */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: tier === "scholar" ? "var(--correct-pale)" : "var(--gold-muted)",
              color: tier === "scholar" ? "var(--correct)" : "var(--gold)",
              borderRadius: 999, padding: "4px 12px", marginBottom: 20,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 14, fontWeight: 700,
            }}>
              <span>★</span>
              {label} plan
            </div>

            {errMsg && (
              <div style={{
                background: "var(--wrong-pale)", border: "1px solid var(--wrong)",
                borderRadius: 8, padding: "8px 12px", marginBottom: 14,
                fontSize: 13, color: "var(--wrong)",
              }}>
                {errMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                type="email" required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={state === "sending"}
                onFocus={(e)  => (e.currentTarget.style.borderColor = "var(--navy)")}
                onBlur={(e)   => (e.currentTarget.style.borderColor = "var(--border)")}
                style={{
                  width: "100%", padding: "11px 13px",
                  border: "1.5px solid var(--border)", borderRadius: 8,
                  fontFamily: "Lora, Georgia, serif", fontSize: 14,
                  color: "var(--text)", background: "var(--card)",
                  outline: "none", transition: "border-color 0.15s",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="submit"
                disabled={!email.trim() || state === "sending"}
                style={{
                  background: "var(--navy)", color: "var(--gold-pale)",
                  border: "none", borderRadius: 8, padding: 13,
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 17, fontWeight: 600, letterSpacing: "1px",
                  cursor: (!email.trim() || state === "sending") ? "not-allowed" : "pointer",
                  opacity: (!email.trim() || state === "sending") ? 0.5 : 1,
                  transition: "all 0.15s",
                }}
              >
                {state === "sending" ? "Adding you…" : `Notify me about ${label} →`}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
