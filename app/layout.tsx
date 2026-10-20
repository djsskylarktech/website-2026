import type { Metadata, Viewport } from "next";
import { Manrope, Sora, Roboto_Mono } from "next/font/google";
import "@/styles/globals.css";

/**
 * Type system.
 *
 * Three faces doing three jobs — headline, text, data — rather than one
 * neutral grotesk doing everything, which is what makes a site read as
 * generic.
 *
 * Sora carries the headlines: a geometric sans with slightly squared bowls
 * and open counters, which stays crisp and bright at large sizes rather than
 * turning into a heavy slab. Manrope sets body copy — rounded, generously
 * spaced and very legible over imagery. Roboto Mono carries numbers, units and
 * field labels, where the tabular figures matter more than personality.
 */

const display = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["600", "700", "800"],
});

const text = Manrope({
  subsets: ["latin"],
  variable: "--font-text",
  display: "swap",
  weight: ["400", "500", "600"],
});

const mono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://djsskylark.com"),
  title: {
    default: "DJS Skylark — Aero Design Team",
    template: "%s — DJS Skylark",
  },
  description:
    "DJS Skylark is the Aero Design team of Dwarkadas J. Sanghvi College of Engineering, Mumbai. We design, build, test and fly radio-controlled aircraft for SAE Aero Design, competing in the Regular, Micro and Advanced classes.",
  openGraph: {
    type: "website",
    siteName: "DJS Skylark",
    title: "DJS Skylark — Aero Design Team",
    description:
      "Three classes, one team. Design, build, test and fly — the aircraft, the engineering and the people behind them.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050A1F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${text.variable} ${mono.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Orbitron:wght@400..900&family=Inter:ital,opsz,wght@0,14..32,300..800;1,14..32,300..800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {/* Keyboard users should be able to get past the flight sequence. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-ember-500 focus:px-4 focus:py-2 focus:text-navy-900"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
