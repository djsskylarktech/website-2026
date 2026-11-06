import "./social-links.css";

const LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/djsskylark/",
    icon: <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2.75" y="2.75" width="18.5" height="18.5" rx="5" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.8" /><circle cx="17.65" cy="6.5" r="1.15" fill="currentColor" /></svg>,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/djsskylark/",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.77 3a2.02 2.02 0 1 0 0 4.04 2.02 2.02 0 0 0 0-4.04ZM3 8.7h3.55V21H3V8.7Zm5.77 0h3.41v1.68h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.45V21h-3.55v-6.2c0-1.48-.03-3.39-2.07-3.39-2.06 0-2.38 1.62-2.38 3.28V21H8.77V8.7Z" /></svg>,
  },
];

export default function SocialLinks({ className = "" }) {
  return (
    <nav className={`skylark-social ${className}`} aria-label="DJS Skylark social media">
      {LINKS.map(({ label, href, icon }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`DJS Skylark on ${label}`}>
          {icon}<span>{label}</span><span className="skylark-social__arrow" aria-hidden="true">↗</span>
        </a>
      ))}
    </nav>
  );
}
