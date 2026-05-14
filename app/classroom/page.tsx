"use client";

import BackButton from "@/components/BackButton";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type Classroom = {
  id: string;
  name: string;
  code: string;
  memberCount: number;
  isOwner: boolean;
  createdAt: string;
};

type Panel = "list" | "creating" | "joining" | "created";

// ─── Shared styles ────────────────────────────────────────────────────────────

const INPUT: React.CSSProperties = {
  width: "100%", padding: "11px 13px",
  border: "1.5px solid var(--border)", borderRadius: 8,
  fontFamily: "Lora, Georgia, serif", fontSize: 14,
  color: "var(--text)", background: "var(--card)", outline: "none",
  transition: "border-color 0.15s", boxSizing: "border-box",
};

const NAV_BTN = (active: boolean): React.CSSProperties => ({
  flex: 1, padding: "10px 6px", border: "none",
  background: active ? "var(--navy)" : "var(--card)",
  color: active ? "var(--gold-pale)" : "var(--text-muted)",
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontSize: 15, fontWeight: 600, letterSpacing: "0.5px",
  cursor: "pointer", borderRadius: 8,
  transition: "all 0.12s",
});

// ─── Upgrade prompt ───────────────────────────────────────────────────────────

function UpgradePrompt() {
  return (
    <div style={{ maxWidth: 480, margin: "80px auto", padding: "0 20px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 32, fontWeight: 700, color: "var(--navy)", marginBottom: 12 }}>
        Classrooms
      </div>
      <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 28 }}>
        Create and manage Daily Davar classrooms, invite students, and track everyone's progress on the daily leaderboard — exclusively for Scholar members.
      </p>
      <a href="/pricing" style={{
        display: "inline-block", background: "var(--navy)", color: "var(--gold-pale)",
        borderRadius: 8, padding: "14px 32px",
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 18, fontWeight: 600, letterSpacing: "1px", textDecoration: "none",
      }}>
        Upgrade to Scholar →
      </a>
    </div>
  );
}

// ─── Classroom card ───────────────────────────────────────────────────────────

