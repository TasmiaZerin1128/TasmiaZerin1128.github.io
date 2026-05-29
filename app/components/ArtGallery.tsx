"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

type Artwork = { file: string; title: string };
type Status = "loading" | "ready" | "empty" | "error";

const R2_BASE = "https://pub-b82d94c1c7a147bfb13506d072e298b7.r2.dev/portfolio";
const PORTFOLIO_LIST_URL =
  "https://tasmia-portfolio.tasmia-art-gallery.workers.dev/portfolio";

// Ring geometry that scales with frame count so adjacent frames keep a
// consistent gap regardless of how many photos the user uploads.
const FRAME_SLOT = 430; // ~310px frame width + ~120px desired gap
const MIN_RADIUS = 800;
function ringRadius(n: number): number {
  if (n < 2) return MIN_RADIUS;
  return Math.max(MIN_RADIUS, FRAME_SLOT / (2 * Math.sin(Math.PI / n)));
}

function deriveTitle(filename: string): string {
  return filename
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ArtGallery() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [front, setFront] = useState(0);
  const [focused, setFocused] = useState<number | null>(null);

  const ringRef = useRef<HTMLDivElement>(null);
  const frameRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rot = useRef(0);
  const vel = useRef(0);
  const auto = useRef(true);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const frontRef = useRef(0);
  const focusedRef = useRef<number | null>(null);

  useEffect(() => {
    focusedRef.current = focused;
    if (focused === null) auto.current = true;
  }, [focused]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(PORTFOLIO_LIST_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const files: unknown = await res.json();
        if (cancelled) return;
        if (!Array.isArray(files) || files.length === 0) {
          setStatus("empty");
          return;
        }
        const list: Artwork[] = files
          .filter((f): f is string => typeof f === "string")
          .map((file) => ({ file, title: deriveTitle(file) }));
        if (list.length === 0) {
          setStatus("empty");
          return;
        }
        setArtworks(list);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const paint = useCallback(() => {
    const N = artworks.length;
    if (N === 0) return;
    const STEP = 360 / N;
    const RADIUS = ringRadius(N);
    const ring = ringRef.current;
    if (ring) {
      ring.style.transform = `translateZ(-${RADIUS}px) rotateY(${rot.current}deg)`;
    }
    let nf = 0;
    let best = -2;
    for (let i = 0; i < N; i++) {
      let a = (((i * STEP + rot.current) % 360) + 360) % 360;
      if (a > 180) a -= 360;
      const facing = Math.cos((a * Math.PI) / 180);
      if (facing > best) {
        best = facing;
        nf = i;
      }
      const el = frameRefs.current[i];
      if (!el) continue;
      el.style.filter = `brightness(${(0.42 + 0.58 * Math.max(0, facing)).toFixed(3)})`;
      el.style.opacity = facing < -0.55 ? "0" : "1";
      el.style.pointerEvents = facing < 0.2 ? "none" : "auto";
      el.classList.toggle("is-front", i === nf);
    }
    if (nf !== frontRef.current) {
      frontRef.current = nf;
      setFront(nf);
    }
  }, [artworks]);

  useEffect(() => {
    if (status !== "ready") return;
    let raf = 0;
    const tick = () => {
      if (!dragging.current && focusedRef.current === null) {
        if (Math.abs(vel.current) > 0.02) {
          rot.current += vel.current;
          vel.current *= 0.94;
          paint();
        } else if (auto.current) {
          rot.current -= 0.1;
          paint();
        }
      }
      raf = requestAnimationFrame(tick);
    };
    paint();
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paint, status]);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      dragging.current = true;
      auto.current = false;
      vel.current = 0;
      lastX.current = e.clientX;
    },
    []
  );

  useEffect(() => {
    if (status !== "ready") return;
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastX.current;
      lastX.current = e.clientX;
      vel.current = dx * 0.18;
      rot.current += dx * 0.18;
      paint();
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [paint, status]);

  useEffect(() => {
    if (focused === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFocused(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focused]);

  const N = artworks.length;
  const STEP = N > 0 ? 360 / N : 0;
  const RADIUS = ringRadius(N);

  const spin = (dir: number) => {
    auto.current = false;
    vel.current = 0;
    rot.current += dir * STEP;
    paint();
  };

  const goTo = (i: number) => {
    auto.current = false;
    vel.current = 0;
    rot.current = -i * STEP;
    paint();
  };

  return (
    <section className="portfolio" id="art-gallery">
      <header className="pf-head">
        <span className="pf-kicker">Selected Works</span>
        <h2 className="pf-title">PORTFOLIO</h2>
        <p className="pf-sub">Drag to spin the gallery · Click an artwork to view</p>
      </header>

      <div className="pf-stage" onPointerDown={onPointerDown}>
        {status === "ready" && (
          <div className="pf-ring" ref={ringRef}>
            {artworks.map((art, i) => (
              <button
                key={art.file}
                ref={(el) => {
                  frameRefs.current[i] = el;
                }}
                className="frame"
                type="button"
                style={{
                  transform: `rotateY(${i * STEP}deg) translateZ(${RADIUS}px)`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (i === frontRef.current) setFocused(i);
                  else goTo(i);
                }}
              >
                <span className="mat">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${R2_BASE}/${art.file}`}
                    alt={art.title}
                    draggable={false}
                  />
                </span>
                <span className="plaque">
                  <span className="plaque-title">{art.title}</span>
                </span>
              </button>
            ))}
          </div>
        )}
        {status !== "ready" && (
          <p className="pf-status" role="status">
            {status === "loading" && "Loading gallery…"}
            {status === "empty" && "No artworks yet."}
            {status === "error" && "Couldn't load the gallery."}
          </p>
        )}
        <div className="pf-floor" />
      </div>

      {status === "ready" && (
        <div className="pf-controls">
          <button
            className="pf-btn"
            type="button"
            onClick={() => spin(1)}
            aria-label="Previous"
          >
            ‹
          </button>
          <span className="pf-count">
            {String(front + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
          </span>
          <button
            className="pf-btn"
            type="button"
            onClick={() => spin(-1)}
            aria-label="Next"
          >
            ›
          </button>
        </div>
      )}

      {focused !== null && artworks[focused] && (
        <div className="lightbox" onClick={() => setFocused(null)}>
          <figure className="lb-fig">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${R2_BASE}/${artworks[focused].file}`}
              alt={artworks[focused].title}
              onClick={(e) => e.stopPropagation()}
            />
            <figcaption onClick={(e) => e.stopPropagation()}>
              <span className="lb-title">{artworks[focused].title}</span>
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}
