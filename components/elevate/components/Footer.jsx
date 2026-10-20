import { EVENT, ORGANISER } from "../config";
import BrandWordmark from "./BrandWordmark";
import Link from "next/link";

// the venue's Google Maps embed — same pin as the footer's "Location" link,
// shown in place rather than as another tab to lose people to
const MAP_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.0028276924054!2d72.83507967544199!3d19.107531882103615!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c9c65184a307%3A0x66af50c5443b4371!2s4R5Q%2B235%20Dwarkadas%20Jivanlal%20Sanghvi%20College%20Of%20Engineering%2C%20Navpada%2C%20Suvarna%20Nagar%2C%20Juhu%2C%20Mumbai%2C%20Maharashtra%20400056!5e0!3m2!1sen!2sin!4v1789617976182!5m2!1sen!2sin";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__about">
          <div className="footer__brandRow">
            {/* drop the committee logo at public/nsdc-logo.png and it appears
                here; until the file exists the mark is simply omitted */}
            <div className="footer__brand">
              <BrandWordmark uppercase />
            </div>
          </div>
          <p className="footer__tag">{ORGANISER.blurb}</p>
          <div className="footer__social" />
        </div>

        <div className="footer__col">
          <span className="footer__heading">Explore</span>
          <a href="#brief">About</a>
          <a href="#legacy">Legacy</a>
          <a href="#prizes">Achievements</a>
          <a href="#schedule">Engineering</a>
          <a href="#sponsors">Aircraft</a>
          <a href="#faq">FAQ</a>
        </div>

        <div className="footer__col">
          <span className="footer__heading">DJS Skylark</span>
          <Link href="/aircraft">Our aircraft</Link>
          <Link href="/team">The team</Link>
          <Link href="/engineering">How we work</Link>
          <Link href="/join">Join Skylark</Link>
        </div>
      </div>

      <div className="container footer__map">
        <iframe
          src={MAP_EMBED_SRC}
          title={`${EVENT.college} — venue map`}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>

      <div className="container footer__bottom">
        <span>
          © {new Date().getFullYear()} {EVENT.name} · {EVENT.college}, {EVENT.city}
        </span>
      </div>
    </footer>
  );
}