function ClassroomCard({ room, onView }: { room: Classroom; onView: () => void }) {
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(room.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{
      background: "var(--card)", border: "1.5px solid var(--border)",
      borderRadius: 12, padding: "18px 20px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 20, fontWeight: 700, color: "var(--navy)", marginBottom: 2 }}>
            {room.name}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {room.memberCount} member{room.memberCount !== 1 ? "s" : ""}
            {room.isOwner && <span style={{ marginLeft: 8, color: "var(--gold)", fontWeight: 600 }}>Owner</span>}
          </div>
        </div>
        {room.isOwner && (
          <div style={{
            background: "var(--navy)", borderRadius: 8, padding: "8px 14px",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 18, fontWeight: 700, letterSpacing: "3px", color: "var(--gold)",
            cursor: "pointer", userSelect: "all",
            display: "flex", alignItems: "center", gap: 8,
          }}
            title="Click to copy join code"
            onClick={copyCode}
          >
            {room.code}
            <span style={{ fontSize: 11, fontFamily: "Lora, Georgia, serif", letterSpacing: 0, color: "var(--gold-pale)", opacity: 0.7, fontWeight: 400 }}>
              {copied ? "✓" : "⧉"}
            </span>
          </div>
        )}
      </div>
      <button
        onClick={onView}
        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--navy)"; e.currentTarget.style.color = "var(--gold-pale)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--navy)"; }}
        style={{
          background: "transparent", border: "1.5px solid var(--navy)",
          borderRadius: 7, padding: "8px 18px", width: "100%",
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 15, fontWeight: 600, color: "var(--navy)",
          cursor: "pointer", transition: "all 0.13s", marginTop: 4,
        }}
      >
        View Today&apos;s Leaderboard →
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClassroomPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const tier   = (session?.user as { tier?: string })?.tier ?? "free";

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [panel,      setPanel]      = useState<Panel>("list");
  const [error,      setError]      = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Create form
  const [createName, setCreateName] = useState("");
  const [newCode,    setNewCode]    = useState("");

  // Join form
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  const loadClassrooms = useCallback(async () => {
    const res = await fetch("/api/classroom/list");
    if (res.ok) {
      const { classrooms: c } = await res.json();
      setClassrooms(c ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || tier !== "scholar") { setLoading(false); return; }
    loadClassrooms();
  }, [status, tier, loadClassrooms]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim()) return;
    setError(""); setSubmitting(true);
    try {
      const res  = await fetch("/api/classroom/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create classroom."); return; }
      setNewCode(data.classroom.code);
      setPanel("created");
      loadClassrooms();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setError(""); setSubmitting(true);
    try {
      const res  = await fetch("/api/classroom/join", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to join classroom."); return; }
      setJoinCode(""); setPanel("list");
      loadClassrooms();
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render guards ────────────────────────────────────────────────────────────

  if (status === "loading" || loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div className="animate-spin" style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--gold)" }} />
      </div>
    );
  }

  if (tier !== "scholar") return <UpgradePrompt />;

  // ── Panel: just-created success ──────────────────────────────────────────────

  if (panel === "created") {
    return (
      <div style={{ maxWidth: 400, margin: "80px auto", padding: "0 20px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
        <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 700, color: "var(--navy)", marginBottom: 8 }}>
          Classroom created!
        </div>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
          Share this join code with your students:
        </p>
        <div style={{
          background: "var(--navy)", borderRadius: 12, padding: "20px 32px",
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 42, fontWeight: 700, letterSpacing: "8px", color: "var(--gold)",
          marginBottom: 24,
        }}>
          {newCode}
        </div>
        <button
          onClick={() => { setPanel("list"); setCreateName(""); setNewCode(""); }}
          style={{
            background: "var(--navy)", color: "var(--gold-pale)", border: "none",
            borderRadius: 8, padding: "12px 28px",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 16, fontWeight: 600, cursor: "pointer",
          }}
        >
          Back to classrooms
        </button>
      </div>
    );
  }

  // ── Panel: create / join forms ───────────────────────────────────────────────

  const showForm = panel === "creating" || panel === "joining";

  return (
    <div style={{ maxWidth: 540, margin: "0 auto", padding: "36px 20px 60px" }}>
        <BackButton />
      {/* Title */}
      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 34, fontWeight: 700, color: "var(--navy)", marginBottom: 24 }}>
        Classrooms
      </div>

      {/* Toggle: Create / Join */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, background: "var(--border)", padding: 4, borderRadius: 10 }}>
        <button style={NAV_BTN(panel === "list")}    onClick={() => { setPanel("list");     setError(""); }}>My Classrooms</button>
        <button style={NAV_BTN(panel === "creating")} onClick={() => { setPanel("creating"); setError(""); }}>+ Create</button>
        <button style={NAV_BTN(panel === "joining")}  onClick={() => { setPanel("joining");  setError(""); }}>Join</button>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ background: "var(--wrong-pale)", border: "1px solid var(--wrong)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "var(--wrong)" }}>
          {error}
        </div>
      )}

      {/* Create form */}
      {panel === "creating" && (
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 600, color: "var(--navy)", marginBottom: 4 }}>
            Create a new classroom
          </div>
          <input
            style={INPUT} type="text" placeholder="Classroom name (e.g. Talmud Study Group)"
            value={createName} onChange={(e) => setCreateName(e.target.value)}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--navy)")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
            required
          />
          <button
            type="submit" disabled={submitting || !createName.trim()}
            style={{
              background: "var(--navy)", color: "var(--gold-pale)", border: "none",
              borderRadius: 8, padding: 13,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 17, fontWeight: 600, letterSpacing: "1px",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: (!createName.trim() || submitting) ? 0.5 : 1,
            }}
          >
            {submitting ? "Creating…" : "Create Classroom"}
          </button>
        </form>
      )}

      {/* Join form */}
      {panel === "joining" && (
        <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 600, color: "var(--navy)", marginBottom: 4 }}>
            Join with a code
          </div>
          <input
            style={{ ...INPUT, textTransform: "uppercase", letterSpacing: "4px", fontSize: 22, textAlign: "center", fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            type="text" placeholder="XXXXXX" maxLength={6}
            value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--navy)")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
            required
          />
          <button
            type="submit" disabled={submitting || joinCode.length < 6}
            style={{
              background: "var(--navy)", color: "var(--gold-pale)", border: "none",
              borderRadius: 8, padding: 13,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 17, fontWeight: 600, letterSpacing: "1px",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: (joinCode.length < 6 || submitting) ? 0.5 : 1,
            }}
          >
            {submitting ? "Joining…" : "Join Classroom"}
          </button>
        </form>
      )}

      {/* Classroom list */}
      {panel === "list" && (
        classrooms.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-muted)", fontSize: 14 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
            You&apos;re not in any classrooms yet.<br />
            Create one or join with a code.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {classrooms.map((room) => (
              <ClassroomCard
                key={room.id}
                room={room}
                onView={() => router.push(`/classroom/${room.id}`)}
              />
            ))}
          </div>
        )
      )}

      {/* Keep list visible below forms (for context) */}
      {showForm && classrooms.length > 0 && (
        <div style={{ marginTop: 36 }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "2px", color: "var(--text-muted)", marginBottom: 14 }}>
            Your Classrooms
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {classrooms.map((room) => (
              <ClassroomCard
                key={room.id}
                room={room}
                onView={() => router.push(`/classroom/${room.id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
