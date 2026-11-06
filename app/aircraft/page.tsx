import Link from "next/link";
import { Navbar } from "@/components/navigation/Navbar";
import { aircraft } from "@/data/aircraft";

export const metadata = {
  title: "Aircraft",
  description:
    "Vajra, Tejas and Garuda — the Regular, Micro and Advanced Class aircraft Skylark designed, built and flew for the 2026 season.",
};

/**
 * The fleet.
 *
 * A full-height row per aircraft rather than three cards: each one gets its own
 * band of the page, with the headline specs set as data and the mission as the
 * only prose. Hovering lifts the row; the whole band is the link.
 */
export default function AircraftIndex() {
  return (
    <>
      <Navbar />

      <main id="main" className="subpage pt-[var(--nav-h)]">
        <section className="mx-auto max-w-[1500px] px-[5vw] py-14 lg:py-20">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 bg-ember-500" />
            <span className="label-meta text-ivory-200">03 — Aircraft</span>
          </div>
          <h1 className="h-display mt-5">
            Three classes.
            <br />
            <span className="text-ember-500">One season.</span>
          </h1>
          <p className="prose-skylark mt-6">
            Skylark enters the Regular, Micro and Advanced classes of SAE Aero Design in the same
            year — three aircraft, designed and built in parallel, each answering a different
            mission.
          </p>
        </section>

        <section className="border-t border-white/[0.1]">
          {aircraft.map((a, i) => (
            <Link
              key={a.slug}
              href={`/aircraft/${a.slug}`}
              className="group block border-b border-white/[0.1] no-underline transition-colors hover:bg-navy-800"
            >
              <div className="mx-auto grid max-w-[1500px] items-center gap-6 px-[5vw] py-10 lg:grid-cols-[90px_minmax(0,1fr)_minmax(0,1.1fr)_120px]">
                <span className="font-mono text-heading tabular-nums text-ember-500">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div>
                  <span className="label-meta">
                    {a.className} Class · {a.year}
                  </span>
                  <h2 className="h-title mt-1 transition-colors group-hover:text-ember-500">
                    {a.name}
                  </h2>
                </div>

                <div>
                  <p className="prose-skylark text-caption">{a.mission}</p>
                  <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
                    {a.specs
                      .filter((s) =>
                        ["Wingspan", "Empty weight", "Design payload"].includes(s.label),
                      )
                      .map((s) => (
                        <div key={s.label}>
                          <dt className="label-meta">{s.label}</dt>
                          <dd className="font-mono text-sub tabular-nums text-ivory-50">
                            {s.value ?? "—"}
                          </dd>
                        </div>
                      ))}
                  </dl>
                </div>

                <span className="link-action justify-self-start lg:justify-self-end">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </section>
      </main>
    </>
  );
}
