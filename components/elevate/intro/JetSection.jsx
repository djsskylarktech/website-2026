import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger, BREAKPOINT, charReveal, lineReveal, childReveal } from "./motion";
import RoverModel from "./RoverModel";

const PRIZES = [
  { place: "2026 · Micro · Design Report", amount: "1st" },
  { place: "2026 · Regular · Oral Presentation", amount: "2nd" },
  { place: "2026 · Micro · Oral Presentation", amount: "3rd" },
];

// the road to the finale, exactly as issued
const TIMELINE = [
  ["01", "", "Define the mission"],
  ["02", "", "Explore configurations"],
  ["03", "", "Analyse aerodynamics"],
  ["04", "", "Design the structure"],
  ["05", "", "Build and test prototypes"],
  ["06", "", "Fly, measure and refine"],
];

// the six tracks, numbered like the timeline's dates so the two lists read
// as a matched pair either side of the jet
const TRACKS = [
  ["01", "", "Aerodynamics"],
  ["02", "", "Structures & stability"],
  ["03", "", "Avionics"],
  ["04", "", "Manufacturing"],
  ["05", "", "Flight testing"],
  ["06", "", "Design reporting"],
];

function Schedule({ rows, phase }) {
  return (
    <ol className="jx-sched" data-phase={phase}>
      {rows.map(([date, time, what]) => (
        <li className="jx-sched__row" key={what}>
          <div className="jx-line-h jx-line-h--ink" />
          <div className="jx-u12" />
          <div className="jx-sched__line">
            <span className="jx-sched__time">{date}</span>
            <span className="jx-sched__what">
              {what}
              {time && <em className="jx-sched__at">{time}</em>}
            </span>
          </div>
          <div className="jx-u12" />
        </li>
      ))}
    </ol>
  );
}

/* Prize pool, then the two-day schedule, then the finale cabin.
   One jet carries the section: it rises into frame as the prize pool is
   revealed, shrinks toward the top as the schedule slides in (10 October
   first, 11 October second), and finally turns into a cabin plan whose
   thirty empty seats are the thirty finalist places still up for grabs. */
