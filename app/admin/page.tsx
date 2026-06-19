"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type AdminData = {
  users: { total: number; free: number; plus: number; scholar: number };
  games: { total: number; wins: number; winRate: number };
  recentUsers: { id: string; name: string | null; email: string; tier: string; createdAt: string }[];
  recentSuggestions: { id: string; email: string; suggestion: string; createdAt: string }[];
};

const ADMIN_EMAILS = ["arielkogan9@gmail.com", "dailydavar1@gmail.com"];

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      background: "var(--card)", border: "1.5px solid var(--border)",
      borderRadius: 12, padding: "20px 24px",
    }}>
      <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 36, fontWeight: 700, color: "var(--navy)", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/"); return; }
    if (status === "authenticated" && !ADMIN_EMAILS.includes(session?.user?.email ?? "")) {
      router.replace("/");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/admin")
        .then((r) => r.json())
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [status, session, router]);

  if (status === "loading" || loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "var(--text-muted)", fontStyle: "italic" }}>
        Loading…
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px 80px" }}>
      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 32, fontWeight: 700, color: "var(--navy)", marginBottom: 32 }}>
        Admin Dashboard
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 40 }}>
        <StatCard label="Total Users" value={data.users.total} />
        <StatCard label="Free" value={data.users.free} />
        <StatCard label="Plus" value={data.users.plus} />
        <StatCard label="Scholar" value={data.users.scholar} />
        <StatCard label="Total Games" value={data.games.total} />
        <StatCard label="Win Rate" value={`${data.games.winRate}%`} sub={`${data.games.wins} wins`} />
      </div>

      {/* Recent Users */}
      <Section title="Recent Signups">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Name", "Email", "Tier", "Joined"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "6px 12px", color: "var(--text-muted)", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.recentUsers.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "8px 12px" }}>{u.name ?? "—"}</td>
                <td style={{ padding: "8px 12px", color: "var(--text-muted)" }}>{u.email}</td>
                <td style={{ padding: "8px 12px" }}>
                  <span style={{
                    background: u.tier === "scholar" ? "var(--navy)" : u.tier === "plus" ? "var(--gold)" : "var(--border)",
                    color: u.tier === "free" ? "var(--text-muted)" : "#fff",
                    borderRadius: 999, padding: "2px 8px", fontSize: 11, fontWeight: 600,
                  }}>
                    {u.tier}
                  </span>
                </td>
                <td style={{ padding: "8px 12px", color: "var(--text-muted)" }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* Recent Suggestions */}
      <Section title="Recent Topic Suggestions">
        {data.recentSuggestions.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: 13 }}>No suggestions yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.recentSuggestions.map((s) => (
              <div key={s.id} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                  {s.email} · {new Date(s.createdAt).toLocaleDateString()}
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.6 }}>{s.suggestion}</div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 700, color: "var(--navy)", marginBottom: 16 }}>
        {title}
      </div>
      <div style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: 12, padding: "20px 16px" }}>
        {children}
      </div>
    </div>
  );
}
