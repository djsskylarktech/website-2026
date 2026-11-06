import Link from "next/link";
import { Navbar } from "@/components/navigation/Navbar";

/**
 * A page that exists but has no real content yet.
 *
 * The brief's placeholder rule applies to whole pages too: rather than filling
 * a section with invented members, logos or log entries, the page states
 * plainly what it will hold and what is needed to build it. It is designed, not
 * a stub — the navigation works and the site never shows a 404.
 */
export function SectionPending({
  index,
  title,
  intent,
}: {
  index: string;
  title: string;
  /** One or two sentences on what this page is for. */
  intent: string;
  /** The real material required before it can be built. */
  needs: string[];
}) {
  const destination = title === "Media" ? { href: "/#legacy", label: "Explore the archive" }
    : title === "Sponsors" ? { href: "/#sponsors", label: "See the fleet" }
    : title === "SAE Aero Design" ? { href: "/#prizes", label: "See our results" }
    : { href: "/#faq", label: "Explore Skylark" };
  return (
    <>
      <Navbar />
      <main
        id="main"
        className="subpage mx-auto max-w-[1100px] px-[6vw] pb-32 pt-[calc(var(--nav-h)+6rem)]"
      >
        <p className="label-meta text-ember-500">{index}</p>
        <h1 className="h-display mt-4">{title}</h1>
        <p className="prose-skylark mt-6">{intent}</p>

        <section className="mt-16 border-t border-white/[0.09] pt-8">
          <h2 className="h-heading">The story continues.</h2>
          <p className="prose-skylark mt-4">A fuller look at this part of Skylark is on its way. In the meantime, there is more to explore from the team.</p>
          <Link href={destination.href} className="link-action mt-7 inline-flex items-center gap-3">{destination.label} <span aria-hidden="true">↗</span></Link>
        </section>

        <Link
          href="/"
          className="label-meta mt-16 inline-flex items-center gap-2 text-ember-500 hover:underline"
        >
          ← Back to the flight
        </Link>
      </main>
    </>
  );
}
