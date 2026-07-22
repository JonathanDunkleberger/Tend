import Link from "next/link";

const GREEN = "#2E9E5B";
const INK = "#17301F";

export const metadata = {
  title: "Terms of Use | Tend",
  description: "The simple rules for using Tend.",
};

export default function TermsPage() {
  return (
    <main style={page}>
      <div style={wrap}>
        <Link href="/" style={back}>Back to tend.</Link>
        <h1 style={h1}>Terms of Use</h1>
        <p style={meta}>Last updated: July 21, 2026</p>

        <p style={p}>
          Welcome to Tend. By using the site or creating an account, you agree to these Terms.
          If you do not agree, please do not use Tend.
        </p>

        <h2 style={h2}>What Tend is</h2>
        <p style={p}>
          Tend is a web app for building habits and quitting hard ones, with a dragon-egg garden as the daily loop.
          It is a <b>wellness / self-help tool</b>, not medical, clinical, or emergency care.
          If you are in crisis, contact local emergency services or a qualified professional.
        </p>

        <h2 style={h2}>Your account</h2>
        <ul style={ul}>
          <li style={li}>You are responsible for keeping your login safe.</li>
          <li style={li}>You are responsible for content you enter (habit names, journal notes, etc.).</li>
          <li style={li}>Do not use Tend to break the law, harass anyone, or try to hack the service.</li>
        </ul>

        <h2 style={h2}>Free and Tend+</h2>
        <p style={p}>
          The free tier includes a limited number of habit eggs and the core daily experience.
          Tend+ (monthly, yearly, or Forever) unlocks unlimited eggs, the full dragon catalog, deeper insights, and premium garden decor.
          Prices are shown in the app at checkout and charged by Stripe.
        </p>
        <ul style={ul}>
          <li style={li}>Subscriptions renew until you cancel.</li>
          <li style={li}>Cancel anytime via the billing portal in Settings; you keep access through the paid period.</li>
          <li style={li}>Forever is a one-time purchase for Tend+ features for as long as we offer the product.</li>
          <li style={li}>
            Except where required by law, fees are non-refundable after purchase. If billing went wrong, email{" "}
            <a href="mailto:hello@tendhabit.com" style={a}>hello@tendhabit.com</a>.
          </li>
        </ul>

        <h2 style={h2}>Your content and our IP</h2>
        <p style={p}>
          You own your habit data. You give us permission to store and display it so Tend can work.
          Tend name, design, dragon art, and code stay ours (or our licensors).
        </p>

        <h2 style={h2}>Availability</h2>
        <p style={p}>
          We aim to keep Tend up, but we do not promise 100% uptime. Features may change.
          We may suspend accounts that abuse the service.
        </p>

        <h2 style={h2}>Disclaimer</h2>
        <p style={p}>
          Tend is provided &ldquo;as is.&rdquo; To the fullest extent allowed by law, we disclaim warranties of merchantability,
          fitness for a particular purpose, and non-infringement. We are not liable for indirect or consequential damages.
          Our total liability related to Tend is limited to the amount you paid us in the 12 months before the claim
          (or $50 if you paid nothing).
        </p>

        <h2 style={h2}>Privacy</h2>
        <p style={p}>
          Our <Link href="/privacy" style={a}>Privacy Policy</Link> explains how we handle data. It is part of these Terms.
        </p>

        <h2 style={h2}>Changes</h2>
        <p style={p}>We may update these Terms. Continued use after changes means you accept them.</p>

        <h2 style={h2}>Contact</h2>
        <p style={p}>
          Questions? <a href="mailto:hello@tendhabit.com" style={a}>hello@tendhabit.com</a>
        </p>

        <p style={{ ...p, marginTop: 40 }}>
          <Link href="/privacy" style={a}>Privacy Policy</Link>
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
