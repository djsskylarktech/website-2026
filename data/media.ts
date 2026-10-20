/**
 * Photography slots.
 *
 * Every entry points at a file under /public. Set `src` to null and the site
 * renders a designed placeholder naming the shot it needs, rather than falling
 * back to stock imagery — a stock airport is someone else's hangar and someone
 * else's aircraft, which is exactly what makes a team site look generic.
 *
 * To fill a slot: drop the file in the folder shown, then set `src` here.
 */

export interface Photo {
  src: string | null;
  /** Describes the shot. Doubles as alt text and as the brief when missing. */
  alt: string;
  /** Who took it, shown as a small credit when supplied. */
  credit?: string;
  /** Focal point, so cropping keeps the subject. CSS object-position. */
  focus?: string;
}

/**
 * The hero image. Wants a wide, dark-ish frame with room on the left for the
 * headline — the aircraft on the flight line at dusk, or the view out of the
 * hangar door, both work.
 *
 * Put the file at: public/hero/hero.jpg  (≈2400px wide, under ~500 KB)
 */
export const heroPhoto: Photo = {
  src: null,
  alt: "DJS Skylark's aircraft on the flight line before a test session.",
  focus: "center 55%",
};

/**
 * Supporting frames used across the hero band. Left to right.
 * Put files at: public/hero/
 */
export const heroStrip: Photo[] = [
  { src: null, alt: "The team preparing an aircraft before a flight." },
  { src: null, alt: "A wing under construction in the workshop." },
  { src: null, alt: "Launch, on the runway." },
];

/** True once a real hero image has been supplied. */
export const hasHeroPhoto = heroPhoto.src !== null;
