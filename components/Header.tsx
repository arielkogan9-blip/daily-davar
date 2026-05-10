type HeaderProps = {
  streak: number;
  isLoggedIn: boolean;
  onHowToPlay: () => void;
  onArchive: () => void;
  onLogin: () => void;
};

const ICON_BTN: React.CSSProperties = {
  width: 34,
  height: 34,
  border: "1.5px solid var(--border)",
  borderRadius: 8,
  background: "transparent",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 16,
  color: "var(--text-muted)",
  flexShrink: 0,
};

export default function Header({ streak, isLoggedIn, onHowToPlay, onArchive, onLogin }: HeaderProps) {
  return (
    <header style={{ borderBottom: "1.5px solid var(--border)" }}>
      <div
        style={{
          maxWidth: 540,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 20px",
        }}
      >
        {/* Left: How to play + Archive */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
          <button onClick={onHowToPlay} aria-label="How to play" style={ICON_BTN}>
            ?
          </button>
          <button
            onClick={onArchive}
            aria-label="Archive"
            title={isLoggedIn ? "Past questions" : "Sign in to access archive"}
            style={{
              ...ICON_BTN,
              position: "relative",
              fontSize: 15,
            }}
          >
            📚
            {!isLoggedIn && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  width: 12,
                  height: 12,
                  background: "var(--border-dark)",
                  borderRadius: "50%",
                  fontSize: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
              >
                🔒
              </span>
            )}
          </button>
        </div>

        {/* Center: Logo */}
        <div style={{ textAlign: "center", lineHeight: 1 }}>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 22,
              fontWeight: 700,
              color: "var(--navy)",
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            Daily Davar
          </div>
          <div
            style={{
              fontSize: 14,
              color: "var(--gold)",
              letterSpacing: "5px",
              marginTop: 2,
            }}
          >
            דָּבָר
          </div>
        </div>

        {/* Right: streak pill + login/account */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          {streak > 0 && (
            <div
              style={{
                background: "var(--navy)",
                color: "var(--gold-pale)",
                padding: "4px 12px",
                borderRadius: 999,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              🔥 {streak}
            </div>
          )}
          <button
            onClick={onLogin}
            aria-label={isLoggedIn ? "Account" : "Login"}
            style={{
              ...ICON_BTN,
              borderColor: isLoggedIn ? "var(--navy)" : "var(--border)",
              color: isLoggedIn ? "var(--navy)" : "var(--text-muted)",
            }}
          >
            {isLoggedIn ? "✓" : "👤"}
          </button>
        </div>
      </div>
    </header>
  );
}
