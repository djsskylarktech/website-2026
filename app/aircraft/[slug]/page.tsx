import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/navigation/Navbar";
import { SpecList, SpecFigure } from "@/components/ui/SpecList";
import { PlaceholderBlock } from "@/components/ui/Placeholder";
import { FigureGrid } from "@/components/content/FigureGrid";
import { figuresFor } from "@/data/figures";
import { AircraftViewer } from "@/components/3d/AircraftViewer";
import { aircraft, aircraftBySlug } from "@/data/aircraft";
import { VALUE_KIND_LABEL } from "@/data/types";

export function generateStaticParams() {
  return aircraft.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = aircraftBySlug[slug as keyof typeof aircraftBySlug];
  if (!a) return {};
  return {
    title: `${a.name} — ${a.className} Class`,
    description: a.summary,
  };
}

/**
 * An aircraft dossier.
 *
 * The aircraft dominates the top of the page, then the engineering story, then
 * the numbers. Specifications come last on purpose: the decisions are more
 * interesting than the table, and the table means more once you know why the
 * aircraft is shaped the way it is.
 */
export default async function AircraftPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = aircraftBySlug[slug as keyof typeof aircraftBySlug];
  if (!a) notFound();

  const others = aircraft.filter((x) => x.slug !== a.slug);
  const plates = figuresFor(a.slug);
  const measured = a.specs.filter((s) => s.value === null);

  return (
    <>
      <Navbar />

      <main id="main" className="pt-[var(--nav-h)]">
        {/* --- Hero: the aircraft, large ------------------------------------ */}
        <section className="relative border-b border-white/[0.1]">
          <div className="mx-auto grid max-w-[1500px] gap-8 px-[5vw] py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:items-center lg:py-20">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 bg-ember-500" />
                <span className="label-meta text-ivory-200">{a.className} Class</span>
                <span className="label-meta">{a.year}</span>
              </div>

              <h1 className="h-display mt-5">{a.name}</h1>

              <p className="prose-skylark mt-6">{a.mission}</p>

              <dl className="mt-9 flex flex-wrap gap-x-10 gap-y-4 rule pt-5">
                {a.specs
                  .filter((s) => ["Wingspan", "Empty weight", "Design payload"].includes(s.label))
                  .map((s) => (
                    <div key={s.label}>
                      <dt className="label-meta">{s.label}</dt>
                      <dd className="font-mono text-heading tabular-nums text-ivory-50">
                        {s.value ?? "—"}
                      </dd>
                    </div>
                  ))}
              </dl>
            </div>

            {/* The model, free-orbiting. Falls back to the schematic stand-in
                until a real export is dropped in. */}
            <div className="relative aspect-[4/3] w-full bg-navy-800">
              <AircraftViewer src={a.model} placeholder={a.modelIsPlaceholder} />
              {a.modelIsPlaceholder ? (
                <p className="is-placeholder absolute bottom-3 left-3 px-2 py-1">
                  [ADD GLB] schematic stand-in — not the real {a.name}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        {/* --- Overview ----------------------------------------------------- */}
        <section className="mx-auto max-w-[1500px] px-[5vw] py-16">
          <div className="grid gap-10 lg:grid-cols-[180px_minmax(0,1fr)]">
            <h2 className="label-meta text-ember-500">01 — Overview</h2>
            <p className="max-w-[55ch] font-head text-heading uppercase leading-tight text-ivory-100">
              {a.summary}
            </p>
          </div>
        </section>

        {/* --- Engineering decisions ---------------------------------------- */}
        <section className="mx-auto max-w-[1500px] px-[5vw] pb-16">
          <div className="grid gap-10 lg:grid-cols-[180px_minmax(0,1fr)]">
            <h2 className="label-meta text-ember-500">02 — Design decisions</h2>

            <div className="space-y-px">
              {a.highlights.map((h, i) => (
                <article
                  key={h.title}
                  className="grid gap-6 bg-navy-800 p-7 sm:p-9 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start"
                >
                  <div>
                    <span className="label-meta">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="h-heading mt-3">{h.title}</h3>
                    <p className="prose-skylark mt-4">{h.body}</p>
                    {h.source ? (
                      <p className="label-meta mt-5">Source · {h.source}</p>
                    ) : null}
                  </div>

                  {h.metric ? (
                    <div className="border-l-2 border-ember-500 pl-6 lg:mt-8">
                      <SpecFigure
                        value={h.metric.value}
                        label={h.metric.label}
                        kind={h.metric.kind}
                      />
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* --- Specifications ----------------------------------------------- */}
        <section className="mx-auto max-w-[1500px] px-[5vw] pb-16">
          <div className="grid gap-10 lg:grid-cols-[180px_minmax(0,1fr)]">
            <div>
              <h2 className="label-meta text-ember-500">03 — Specifications</h2>
              <p className="mt-4 max-w-[26ch] text-caption text-slate-400">
                Every value states what kind it is. A design figure is not a result
                the aircraft was recorded achieving.
              </p>
            </div>

            <div>
              <SpecList specs={a.specs.filter((s) => s.value !== null)} columns={2} />

              {measured.length > 0 ? (
                <div className="mt-10 border border-dashed border-ember-500/35 p-6">
                  <h3 className="label-meta text-ember-300">
                    Not yet measured — {measured.length} value
                    {measured.length === 1 ? "" : "s"}
                  </h3>
                  <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
                    {measured.map((s) => (
                      <li key={s.label} className="text-caption text-ivory-200">
                        {s.label}
                        <span className="ml-2 text-slate-500">
                          {VALUE_KIND_LABEL[s.kind]}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 max-w-measure text-caption text-slate-400">
                    These stay blank rather than being filled with design figures.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* --- Drawings ----------------------------------------------------- */}
        {plates.length > 0 ? (
          <section className="mx-auto max-w-[1500px] px-[5vw] pb-16">
            <div className="grid gap-10 lg:grid-cols-[180px_minmax(0,1fr)]">
              <div>
                <h2 className="label-meta text-ember-500">04 — Drawings</h2>
                <p className="mt-4 max-w-[26ch] text-caption text-slate-400">
                  Taken from the team&rsquo;s CAD and the 2026 design report. Section numbers refer
                  to the report.
                </p>
              </div>
              <FigureGrid figures={plates} />
            </div>
          </section>
        ) : (
          <section className="mx-auto max-w-[1500px] px-[5vw] pb-16">
            <div className="grid gap-10 lg:grid-cols-[180px_minmax(0,1fr)]">
              <h2 className="label-meta text-ember-500">04 — Drawings</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <PlaceholderBlock kind="image" note={`${a.name} CAD drawings`} aspect="4 / 3" />
                <PlaceholderBlock kind="image" note={`${a.name} in flight`} aspect="4 / 3" />
                <PlaceholderBlock kind="image" note="Figures from the design report" aspect="4 / 3" />
              </div>
            </div>
          </section>
        )}

        {/* --- Other aircraft ------------------------------------------------ */}
        <section className="mx-auto max-w-[1500px] px-[5vw] pb-24">
          <h2 className="label-meta rule pt-8 text-ember-500">The rest of the fleet</h2>
          <div className="mt-6 grid gap-px sm:grid-cols-2">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/aircraft/${o.slug}`}
                className="group bg-navy-800 p-7 no-underline transition-colors hover:bg-navy-700"
              >
                <span className="label-meta">{o.className} Class · {o.year}</span>
                <span className="h-title mt-2 block transition-colors group-hover:text-ember-500">
                  {o.name}
                </span>
                <span className="prose-skylark mt-3 block text-caption">{o.mission}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
