import "./team-reveal.css";

// Add approved team-reveal photographs here when they are supplied in public/team-reveal/.
const revealPhotos = [];

export default function TeamReveal() {
  return (
    <section className="jx team-reveal" id="team" aria-labelledby="team-reveal-title" data-header-ink>
      <div className="team-reveal__inner">
        <span className="team-reveal__eyebrow">DJS Skylark / The roster</span>
        <h2 id="team-reveal-title">The team behind<br /><em>the flight.</em></h2>
        {revealPhotos.length ? (
          <div className="team-reveal__grid">
            {revealPhotos.map((photo) => (
              <figure key={photo.src}>
                <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
                <figcaption>{photo.caption}</figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="team-reveal__pending">
            <span>01 / TEAM REVEAL</span>
            <p>Meet the people building the next flight.</p>
            <strong>Coming soon</strong>
          </div>
        )}
      </div>
    </section>
  );
}
