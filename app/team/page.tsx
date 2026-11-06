import { Navbar } from "@/components/navigation/Navbar";
import { alumni, departments, membersOf, quotes, TEAM_SIZE } from "@/data/team";

export const metadata = {
  title: "Team",
  description:
    "The people behind the aircraft — aerodynamics, structures and stability, avionics, payload, manufacturing, design report, FDRR and marketing.",
};

/**
 * The team.
 *
 * Organised by sub-team rather than as a grid of identical headshots, which is
 * what the brief asks for and also what the organisation actually looks like.
 * The department structure is real, from the 2026 design reports; the roster is
 * empty until supplied, and a member without a portrait is shown as name and
 * role rather than given a generated face.
 */
export default function TeamPage() {
  return (
    <>
      <Navbar />

      <main id="main" className="subpage pt-[var(--nav-h)]">
        <section className="mx-auto max-w-[1500px] px-[5vw] py-14 lg:py-20">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 bg-ember-500" />
            <span className="label-meta text-ivory-200">07 — Team</span>
          </div>
          <h1 className="h-display mt-5">
            The people behind
            <br />
            <span className="text-ember-500">the flight.</span>
          </h1>
          <p className="prose-skylark mt-6">
            {TEAM_SIZE} members, organised into the sub-teams below. Three aircraft are designed,
            built and flown in parallel in a single season, which only works because each group owns
            its own problem end to end.
          </p>
        </section>

        {/* --- Departments --------------------------------------------------- */}
        <section className="mx-auto max-w-[1500px] px-[5vw] pb-16">
          <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-4">
            {departments.map((d, i) => {
              const people = membersOf(d.slug);
              return (
                <section key={d.slug} className="bg-navy-800 p-7">
                  <span className="font-mono text-caption tabular-nums text-ember-500">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="h-heading mt-2 text-[1.15rem]">{d.name}</h2>
                  <p className="mt-2 text-caption text-slate-400">{d.remit}</p>

                  {people.length > 0 ? (
                    <ul className="mt-5 space-y-2 border-t border-white/[0.12] pt-4">
                      {people.map((m) => (
                        <li key={m.name} className="group">
                          <span className="block text-caption text-ivory-100">{m.name}</span>
                          <span className="label-meta">
                            {m.role} · {m.year} · {m.branch}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              );
            })}
          </div>
        </section>

        {/* --- Quotes -------------------------------------------------------- */}
        {quotes.length > 0 && <section className="mx-auto max-w-[1500px] px-[5vw] pb-16">
          <h2 className="label-meta text-ember-500">In their words</h2>
          {quotes.length > 0 ? (
            <div className="mt-6 grid gap-px sm:grid-cols-2 lg:grid-cols-3">
              {quotes.map((q) => (
                <figure key={q.name + q.text.slice(0, 12)} className="bg-navy-800 p-7">
                  <blockquote className="font-head text-heading uppercase leading-tight text-ivory-50">
                    &ldquo;{q.text}&rdquo;
                  </blockquote>
                  <figcaption className="label-meta mt-5">
                    {q.name} · {q.role} · {q.year}
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : null}
        </section>}

        {/* --- Alumni -------------------------------------------------------- */}
        {alumni.length > 0 && <section className="mx-auto max-w-[1500px] px-[5vw] pb-24">
          <h2 className="label-meta text-ember-500">Alumni</h2>
          {alumni.length > 0 ? (
            <ul className="mt-6 border-t border-white/[0.1]">
              {alumni.map((a) => (
                <li
                  key={a.name}
                  className="flex flex-wrap items-baseline justify-between gap-4 border-b border-white/[0.1] py-4"
                >
                  <span className="text-sub text-ivory-50">{a.name}</span>
                  <span className="label-meta">{a.batch}</span>
                  <span className="text-caption text-ivory-200">{a.destination}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>}
      </main>
    </>
  );
}
