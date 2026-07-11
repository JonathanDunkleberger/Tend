/* eslint-disable @next/next/no-img-element -- dragon sprites are small static PNGs served from /public; plain <img> keeps this a zero-client-JS server component and matches the rest of the app. */
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDragonSprite } from "@/lib/sprites";

/**
 * Tend — marketing landing page.
 *
 * Server component: keeps the signed-in redirect, ships ZERO client JS, and
 * gets a fast LCP. All motion is CSS-only (keyframes injected below), so the
 * page stays static + snappy on a phone. Mobile-first; scales up at ≥640px.
 *
 * Brand soul: warm garden you tend daily → habits are dragon eggs that hatch
 * and evolve. Assumes the best in you. Never shaming.
 */

const GREEN = "#2E9E5B";
const GREEN_DEEP = "#1F7A46";
const INK = "#17301F";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/garden");

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#FBFAF5",
        color: INK,
        fontFamily: "'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ambient garden glow */}
      <div aria-hidden className="tGlow tGlow1" />
      <div aria-hidden className="tGlow tGlow2" />

      {/* ── Nav ── */}
      <nav className="tNav">
        <div className="tNavInner">
          <span className="tLogo">
            tend<span style={{ color: GREEN }}>.</span>
          </span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link href="/sign-in" className="tNavSignIn">
              Sign in
            </Link>
            <Link href="/sign-up" className="tBtn tBtnSm">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="tHero">
        <span className="tEyebrow">🌱 Assumes the best in you</span>
        <h1 className="tH1">
          Tend your habits,
          <br />
          <span className="tH1Accent">hatch your dragons.</span>
        </h1>
        <p className="tHeroSub">
          A calm little garden for building the life you want. Each habit is a dragon egg —
          tend it daily and watch it hatch and evolve. Miss a day? No shame, just a gentle
          new dawn.
        </p>

        {/* living hero visual */}
        <div className="tHeroArt" aria-hidden>
          <div className="tHeroDisc" />
          <img
            src={getDragonSprite(4, 33)}
            alt=""
            className="tHeroDragon"
            draggable={false}
          />
          <img
            src={getDragonSprite(0, 7)}
            alt=""
            className="tHeroEgg tHeroEgg1"
            draggable={false}
          />
          <img
            src={getDragonSprite(0, 14)}
            alt=""
            className="tHeroEgg tHeroEgg2"
            draggable={false}
          />
          <img
            src={getDragonSprite(0, 24)}
            alt=""
            className="tHeroEgg tHeroEgg3"
            draggable={false}
          />
        </div>

        <div className="tHeroCtas">
          <Link href="/sign-up" className="tBtn tBtnLg">
            Hatch your first egg — free
          </Link>
          <span className="tHeroFinePrint">No card. 3 habits free, forever.</span>
        </div>

        <div className="tTrustRow">
          {["No shame, ever", "Your data is yours", "Beautiful on mobile"].map((t) => (
            <span key={t} className="tTrustChip">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="tSection">
        <p className="tKicker">The daily loop</p>
        <h2 className="tH2">Three taps to a calmer you</h2>
        <div className="tSteps">
          {[
            {
              n: "1",
              sprite: getDragonSprite(0, 11),
              title: "Plant an egg",
              body: "Pick a habit to grow — or one to gently leave behind. It arrives as a mystery dragon egg.",
            },
            {
              n: "2",
              sprite: getDragonSprite(1, 11),
              title: "Tend it daily",
              body: "Each day defaults to “you did well.” One tap confirms it. Slipped? Tell it kindly — no guilt.",
            },
            {
              n: "3",
              sprite: getDragonSprite(4, 11),
              title: "Watch it evolve",
              body: "Streaks warm the egg until it hatches, then your dragon grows through five gorgeous stages.",
            },
          ].map((s) => (
            <div key={s.n} className="tStep">
              <div className="tStepArt">
                <img
                  src={s.sprite}
                  alt={s.title}
                  className="tStepSprite"
                  draggable={false}
                />
                <span className="tStepNum">{s.n}</span>
              </div>
              <h3 className="tStepTitle">{s.title}</h3>
              <p className="tStepBody">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Evolution journey (the payoff, shown not told) ── */}
      <section className="tSection tEvoSection">
        <p className="tKicker">The payoff</p>
        <h2 className="tH2">Watch your dragon grow up</h2>
        <p className="tEvoIntro">
          Every day you tend nudges the egg closer to hatching — then your dragon evolves through five
          gorgeous stages. Here’s the whole journey, one good day at a time.
        </p>
        <div className="tEvoScroll">
          <div className="tEvoRail">
            <div className="tEvoGround" aria-hidden />
            {EVO_STAGES.map((s, i) => (
              <div key={s.name} className={`tEvoStage${i === EVO_STAGES.length - 1 ? " tEvoStageLast" : ""}`}>
                <div className="tEvoPod">
                  <img
                    src={getDragonSprite(s.stage, EVO_SPECIES)}
                    alt={`${s.name} — day ${s.day}`}
                    className="tEvoSprite"
                    style={{ width: s.size, height: s.size, animationDelay: `${i * 0.35}s` }}
                    draggable={false}
                  />
                </div>
                <div className="tEvoDay">Day {s.day}</div>
                <div className="tEvoName">{s.name}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="tEvoFoot">
          Slip a day? The journey just pauses — your dragon waits for you, it never resets to zero.
        </p>
      </section>

      {/* ── Feature bento ── */}
      <section className="tSection">
        <p className="tKicker">More than a checkbox</p>
        <h2 className="tH2">Everything to keep you going</h2>
        <div className="tBento">
          <div className="tCard tCardWide" style={{ background: "linear-gradient(135deg,#EAF7EE,#F4FBF0)" }}>
            <div className="tCardIcon" style={{ background: "#DCF0E2" }}>📊</div>
            <h3 className="tCardTitle">Insights that actually help</h3>
            <p className="tCardBody">
              Best days, momentum trends, per-habit consistency, and a shareable Tend Wrapped —
              real answers to “how am I doing, and what’s working?”
            </p>
          </div>
          <div className="tCard">
            <div className="tCardIcon" style={{ background: "#E7EEFC" }}>🧘</div>
            <h3 className="tCardTitle">Calm on tap</h3>
            <p className="tCardBody">Guided breathing, grounding and urge-surfing for the hard moments.</p>
          </div>
          <div className="tCard">
            <div className="tCardIcon" style={{ background: "#FBEFD9" }}>🔥</div>
            <h3 className="tCardTitle">Streaks &amp; coins</h3>
            <p className="tCardBody">Milestone rewards that celebrate you — with a grace token so one slip never stings.</p>
          </div>
          <div className="tCard tCardWide" style={{ background: "linear-gradient(135deg,#F3EEFB,#FBF3F8)" }}>
            <div className="tCardIcon" style={{ background: "#EBE1FA" }}>🐉</div>
            <h3 className="tCardTitle">36 dragons to discover</h3>
            <p className="tCardBody">
              Fire, water, nature, storm, shadow, light and cosmic — commons to legendaries. Every
              habit hatches a companion that’s truly yours.
            </p>
          </div>
        </div>
      </section>

      {/* ── Dragon showcase ── */}
      <section className="tShowcase">
        <p className="tKicker" style={{ color: "rgba(255,255,255,0.55)" }}>The collection</p>
        <h2 className="tH2" style={{ color: "white" }}>Your habits, made adorable</h2>
        <p className="tShowcaseSub">Real payoff for real consistency. Here are a few waiting to be hatched.</p>
        <div className="tDragonStrip">
          {[5, 10, 16, 22, 28, 33, 36, 3, 21, 14].map((id, i) => (
            <img
              key={id}
              src={getDragonSprite(4, id)}
              alt=""
              className="tDragonChip"
              style={{ animationDelay: `${(i % 5) * 0.4}s` }}
              draggable={false}
            />
          ))}
        </div>
      </section>

      {/* ── Emotional / never-shaming ── */}
      <section className="tSection tPromise">
        <div className="tPromiseCard">
          <span className="tPromiseMark">“</span>
          <p className="tPromiseText">
            Most trackers punish you for being human. Tend assumes the best in you — every day starts
            as a win, slips are met with a kind word, and a broken streak is just a new sunrise for
            your dragon.
          </p>
          <p className="tPromiseWho">— the whole idea behind Tend</p>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="tSection">
        <p className="tKicker">Simple pricing</p>
        <h2 className="tH2">Start free. Grow when you’re ready.</h2>
        <div className="tPlans">
          <div className="tPlan">
            <div className="tPlanName">Free</div>
            <div className="tPlanPrice">
              $0<span className="tPlanPer"> forever</span>
            </div>
            <ul className="tPlanList">
              {["3 dragon eggs", "Daily assumes-best check-in", "Streaks, coins &amp; milestones", "Breathing &amp; calm tools", "30-day history"].map((f) => (
                <li key={f} dangerouslySetInnerHTML={{ __html: bullet(f) }} />
              ))}
            </ul>
            <Link href="/sign-up" className="tBtn tBtnGhost tBtnBlock">
              Get started
            </Link>
          </div>
          <div className="tPlan tPlanPro">
            <div className="tPlanBadge">Most loved</div>
            <div className="tPlanName">
              Tend+ <span style={{ color: "#F5A623" }}>♦</span>
            </div>
            <div className="tPlanPrice">
              $4.99<span className="tPlanPer"> /mo</span>
            </div>
            <div className="tPlanNote">or $39.99/yr — save 33%</div>
            <ul className="tPlanList">
              {["Unlimited dragon eggs", "Choose your egg &amp; species", "Full history &amp; deep insights", "Tend Wrapped", "All garden décor", "Grace tokens &amp; more"].map((f) => (
                <li key={f} dangerouslySetInnerHTML={{ __html: bullet(f, true) }} />
              ))}
            </ul>
            <Link href="/sign-up" className="tBtn tBtnBlock">
              Start growing
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ (objection handling — pure-CSS accordion, zero JS) ── */}
      <section className="tSection tFaqSection">
        <p className="tKicker">Before you start</p>
        <h2 className="tH2">The gentle questions</h2>
        <div className="tFaq">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="tFaqItem">
              <summary className="tFaqQ">
                {q}
                <span aria-hidden className="tFaqMark" />
              </summary>
              <p className="tFaqA" dangerouslySetInnerHTML={{ __html: a }} />
            </details>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="tFinal">
        <h2 className="tFinalH">Your garden is waiting.</h2>
        <p className="tFinalSub">Plant your first egg tonight. Wake up to something growing.</p>
        <Link href="/sign-up" className="tBtn tBtnLg tBtnOnDark">
          Hatch your first egg — free
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="tFooter">
        <span className="tLogo" style={{ fontSize: 16, color: "rgba(0,0,0,0.25)" }}>
          tend<span style={{ color: GREEN }}>.</span>
        </span>
        <p className="tFooterText">Every good day grows your world.</p>
        <p className="tFooterCopy">© 2026 Tend</p>
      </footer>

      {/* ── Mobile sticky CTA (thumb zone) ── */}
      <div className="tStickyBar">
        <Link href="/sign-up" className="tBtn tBtnBlock">
          Hatch your first egg — free
        </Link>
      </div>
    </main>
  );
}

function bullet(label: string, pro = false): string {
  const c = pro ? "#F5A623" : GREEN;
  return `<span class="tBulletCheck" style="color:${c}">✓</span><span>${label}</span>`;
}

/**
 * The evolution journey shown on the landing. Uses ONE species (16 = Ancient
 * Verdant, a nature legendary — on-brand green) across all five real stages so
 * the payoff is honest: stage 0 is the species egg, stages 1–4 are the dragon
 * growing (matching the in-app "grows via display size" model). Day labels are
 * the real STAGE_THRESHOLDS [0,3,7,14,30] → Day 1/3/7/14/30, so the timeline is
 * a truthful promise, not marketing fiction.
 */
const EVO_SPECIES = 16;
const EVO_STAGES: { stage: number; name: string; day: number; size: number }[] = [
  { stage: 0, name: "Egg", day: 1, size: 40 },
  { stage: 1, name: "Hatchling", day: 3, size: 50 },
  { stage: 2, name: "Whelp", day: 7, size: 62 },
  { stage: 3, name: "Drake", day: 14, size: 76 },
  { stage: 4, name: "Elder", day: 30, size: 92 },
];

/**
 * Objection-handling FAQ — the top reasons someone hesitates before signing up,
 * answered plainly and warmly (2026 conversion best practice: 6 concise items,
 * risk acknowledged then mitigated). Answers allow inline <b>/<a> markup.
 */
const FAQS: { q: string; a: string }[] = [
  {
    q: "What happens if I miss a day?",
    a: "Nothing scary. A slip gently pauses your egg — it never shames you or wipes your progress. And <b>grace tokens</b>, earned free at streak milestones, quietly protect a streak the first time life gets in the way. Tend assumes the best in you.",
  },
  {
    q: "Is Tend really free?",
    a: "Yes — free forever. Three dragon eggs, the full daily check-in, streaks, coins, and every wellness tool cost nothing. <b>Tend+</b> only unlocks more eggs, deeper insights, and garden décor when you’re ready. The whole emotional loop is free.",
  },
  {
    q: "Will it feel good on my phone?",
    a: "That’s the whole point. Tend is built mobile-first — thumb-friendly, fast, and beautiful on a small screen. You can add it to your home screen and open it like any app, no app store required.",
  },
  {
    q: "I’ve abandoned habit apps before. Why is this different?",
    a: "Most trackers are cold checklists that guilt you. Tend is a little garden you <b>want</b> to open — your habits are dragon eggs that visibly warm, hatch, and evolve as you tend them. The reward is emotional, not a red streak counter.",
  },
  {
    q: "What happens to my data?",
    a: "Your data is yours. We never sell it, and it exists to help <i>you</i> understand your own patterns — best days, momentum, what’s working. Export or delete it whenever you like.",
  },
  {
    q: "Can I cancel Tend+ anytime?",
    a: "Anytime, in a tap. If you downgrade you keep every dragon you’ve hatched and every day you’ve grown — nothing you tended disappears.",
  },
];

const CSS = `
:root{ --g:${GREEN}; --gd:${GREEN_DEEP}; }
.tGlow{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;z-index:0;}
.tGlow1{top:-120px;right:-80px;width:360px;height:360px;background:radial-gradient(circle,rgba(46,158,91,0.16),transparent 70%);}
.tGlow2{top:520px;left:-140px;width:420px;height:420px;background:radial-gradient(circle,rgba(245,166,35,0.10),transparent 70%);}

/* nav */
.tNav{position:fixed;top:0;left:0;width:100%;z-index:50;background:rgba(251,250,245,0.8);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid rgba(0,0,0,0.05);}
.tNavInner{max-width:1000px;margin:0 auto;padding:0 18px;height:56px;display:flex;align-items:center;justify-content:space-between;}
.tLogo{font-family:'Fraunces',serif;font-size:21px;font-weight:600;letter-spacing:-0.5px;}
.tNavSignIn{font-size:13.5px;font-weight:600;color:rgba(0,0,0,0.6);text-decoration:none;padding:8px 12px;border-radius:10px;}
.tNavSignIn:hover{color:${INK};}

/* buttons */
.tBtn{display:inline-flex;align-items:center;justify-content:center;gap:6px;font-family:inherit;font-weight:600;color:#fff;background:linear-gradient(135deg,var(--g),var(--gd));text-decoration:none;border-radius:14px;box-shadow:0 6px 20px rgba(46,158,91,0.28);transition:transform .15s ease,box-shadow .15s ease;white-space:nowrap;}
.tBtn:active{transform:scale(0.97);}
.tBtnSm{font-size:13.5px;padding:9px 16px;border-radius:11px;box-shadow:0 3px 12px rgba(46,158,91,0.24);}
.tBtnLg{font-size:15.5px;padding:15px 30px;}
.tBtnBlock{width:100%;font-size:15px;padding:15px 22px;}
.tBtnGhost{background:#fff;color:${GREEN_DEEP};box-shadow:none;border:1.5px solid rgba(46,158,91,0.25);}
.tBtnOnDark{box-shadow:0 8px 28px rgba(0,0,0,0.35);}
.tBtn:hover{transform:translateY(-1px);box-shadow:0 10px 26px rgba(46,158,91,0.34);}

/* hero */
.tHero{position:relative;z-index:1;max-width:640px;margin:0 auto;padding:104px 24px 40px;text-align:center;}
.tEyebrow{display:inline-block;font-size:12.5px;font-weight:600;color:${GREEN_DEEP};background:rgba(46,158,91,0.10);padding:7px 14px;border-radius:100px;margin-bottom:20px;}
.tH1{font-family:'Fraunces',serif;font-size:40px;line-height:1.08;font-weight:600;letter-spacing:-1.4px;margin:0 0 16px;}
.tH1Accent{color:${GREEN};}
.tHeroSub{font-size:16px;line-height:1.55;color:rgba(0,0,0,0.6);max-width:440px;margin:0 auto 8px;}
.tHeroArt{position:relative;height:230px;margin:14px auto 4px;display:flex;align-items:center;justify-content:center;}
.tHeroDisc{position:absolute;width:230px;height:230px;border-radius:50%;background:radial-gradient(circle at 50% 42%,rgba(46,158,91,0.16),rgba(46,158,91,0.05) 55%,transparent 72%);}
.tHeroDragon{position:relative;width:168px;height:168px;object-fit:contain;filter:drop-shadow(0 18px 26px rgba(31,122,70,0.28));animation:tFloat 4s ease-in-out infinite;}
.tHeroEgg{position:absolute;width:52px;height:52px;object-fit:contain;filter:drop-shadow(0 8px 12px rgba(0,0,0,0.14));}
.tHeroEgg1{left:8%;top:26%;animation:tFloat 3.4s ease-in-out infinite;}
.tHeroEgg2{right:6%;top:16%;width:44px;height:44px;animation:tFloat 3.8s ease-in-out infinite .5s;}
.tHeroEgg3{right:14%;bottom:8%;width:40px;height:40px;animation:tFloat 3.1s ease-in-out infinite .9s;}
.tHeroCtas{display:flex;flex-direction:column;align-items:center;gap:10px;margin-top:10px;}
.tHeroFinePrint{font-size:12.5px;color:rgba(0,0,0,0.55);}
.tTrustRow{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:26px;}
.tTrustChip{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:500;color:rgba(0,0,0,0.58);background:#fff;border:1px solid rgba(0,0,0,0.06);padding:7px 12px;border-radius:100px;box-shadow:0 1px 3px rgba(0,0,0,0.03);}

/* generic section */
.tSection{position:relative;z-index:1;max-width:940px;margin:0 auto;padding:44px 24px;}
.tKicker{font-size:12.5px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${GREEN};text-align:center;margin:0 0 8px;}
.tH2{font-family:'Fraunces',serif;font-size:28px;font-weight:600;letter-spacing:-0.7px;text-align:center;margin:0 0 28px;line-height:1.15;}

/* steps */
.tSteps{display:grid;gap:16px;}
.tStep{background:#fff;border:1px solid rgba(0,0,0,0.05);border-radius:20px;padding:24px 22px;text-align:center;box-shadow:0 2px 14px rgba(0,0,0,0.03);}
.tStepArt{position:relative;width:96px;height:96px;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle,rgba(46,158,91,0.10),transparent 70%);border-radius:50%;}
.tStepSprite{width:76px;height:76px;object-fit:contain;filter:drop-shadow(0 8px 12px rgba(31,122,70,0.16));animation:tFloat 4s ease-in-out infinite;}
.tStepNum{position:absolute;top:0;right:6px;width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,var(--g),var(--gd));color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(46,158,91,0.3);}
.tStepTitle{font-family:'Fraunces',serif;font-size:19px;font-weight:600;margin:0 0 6px;}
.tStepBody{font-size:14px;line-height:1.55;color:rgba(0,0,0,0.6);margin:0;}

/* bento */
.tBento{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.tCard{background:#fff;border:1px solid rgba(0,0,0,0.05);border-radius:20px;padding:22px;box-shadow:0 2px 14px rgba(0,0,0,0.03);}
.tCardWide{grid-column:1 / -1;}
.tCardIcon{width:44px;height:44px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:14px;}
.tCardTitle{font-family:'Fraunces',serif;font-size:19px;font-weight:600;margin:0 0 6px;}
.tCardBody{font-size:14px;line-height:1.55;color:rgba(0,0,0,0.6);margin:0;}

/* evolution journey */
.tEvoSection{padding-bottom:36px;}
.tEvoIntro{font-size:15px;line-height:1.55;color:rgba(0,0,0,0.6);text-align:center;max-width:480px;margin:-16px auto 30px;}
.tEvoScroll{overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;padding:6px 0 4px;}
.tEvoScroll::-webkit-scrollbar{display:none;}
.tEvoRail{position:relative;display:flex;align-items:flex-end;gap:4px;width:max-content;min-width:100%;justify-content:space-between;padding:0 4px;}
.tEvoGround{position:absolute;left:0;right:0;bottom:52px;height:3px;border-radius:3px;background:linear-gradient(90deg,rgba(46,158,91,0.12),rgba(46,158,91,0.5) 55%,rgba(245,166,35,0.6));z-index:0;}
.tEvoStage{position:relative;z-index:1;flex:0 0 auto;display:flex;flex-direction:column;align-items:center;text-align:center;min-width:54px;}
.tEvoPod{height:104px;display:flex;align-items:flex-end;justify-content:center;}
.tEvoSprite{object-fit:contain;filter:drop-shadow(0 8px 12px rgba(31,122,70,0.2));animation:tFloat 4s ease-in-out infinite;}
.tEvoStageLast .tEvoSprite{filter:drop-shadow(0 10px 18px rgba(245,166,35,0.4)) drop-shadow(0 0 14px rgba(245,166,35,0.35));}
.tEvoDay{margin-top:16px;font-size:11px;font-weight:700;letter-spacing:0.3px;color:#fff;background:linear-gradient(135deg,var(--g),var(--gd));padding:3px 9px;border-radius:100px;box-shadow:0 2px 6px rgba(46,158,91,0.28);}
.tEvoStageLast .tEvoDay{background:linear-gradient(135deg,#F5A623,#E08A00);box-shadow:0 2px 6px rgba(245,166,35,0.35);}
.tEvoName{margin-top:7px;font-family:'Fraunces',serif;font-size:13px;font-weight:600;color:${INK};line-height:1.15;}
.tEvoFoot{text-align:center;font-size:13.5px;color:rgba(0,0,0,0.55);margin:26px auto 0;max-width:440px;line-height:1.5;}

/* showcase (dark) */
.tShowcase{position:relative;z-index:1;background:linear-gradient(160deg,#122019,#0B1510);padding:52px 24px;margin-top:24px;text-align:center;overflow:hidden;}
.tShowcaseSub{font-size:14.5px;color:rgba(255,255,255,0.5);max-width:420px;margin:0 auto 30px;line-height:1.5;}
.tDragonStrip{display:flex;gap:14px;overflow-x:auto;padding:6px 2px 14px;scrollbar-width:none;-webkit-overflow-scrolling:touch;justify-content:flex-start;}
.tDragonStrip::-webkit-scrollbar{display:none;}
.tDragonChip{flex:0 0 auto;width:84px;height:84px;object-fit:contain;padding:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:18px;filter:drop-shadow(0 8px 12px rgba(0,0,0,0.3));animation:tFloat 4.5s ease-in-out infinite;}

/* promise */
.tPromise{padding-top:20px;}
.tPromiseCard{position:relative;background:linear-gradient(135deg,#EAF7EE,#F7FBF2);border:1px solid rgba(46,158,91,0.12);border-radius:24px;padding:34px 28px;text-align:center;max-width:640px;margin:0 auto;}
.tPromiseMark{font-family:'Fraunces',serif;font-size:64px;line-height:0.6;color:rgba(46,158,91,0.35);display:block;height:34px;}
.tPromiseText{font-family:'Fraunces',serif;font-size:20px;line-height:1.45;font-weight:500;color:${INK};margin:0 0 14px;}
.tPromiseWho{font-size:13px;color:rgba(0,0,0,0.55);margin:0;}

/* pricing */
.tPlans{display:grid;gap:16px;max-width:560px;margin:0 auto;}
.tPlan{position:relative;background:#fff;border:1px solid rgba(0,0,0,0.07);border-radius:22px;padding:26px 24px;}
.tPlanPro{border:2px solid ${GREEN};box-shadow:0 10px 30px rgba(46,158,91,0.14);}
.tPlanBadge{position:absolute;top:-12px;left:24px;background:linear-gradient(135deg,var(--g),var(--gd));color:#fff;font-size:11px;font-weight:700;letter-spacing:0.5px;padding:5px 12px;border-radius:100px;text-transform:uppercase;}
.tPlanName{font-family:'Fraunces',serif;font-size:20px;font-weight:600;margin-bottom:6px;}
.tPlanPrice{font-size:34px;font-weight:700;letter-spacing:-1px;}
.tPlanPer{font-size:15px;font-weight:500;color:rgba(0,0,0,0.55);}
.tPlanNote{font-size:12.5px;color:${GREEN_DEEP};font-weight:600;margin-top:2px;}
.tPlanList{list-style:none;padding:0;margin:16px 0 20px;display:flex;flex-direction:column;gap:9px;}
.tPlanList li{display:flex;align-items:flex-start;gap:9px;font-size:14px;color:rgba(0,0,0,0.62);}
.tBulletCheck{font-weight:800;flex-shrink:0;}

/* faq — native <details> accordion, no JS */
.tFaqSection{max-width:680px;padding-top:24px;}
.tFaq{display:flex;flex-direction:column;gap:10px;}
.tFaqItem{background:#fff;border:1px solid rgba(0,0,0,0.07);border-radius:16px;padding:2px 18px;box-shadow:0 1px 2px rgba(0,0,0,0.03);transition:border-color .2s;}
.tFaqItem[open]{border-color:rgba(46,158,91,0.35);}
.tFaqQ{display:flex;align-items:center;justify-content:space-between;gap:14px;cursor:pointer;list-style:none;padding:16px 0;font-family:'Fraunces',serif;font-size:16.5px;font-weight:600;color:${INK};line-height:1.3;}
.tFaqQ::-webkit-details-marker{display:none;}
.tFaqQ:focus-visible{outline:2px solid ${GREEN};outline-offset:3px;border-radius:6px;}
.tFaqMark{position:relative;flex-shrink:0;width:16px;height:16px;}
.tFaqMark::before,.tFaqMark::after{content:"";position:absolute;top:50%;left:50%;width:12px;height:2px;border-radius:2px;background:${GREEN};transform:translate(-50%,-50%);transition:transform .25s ease;}
.tFaqMark::after{transform:translate(-50%,-50%) rotate(90deg);}
.tFaqItem[open] .tFaqMark::after{transform:translate(-50%,-50%) rotate(0deg);}
.tFaqA{margin:0 0 16px;font-size:14.5px;line-height:1.6;color:rgba(0,0,0,0.66);}
.tFaqA b{color:${GREEN_DEEP};font-weight:700;}
.tFaqA i{font-style:italic;}

/* final */
.tFinal{position:relative;z-index:1;text-align:center;background:linear-gradient(160deg,#1F7A46,#13512F);margin-top:8px;padding:60px 24px 72px;color:#fff;}
.tFinalH{font-family:'Fraunces',serif;font-size:30px;font-weight:600;letter-spacing:-0.8px;margin:0 0 10px;}
.tFinalSub{font-size:15.5px;color:rgba(255,255,255,0.9);margin:0 0 26px;line-height:1.5;}
.tBtnOnDark{background:#fff;color:${GREEN_DEEP};}

/* footer */
.tFooter{text-align:center;padding:34px 20px 96px;background:#FBFAF5;}
.tFooterText{font-size:13px;color:rgba(0,0,0,0.55);margin:8px 0 2px;}
.tFooterCopy{font-size:11.5px;color:rgba(0,0,0,0.55);margin:0;}

/* mobile sticky CTA */
.tStickyBar{position:fixed;left:0;bottom:0;width:100%;z-index:40;padding:12px 16px calc(12px + env(safe-area-inset-bottom,0px));background:rgba(251,250,245,0.9);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-top:1px solid rgba(0,0,0,0.06);}

@keyframes tFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}

/* ≥640px: scale up, hide sticky bar, multi-column */
@media(min-width:640px){
  .tH1{font-size:56px;letter-spacing:-2px;}
  .tHeroSub{font-size:17.5px;}
  .tHeroArt{height:280px;}
  .tHeroDragon{width:210px;height:210px;}
  .tH2{font-size:34px;}
  .tSteps{grid-template-columns:repeat(3,1fr);}
  .tBento{grid-template-columns:repeat(2,1fr);}
  .tCardWide{grid-column:span 1;}
  .tEvoIntro{font-size:16px;}
  .tEvoRail{max-width:660px;margin:0 auto;padding:0 12px;}
  .tPlans{grid-template-columns:1fr 1fr;max-width:640px;}
  .tStickyBar{display:none;}
  .tFooter{padding-bottom:40px;}
  .tDragonStrip{justify-content:center;flex-wrap:wrap;overflow-x:visible;}
}
@media(prefers-reduced-motion:reduce){
  .tHeroDragon,.tHeroEgg,.tStepSprite,.tDragonChip,.tEvoSprite{animation:none!important;}
}
`;
