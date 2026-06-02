"use client";

import { useEffect, useRef } from "react";

const TRAIL_COUNT = 18;
const PAINT_COLORS = [
  "#ff3b6b", // hot pink
  "#ff8c1a", // vivid orange
  "#ffd300", // bright yellow
  "#2ecc40", // green
  "#1ec8ff", // cyan
  "#7b5bff", // violet
];

// Head dot color: a deep orange so the leading circle reads as the cursor
// anchor while staying in the warm palette (not a dark blob).
const HEAD_COLOR = "#e8731a";

// One stable, randomized color per trail position (no serial sweep, no
// strobing). Picked once per mount; adjacent dots avoid repeating.
const buildColors = () => {
  const colors = [HEAD_COLOR];
  for (let i = 1; i < TRAIL_COUNT; i++) {
    let c = PAINT_COLORS[Math.floor(Math.random() * PAINT_COLORS.length)];
    while (c === colors[i - 1]) {
      c = PAINT_COLORS[Math.floor(Math.random() * PAINT_COLORS.length)];
    }
    colors.push(c);
  }
  return colors;
};

export default function CustomCursor() {
  const trailRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;

    document.body.classList.add("art-cursor-active");

    const pos = { x: -100, y: -100 };
    const trail = Array.from({ length: TRAIL_COUNT }, () => ({
      x: -100,
      y: -100,
    }));

    // Assign stable colors once (avoids SSR hydration mismatch from random()).
    const colors = buildColors();
    colors.forEach((c, i) => {
      const el = trailRefs.current[i];
      if (el) el.style.background = c;
    });

    let raf = 0;

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
    };

    const onDown = () => spawnSplash(pos.x, pos.y);

    const spawnSplash = (x: number, y: number) => {
      const splash = document.createElement("span");
      splash.className = "art-cursor-splash";
      splash.style.left = `${x}px`;
      splash.style.top = `${y}px`;
      for (let i = 0; i < 6; i++) {
        const drop = document.createElement("span");
        drop.className = "art-cursor-droplet";
        const angle = (Math.PI * 2 * i) / 6 + Math.random() * 0.6;
        const dist = 20 + Math.random() * 16;
        drop.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
        drop.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
        drop.style.setProperty("--sz", `${4 + Math.random() * 5}px`);
        drop.style.background = PAINT_COLORS[i % PAINT_COLORS.length];
        splash.appendChild(drop);
      }
      document.body.appendChild(splash);
      setTimeout(() => splash.remove(), 650);
    };

    const animate = () => {
      // Lead dot eases toward the cursor; each following dot chases the one
      // ahead. A gentle follow factor spreads them into a long swatch. When
      // idle they all converge on the cursor, collapsing into one circle.
      trail[0].x += (pos.x - trail[0].x) * 0.45;
      trail[0].y += (pos.y - trail[0].y) * 0.45;

      for (let i = 1; i < trail.length; i++) {
        trail[i].x += (trail[i - 1].x - trail[i].x) * 0.32;
        trail[i].y += (trail[i - 1].y - trail[i].y) * 0.32;
      }

      for (let i = 0; i < trail.length; i++) {
        const el = trailRefs.current[i];
        if (!el) continue;
        const t = trail[i];
        const opacity = 0.9 - (i / trail.length) * 0.35;
        const scale = 1.1 - (i / trail.length) * 0.55;
        el.style.transform = `translate3d(${t.x}px, ${t.y}px, 0) translate(-50%, -50%) scale(${scale})`;
        el.style.opacity = `${opacity}`;
      }

      raf = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      cancelAnimationFrame(raf);
      document.body.classList.remove("art-cursor-active");
    };
  }, []);

  return (
    <>
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) trailRefs.current[i] = el;
          }}
          className="art-cursor-trail"
          style={{
            borderRadius:
              i % 2 === 0 ? "55% 45% 60% 40%" : "45% 55% 40% 60%",
          }}
          aria-hidden
        />
      ))}
    </>
  );
}
