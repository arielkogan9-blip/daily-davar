"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

type HeaderProps = {
  streak: number;
  onSettings: () => void;
  onArchive: () => void;
  onLogin: () => void;
};

const ICON_BTN: React.CSSProperties = {
  width: 34, height: 34,
  border: "1.5px solid var(--border)", borderRadius: 8,
  background: "transparent", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: 15, color: "var(--text-muted)", flexShrink: 0,
  transition: "border-color 0.12s, color 0.12s",
};

const TIER_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  free:    { bg: "var(--border)",       color: "var(--text-muted)", label: "Free"    },
  plus:    { bg: "var(--gold-muted)",   color: "var(--gold)",       label: "Plus"    },
  scholar: { bg: "var(--correct-pale)", color: "var(--correct)",    label: "Scholar" },
};

function NavLink({
  label, onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--navy)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
      style={{
        background: "none", border: "none", padding: "3px 0",
        fontFamily: "Lora, Georgia, serif", fontSize: 12,
        cursor: "pointer", color: "var(--text-muted)",
        transition: "color 0.12s", whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

const SEP = (
  <span style={{ color: "var(--border-dark)", fontSize: 11, userSelect: "none" }}>|</span>
);

export default function Header({ streak, onSettings, onArchive, onLogin }: HeaderProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoggedIn = status === "authenticated" && !!session?.user;
  const tier       = (session?.user as { tier?: string })?.tier ?? "free";
  const firstName  = session?.user?.name?.split(" ")[0] ?? session?.user?.email?.split("@")[0] ?? "";
  const isScholar  = tier === "scholar";
  const badge      = TIER_BADGE[tier] ?? TIER_BADGE.free;

  return (
    <header style={{ borderBottom: "1.5px solid var(--border)", background: "var(--bg)" }}>
      <div
        style={{
          maxWidth: 540, margin: "0 auto",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "12px 20px",
        }}
      >
        {/* ── Left: icon buttons ─────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
          <button
            onClick={onSettings}
            aria-label="Settings"
            title="Settings"
            style={ICON_BTN}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--navy)"; e.currentTarget.style.color = "var(--navy)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            ⚙️
          </button>
          <button
            onClick={onArchive}
            aria-label="Question library"
            title="Question Library"
            style={ICON_BTN}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--navy)"; e.currentTarget.style.color = "var(--navy)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            📚
          </button>
          {isScholar && (
            <button
              onClick={() => router.push("/digest")}
              aria-label="Weekly Digest"
              title="Weekly Digest"
              style={ICON_BTN}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--navy)"; e.currentTarget.style.color = "var(--navy)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              📖
            </button>
          )}
        </div>

        {/* ── Center: logo ───────────────────────────────────────────── */}
        <button
          onClick={() => router.push("/")}
          style={{
            textAlign: "center", lineHeight: 1,
            background: "none", border: "none", cursor: "pointer", padding: 0,
          }}
        >
          <div
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 20, fontWeight: 700, color: "var(--navy)",
              letterSpacing: "3px", textTransform: "uppercase",
            }}
          >
            Daily Davar
          </div>
          <div style={{ fontSize: 13, color: "var(--gold)", letterSpacing: "5px", marginTop: 1 }}>
            דָּבָר
          </div>
        </button>

        {/* ── Right: account / auth ───────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>

          {/* Streak pill */}
          {streak > 0 && (
            <div
              style={{
                background: "var(--navy)", color: "var(--gold-pale)",
                padding: "3px 10px", borderRadius: 999,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 13, fontWeight: 600,
              }}
            >
              🔥 {streak}
            </div>
          )}

          {/* Loading skeleton */}
          {status === "loading" && (
            <div style={{ width: 72, height: 30, borderRadius: 8, background: "var(--border)", opacity: 0.4 }} />
          )}

          {/* ── Logged OUT ── */}
          {status !== "loading" && !isLoggedIn && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={() => router.push("/pricing")}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--navy)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "Lora, Georgia, serif", fontSize: 12,
                  color: "var(--text-muted)", transition: "color 0.12s",
                }}
              >
                Pricing
              </button>
              <button
                onClick={onLogin}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--navy-hover)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--navy)"; }}
                style={{
                  background: "var(--navy)", color: "var(--gold-pale)",
                  border: "none", borderRadius: 7, padding: "6px 14px",
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 14, fontWeight: 600, cursor: "pointer",
                  transition: "background 0.12s",
                }}
              >
                Sign In
              </button>
            </div>
          )}

          {/* ── Logged IN ── */}
          {status !== "loading" && isLoggedIn && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>

              {/* User + tier badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  onClick={onSettings}
                  title="Your stats"
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--navy)")}
                  style={{
                    background: "none", border: "none", padding: 0, cursor: "pointer",
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 15, fontWeight: 700, color: "var(--navy)",
                    transition: "color 0.12s",
                  }}
                >
                  {firstName}
                </button>
                <span
                  style={{
                    background: badge.bg, color: badge.color,
                    fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.5px", padding: "2px 7px", borderRadius: 999,
                  }}
                >
                  {badge.label}
                </span>
              </div>

              {/* Navigation row */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <NavLink label="Stats"    onClick={() => router.push("/dashboard")} />
                {SEP}
                <NavLink label="History"  onClick={() => router.push("/history")} />
                {SEP}
                <NavLink label="Pricing"  onClick={() => router.push("/pricing")} />
                {isScholar && (
                  <>
                    {SEP}
                    <NavLink label="Archive" onClick={() => router.push("/archive")} />
                    {SEP}
                    <NavLink label="Digest"  onClick={() => router.push("/digest")} />
                  </>
                )}
                {SEP}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--wrong)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                  style={{
                    background: "none", border: "none", padding: "3px 0",
                    fontFamily: "Lora, Georgia, serif", fontSize: 12,
                    cursor: "pointer", color: "var(--text-muted)", transition: "color 0.12s",
                  }}
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
