"use client";

import { useEffect, useRef } from "react";

const TRAIL_COUNT = 7;
const PAINT_COLORS = [
  "#f4a261",
  "#e76f51",
  "#c9743d",
  "#d4a574",
  "#b56a4e",
  "#e9c46a",
];

export default function CustomCursor() {
  const brushRef = useRef<SVGSVGElement>(null);
  const trailRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;

    document.body.classList.add("art-cursor-active");

    const pos = { x: -100, y: -100 };
    const trail = Array.from({ length: TRAIL_COUNT }, () => ({
      x: -100,
      y: -100,
      color: PAINT_COLORS[0],
    }));

    let raf = 0;
    let frame = 0;
    let colorIdx = 0;
    let hovering = false;

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
    };

    const onDown = () => {
      brushRef.current?.classList.add("art-cursor-brush-click");
      spawnSplash(pos.x, pos.y);
    };
    const onUp = () => {
      brushRef.current?.classList.remove("art-cursor-brush-click");
    };

    const interactiveSelector =
      "a, button, .art-card, .art-hero-btn, .art-nav-menu li";
    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const isInteractive =
        target?.closest && target.closest(interactiveSelector);
      if (isInteractive && !hovering) {
        hovering = true;
        brushRef.current?.classList.add("art-cursor-brush-hover");
      } else if (!isInteractive && hovering) {
        hovering = false;
        brushRef.current?.classList.remove("art-cursor-brush-hover");
      }
    };

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
        drop.style.background =
          PAINT_COLORS[(colorIdx + i) % PAINT_COLORS.length];
        splash.appendChild(drop);
      }
      document.body.appendChild(splash);
      setTimeout(() => splash.remove(), 650);
    };

    const animate = () => {
      frame++;

      if (brushRef.current) {
        brushRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      }

      if (frame % 2 === 0) {
        for (let i = trail.length - 1; i > 0; i--) {
          trail[i].x = trail[i - 1].x;
          trail[i].y = trail[i - 1].y;
          trail[i].color = trail[i - 1].color;
        }
        trail[0].x = pos.x;
        trail[0].y = pos.y;
        colorIdx = (colorIdx + 1) % PAINT_COLORS.length;
        trail[0].color = PAINT_COLORS[colorIdx];
      }

      for (let i = 0; i < trail.length; i++) {
        const el = trailRefs.current[i];
        if (!el) continue;
        const t = trail[i];
        const opacity = (1 - i / trail.length) * 0.85;
        const scale = 1.1 - i / (trail.length * 1.3);
        el.style.transform = `translate3d(${t.x}px, ${t.y}px, 0) translate(-50%, -50%) scale(${scale})`;
        el.style.opacity = `${opacity}`;
        el.style.background = t.color;
      }

      raf = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      cancelAnimationFrame(raf);
      document.body.classList.remove("art-cursor-active");
    };
  }, []);

  return (
    <>
      <svg
        ref={brushRef}
        className="art-cursor-brush"
        width="40"
        height="40"
        viewBox="0 0 24 24"
        aria-hidden
      >
        {/* Handle — brown */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          fill="#5a3a1f"
          d="M20.599 1.5c-.376 0-.743.111-1.055.32l-5.08 3.385a18.747 18.747 0 0 0-3.471 2.987 10.04 10.04 0 0 1 4.815 4.815 18.748 18.748 0 0 0 2.987-3.472l3.386-5.079A1.902 1.902 0 0 0 20.599 1.5Z"
        />
        {/* Brush stroke / tip swoosh */}
        <path
          className="art-cursor-bristle-middle-tip"
          fillRule="evenodd"
          clipRule="evenodd"
          fill="#704019"
          d="M12.299 15.525a18.76 18.76 0 0 0 1.896-1.207 8.026 8.026 0 0 0-4.513-4.513A18.75 18.75 0 0 0 8.475 11.7l-.278.5a5.26 5.26 0 0 1 3.601 3.602l.502-.278Z"
        />
        {/* Paint droplet */}
        <path
          className="art-cursor-bristle-tip"
          fillRule="evenodd"
          clipRule="evenodd"
          fill="#C44D71"
          d="M6.75 13.5A3.75 3.75 0 0 0 3 17.25a1.5 1.5 0 0 1-1.601 1.497.75.75 0 0 0-.7 1.123 5.25 5.25 0 0 0 9.8-2.62 3.75 3.75 0 0 0-3.75-3.75Z"
        />
      </svg>
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
