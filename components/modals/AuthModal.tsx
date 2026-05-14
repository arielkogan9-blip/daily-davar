"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

type AuthModalProps = {
  onClose: () => void;
  /** Called after a successful sign-in or registration so the parent can react. */
  onSuccess?: () => void;
  /** Pre-select "register" mode when opened from a sign-up CTA. */
  initialMode?: "login" | "register";
};

type Mode = "login" | "register";
type SubmitState = "idle" | "loading" | "error";

// ─── Shared input style ───────────────────────────────────────────────────────

const INPUT: React.CSSProperties = {
  width: "100%",
  padding: "11px 13px",
  border: "1.5px solid var(--border)",
  borderRadius: 8,
  fontFamily: "Lora, Georgia, serif",
  fontSize: 14,
  color: "var(--text)",
  background: "var(--card)",
  outline: "none",
  transition: "border-color 0.15s",
  boxSizing: "border-box",
};

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={INPUT}
      onFocus={(e) => { e.currentTarget.style.borderColor = "var(--navy)"; props.onFocus?.(e); }}
      onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; props.onBlur?.(e); }}
    />
  );
}

// ─── Overlay shell ────────────────────────────────────────────────────────────

function ModalShell({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute", inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 50, padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg)",
          borderRadius: 14,
          padding: "28px 26px",
          maxWidth: 420,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          style={{
            position: "absolute", top: 14, right: 16,
            background: "none", border: "none", fontSize: 20,
            cursor: "pointer", color: "var(--text-muted)", lineHeight: 1, padding: 0,
          }}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AuthModal({ onClose, onSuccess, initialMode = "login" }: AuthModalProps) {
  const [mode,  setMode]  = useState<Mode>(initialMode);
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState<string>("");

  // Form fields
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");

  function switchMode(m: Mode) {
    setMode(m);
    setError("");
    setState("idle");
  }

  // ── Client-side validation ────────────────────────────────────────────────
  function validate(): string | null {
    if (!email.trim())    return "Email is required.";
    if (!password.trim()) return "Password is required.";
    if (mode === "register") {
      if (!name.trim())             return "Name is required.";
      if (password.length < 8)      return "Password must be at least 8 characters.";
      if (password !== confirm)     return "Passwords do not match.";
    }
    return null;
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setState("loading");
    setError("");

    try {
      if (mode === "login") {
        const result = await signIn("credentials", {
          email: email.toLowerCase().trim(),
          password,
          redirect: false,
        });

        if (result?.error) {
          setState("error");
          setError("Invalid email or password. Please try again.");
          return;
        }
      } else {
        // Register
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), email: email.toLowerCase().trim(), password }),
        });

        const data = await res.json();
        if (!res.ok) {
          setState("error");
          setError(data.error ?? "Registration failed. Please try again.");
          return;
        }

        // Auto sign-in after successful registration
        const signInResult = await signIn("credentials", {
          email: email.toLowerCase().trim(),
          password,
          redirect: false,
        });

        if (signInResult?.error) {
          setState("error");
          setError("Account created but sign-in failed. Please sign in manually.");
          switchMode("login");
          return;
        }
      }

      // Success
      onSuccess?.();
      onClose();
    } catch {
      setState("error");
      setError("Something went wrong. Please try again.");
    }
  }

  const isLogin  = mode === "login";
  const loading  = state === "loading";

  return (
    <ModalShell onClose={onClose}>
      {/* Title */}
      <div style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 28, fontWeight: 700, color: "var(--navy)",
        textAlign: "center", marginBottom: 6,
      }}>
        {isLogin ? "Welcome Back" : "Create Account"}
      </div>

      <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginBottom: 22, lineHeight: 1.6 }}>
        {isLogin
          ? "Sign in to save your streak and track your progress."
          : "Join Daily Davar — free forever, upgrade any time."}
      </p>

      {/* Error banner */}
      {error && (
        <div style={{
          background: "var(--wrong-pale)", border: "1px solid var(--wrong)",
          borderRadius: 8, padding: "10px 14px", marginBottom: 14,
          fontSize: 13, color: "var(--wrong)", lineHeight: 1.5,
        }}>
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {!isLogin && (
          <TextInput
            type="text"
            placeholder="Your name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
          />
        )}

        <TextInput
          type="email"
          placeholder="Email address"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />

        <TextInput
          type="password"
          placeholder={isLogin ? "Password" : "Password (min 8 characters)"}
          autoComplete={isLogin ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />

        {!isLogin && (
          <TextInput
            type="password"
            placeholder="Confirm password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={loading}
            required
          />
        )}

        <button
          type="submit"
          disabled={loading}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "var(--navy-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--navy)"; }}
          style={{
            width: "100%", marginTop: 6,
            background: "var(--navy)", color: "var(--gold-pale)",
            border: "none", borderRadius: 8, padding: 13,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 17, fontWeight: 600, letterSpacing: "1px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.65 : 1,
            transition: "background 0.15s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {loading ? (
            <>
              <span
                className="animate-spin"
                style={{
                  display: "inline-block", width: 14, height: 14, borderRadius: "50%",
                  border: "2px solid rgba(240,223,168,0.3)", borderTopColor: "var(--gold-pale)",
                }}
              />
              {isLogin ? "Signing in…" : "Creating account…"}
            </>
          ) : (
            isLogin ? "Sign In" : "Create Account"
          )}
        </button>
      </form>

      {/* Footer links */}
      <div style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
        {isLogin ? (
          <>
            <span>
              No account?{" "}
              <button onClick={() => switchMode("register")} style={{ background: "none", border: "none", padding: 0, color: "var(--gold)", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
                Create one free
              </button>
            </span>
            <button onClick={onClose} style={{ background: "none", border: "none", padding: 0, color: "var(--text-muted)", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
              Continue as guest
            </button>
          </>
        ) : (
          <span>
            Already have an account?{" "}
            <button onClick={() => switchMode("login")} style={{ background: "none", border: "none", padding: 0, color: "var(--gold)", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
              Sign in
            </button>
          </span>
        )}
      </div>
    </ModalShell>
  );
}
