"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import archive from "../legacy-media.json";
import selection from "../legacy-selection.json";
import "./legacy.css";

const seasons = archive.map((season) => ({
  ...season,
  media: season.media.filter((_, index) => selection[season.folder]?.includes(index + 1)).slice(0, 8),
})).filter((season) => season.media.length);

function mediaImage(item) {
  return item.thumb || (item.type === "video" ? item.poster : item.src);
}

function mediaSrcSet(item) {
  return item.thumb && item.preview ? `${item.thumb} 480w, ${item.preview} 960w` : undefined;
}

export default function LegacyGallery() {
  const [seasonIndex, setSeasonIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(null);
  const [compact, setCompact] = useState(false);
  const root = useRef(null);
  const season = seasons[seasonIndex];
  const visibleMedia = season.media.slice(0, compact ? 4 : 8);
  const active = activeIndex === null ? null : visibleMedia[activeIndex];

  useEffect(() => {
    const query = window.matchMedia("(max-width: 650px)");
    const update = () => { setCompact(query.matches); setActiveIndex(null); };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

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
      if (event.key === "ArrowRight") setActiveIndex((index) => (index + 1) % visibleMedia.length);
      if (event.key === "ArrowLeft") setActiveIndex((index) => (index - 1 + visibleMedia.length) % visibleMedia.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = priorOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [activeIndex, visibleMedia.length]);

  return (
    <section ref={root} className="jx legacy" id="legacy" aria-labelledby="legacy-title">
      <div className="legacy__inner">
        <div className="legacy__heading">
          <div className="legacy__eyebrow"><span className="legacy__dot" /> The archive <span>·</span> DJS Skylark</div>
          <h2 id="legacy-title">The people behind <em>every flight.</em></h2>
          <p>Years of building, testing and travelling together. A look back through the team’s own photographs and films.</p>
        </div>

        <div className="legacy__gallery-label">Selected moments <span>Choose a year</span></div>
        <div className="legacy__years" role="group" aria-label="Archive years">
          {seasons.map((entry, index) => (
            <button
              type="button"
              key={entry.folder}
              className={index === seasonIndex ? "is-active" : ""}
              aria-pressed={index === seasonIndex}
              onClick={() => { setSeasonIndex(index); setActiveIndex(null); }}
            >
              {entry.label}
            </button>
          ))}
        </div>
        <div className="legacy__grid" key={season.folder}>
          {visibleMedia.map((item, index) => (
            <button
              type="button"
              className="legacy__item"
              key={item.src}
              onClick={() => setActiveIndex(index)}
              aria-label={`Open ${item.type === "video" ? "video" : "photo"} from ${season.label}`}
            >
              <img src={mediaImage(item)} srcSet={mediaSrcSet(item)} sizes="(max-width: 650px) 50vw, (max-width: 900px) 33vw, 25vw" alt={`DJS Skylark archive, ${season.label}`} loading="lazy" decoding="async" />
              <span className="legacy__item-shade" />
              <span className="legacy__item-number">{season.label}</span>
              {item.type === "video" && <span className="legacy__play" aria-hidden="true">▶</span>}
              <span className="legacy__item-kind">{item.type === "video" ? "FILM" : "PHOTO"}</span>
            </button>
          ))}
        </div>
      </div>

      {active && createPortal((
        <div className="legacy__viewer" role="dialog" aria-modal="true" aria-label="Team archive viewer" onClick={() => setActiveIndex(null)}>
          <div className="legacy__viewer-top">
            <span>DJS SKYLARK / {season.label} <span>·</span> {String(activeIndex + 1).padStart(2, "0")} / {String(visibleMedia.length).padStart(2, "0")}</span>
            <button type="button" className="legacy__close" onClick={() => setActiveIndex(null)} aria-label="Close viewer">Close <span aria-hidden="true">×</span></button>
          </div>
          <div className="legacy__viewer-media" onClick={(event) => event.stopPropagation()}>
            {active.type === "video" ? (
              <video key={active.src} poster={active.preview || active.poster} controls autoPlay playsInline preload="none">
                <source src={active.src} type={active.src.endsWith(".webm") ? "video/webm" : "video/mp4"} />
                {active.fallback && <source src={active.fallback} type="video/mp4" />}
              </video>
            ) : (
              <img key={active.src} src={active.src} alt={`DJS Skylark archive, ${season.label}`} decoding="async" />
            )}
          </div>
          <div className="legacy__viewer-bottom" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setActiveIndex((activeIndex - 1 + visibleMedia.length) % visibleMedia.length)} aria-label="Previous item">← Previous</button>
            <span>{active.type === "video" ? "ARCHIVE FILM" : "ARCHIVE PHOTOGRAPH"}</span>
            <button type="button" onClick={() => setActiveIndex((activeIndex + 1) % visibleMedia.length)} aria-label="Next item">Next →</button>
          </div>
        </div>
      ), document.body)}
    </section>
  );
}
