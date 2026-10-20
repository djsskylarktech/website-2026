"use client";

import Link from "next/link";
import { useState } from "react";
import { FlightScroll } from "@/components/FlightScroll";
import { FlightIntro } from "@/components/FlightIntro";
import { FlightAudio } from "@/components/FlightAudio";
import { FlightScene } from "@/components/3d/FlightScene";
import { GoogleCityAttribution } from "@/components/3d/GoogleCity";
import { FlightPanel, FlightPanelLayer } from "@/components/content/FlightPanel";
import { FlightTelemetry } from "@/components/content/FlightTelemetry";
import { FleetTabs } from "@/components/content/FleetTabs";
import { PanelFrame } from "@/components/content/PanelFrame";
import { Navbar } from "@/components/navigation/Navbar";
import { SpecFigure } from "@/components/ui/SpecList";
import { Placeholder } from "@/components/ui/Placeholder";
import { aircraft, HERO_AIRCRAFT } from "@/data/aircraft";
import { achievementsByYear, TEAM_FACTS, UNVERIFIED_YEARS } from "@/data/achievements";
import { FLIGHT_SCROLL_VH } from "@/data/flight";
import { useCapability } from "@/lib/use-capability";
import { StaticHome } from "./StaticHome";

/**
 * The homepage: one continuous flight, with content windows opening along it.
 *
 * Structure is deliberately simple — a tall scroll container, a fixed 3D scene
 * behind it and a fixed panel layer in front. Nothing here scrolls in the
 * ordinary sense; scroll position is read as flight progress and everything
 * else is positioned from that.
 */
export function FlightHome() {
  const tier = useCapability();
  const [showStory, setShowStory] = useState(true);

  // Reduced motion and weak devices get an ordinary, fully readable page rather
  // than a degraded version of the flight.
  if (tier === "static") {
    return (
      <>
        <Navbar />
        <StaticHome />
      </>
    );
  }

  return (
    <>
      <FlightScroll enabled />
      <FlightAudio />
      <FlightScene tier={tier} />
      <FlightIntro />
      <Navbar overFlight />
      <FlightTelemetry showStory={showStory} onToggleStory={() => setShowStory(value => !value)} />
      <GoogleCityAttribution apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} />

      {showStory ? <FlightPanelLayer>
        <Opening />
        <About />
        <Achievements />
        <Fleet />
        <Engineering />
        <FlightLogTeaser />
        <Team />
        <Sponsors />
        <Join />
      </FlightPanelLayer> : null}

      {/* The scroll driver. Its only job is to give the page length for the
          flight to be read from; all content sits in the fixed layer above. */}
      <main id="main" style={{ height: `${FLIGHT_SCROLL_VH}vh` }} aria-hidden="true" />

      {/* The flight is visual. This is the same content as a document, so the
          page is navigable and indexable without running the 3D scene. */}
      <div className="sr-only">
        <StaticHome />
      </div>
    </>
  );
}

