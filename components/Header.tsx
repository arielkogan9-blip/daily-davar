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
  fontSize: 16, color: "var(--text-muted)", flexShrink: 0,
};

const TIER_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  free:    { bg: "var(--border)",       color: "var(--text-muted)", label: "free"    },
  plus:    { bg: "var(--gold-muted)",   color: "var(--gold)",       label: "plus"    },
  scholar: { bg: "var(--correct-pale)", color: "var(--correct)",    label: "scholar" },
};

const NAV_BTN: React.CSSProperties = {
  background: "none", border: "none", padding: "2px 6px",
  fontFamily: "Lora, Georgia, serif", fontSize: 11, cursor: "pointer",
  color: "var(--text-muted)", borderRadius: 4, transition: "color 0.1s",
};

const hov = (e: React.MouseEvent<HTMLButtonElement>, enter: boolean) =>
  (e.currentTarget.style.color = enter ? "var(--navy)" : "var(--text-muted)");

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
      <div style={{
        maxWidth: 540, margin: "0 auto",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 20px",
      }}>

        {/* ── Left: icon buttons ── */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
          <button onClick={onSettings} aria-label="Settings" style={ICON_BTN} title="Settings">
            ⚙️
          </button>
          <button
            onClick={onArchive}
            aria-label="Question archive"
            title="Question Library"
            style={{ ...ICON_BTN, fontSize: 15 }}
          >
            📚
          </button>
          {isScholar && (
            <>
              <button
                aria-label="Classroom"
                title="Classroom"
                onClick={() => router.push("/classroom")}
                style={{ ...ICON_BTN, fontSize: 15 }}
              >
                👥
              </button>
              <button
                aria-label="Daily Digest"
                title="Daily Digest"
                onClick={() => router.push("/digest")}
                style={{ ...ICON_BTN, fontSize: 15 }}
              >
                📖
              </button>
            </>
          )}
        </div>

        {/* ── Center: logo (click → home) ── */}
        <button
          onClick={() => router.push("/")}
          style={{ textAlign: "center", lineHeight: 1, background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <div style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 22, fontWeight: 700, color: "var(--navy)",
            letterSpacing: "3px", textTransform: "uppercase",
          }}>
            Daily Davar
          </div>
          <div style={{ fontSize: 14, color: "var(--gold)", letterSpacing: "5px", marginTop: 2 }}>
            דָּבָר
          </div>
        </button>

        {/* ── Right: auth / account ── */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
          {streak > 0 && (
            <div style={{
              background: "var(--navy)", color: "var(--gold-pale)",
              padding: "4px 10px", borderRadius: 999,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 14, fontWeight: 600,
            }}>
              🔥 {streak}
            </div>
          )}

          {status === "loading" && (
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--border)", opacity: 0.4 }} />
          )}

          {/* ── Logged OUT ── */}
          {status !== "loading" && !isLoggedIn && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={() => router.push("/pricing")}
                style={{
                  background: "none", border: "none", cursor: "pointer", padding: "2px 6px",
                  fontFamily: "Lora, Georgia, serif", fontSize: 11,
                  color: "var(--text-muted)", borderRadius: 4,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--navy)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                Pricing
              </button>
              <button onClick={onLogin} aria-label="Sign in" title="Sign in" style={ICON_BTN}>
                👤
              </button>
            </div>
          )}

          {/* ── Logged IN ── */}
          {status !== "loading" && isLoggedIn && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
              {/* User chip */}
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <button
                  onClick={onSettings}
                  title="View stats"
                  style={{
                    background: "none", border: "none", padding: 0, cursor: "pointer",
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 14, fontWeight: 600, color: "var(--navy)",
                  }}
                >
                  {firstName}
                </button>
                <span style={{
                  background: badge.bg, color: badge.color,
                  fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.8px", padding: "2px 6px", borderRadius: 999,
                }}>
                  {badge.label}
                </span>
              </div>

              {/* Nav links row */}
              <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                <button style={NAV_BTN} onClick={() => router.push("/dashboard")} onMouseEnter={(e) => hov(e, true)} onMouseLeave={(e) => hov(e, false)}>Stats</button>
                <span style={{ color: "var(--border-dark)", fontSize: 10 }}>·</span>
                <button style={NAV_BTN} onClick={() => router.push("/pricing")}   onMouseEnter={(e) => hov(e, true)} onMouseLeave={(e) => hov(e, false)}>Pricing</button>
                {isScholar && (
                  <>
                    <span style={{ color: "var(--border-dark)", fontSize: 10 }}>·</span>
                    <button style={NAV_BTN} onClick={() => router.push("/archive")}   onMouseEnter={(e) => hov(e, true)} onMouseLeave={(e) => hov(e, false)}>Archive</button>
                    <span style={{ color: "var(--border-dark)", fontSize: 10 }}>·</span>
                    <button style={NAV_BTN} onClick={() => router.push("/classroom")} onMouseEnter={(e) => hov(e, true)} onMouseLeave={(e) => hov(e, false)}>Classroom</button>
                    <span style={{ color: "var(--border-dark)", fontSize: 10 }}>·</span>
                    <button style={NAV_BTN} onClick={() => router.push("/digest")}    onMouseEnter={(e) => hov(e, true)} onMouseLeave={(e) => hov(e, false)}>Digest</button>
                  </>
                )}
                <span style={{ color: "var(--border-dark)", fontSize: 10 }}>·</span>
                <button
                  style={{ ...NAV_BTN, color: "var(--wrong)" }}
                  onClick={() => signOut({ callbackUrl: "/" })}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--wrong)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--wrong)")}
                  title="Sign out"
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
