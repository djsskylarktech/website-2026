import type { ReactNode } from "react";

/**
 * The editorial window itself.
 *
 * Square corners, one hairline border, an orange rule on the leading edge, and
 * a numbered label in the corner — the vocabulary of a technical document
 * rather than a UI card. Composition is left to the caller: panels are
 * deliberately not a fixed template, because a section may be one sentence and
 * one number, or a figure with a caption, and both should be possible.
 */
export function PanelFrame({
  index,
  label,
  children,
  className = "",
}: {
  /** Section number, e.g. "01". Shown as metadata, not decoration. */
  index?: string;
  label?: string;
  children: ReactNode;
  /** Which side of the viewport this sits on, so the scrim fades outward. */
  side?: "left" | "right" | "center";
  className?: string;
}) {
  return (
    <section
      className={`panel panel-rule py-2 ${className}`}
    >
      {(index || label) && (
        <header className="mb-5 flex items-baseline gap-3">
          {index ? <span className="label-meta text-ember-500">{index}</span> : null}
          {label ? <h2 className="label-meta">{label}</h2> : null}
        </header>
      )}
      {children}
    </section>
  );
}

/**
 * A caption for a real engineering figure. Figures from the design reports
 * carry their source, so a reader can go and check it.
 */
export function FigureCaption({
  children,
  source,
}: {
  children: ReactNode;
  source?: string;
}) {
  return (
    <figcaption className="mt-3 text-caption text-slate-400">
      {children}
      {source ? <span className="ml-2 text-ivory-300/60">· {source}</span> : null}
    </figcaption>
  );
}
