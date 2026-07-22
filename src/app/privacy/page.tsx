import Link from "next/link";

const GREEN = "#2E9E5B";
const INK = "#17301F";

export const metadata = {
  title: "Privacy Policy | Tend",
  description: "How Tend handles your data. Short version: your garden is yours.",
};

export default function PrivacyPage() {
  return (
    <main style={page}>
      <div style={wrap}>
        <Link href="/" style={back}>Back to tend.</Link>
        <h1 style={h1}>Privacy Policy</h1>
        <p style={meta}>Last updated: July 21, 2026</p>

        <p style={p}>
          Tend is a habit garden. We built it to help you grow - not to harvest your data.
          This page explains what we collect, why, and how to reach us.
        </p>

        <h2 style={h2}>Who we are</h2>
        <p style={p}>
          Tend (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is operated by the maker of{" "}
          <a href="https://hatchtend.com" style={a}>hatchtend.com</a>.
          Contact:{" "}
          <a href="mailto:hello@hatchtend.com" style={a}>hello@hatchtend.com</a>.
        </p>

        <h2 style={h2}>What we collect</h2>
        <ul style={ul}>
          <li style={li}>
            <b>Account info</b> - email and display name via our auth provider (Clerk), so you can sign in and sync across devices.
          </li>
          <li style={li}>
            <b>App data you create</b> - habits, check-ins, streaks, coins, garden decor, quit progress, urge journal entries, preferences.
          </li>
          <li style={li}>
            <b>Billing</b> - if you subscribe to Tend+, payment is handled by Stripe. We store subscription status and Stripe IDs. We do <b>not</b> store your full card number.
          </li>
          <li style={li}>
            <b>Technical basics</b> - standard server logs needed to keep the site secure. We do not run ad trackers or sell data.
          </li>
        </ul>

        <h2 style={h2}>How we use it</h2>
        <ul style={ul}>
          <li style={li}>To run Tend - sync your garden, show progress, process Tend+ billing.</li>
          <li style={li}>To fix bugs, prevent abuse, and keep the service reliable.</li>
          <li style={li}>To email you about your account or important service changes.</li>
        </ul>

        <h2 style={h2}>Who we share with</h2>
        <p style={p}>Only the partners needed to run the product:</p>
        <ul style={ul}>
          <li style={li}><b>Clerk</b> - authentication</li>
          <li style={li}><b>Supabase</b> - encrypted cloud database</li>
          <li style={li}><b>Stripe</b> - payments</li>
          <li style={li}><b>Vercel</b> - hosting</li>
        </ul>
        <p style={p}>We do not sell your personal information.</p>

        <h2 style={h2}>Your choices</h2>
        <ul style={ul}>
          <li style={li}>Update account details in the app / Clerk settings.</li>
          <li style={li}>Cancel Tend+ anytime via the Stripe portal in Settings.</li>
          <li style={li}>
            To export or delete your data, email{" "}
            <a href="mailto:hello@hatchtend.com" style={a}>hello@hatchtend.com</a>.
          </li>
        </ul>

        <h2 style={h2}>Children</h2>
        <p style={p}>Tend is not directed at children under 13. Contact us if a child created an account.</p>

        <h2 style={h2}>Security and retention</h2>
        <p style={p}>
          We use HTTPS and access-controlled databases. We keep data while your account is active,
          then delete or anonymize it after you request deletion, except where law requires longer retention.
        </p>

        <h2 style={h2}>Changes</h2>
        <p style={p}>If this policy changes, we will update the date above.</p>

        <p style={{ ...p, marginTop: 40 }}>
          <Link href="/terms" style={a}>Terms of Use</Link>
          {" | "}
          <Link href="/" style={a}>Back to Tend</Link>
        </p>
      </div>
    </main>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#FBFAF5",
  color: INK,
  fontFamily: "'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif",
};
const wrap: React.CSSProperties = { maxWidth: 640, margin: "0 auto", padding: "40px 24px 80px" };
const back: React.CSSProperties = { color: GREEN, textDecoration: "none", fontWeight: 600, fontSize: 14 };
const h1: React.CSSProperties = { fontFamily: "'Fraunces',serif", fontSize: 32, margin: "24px 0 8px", fontWeight: 600 };
const h2: React.CSSProperties = { fontFamily: "'Fraunces',serif", fontSize: 20, margin: "32px 0 10px", fontWeight: 600 };
const meta: React.CSSProperties = { fontSize: 13, color: "rgba(23,48,31,0.45)", margin: "0 0 24px" };
const p: React.CSSProperties = { fontSize: 15, lineHeight: 1.65, margin: "0 0 14px", color: "rgba(23,48,31,0.85)" };
const ul: React.CSSProperties = { margin: "0 0 14px", paddingLeft: 20 };
const li: React.CSSProperties = { fontSize: 15, lineHeight: 1.65, marginBottom: 8, color: "rgba(23,48,31,0.85)" };
const a: React.CSSProperties = { color: GREEN, fontWeight: 500 };
