import { GROUP_LABEL, type Figure } from "@/data/figures";

/**
 * Engineering figures, laid out as an editorial plate rather than a gallery.
 *
 * The drawings are the point, so they sit on a light ground — they were
 * rendered on white and look wrong knocked out on a dark panel — with the
 * caption and report section beneath as a technical cutline. Wide drawings get
 * the full measure; details sit two or three up.
 */
export function FigureGrid({ figures }: { figures: Figure[] }) {
  if (figures.length === 0) return null;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {figures.map((fig) => (
        <figure
          key={fig.src}
          className={`group flex flex-col ${fig.wide ? "sm:col-span-2 lg:col-span-3" : ""}`}
        >
          <div className="relative overflow-hidden rounded-sm bg-ivory-50">
            {/* Plain <img>: Next's optimiser is off (its native dependency is
                blocked on the team's machines), and these are already sized. */}
            <img
              src={fig.src}
              alt={fig.caption}
              loading="lazy"
              decoding="async"
              className="w-full object-contain transition-transform duration-700 ease-flight group-hover:scale-[1.02]"
            />
          </div>

          <figcaption className="mt-3 flex gap-4">
            <span className="label-meta shrink-0 pt-0.5 text-ember-500">§{fig.section}</span>
            <span className="text-caption text-ivory-200">
              {fig.caption}
              <span className="ml-2 text-slate-500">{GROUP_LABEL[fig.group]}</span>
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
