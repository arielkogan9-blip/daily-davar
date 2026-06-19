import Link from "next/link";
import BackButton from "@/components/BackButton";

const SECTION = (title: string, body: string) => ({ title, body });

const SECTIONS = [
  SECTION("1. Acceptance of Terms", "By accessing or using Daily Davar, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service."),
  SECTION("2. Description of Service", "Daily Davar is a daily Jewish knowledge game tied to the Hebrew calendar. We offer free and paid membership tiers with different feature sets."),
  SECTION("3. User Accounts", "You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must provide accurate information when registering."),
  SECTION("4. Payments and Subscriptions", "Paid subscriptions (Plus and Scholar) are billed monthly or annually via Stripe. Subscriptions renew automatically. You may cancel at any time through your account settings or by contacting us. Refunds are handled at our discretion."),
  SECTION("5. Prohibited Conduct", "You agree not to: (a) use the service for any unlawful purpose; (b) attempt to circumvent security measures; (c) scrape or reproduce content without permission; (d) create multiple accounts to abuse free features."),
  SECTION("6. Intellectual Property", "All content on Daily Davar — including questions, explanations, and design — is owned by Daily Davar. Torah and Talmudic texts are in the public domain. Our original commentary and presentation are protected."),
  SECTION("7. Data and Privacy", "We collect and process data as described in our Privacy Policy. By using Daily Davar, you consent to this data processing."),
  SECTION("8. Disclaimers", "The service is provided 'as is.' We make no warranties regarding accuracy, availability, or fitness for a particular purpose. Torah questions are for educational purposes — please consult a rabbi for halachic decisions."),
  SECTION("9. Limitation of Liability", "Daily Davar shall not be liable for indirect, incidental, or consequential damages arising from your use of the service."),
  SECTION("10. Changes to Terms", "We may update these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms."),
  SECTION("11. Contact", "For questions about these terms, contact us at dailydavar1@gmail.com."),
];

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 20px 80px", fontFamily: "Lora, Georgia, serif" }}>
      <BackButton />
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 36, fontWeight: 700, color: "var(--navy)", marginBottom: 8 }}>
          Terms of Service
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
        <Link href="/privacy" style={{ color: "var(--gold)" }}>Privacy Policy</Link>
        {" "}·{" "}
        <Link href="/" style={{ color: "var(--gold)" }}>Back to Daily Davar</Link>
      </div>
    </div>
  );
}
