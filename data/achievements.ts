import type { Achievement } from "./types";

/**
 * Competition results.
 *
 * Source of truth is the team proposal, confirmed by the team. The 2026
 * results were won in April 2026 at SAE Aero Design, Fort Worth, Texas.
 *
 * `UNVERIFIED_YEARS` marks any year still awaiting confirmation; it is empty.
 * Add earlier years here as they are supplied; the timeline reads from this
 * array and needs no layout changes.
 */

export const UNVERIFIED_YEARS: number[] = [];

export const achievements: Achievement[] = [
  { year: 2026, className: "Micro", category: "Design Report", place: 1, scope: "Worldwide" },
  { year: 2026, className: "Micro", category: "Oral Presentation", place: 3, scope: "Worldwide" },
  { year: 2026, className: "Regular", category: "Oral Presentation", place: 2, scope: "Worldwide" },

  { year: 2025, className: "Micro", category: "Oral Presentation", place: 2, scope: "Worldwide" },
  { year: 2025, className: "Regular", category: "Oral Presentation", place: 2, scope: "Worldwide" },
  { year: 2025, className: "Advanced", category: "Oral Presentation", place: 2, scope: "Worldwide" },

  { year: 2024, className: "Micro", category: "Design Report", place: 1, scope: "Worldwide" },
  { year: 2024, className: "Regular", category: "Design Report", place: 2, scope: "Worldwide" },
  { year: 2024, className: "Regular", category: "Technical Presentation", place: 3, scope: "Worldwide" },
];

/** Results grouped by year, newest first — the shape the timeline wants. */
export function achievementsByYear(): { year: number; results: Achievement[] }[] {
  const years = [...new Set(achievements.map((a) => a.year))].sort((a, b) => b - a);
  return years.map((year) => ({
    year,
    results: achievements.filter((a) => a.year === year),
  }));
}

/**
 * Claims about the team that appear on the site. Kept here so the wording is
 * reviewed in one place rather than scattered through components.
 */
export const TEAM_FACTS = {
  college: "Dwarkadas J. Sanghvi College of Engineering",
  city: "Mumbai, India",
  competingSince: 2014,
  /** From the proposal. */
  experienceYears: "12+",
  /** The three SAE Aero Design classes Skylark enters. */
  classes: ["Regular", "Micro", "Advanced"] as const,
  /** Team size as described in the 2026 technical reports. */
  memberCount: 47,
  /** Where the most recent results were won. */
  lastCompetition: { event: "SAE Aero Design", venue: "Fort Worth, Texas", month: "April 2026" },
};