function Opening() {
  return (
    <FlightPanel scene="start" side="left">
      {/* The wordmark already sits in the navbar; repeating it here just
          collides with it. This line carries the place instead. */}
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 shrink-0 bg-ember-500" />
        <span className="label-meta text-ivory-200">Mumbai, India</span>
      </div>

      <h1 className="h-display mt-6">
        We engineer
        <br />
        <span className="text-ember-500">flight.</span>
      </h1>

      {/* Three facts, set as data rather than prose. Gives the opening frame
          structure instead of another paragraph of white text. */}
      <dl className="mt-9 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/[0.14] pt-5">
        {[
          { k: "Competing since", v: String(TEAM_FACTS.competingSince) },
          { k: "Classes entered", v: "3" },
          { k: "Members", v: String(TEAM_FACTS.memberCount) },
        ].map(({ k, v }) => (
          <div key={k}>
            <dt className="label-meta">{k}</dt>
            <dd className="font-mono text-heading tabular-nums text-ivory-50">{v}</dd>
          </div>
        ))}
      </dl>

      {/* Two ways out of the hero for anyone who does not want to fly the whole
          page: the fleet, and the thing sponsors actually come here for. */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          href="/aircraft"
          className="label-meta bg-ember-500 px-5 py-3 text-navy-900 transition-colors hover:bg-ember-400"
        >
          Explore our aircraft →
        </Link>
        <Link
          href="/sponsors"
          className="label-meta border border-white/30 px-5 py-3 text-ivory-100 transition-colors hover:border-ember-500 hover:text-ember-500"
        >
          Partner with us
        </Link>
      </div>

      <p className="label-meta mt-9 flex items-center gap-3 text-ivory-300">
        <span className="inline-block h-px w-10 bg-ember-500" />
        Scroll to take off
      </p>
    </FlightPanel>
  );
}

function About() {
  return (
    <FlightPanel scene="about">
      <PanelFrame index="01" label="About">
        <h2 className="h-title">
          A student-built aerospace team from Mumbai.
        </h2>
        <p className="prose-skylark mt-5">
          DJS Skylark is the Aero Design team of {TEAM_FACTS.college}. We design, build and fly
          radio-controlled aircraft for SAE Aero Design, and have competed since{" "}
          {TEAM_FACTS.competingSince} — entering the Regular, Micro and Advanced classes
          simultaneously.
        </p>
        <p className="prose-skylark mt-4">
          Three aircraft, built in parallel, by {TEAM_FACTS.memberCount} people across aerodynamics,
          structures and stability, avionics and marketing.
        </p>
        <Link
          href="/sae"
          className="label-meta mt-7 inline-flex items-center gap-2 text-ember-500 hover:underline"
        >
          Our story →
        </Link>
      </PanelFrame>
    </FlightPanel>
  );
}

function Achievements() {
  const years = achievementsByYear();

  return (
    <FlightPanel scene="achievements">
      <PanelFrame index="02" label="Achievements" side="right">
        <h2 className="h-title">SAE Aero Design</h2>

        <div className="mt-7 space-y-6">
          {years.slice(0, 3).map(({ year, results }) => (
            <div key={year} className="flex gap-6 border-t border-white/[0.12] pt-4">
              {/* Wide enough for the "Unconfirmed" marker to sit under the year
                  rather than running into the placings beside it. */}
              <div className="w-[5.5rem] shrink-0">
                <span className="font-mono text-heading tabular-nums text-ember-500">{year}</span>
                {UNVERIFIED_YEARS.includes(year) ? (
                  <span className="label-meta mt-1 block leading-tight text-ember-300/70">
                    Unconfirmed
                  </span>
                ) : null}
              </div>
              <ul className="flex-1 space-y-1.5">
                {results.map((r) => (
                  <li key={`${r.className}-${r.category}`} className="flex items-baseline gap-3">
                    <span className="font-mono text-sub tabular-nums text-ivory-50">
                      {ordinal(r.place)}
                    </span>
                    <span className="text-caption text-ivory-200">
                      {r.className} · {r.category}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="prose-skylark mt-7 text-ivory-300">
          Skylark competes in all three classes in the same season.
        </p>
      </PanelFrame>
    </FlightPanel>
  );
}

function Fleet() {
  return (
    <FlightPanel scene="fleet">
      <PanelFrame index="03" label="Our aircraft" side="right">
        <FleetTabs />
      </PanelFrame>
    </FlightPanel>
  );
}

function Engineering() {
  const h = HERO_AIRCRAFT.highlights[0];

  return (
    <FlightPanel scene="engineering">
      <PanelFrame index="04" label="Engineering">
        <h2 className="h-title">From idea to flight.</h2>
        <ol className="label-meta mt-6 flex flex-wrap gap-x-3 gap-y-2 text-ivory-200">
          {["Research", "Design", "Analyse", "Manufacture", "Test", "Fly", "Iterate"].map(
            (step, i) => (
              <li key={step} className="flex items-center gap-3">
                {i > 0 ? <span className="text-ember-500/60">→</span> : null}
                {step}
              </li>
            ),
          )}
        </ol>

        {h.metric ? (
          <div className="mt-8 border-t border-white/[0.09] pt-6">
            <SpecFigure value={h.metric.value} label={h.metric.label} kind={h.metric.kind} />
            <p className="prose-skylark mt-4 text-caption">{h.title}.</p>
          </div>
        ) : null}

        <Link
          href="/engineering"
          className="label-meta mt-7 inline-flex items-center gap-2 text-ember-500 hover:underline"
        >
          How we work →
        </Link>
      </PanelFrame>
    </FlightPanel>
  );
}

function FlightLogTeaser() {
  return (
    <FlightPanel scene="flight-log">
      <PanelFrame index="05" label="Flight log" side="right">
        <h2 className="h-title">Failure is engineering data.</h2>
        <p className="prose-skylark mt-5">
          What we changed, what broke, what we learned, and the number that proved it. The log is
          written from real test entries — it stays empty until those are in.
        </p>
        <div className="mt-6">
          <Placeholder kind="flight-log" note="test and flight entries from the team" />
        </div>
        <Link
          href="/flight-log"
          className="label-meta mt-7 inline-flex items-center gap-2 text-ember-500 hover:underline"
        >
          View full log →
        </Link>
      </PanelFrame>
    </FlightPanel>
  );
}

function Team() {
  return (
    <FlightPanel scene="team">
      <PanelFrame index="06" label="Team">
        <h2 className="h-title">The people behind the flight.</h2>
        <p className="prose-skylark mt-5">
          {TEAM_FACTS.memberCount} members across aerodynamics, structures and stability, avionics
          and marketing, with dedicated Design Report and FDRR sub-teams.
        </p>
        <div className="mt-6">
          <Placeholder kind="data" note="current roster: name, role, year, branch, subsystem" />
        </div>
        <Link
          href="/team"
          className="label-meta mt-7 inline-flex items-center gap-2 text-ember-500 hover:underline"
        >
          Meet the team →
        </Link>
      </PanelFrame>
    </FlightPanel>
  );
}

function Sponsors() {
  return (
    <FlightPanel scene="sponsors">
      <PanelFrame index="07" label="Partners" side="right">
        <h2 className="h-heading">Help us build what flies next.</h2>
        <div className="mt-5">
          <Placeholder kind="logo" note="sponsor logos as SVG or transparent PNG" />
        </div>
        <Link
          href="/sponsors"
          className="label-meta mt-6 inline-flex items-center gap-2 text-ember-500 hover:underline"
        >
          Partner with Skylark →
        </Link>
      </PanelFrame>
    </FlightPanel>
  );
}

function Join() {
  return (
    <FlightPanel scene="join">
      <h2 className="h-display">
        Don&rsquo;t just watch
        <br />
        the flight. <span className="text-ember-500">Build it.</span>
      </h2>
      <p className="prose-skylark mt-6">
        Work on real aircraft. Solve real problems. Learn by doing.
      </p>
      <Link
        href="/join"
        className="label-meta mt-8 inline-block border border-ember-500 px-5 py-3 text-ember-500 transition-colors hover:bg-ember-500 hover:text-navy-900"
      >
        Join Skylark →
      </Link>
    </FlightPanel>
  );
}

function ordinal(n: number): string {
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th";
  return `${n}${suffix}`;
}
