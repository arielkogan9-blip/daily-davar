"use client";

import { useRef, useState, useEffect } from "react";
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

export default function Header({ streak, onSettings, onArchive, onLogin }: HeaderProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = status === "authenticated" && !!session?.user;
  const tier       = (session?.user as { tier?: string })?.tier ?? "free";
  const firstName  = session?.user?.name?.split(" ")[0] ?? session?.user?.email?.split("@")[0] ?? "";
  const isScholar  = tier === "scholar";
  const badge      = TIER_BADGE[tier] ?? TIER_BADGE.free;

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  function iconHover(enter: boolean) {
    return {
      onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.borderColor = enter ? "var(--navy)" : "var(--border)";
        e.currentTarget.style.color       = enter ? "var(--navy)" : "var(--text-muted)";
      },
      onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.color       = "var(--text-muted)";
      },
    };
  }

  // Shared dropdown menu item style
  function MenuItem({
    label, onClick, danger,
  }: { label: string; onClick: () => void; danger?: boolean }) {
    const base = danger ? "var(--wrong)" : "var(--text)";
    const hov  = danger ? "#c0392b"      : "var(--navy)";
    return (
      <button
        onClick={() => { setMenuOpen(false); onClick(); }}
        onMouseEnter={(e) => { e.currentTarget.style.color = hov; e.currentTarget.style.background = "var(--border)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = base; e.currentTarget.style.background = "transparent"; }}
        style={{
          display: "block", width: "100%", textAlign: "left",
          background: "transparent", border: "none", padding: "9px 14px",
          fontFamily: "Lora, Georgia, serif", fontSize: 13,
          color: base, cursor: "pointer", transition: "all 0.1s",
        }}
      >
        {label}
      </button>
    );
  }

  return (
    <header style={{ borderBottom: "1.5px solid var(--border)", background: "var(--bg)" }}>
      {/* Use CSS grid so the logo column is always exactly centered */}
      <div
        style={{
          maxWidth: 540, margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          padding: "12px 20px",
          gap: 8,
        }}
      >
        {/* ── Left: icon buttons ─────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button
            onClick={onSettings}
            aria-label="Settings"
            title="Settings"
            style={ICON_BTN}
            {...iconHover(true)}
          >
            ⚙️
          </button>
          <button
            onClick={onArchive}
            aria-label="Question library"
            title="Question Library"
            style={ICON_BTN}
            {...iconHover(true)}
          >
            📚
          </button>
          {isScholar && (
            <button
              onClick={() => router.push("/digest")}
              aria-label="Weekly Digest"
              title="Weekly Digest"
              style={ICON_BTN}
              {...iconHover(true)}
            >
              📖
            </button>
          )}
        </div>

        {/* ── Center: logo (always centered) ─────────────────────────── */}
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

        {/* ── Right: auth / account ───────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>

          {/* Streak pill */}
          {streak > 0 && (
            <div style={{
              background: "var(--navy)", color: "var(--gold-pale)",
              padding: "3px 10px", borderRadius: 999,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 13, fontWeight: 600, flexShrink: 0,
            }}>
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

          {/* ── Logged IN: dropdown trigger ── */}
          {status !== "loading" && isLoggedIn && (
            <div ref={menuRef} style={{ position: "relative" }}>
              {/* Trigger */}
              <button
                onClick={() => setMenuOpen((o) => !o)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "none", border: "none", cursor: "pointer", padding: "4px 2px",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 15, fontWeight: 700, color: "var(--navy)",
                  }}
                >
                  {firstName}
                </span>
                <span style={{
                  background: badge.bg, color: badge.color,
                  fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.5px", padding: "2px 7px", borderRadius: 999,
                }}>
                  {badge.label}
                </span>
                <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: 1 }}>
                  {menuOpen ? "▲" : "▾"}
                </span>
              </button>

              {/* Dropdown panel */}
              {menuOpen && (
                <div
                  style={{
                    position: "absolute", right: 0, top: "calc(100% + 6px)",
                    background: "var(--bg)", border: "1.5px solid var(--border)",
                    borderRadius: 10, minWidth: 160,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    overflow: "hidden", zIndex: 200,
                  }}
                >
                  <MenuItem label="Stats"    onClick={() => router.push("/dashboard")} />
                  <MenuItem label="History"  onClick={() => router.push("/history")} />
                  <MenuItem label="Pricing"  onClick={() => router.push("/pricing")} />
                  {isScholar && (
                    <>
                      <MenuItem label="Archive" onClick={() => router.push("/archive")} />
                      <MenuItem label="Digest"  onClick={() => router.push("/digest")} />
                    </>
                  )}
                  <div style={{ borderTop: "1px solid var(--border)", margin: "4px 0" }} />
                  <MenuItem label="Sign Out" onClick={() => signOut({ callbackUrl: "/" })} danger />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
