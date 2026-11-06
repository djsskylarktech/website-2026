import Link from "next/link";
import { Navbar } from "@/components/navigation/Navbar";
import { disciplines, PROCESS } from "@/data/engineering";

export const metadata = {
  title: "Engineering",
  description:
    "How Skylark designs, analyses, builds and tests aircraft — trade studies, CFD, finite element analysis, thrust stands and instrumented flight testing.",
};

/**
 * Engineering and R&D.
 *
 * The storyboard frames this as a process strip followed by a grid of research
 * areas. Both are here, built from what the design reports actually document —
 * each discipline carries the tools it names and, where one exists, a measured
 * result rather than a claim.
 */
export default function EngineeringPage() {
  return (
    <>
      <Navbar />

      <main id="main" className="subpage pt-[var(--nav-h)]">
        <section className="mx-auto max-w-[1500px] px-[5vw] py-14 lg:py-20">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 bg-ember-500" />
            <span className="label-meta text-ivory-200">05 — Engineering</span>
          </div>
          <h1 className="h-display mt-5">
            From idea
            <br />
            <span className="text-ember-500">to flight.</span>
          </h1>
          <p className="prose-skylark mt-6">
            Nothing on this site is claimed that was not analysed and then flown. Each aircraft is
            narrowed from thousands of candidate configurations by trade study, taken through CFD and
            finite element analysis, built, instrumented, and flown — with the results fed back into
            the next airframe.
          </p>
        </section>

        {/* --- The loop ---------------------------------------------------- */}
        <section className="border-y border-white/[0.1] bg-navy-800/60">
          <ol className="mx-auto grid max-w-[1500px] grid-cols-2 gap-px px-[5vw] py-10 sm:grid-cols-4 lg:grid-cols-7">
            {PROCESS.map((p, i) => (
              <li key={p.step} className="pr-4">
                <span className="font-mono text-caption tabular-nums text-ember-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="h-heading mt-2 text-[1.05rem] leading-tight">{p.step}</h2>
                <p className="mt-2 text-caption text-slate-400">{p.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* --- Disciplines -------------------------------------------------- */}
        <section className="mx-auto max-w-[1500px] px-[5vw] py-16">
          <h2 className="label-meta text-ember-500">Research and development</h2>

          <div className="mt-8 grid gap-px sm:grid-cols-2 lg:grid-cols-3">
            {disciplines.map((d, i) => (
              <article key={d.slug} className="flex flex-col bg-navy-800 p-7">
                <span className="font-mono text-caption tabular-nums text-ember-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="h-heading mt-2">{d.name}</h3>
                <p className="prose-skylark mt-3 text-caption">{d.body}</p>

                <ul className="mt-5 flex flex-wrap gap-2">
                  {d.methods.map((m) => (
                    <li
                      key={m}
                      className="border border-white/15 px-2 py-1 font-mono text-[0.6875rem] uppercase tracking-wider text-ivory-300"
                    >
                      {m}
                    </li>
                  ))}
                </ul>

                {d.result ? (
                  <div className="mt-6 border-t border-white/[0.12] pt-4">
                    <div className="font-mono text-heading tabular-nums text-ember-500">
                      {d.result.value}
                    </div>
                    <div className="mt-1 text-caption text-ivory-200">{d.result.label}</div>
                    <div className="label-meta mt-1">{d.result.aircraft} · design report</div>
                  </div>
                ) : (
                  <div className="mt-auto" />
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1500px] px-[5vw] pb-24">
          <Link href="/aircraft" className="link-action">
            See what it produced →
          </Link>
        </section>
      </main>
    </>
  );
}
