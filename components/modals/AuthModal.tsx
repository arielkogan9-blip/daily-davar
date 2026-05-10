"use client";

import { useState } from "react";

type AuthModalProps = {
  onClose: () => void;
  onLogin?: () => void;
};

type Mode = "login" | "register";

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  padding: "11px 13px",
  border: "1.5px solid var(--border)",
  borderRadius: 8,
  fontFamily: "Lora, Georgia, serif",
  fontSize: 14,
  color: "var(--text)",
  background: "#fff",
  outline: "none",
  transition: "border-color 0.15s",
  boxSizing: "border-box",
};

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={INPUT_STYLE}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "var(--navy)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        props.onBlur?.(e);
      }}
    />
  );
}

export default function AuthModal({ onClose, onLogin }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>("login");

  // TODO: wire up real auth logic (sign in / register API calls)
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onLogin?.();
    onClose();
  }

  const isLogin = mode === "login";

  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0, 0, 0, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: "28px 26px",
          maxWidth: 460,
          width: "100%",
          maxHeight: "88vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          style={{
            position: "absolute",
            top: 14,
            right: 16,
            background: "none",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
            color: "var(--text-muted)",
            lineHeight: 1,
            padding: 0,
          }}
        >
          ✕
        </button>

        {/* Title */}
        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 26,
            fontWeight: 700,
            color: "var(--navy)",
            textAlign: "center",
            marginBottom: 6,
          }}
        >
          {isLogin ? "Welcome Back" : "Create Account"}
        </div>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
            textAlign: "center",
            marginBottom: 20,
            lineHeight: 1.6,
          }}
        >
          {isLogin
            ? "Sign in to save your streak and track your learning."
            : "Join Daily Davar to track your progress."}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <TextInput type="email" placeholder="Email address" autoComplete="email" required />

          {!isLogin && (
            <TextInput type="text" placeholder="Your name" autoComplete="name" required />
          )}

          <TextInput
            type="password"
            placeholder="Password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
          />

          {!isLogin && (
            <TextInput
              type="password"
              placeholder="Confirm password"
              autoComplete="new-password"
              required
            />
          )}

          {/* Submit button */}
          <button
            type="submit"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--navy-hover)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--navy)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            style={{
              width: "100%",
              marginTop: 4,
              background: "var(--navy)",
              color: "var(--gold-pale)",
              border: "none",
              borderRadius: 8,
              padding: 13,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 17,
              fontWeight: 600,
              letterSpacing: "1px",
              cursor: "pointer",
              transition: "background 0.2s, transform 0.15s",
            }}
          >
            {isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* Footer links */}
        <div
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "var(--text-muted)",
            marginTop: 14,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {isLogin ? (
            <>
              <span>
                No account?{" "}
                <button
                  onClick={() => setMode("register")}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    color: "var(--gold)",
                    cursor: "pointer",
                    fontSize: 13,
                    fontFamily: "inherit",
                  }}
                >
                  Create one
                </button>
              </span>
              <button
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "var(--navy)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: "inherit",
                }}
              >
                Continue as guest
              </button>
            </>
          ) : (
            <span>
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "var(--gold)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: "inherit",
                }}
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
