"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { subscribeFlight } from "@/lib/flight-store";

/**
 * The main navigation.
 *
 * On the homepage it stays out of the way while the visitor is flying: the
 * brief asks for the flight itself to be the navigation, so the bar is reduced
 * to the wordmark until the flight is underway, then fills in. On inner pages
 * it is present and conventional from the start.
 */

const LINKS = [
  { href: "/aircraft", label: "Aircraft" },
  { href: "/sae", label: "SAE" },
  { href: "/engineering", label: "Engineering" },
  { href: "/flight-log", label: "Flight Log" },
  { href: "/team", label: "Team" },
  { href: "/media", label: "Media" },
  { href: "/sponsors", label: "Sponsors" },
];

export function Navbar({ overFlight = false }: { overFlight?: boolean }) {
  // Over the flight the bar reveals itself once the aircraft is airborne.
  const [revealed, setRevealed] = useState(true);

  useEffect(() => {
    if (!overFlight) return;
    return subscribeFlight(() => {
      setRevealed(true);
    });
  }, [overFlight]);

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 h-[var(--nav-h)]"
      style={{
        background: overFlight
          ? "linear-gradient(to bottom, rgb(5 10 31 / 0.82), transparent)"
          : "rgb(5 10 31 / 0.92)",
        backdropFilter: overFlight ? undefined : "blur(8px)",
      }}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-[4vw]"
      >
        <Link href="/" className="flex items-baseline gap-2.5 no-underline">
          <span className="text-sub font-semibold tracking-tight text-ivory-50">
            DJS SKYLARK
          </span>
          <span className="label-meta hidden sm:inline">Aero Design · DJSCE</span>
        </Link>

        <div
          className="flex items-center gap-7 transition-opacity duration-500 ease-flight"
          style={{ opacity: revealed ? 1 : 0, pointerEvents: revealed ? "auto" : "none" }}
        >
          <ul className="hidden items-center gap-7 lg:flex">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="label-meta text-ivory-200 transition-colors hover:text-ember-500"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/join"
            className="label-meta border border-ember-500 px-3.5 py-2 text-ember-500 transition-colors hover:bg-ember-500 hover:text-navy-900"
          >
            Join
          </Link>
        </div>
      </nav>
    </header>
  );
}
