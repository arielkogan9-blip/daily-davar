import Link from "next/link";
import BackButton from "@/components/BackButton";

const SECTION = (title: string, body: string) => ({ title, body });

const SECTIONS = [
  SECTION("1. What We Collect", "We collect: (a) account information you provide — name, email, and a hashed password when you register; (b) game data — which questions you answered, whether you won, streak counts; (c) optional profile data — display name and avatar emoji stored in your browser's localStorage; (d) technical data — IP address (for rate limiting only, not stored), browser type, and Vercel analytics events (page views, no personal identifiers)."),
  SECTION("2. How We Use Your Data", "We use your data to: authenticate you; save and sync your streak and game history across devices (paid tiers); generate leaderboard rankings from current streak data; send transactional emails (welcome, password reset) using Gmail SMTP; and improve the service via aggregate analytics."),
  SECTION("3. What We Do Not Do", "We do not sell your data. We do not share your personal information with advertisers. We do not use third-party tracking pixels or cookies beyond what NextAuth requires for sessions."),
  SECTION("4. Data Storage", "Your data is stored in a Turso (libSQL) database hosted on Turso's infrastructure. Session tokens are stored as secure HTTP-only cookies. Profile preferences (avatar, display name) are stored only in your browser's localStorage and never sent to our servers."),
  SECTION("5. Payments", "Payments are processed by Stripe. We never see or store your card number. Stripe's privacy policy applies to payment data. We store only your subscription tier (free, plus, or scholar) and a Stripe customer ID."),
  SECTION("6. Email Communications", "If you register, we may send a welcome email. For password resets, we send a time-limited reset link. We do not send marketing emails unless you explicitly opt in. You can unsubscribe at any time."),
  SECTION("7. Data Retention", "Game results are retained for the life of your account. If you delete your account (by emailing us), we delete all associated data within 30 days. Vercel Analytics data is retained per Vercel's policy."),
  SECTION("8. Your Rights", "You may request a copy of your data, correction of inaccurate data, or deletion of your account by emailing dailydavar1@gmail.com. We will respond within 30 days."),
  SECTION("9. Cookies", "We use one session cookie (next-auth.session-token) to keep you logged in. No advertising or tracking cookies are set."),
  SECTION("10. Children", "Daily Davar is not directed at children under 13. We do not knowingly collect data from children. If you believe a child has registered, please contact us."),
  SECTION("11. Changes", "We may update this policy. We will note the date of the last update at the top of this page. Continued use after changes constitutes acceptance."),
  SECTION("12. Contact", "Questions about privacy? Email us at dailydavar1@gmail.com."),
];

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 20px 80px", fontFamily: "Lora, Georgia, serif" }}>
      <BackButton />
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 36, fontWeight: 700, color: "var(--navy)", marginBottom: 8 }}>
          Privacy Policy
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Last updated: June 2025</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 18, fontWeight: 700, color: "var(--navy)", marginBottom: 8 }}>
              {s.title}
            </div>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.8, margin: 0 }}>{s.body}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--border)", fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>
        See also our{" "}
        <Link href="/terms" style={{ color: "var(--gold)" }}>Terms of Service</Link>
        {" "}·{" "}
        <Link href="/" style={{ color: "var(--gold)" }}>Back to Daily Davar</Link>
      </div>
    </div>
  );
}