export default function JetSection() {
  const root = useRef(null);

  useLayoutEffect(() => {
    const el = root.current;
    const $ = (s) => el.querySelector(s);
    const header = document.querySelector("[data-jx-header]");
    let disposed = false;

    const ctx = gsap.context((self) => {
      self.add("build", () => {
        const area = $("[data-jet-area]");

        // the cream wash takes over from the sky
        gsap.fromTo($("[data-light-bg]"), { opacity: 0 }, {
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: area, start: "top top", end: "center center", scrub: true },
        });

        // keep the site's floating chrome out of this section too
        ScrollTrigger.create({
          trigger: el,
          start: "top bottom",
          end: "bottom 60%",
          onToggle: (st) => document.documentElement.classList.toggle("in-jet", st.isActive),
        });

        // dark header over the light section
        ScrollTrigger.create({
          trigger: area,
          start: "top top-=75%",
          end: "bottom top",
          onToggle: (st) => header?.classList.toggle("jx-header--ink", st.isActive),
        });

        // prize copy arrives as the section does
        el.querySelectorAll("[data-jet-chars]").forEach((t) => {
          const tween = charReveal(t, { paused: true });
          ScrollTrigger.create({ trigger: t, start: "top bottom", once: true, onEnter: () => tween.play() });
        });
        el.querySelectorAll("[data-jet-lines]").forEach((t) => {
          const tween = lineReveal(t, { paused: true });
          ScrollTrigger.create({ trigger: t, start: "top bottom", once: true, onEnter: () => tween.play() });
        });
        el.querySelectorAll("[data-jet-divs]").forEach((t) => {
          const tween = childReveal(t, { paused: true });
          ScrollTrigger.create({ trigger: t, start: "top bottom", once: true, onEnter: () => tween.play() });
        });

        const badge = $("[data-seat-badge]");

        // a schedule phase: its heading, then its rows one after another
        const phase = (n, trigger) => {
          const head = el.querySelectorAll(`[data-phase-day="${n}"] > *`);
          const rows = el.querySelectorAll(`[data-phase="${n}"] .jx-sched__row`);
          gsap.fromTo([...head, ...rows], { opacity: 0, filter: "blur(18px)", y: 12 }, {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            ease: "Out",
            stagger: 0.12,
            scrollTrigger: trigger,
          });
        };

        const mm = gsap.matchMedia();
        mm.add(`(min-width: ${BREAKPOINT}px)`, () => {
          const at = (start, end, extra = {}) => ({ trigger: area, start, end, ...extra });

          // prize panel slides out below as the schedule slides in from above
          gsap.fromTo([$("[data-jet-w]"), $("[data-spec-w]")], { yPercent: 0 }, {
            yPercent: 100,
            ease: "none",
            scrollTrigger: at("50% center", "85% bottom", { scrub: 1.2 }),
          });

          // jet shrinks toward the top of the frame
          gsap.fromTo($("[data-jet]"), { scale: 1, yPercent: 0 }, {
            scale: 0.62,
            yPercent: -15,
            ease: "In",
            scrollTrigger: at("25% center", "85% bottom", { scrub: 1.2 }),
          });

          // phase one (10 October) lands with the panel, phase two (11 October) after it
          phase(1, at("58% center", "85% bottom", { scrub: true }));
          phase(2, at("85% bottom", "95% bottom", { scrub: true }));

          // streaks in sideways under a directional (horizontal-only) motion blur
          const blur = $("[data-dirblur]");
          const badgeIn = gsap.timeline({ scrollTrigger: at("74% bottom", "84% bottom", { scrub: true }) });
          badgeIn
            .fromTo(badge, { opacity: 0, xPercent: -10 }, { opacity: 1, xPercent: 0, ease: "Out", duration: 1 }, 0)
            .fromTo(blur, { attr: { stdDeviation: "48 0" } }, { attr: { stdDeviation: "0 0" }, ease: "Out", duration: 1 }, 0);
        });

        mm.add(`(max-width: ${BREAKPOINT - 1}px)`, () => {
          const plane = $("[data-jet]");
          phase(1, { trigger: $('[data-phase="1"]'), start: "top 90%", end: "bottom 70%", scrub: true });
          phase(2, { trigger: $('[data-phase="2"]'), start: "top 90%", end: "bottom 70%", scrub: true });

          // the jet settles in size as it scrolls through — desktop shrinks it
          // into the schedule pin; here, with nothing pinned, a gentle zoom as
          // it crosses the viewport reads as the same "coming in to land" beat
          gsap.fromTo(plane, { scale: 1.16 }, {
            scale: 0.86,
            ease: "none",
            scrollTrigger: { trigger: plane, start: "top bottom", end: "bottom top", scrub: true },
          });

          gsap.fromTo(badge, { opacity: 0, y: 16 }, {
            opacity: 1,
            y: 0,
            scrollTrigger: { trigger: badge, start: "top 95%", end: "top 70%", scrub: true },
          });
        });

        return () => mm.revert();
      });
    }, el);

    const fontsIn = document.fonts?.ready ?? Promise.resolve();
    Promise.race([fontsIn, new Promise((r) => setTimeout(r, 1500))]).then(() => {
      if (disposed) return;
      ctx.build();
      ScrollTrigger.refresh();
    });

    return () => {
      disposed = true;
      header?.classList.remove("jx-header--ink");
      document.documentElement.classList.remove("in-jet");
      ctx.revert();
    };
  }, []);

  return (
    <section className="jx jx-jet" data-label="Achievements" ref={root}>
      <div className="jx-jet-area" data-jet-area>
        <div className="jx-jet-switcher">
          <div className="jx-light-bg" data-light-bg />

          {/* ---------------- prize pool ---------------- */}
          <div className="jx-jet-w" data-jet-w>
            <div className="jx-jet-s">
              <div className="jx-jet-s__top" />
              <div className="jx-jet-s__bot">
                <div className="jx-grid jx-fill jx-jet-s__prizeRow">
                  <div className="jx-jet-s__sub">
                    <h2 className="jx-h1" data-jet-chars>
                      Our <br /> Results
                    </h2>
                  </div>
                  <div className="jx-jet-s__desc">
                    <ul className="jx-prizes jx-prizes--lg" data-jet-divs>
                      {PRIZES.map((p) => (
                        <li key={p.place}>
                          <span className="jx-p7 jx-gray-ink">{p.place}</span>
                          <span className="jx-h2 jx-ink">{p.amount}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="jx-u24" />
                    <p className="jx-p7 jx-gray-ink" data-jet-lines>
                      Three worldwide SAE Aero Design podium results in 2026, built on ten years of student engineering.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- schedule, two phases ---------------- */}
          <div className="jx-spec-w" data-spec-w>
            <div className="jx-spec-s">
              <div className="jx-u96" />
              <div className="jx-line-h jx-line-h--ink" />
              <div className="jx-grid jx-fill">
                <div className="jx-spec-s__col jx-spec-s__col--l">
                  <div className="jx-spec-day" data-phase-day="1">
                    <div className="jx-u12" />
                    <div className="jx-p5">Flight plan</div>
                    <div className="jx-u24" />
                    <div className="jx-h2 jx-ink">Process</div>
                  </div>
                  <div className="jx-sched-wrap">
                    <Schedule rows={TIMELINE} phase="1" />
                  </div>
                </div>

                <div className="jx-spec-s__center">
                  <svg className="jx-svg-defs" aria-hidden="true">
                    <filter id="jx-dirblur" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur data-dirblur stdDeviation="0 0" />
                    </filter>
                  </svg>
                  <div className="jx-seat-badge" data-seat-badge>
                    <div className="jx-l1 jx-gray">DJS Skylark · Mumbai</div>
                    <div className="jx-u12" />
                    <div className="jx-seat-badge__pill">
                      <i className="jx-seat-badge__dot" />
                      <span className="jx-t7">
                        <span className="jx-seat-badge__n">3</span> aircraft · one team
                      </span>
                    </div>
                  </div>
                </div>

                <div className="jx-spec-s__col jx-spec-s__col--r">
                  <div className="jx-spec-day" data-phase-day="2">
                    <div className="jx-u12" />
                    <div className="jx-p5">Our disciplines</div>
                    <div className="jx-u24" />
                    <div className="jx-h2 jx-ink">Systems</div>
                  </div>
                  <div className="jx-sched-wrap">
                    <Schedule rows={TRACKS} phase="2" />
                  </div>
                </div>
              </div>
              <div className="jx-u36" />
            </div>
          </div>
        </div>

        {/* nav target: the point where both schedule phases are on screen */}
        <div className="jx-jet-anchor jx-jet-anchor--prizes" id="prizes" aria-hidden="true" />
        <div className="jx-jet-anchor" id="schedule" aria-hidden="true" />

        {/* ---------------- the rover ---------------- */}
        <div className="jx-jet-plane">
          <div className="jx-jet-plane__scale" data-jet>
            <div className="jx-jet-box" data-jet-box>
              <RoverModel />
            </div>
          </div>
        </div>
      </div>
      <div className="jx-jet-tail" aria-hidden="true" />
    </section>
  );
}
