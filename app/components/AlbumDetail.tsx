"use client";

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import gsap from "gsap";
import styles from "./AlbumDetail.module.css";

interface ImageData {
  title: string;
  description?: string;
  filename: string;
}

interface MetadataAlbum {
  title: string;
  images: Record<string, ImageData>;
}

interface AlbumDetailProps {
  albumName: string;
  albumTitle: string;
  metadata?: MetadataAlbum;
  /** full URL of the album cover, so it can be excluded from the gallery */
  cover?: string | null;
  onClose: () => void;
}

interface ImageItem {
  key: string;
  filename: string;
  data: ImageData;
  url: string;
}

const ALBUMS_R2_BASE = "https://pub-b82d94c1c7a147bfb13506d072e298b7.r2.dev";

// Route an R2 image through the free wsrv.nl image proxy, which resizes +
// re-encodes to webp and serves it cached from its CDN. Smaller transfers =
// faster, lighter loads. `w` caps width, `q` is quality (1–100).
// https://wsrv.nl/docs/
function sized(url: string, w: number, q = 80): string {
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${w}&output=webp&q=${q}`;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export default function AlbumDetail({
  albumName,
  albumTitle,
  metadata,
  cover,
  onClose,
}: AlbumDetailProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [inView, setInView] = useState<Set<string>>(new Set());
  const [lensPos, setLensPos] = useState({ x: 0.5, y: 0.5 });
  const [lensBg, setLensBg] = useState<{ w: number; h: number } | null>(null);
  const [showLens, setShowLens] = useState(false);

  const wallRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const thumbRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // single source of horizontal motion for the wall: a rAF lerp toward a target
  // scrollLeft, shared by the wheel handler AND filmstrip/keyboard centering so
  // the two never fight over scrollLeft (a click mid wheel-settle redirects
  // cleanly instead of being yanked back to the old wheel target).
  const scrollTargetRef = useRef<number | null>(null);
  const scrollRafRef = useRef(0);
  // gates the wheel handler so one physical scroll (which fires many wheel
  // events, esp. trackpads) advances the wall by exactly one image.
  const wheelLockRef = useRef(false);

  // detail-story refs
  const storyScrollRef = useRef<HTMLDivElement>(null);
  const stageHolderRef = useRef<HTMLDivElement>(null);
  const stageTitleRef = useRef<HTMLHeadingElement>(null);
  const paintingRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const detailImgRef = useRef<HTMLDivElement>(null);
  const scrollDownRef = useRef<HTMLButtonElement>(null);

  // ---- image list (serial order by filename), derived from props ----
  const images = useMemo<ImageItem[]>(() => {
    if (!metadata?.images) return [];
    const encodedAlbum = encodeURI(albumName);
    return Object.entries(metadata.images)
      .map(([key, data]) => {
        const encodedFilename = encodeURI(data.filename);
        const url = `${ALBUMS_R2_BASE}/${encodedAlbum}/${encodedFilename}`;
        return { key, filename: data.filename, data, url };
      })
      // drop the cover image so it isn't repeated inside the album
      .filter((img) => !cover || img.url !== cover)
      // natural sort by filename: Day 1, Day 2, … Day 10, Day 11
      .sort((a, b) =>
        a.filename.localeCompare(b.filename, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );
  }, [metadata, albumName, cover]);

  const total = images.length;
  const activeImage = images[activeIndex];

  // Only the first few images are eager-loaded and gate the reveal; the rest
  // load lazily as they scroll into view, so we never decode everything at once.
  const EAGER_COUNT = 4;
  const galleryReady =
    total > 0 &&
    images
      .slice(0, EAGER_COUNT)
      .every((img) => loadedImages.has(img.key));
  const markLoaded = useCallback((key: string) => {
    setLoadedImages((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  // an image starts fetching once it's eager (first few) or has entered the
  // preload zone via the IntersectionObserver below
  const shouldLoad = useCallback(
    (key: string, idx: number) => idx < EAGER_COUNT || inView.has(key),
    [inView]
  );

  // one rAF lerp that owns wall.scrollLeft; both the wheel handler and the
  // centering helpers steer it via scrollTargetRef so nothing fights.
  const scrollLastTs = useRef(0);
  const stepWallScroll = useCallback((ts: number) => {
    const el = wallRef.current;
    if (!el || scrollTargetRef.current == null) {
      scrollRafRef.current = 0;
      scrollLastTs.current = 0;
      return;
    }
    // frames elapsed at a 60fps reference so the glide speed is identical on
    // high-refresh displays (capped: a background-tab pause isn't one big jump)
    const k = scrollLastTs.current
      ? Math.min((ts - scrollLastTs.current) / 16.667, 3)
      : 1;
    scrollLastTs.current = ts;
    const diff = scrollTargetRef.current - el.scrollLeft;
    if (Math.abs(diff) < 0.5) {
      el.scrollLeft = scrollTargetRef.current;
      scrollTargetRef.current = null;
      scrollRafRef.current = 0;
      scrollLastTs.current = 0;
      return;
    }
    // 0.10/frame = a slower, calmer glide (higher = snappier)
    el.scrollLeft += diff * (1 - Math.pow(1 - 0.1, k));
    scrollRafRef.current = requestAnimationFrame(stepWallScroll);
  }, []);

  // animate the wall toward an absolute scrollLeft (clamped). Reduced motion
  // jumps instantly. This is the *only* place that drives wall scroll, so a
  // click can redirect an in-flight wheel-settle instead of being yanked back.
  const animateWallTo = useCallback(
    (left: number) => {
      const el = wallRef.current;
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const clamped = Math.max(0, Math.min(maxScroll, left));
      if (prefersReducedMotion()) {
        scrollTargetRef.current = null;
        if (scrollRafRef.current) {
          cancelAnimationFrame(scrollRafRef.current);
          scrollRafRef.current = 0;
        }
        el.scrollLeft = clamped;
        return;
      }
      scrollTargetRef.current = clamped;
      if (!scrollRafRef.current) {
        scrollLastTs.current = 0;
        scrollRafRef.current = requestAnimationFrame(stepWallScroll);
      }
    },
    [stepWallScroll]
  );

  // scroll the wall so a given canvas sits dead-center (used by filmstrip clicks
  // and keyboard nav). Uses getBoundingClientRect so it's correct regardless of
  // the canvas's offsetParent, and steers the shared lerp so it never fights the
  // wheel handler or nudges the page like scrollIntoView would.
  const centerCanvas = useCallback(
    (key: string) => {
      const wall = wallRef.current;
      const c = canvasRefs.current.get(key);
      if (!wall || !c) return;
      const wallRect = wall.getBoundingClientRect();
      const cRect = c.getBoundingClientRect();
      const delta =
        cRect.left - wallRect.left + cRect.width / 2 - wall.clientWidth / 2;
      animateWallTo(wall.scrollLeft + delta);
    },
    [animateWallTo]
  );

  const goTo = useCallback(
    (idx: number) => {
      if (total === 0) return;
      setActiveIndex(Math.max(0, Math.min(total - 1, idx)));
    },
    [total]
  );

  const openDetail = useCallback((idx: number) => {
    setActiveIndex(idx);
    setLensPos({ x: 0.5, y: 0.5 });
    setLensBg(null);
    setDetailOpen(true);
  }, []);

  const closeDetail = useCallback(() => setDetailOpen(false), []);

  // ---- lock background page scroll while the detail story is open ----
  useEffect(() => {
    if (!detailOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [detailOpen]);

  // ---- wall: one scroll = step one image to dead-center ----
  // Each physical scroll advances by a single image and re-centers it (instead
  // of free proportional scrolling). The wheel lock collapses the burst of
  // events a single wheel notch / trackpad swipe emits into one step. At the
  // first/last image the boundary canvas stays centered (50vw track padding),
  // and the wheel is released to the page so the user can scroll past the wall.
  useEffect(() => {
    const el = wallRef.current;
    if (!el || detailOpen || total === 0) return;

    const nearestIndex = () => {
      const mid = el.scrollLeft + el.clientWidth / 2;
      let nearest = 0;
      let best = Infinity;
      images.forEach((img, i) => {
        const c = canvasRefs.current.get(img.key);
        if (!c) return;
        const center = c.offsetLeft + c.offsetWidth / 2;
        const d = Math.abs(center - mid);
        if (d < best) {
          best = d;
          nearest = i;
        }
      });
      return nearest;
    };

    const onWheel = (e: WheelEvent) => {
      // honor whichever axis the gesture favors (vertical wheel or trackpad swipe)
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta === 0) return;
      const dir = delta > 0 ? 1 : -1;
      const next = nearestIndex() + dir;
      // at an end: let the page take the scroll so the wall isn't a trap
      if (next < 0 || next > total - 1) return;
      e.preventDefault();
      if (wheelLockRef.current) return; // one step per scroll gesture
      wheelLockRef.current = true;
      goTo(next);
      const key = images[next]?.key;
      if (key) centerCanvas(key);
      window.setTimeout(() => {
        wheelLockRef.current = false;
      }, 600); // matches the slower glide so one gesture = one image
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [detailOpen, total, images, goTo, centerCanvas]);

  // ---- stop the wall lerp when leaving the wall view / unmounting ----
  useEffect(() => {
    if (!detailOpen) return;
    scrollTargetRef.current = null;
    if (scrollRafRef.current) {
      cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = 0;
    }
  }, [detailOpen]);

  useEffect(
    () => () => {
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
    },
    []
  );

  // ---- wall: sync active index to whichever canvas is centered ----
  useEffect(() => {
    const el = wallRef.current;
    if (!el || detailOpen || total === 0) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const mid = el.scrollLeft + el.clientWidth / 2;
        let nearest = 0;
        let best = Infinity;
        images.forEach((img, i) => {
          const c = canvasRefs.current.get(img.key);
          if (!c) return;
          const center = c.offsetLeft + c.offsetWidth / 2;
          const d = Math.abs(center - mid);
          if (d < best) {
            best = d;
            nearest = i;
          }
        });
        setActiveIndex((prev) => (prev === nearest ? prev : nearest));
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [detailOpen, total, images]);

  // ---- preload images just before they scroll into the wall's viewport ----
  useEffect(() => {
    const root = wallRef.current;
    if (!root || total === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const arrived: string[] = [];
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const key = (entry.target as HTMLElement).dataset.key;
            if (key) {
              arrived.push(key);
              observer.unobserve(entry.target);
            }
          }
        }
        if (arrived.length) {
          setInView((prev) => {
            const next = new Set(prev);
            arrived.forEach((k) => next.add(k));
            return next;
          });
        }
      },
      // start loading ~400px before a canvas reaches the horizontal viewport
      { root, rootMargin: "0px 400px" }
    );

    canvasRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [total, images]);

  // ---- center the first canvas on the wall once it has measured width ----
  const didInitialCenter = useRef(false);
  useEffect(() => {
    if (detailOpen || total === 0 || didInitialCenter.current) return;
    const el = wallRef.current;
    const first = images[0] && canvasRefs.current.get(images[0].key);
    if (!el || !first || first.offsetWidth === 0) return;
    el.scrollLeft =
      first.offsetLeft + first.offsetWidth / 2 - el.clientWidth / 2;
    didInitialCenter.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, loadedImages, detailOpen]);

  // ---- keep active thumbnail centered in the filmstrip ----
  useEffect(() => {
    if (!activeImage || detailOpen) return;
    const el = thumbRefs.current.get(activeImage.key);
    el?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeIndex, activeImage, detailOpen]);

  // ---- keyboard: arrow keys slide the wall one image at a time ----
  useEffect(() => {
    const slideTo = (idx: number) => {
      const clamped = Math.max(0, Math.min(total - 1, idx));
      goTo(clamped);
      const k = images[clamped]?.key;
      if (k) centerCanvas(k);
    };
    const onKey = (e: KeyboardEvent) => {
      if (detailOpen) {
        if (e.key === "Escape") closeDetail();
        return;
      }
      if (e.key === "Escape") onClose();
      // preventDefault: the wall is a scrollable region, so the browser's own
      // arrow-key scrolling would fight the animated glide
      if (e.key === "ArrowRight") {
        e.preventDefault();
        slideTo(activeIndex + 1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        slideTo(activeIndex - 1);
      }
      if (e.key === "Home") {
        e.preventDefault();
        slideTo(0);
      }
      if (e.key === "End") {
        e.preventDefault();
        slideTo(total - 1);
      }
      if (e.key === "Enter" && activeImage) openDetail(activeIndex);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    total,
    detailOpen,
    activeIndex,
    activeImage,
    images,
    goTo,
    openDetail,
    closeDetail,
    onClose,
    centerCanvas,
  ]);

  // ---- detail: reveal (big overlay title + painting) when opened ----
  useEffect(() => {
    if (!detailOpen) return;
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      if (captionRef.current) {
        const parts = captionRef.current.children;
        if (reduced) {
          gsap.set(parts, { autoAlpha: 1, y: 0 });
        } else {
          gsap.fromTo(
            parts,
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.9,
              ease: "power3.out",
              stagger: 0.12,
              delay: 0.2,
            }
          );
        }
      }
      if (paintingRef.current) {
        if (reduced) {
          gsap.set(paintingRef.current, { autoAlpha: 1, scale: 1 });
        } else {
          gsap.fromTo(
            paintingRef.current,
            { autoAlpha: 0, scale: 0.92 },
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.6,
              ease: "power3.out",
              clearProps: "transform",
            }
          );
        }
      }
    });
    // reset scroll to top of the story
    storyScrollRef.current?.scrollTo({ top: 0 });
    return () => ctx.revert();
  }, [detailOpen, activeIndex]);

  // ---- detail: fade the big overlay title out as you scroll ----
  useEffect(() => {
    if (!detailOpen) return;
    const scroller = storyScrollRef.current;
    if (!scroller) return;

    let raf = 0;
    const apply = () => {
      const vh = window.innerHeight || 1;
      const fade = clamp01(scroller.scrollTop / (vh * 0.5));
      if (captionRef.current) {
        captionRef.current.style.opacity = String(1 - fade);
      }
      if (scrollDownRef.current) {
        scrollDownRef.current.style.opacity = String(1 - fade);
        scrollDownRef.current.style.pointerEvents = fade > 0.6 ? "none" : "auto";
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };
    apply();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [detailOpen, activeIndex]);


  // magnification factor of the loupe relative to the displayed image
  const LENS_ZOOM = 3;

  // measured against the <img> itself (NOT the flex wrapper around it, which
  // is wider than the centered image — that offset was showing the wrong spot)
  const handleLensMove = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setLensPos({
      x: clamp01((e.clientX - rect.left) / rect.width),
      y: clamp01((e.clientY - rect.top) / rect.height),
    });
    // size the lens backdrop from the image's real displayed dimensions so the
    // zoom keeps the artwork's aspect ratio (a bare 450% of the square lens
    // box stretched non-square art and skewed the position mapping)
    setLensBg({
      w: rect.width * LENS_ZOOM,
      h: rect.height * LENS_ZOOM,
    });
  };

  if (!metadata) {
    return (
      <div className={styles.empty}>
        <button className={styles.backBtn} onClick={onClose}>
          ← Back
        </button>
        <p>No images in this album yet.</p>
      </div>
    );
  }

  return (
    <div
      className={`${styles.container} ${
        detailOpen ? styles.containerDetail : ""
      }`}
    >
      {!detailOpen && total > 0 && (
        <div className={styles.counterTop} aria-live="polite">
          {String(activeIndex + 1).padStart(2, "0")} /{" "}
          {String(total).padStart(2, "0")}
          <span className={styles.keysHint} aria-hidden>
            &nbsp;&middot;&nbsp;&larr; &rarr; to browse
          </span>
        </div>
      )}

      {!detailOpen && (
        <header className={styles.header}>
          <h1 className={styles.title}>{albumTitle}</h1>
        </header>
      )}

      {total === 0 && (
        <div className={styles.emptyInline}>
          <p>No images in this album yet.</p>
        </div>
      )}

      {/* ---- gallery loading spinner (until every image decodes) ---- */}
      {total > 0 && !galleryReady && (
        <div className={styles.galleryLoading}>
          <div className={styles.spinner} aria-hidden />
          <p className={styles.loadingText}>
            Loading gallery&hellip; {loadedImages.size}/{total}
          </p>
        </div>
      )}

      {/* ---- wall: horizontal row of borderless canvases ---- */}
      {total > 0 && (
        <>
          <div className={styles.pendant} aria-hidden />

          <div
            className={`${styles.wall} ${
              galleryReady ? styles.wallReady : ""
            }`}
            ref={wallRef}
            role="region"
            aria-label={`${albumTitle} images — use the left and right arrow keys to browse`}
            tabIndex={0}
          >
            <div className={styles.wallTrack}>
              {images.map((image, idx) => (
                <button
                  key={image.key}
                  type="button"
                  data-key={image.key}
                  ref={(el) => {
                    if (el) canvasRefs.current.set(image.key, el);
                    else canvasRefs.current.delete(image.key);
                  }}
                  className={`${styles.canvas} ${
                    idx === activeIndex ? styles.canvasActive : ""
                  }`}
                  onClick={() => openDetail(idx)}
                  aria-label={`Open ${image.data.title}`}
                >
                  <span className={styles.canvasFrame}>
                    {!loadedImages.has(image.key) && (
                      <span className={styles.imagePlaceholder} aria-hidden />
                    )}
                    {shouldLoad(image.key, idx) && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={sized(image.url, 1200)}
                        alt={image.data.title}
                        className={`${styles.canvasImg} ${
                          loadedImages.has(image.key)
                            ? styles.canvasImgLoaded
                            : ""
                        }`}
                        draggable={false}
                        decoding="async"
                        onLoad={() => markLoaded(image.key)}
                        onError={() => markLoaded(image.key)}
                      />
                    )}
                    <span className={styles.canvasTitle}>
                      {image.data.title}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ---- filmstrip ---- */}
          <div className={styles.filmstrip}>
            <div className={styles.filmstripInner}>
              {images.map((image, idx) => (
                <button
                  key={image.key}
                  type="button"
                  ref={(el) => {
                    if (el) thumbRefs.current.set(image.key, el);
                    else thumbRefs.current.delete(image.key);
                  }}
                  className={`${styles.thumb} ${
                    idx === activeIndex ? styles.thumbActive : ""
                  }`}
                  onClick={() => {
                    goTo(idx);
                    centerCanvas(image.key);
                  }}
                  aria-label={image.data.title}
                  aria-current={idx === activeIndex}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sized(image.url, 160, 70)}
                    alt={image.data.title}
                    className={styles.thumbImg}
                    draggable={false}
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>

          <button className={styles.backBtn} onClick={onClose}>
            ← Back to Albums
          </button>
        </>
      )}

      {/* ---- detail story (scroll-driven) ---- */}
      {detailOpen && activeImage && (
        <div
          className={styles.story}
          ref={storyScrollRef}
          role="dialog"
          aria-modal="true"
          aria-label={activeImage.data.title}
        >
          <button
            className={styles.closeBtn}
            onClick={closeDetail}
            aria-label="Close"
          >
            Close
          </button>

          <div className={`${styles.pendant} ${styles.pendantStory}`} aria-hidden />

          <button
            className={styles.scrollDown}
            ref={scrollDownRef}
            onClick={() => {
              const vh = window.innerHeight || 0;
              storyScrollRef.current?.scrollTo({
                top: vh * 1.7,
                behavior: prefersReducedMotion() ? "auto" : "smooth",
              });
            }}
            aria-label="Scroll down"
          >
            <span className={styles.scrollDownLabel}>Scroll</span>
            <span className={styles.scrollDownArrow} aria-hidden>
              ↓
            </span>
          </button>

          {/* scene 1: image with big overlay title in the blank space */}
          <div className={styles.stageHolder} ref={stageHolderRef}>
            <div className={styles.stage}>
              <div className={styles.bigOverlay} ref={captionRef}>
                <span className={styles.overlaySub}>
                  {activeImage.data.description
                    ? activeImage.data.description
                    : `${String(activeIndex + 1).padStart(2, "0")} / ${String(
                        total
                      ).padStart(2, "0")}`}
                </span>
                <h2 className={styles.bigTitle}>{activeImage.data.title}</h2>
              </div>
              <div className={styles.paintingWrap} ref={paintingRef}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sized(activeImage.url, 1600)}
                  alt={activeImage.data.title}
                  className={styles.painting}
                  draggable={false}
                />
              </div>
            </div>
          </div>

          {/* scene 3: zoom into detail with the cursor loupe */}
          <div className={styles.descScene}>
            <span className={styles.loupeHint}>Hover to zoom in</span>
            <div className={styles.detailImageWrap} ref={detailImgRef}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sized(activeImage.url, 1600)}
                alt={activeImage.data.title}
                className={styles.detailImage}
                draggable={false}
                onMouseEnter={() => setShowLens(true)}
                onMouseLeave={() => setShowLens(false)}
                onMouseMove={handleLensMove}
              />
            </div>

            <aside className={styles.detailSide}>
              <div
                className={styles.lens}
                style={{
                  backgroundImage: `url("${sized(activeImage.url, 2000)}")`,
                  // px size derived from the displayed image keeps the zoom
                  // aspect-true; "cover" is only the pre-hover fallback
                  backgroundSize: lensBg
                    ? `${lensBg.w}px ${lensBg.h}px`
                    : "cover",
                  backgroundPosition: `${lensPos.x * 100}% ${
                    lensPos.y * 100
                  }%`,
                  opacity: showLens ? 1 : 0.55,
                }}
                aria-hidden
              />

              {/* title + description, directly below the magnifier */}
              <div className={styles.finalText}>
                <h2 className={styles.finalTitle} ref={stageTitleRef}>
                  {activeImage.data.title}
                </h2>
                {activeImage.data.description && (
                  <p className={styles.finalDesc}>
                    {activeImage.data.description}
                  </p>
                )}
                <span className={styles.finalMeta}>
                  {albumTitle} · {String(activeIndex + 1).padStart(2, "0")} /{" "}
                  {String(total).padStart(2, "0")}
                </span>
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
