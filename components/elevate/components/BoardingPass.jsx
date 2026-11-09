import { useEffect, useState } from "react";
import useInView, { prefersReducedMotion } from "../hooks/useInView";
import { cue } from "../audio/bus";
import Sponsors from "./Sponsors";

const ROWS = [
  { k: "Team", v: "DJS Skylark" },
  { k: "Home", v: "Mumbai" },
  { k: "Classes", v: "3" },
  { k: "Members", v: "47" },
  { k: "Since", v: "2014" },
];

export default function BoardingPass() {
  const [ref, seen] = useInView(0.45);
  const [backRef, backSeen] = useInView(0.3);
  const [torn, setTorn] = useState(false);
  const cloudUrl = "/images/intro/cloudscape-v2.webp";

  useEffect(() => {
    if (!seen) {
      const id = setTimeout(() => setTorn(false), 0);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => { setTorn(true); cue("stamp"); }, prefersReducedMotion() ? 0 : 900);
    return () => clearTimeout(id);
  }, [seen]);

  return (
    <section id="register" data-label="The fleet" className="pass bp-section">
      {cloudUrl && <img className="pass__cloud" src={cloudUrl} alt="" aria-hidden="true" />}
      <div className="pass__fadeTop" aria-hidden="true" />
      <div className="pass__fadeBottom" aria-hidden="true" />

      <div className="container bp-wrap">
        <div ref={ref} className={`bp ${seen ? "is-in" : ""} ${torn ? "is-torn" : ""}`}>
          <div className="bp__ticket">
            <div className="bp__qr bp__qr--brand" aria-label="DJS Skylark">
              <img src="/brand/djs-skylark-official.png?v=3" alt="DJS Skylark" className="bp__official-logo" loading="lazy" decoding="async" />
              <span className="bp__brandNote">DJS · Aero Design<br />Mumbai, India</span>
            </div>
            <div className="bp__perf" aria-hidden="true" />
            <div className="bp__main">
              <div className="bp__route">
                <div className="bp__place">
                  <span className="bp__city">A problem,<br />an idea</span>
                  <strong className="bp__code">DESIGN</strong>
                  <span className="bp__when">Research · prototype</span>
                </div>
                <div className="bp__path" aria-hidden="true">
                  <span />
                  <svg viewBox="0 0 24 24"><path d="M22 12 L3 5 L6 12 L3 19 Z" fill="currentColor" /></svg>
                  <span />
                </div>
                <div className="bp__place bp__place--to">
                  <span className="bp__city">An aircraft,<br />in flight</span>
                  <strong className="bp__code">FLY</strong>
                  <span className="bp__when">Test · refine</span>
                </div>
              </div>
              <dl className="bp__rows">
                {ROWS.map((r) => <div key={r.k}><dt>{r.k}</dt><dd>{r.v}</dd></div>)}
              </dl>
            </div>
          </div>
          <div className="bp__stub">
            <span className="bp__stubTitle">Flight record</span>
            <span className="bp__stubBrand">SKYLARK</span>
          </div>
        </div>

        <div className="pass__countdown pass__countdown--stats">
          <span className="pass__countLabel">Student-built since 2014</span>
          <div className="pass__countParts">
            <div><strong>03</strong><span>Classes</span></div>
            <div><strong>47</strong><span>Members</span></div>
            <div><strong>12+</strong><span>Years</span></div>
          </div>
        </div>

        <div id="sponsors" ref={backRef} className={`bp-back ${backSeen ? "is-in" : ""}`}>
          <div className="bp-back__perf" aria-hidden="true" />
          <div className="bp-back__head">
            <span className="bp-back__eyebrow">Flight record · Back</span>
            <h3 className="bp-back__title">Meet the fleet</h3>
          </div>
          <Sponsors />
        </div>
      </div>
    </section>
  );
}
