"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import seasons from "../legacy-media.json";
import "./legacy.css";

const archiveEnds = [seasons[0], seasons.find((season) => season.folder === "18-19"), seasons.at(-1)];

function mediaImage(item) {
  return item.type === "video" ? item.poster : item.src;
}

export default function LegacyGallery() {
  const [seasonIndex, setSeasonIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(null);
  const root = useRef(null);
  const season = seasons[seasonIndex];
  const active = activeIndex === null ? null : season.media[activeIndex];

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      document.documentElement.classList.toggle("in-legacy", entry.isIntersecting);
    }, { threshold: 0.01 });
    if (root.current) observer.observe(root.current);
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("in-legacy");
    };
  }, []);

  useEffect(() => {
    if (activeIndex === null) return undefined;
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight") setActiveIndex((index) => (index + 1) % season.media.length);
      if (event.key === "ArrowLeft") setActiveIndex((index) => (index - 1 + season.media.length) % season.media.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = priorOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [activeIndex, season]);

  return (
    <section ref={root} className="jx legacy" id="legacy" aria-labelledby="legacy-title">
      <div className="legacy__inner">
        <div className="legacy__heading">
          <div className="legacy__eyebrow"><span className="legacy__dot" /> The archive <span>·</span> DJS Skylark</div>
          <h2 id="legacy-title">The people behind <em>every flight.</em></h2>
          <p>Years of building, testing and travelling together. A look back through the team’s own photographs and films.</p>
        </div>

        <div className="legacy__lead" aria-label="Highlights from the team archive">
          {archiveEnds.map((entry, index) => (
            <button
              type="button"
              key={entry.folder}
              className={`legacy__lead-card legacy__lead-card--${index + 1}`}
              onClick={() => {
                const next = seasons.indexOf(entry);
                setSeasonIndex(next);
                setActiveIndex(0);
              }}
              aria-label={`Explore the ${entry.label} archive`}
            >
              <img src={mediaImage(entry.media[0])} alt={`DJS Skylark archive, ${entry.label}`} loading="lazy" />
              <span className="legacy__lead-year">{entry.label}</span>
              <span className="legacy__lead-arrow" aria-hidden="true">↗</span>
            </button>
          ))}
        </div>

        <div className="legacy__archive-head">
          <div>
            <span className="legacy__index">01 / THE YEARS</span>
            <h3>Explore the archive</h3>
          </div>
          <p>Choose a year to see the moments it left behind.</p>
        </div>

        <div className="legacy__rail" role="group" aria-label="Archive years">
          {seasons.map((entry, index) => (
            <button
              type="button"
              key={entry.folder}
              className={index === seasonIndex ? "is-active" : ""}
              onClick={(event) => {
                setSeasonIndex(index);
                setActiveIndex(null);
                event.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
              }}
              aria-pressed={index === seasonIndex}
            >
              {entry.label}
            </button>
          ))}
        </div>

        <div className="legacy__season-head">
          <div><span className="legacy__index">SELECTED YEAR</span><h4>{season.label}</h4></div>
          <span>{season.media.length} {season.media.length === 1 ? "moment" : "moments"} <span className="legacy__season-star">✳</span> Photos &amp; films</span>
        </div>

        <div className="legacy__grid" key={season.folder}>
          {season.media.map((item, index) => (
            <button
              type="button"
              className={`legacy__item${index === 0 ? " legacy__item--first" : ""}`}
              key={item.src}
              onClick={() => setActiveIndex(index)}
              aria-label={`Open ${item.type === "video" ? "video" : "photo"} ${index + 1} from ${season.label}`}
            >
              <img src={mediaImage(item)} alt={`DJS Skylark archive, ${season.label}, ${item.type} ${index + 1}`} loading="lazy" />
              <span className="legacy__item-shade" />
              <span className="legacy__item-number">{String(index + 1).padStart(2, "0")}</span>
              {item.type === "video" && <span className="legacy__play" aria-hidden="true">▶</span>}
              <span className="legacy__item-kind">{item.type === "video" ? "FILM" : "PHOTO"}</span>
            </button>
          ))}
        </div>
      </div>

      {active && createPortal((
        <div className="legacy__viewer" role="dialog" aria-modal="true" aria-label={`${season.label} archive viewer`} onClick={() => setActiveIndex(null)}>
          <div className="legacy__viewer-top">
            <span>DJS SKYLARK / {season.label} <span>·</span> {String(activeIndex + 1).padStart(2, "0")} / {String(season.media.length).padStart(2, "0")}</span>
            <button type="button" className="legacy__close" onClick={() => setActiveIndex(null)} aria-label="Close viewer">Close <span aria-hidden="true">×</span></button>
          </div>
          <div className="legacy__viewer-media" onClick={(event) => event.stopPropagation()}>
            {active.type === "video" ? (
              <video key={active.src} poster={active.poster} controls autoPlay playsInline preload="metadata">
                <source src={active.src} type={active.src.endsWith(".webm") ? "video/webm" : "video/mp4"} />
                {active.fallback && <source src={active.fallback} type="video/mp4" />}
              </video>
            ) : (
              <img key={active.src} src={active.src} alt={`DJS Skylark archive, ${season.label}, photo ${activeIndex + 1}`} />
            )}
          </div>
          <div className="legacy__viewer-bottom" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setActiveIndex((activeIndex - 1 + season.media.length) % season.media.length)} aria-label="Previous item">← Previous</button>
            <span>{active.type === "video" ? "ARCHIVE FILM" : "ARCHIVE PHOTOGRAPH"}</span>
            <button type="button" onClick={() => setActiveIndex((activeIndex + 1) % season.media.length)} aria-label="Next item">Next →</button>
          </div>
        </div>
      ), document.body)}
    </section>
  );
}
