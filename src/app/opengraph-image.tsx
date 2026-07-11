import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Dynamic OpenGraph / Twitter share card for the landing (1200x630).
 *
 * Rendered server-side by next/og (satori) — no browser needed, so it works
 * in this sandbox. Runs on the Node runtime so it can read the hero dragon
 * sprite off disk and inline it as a data URI (satori can't fetch /public).
 *
 * Brand: warm cream garden, green accent, the wordmark + one-line promise,
 * and the hero dragon as the emotional hook — the thing people share.
 */
export const runtime = "nodejs";
export const alt = "Tend — grow habits, hatch dragons. A calm garden you tend daily.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GREEN = "#2E9E5B";
const GREEN_DEEP = "#1F7A46";
const INK = "#17301F";
const CREAM = "#FBFAF5";

export default async function OgImage() {
  // Inline the hero dragon (dragon_33.png — same sprite as the landing hero).
  let dragonSrc = "";
  try {
    const buf = await readFile(join(process.cwd(), "public/sprites/dragons/dragon_33.png"));
    dragonSrc = `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    dragonSrc = "";
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: CREAM,
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* ambient garden glows */}
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -120,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(46,158,91,0.18), transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -180,
            left: -140,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245,166,35,0.12), transparent 70%)",
          }}
        />

        {/* text column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 64px",
            width: dragonSrc ? 720 : 1200,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", fontSize: 40, fontWeight: 800, color: INK, letterSpacing: -1 }}>
            tend<span style={{ color: GREEN }}>.</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 78,
              fontWeight: 800,
              color: INK,
              letterSpacing: -2.5,
              lineHeight: 1.05,
              marginTop: 28,
            }}
          >
            Grow habits. Hatch dragons.
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#3d5c49", lineHeight: 1.4, marginTop: 26, maxWidth: 600 }}>
            A calm little garden you tend daily. Every good day grows your world.
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              alignSelf: "flex-start",
              marginTop: 34,
              padding: "12px 22px",
              borderRadius: 999,
              background: "rgba(46,158,91,0.12)",
              color: GREEN_DEEP,
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            Assumes the best in you — never shaming
          </div>
        </div>

        {/* dragon */}
        {dragonSrc ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 480 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dragonSrc} width={360} height={360} alt="" style={{ objectFit: "contain" }} />
          </div>
        ) : null}
      </div>
    ),
    { ...size }
  );
}
