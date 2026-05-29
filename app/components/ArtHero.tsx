"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";

const TOP_LINE = "TASMIA’S";
const BOTTOM_LINE = "GALLERY";

function splitChars(el: HTMLElement | null, text: string) {
  if (!el) return;
  el.innerHTML = text
    .split("")
    .map((c) =>
      c === " "
        ? `<span class="art-poster-char art-poster-space">&nbsp;</span>`
        : `<span class="art-poster-char">${c}</span>`
    )
    .join("");
}

export default function ArtHero() {
  const rootRef = useRef<HTMLElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    splitChars(topRef.current, TOP_LINE);
    splitChars(bottomRef.current, BOTTOM_LINE);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".art-poster-titleblock",
        { opacity: 0 },
        { opacity: 1, duration: 0.2 }
      )
        .fromTo(
          ".art-poster-top .art-poster-char",
          { y: -120, opacity: 0, rotateZ: -8 },
          {
            y: 0,
            opacity: 1,
            rotateZ: 0,
            stagger: 0.04,
            duration: 0.75,
            ease: "back.out(1.4)",
          },
          0
        )
        .fromTo(
          ".art-poster-bottom .art-poster-char",
          { y: 160, opacity: 0, rotateZ: 6 },
          {
            y: 0,
            opacity: 1,
            rotateZ: 0,
            stagger: 0.055,
            duration: 0.95,
            ease: "back.out(1.3)",
          },
          "-=0.55"
        )
        .fromTo(
          ".art-poster-figure",
          { y: 120, opacity: 0, scale: 0.96 },
          { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power4.out" },
          "-=0.9"
        )
        .fromTo(
          ".art-poster-mark",
          { opacity: 0, y: 12 },
          {
            opacity: (_i, el) =>
              (el as HTMLElement).classList.contains("art-poster-mark-br")
                ? 0.62
                : 0.8,
            y: 0,
            stagger: 0.1,
            duration: 0.7,
            ease: "power2.out",
          },
          "-=0.6"
        )
        .fromTo(
          ".art-poster-scroll",
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.3"
        );

    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="art-poster" ref={rootRef} id="art-hero">
      <div className="art-poster-titleblock" aria-hidden>
        <div className="art-poster-top" ref={topRef}>
          {TOP_LINE}
        </div>
        <div className="art-poster-bottom" ref={bottomRef}>
          {BOTTOM_LINE}
        </div>
      </div>

      <h1 className="art-poster-sr">Tasmia&rsquo;s Gallery</h1>

      <div className="art-poster-figure-wrap">
        <Image
          className="art-poster-figure"
          src="/images/edited-photo.png"
          alt="Tasmia"
          width={900}
          height={1300}
          priority
          unoptimized
        />
      </div>


      <span className="art-poster-mark art-poster-mark-br">
        Tasmia&nbsp;&middot;&nbsp;Gallery
      </span>

      <a
        href="#art-gallery"
        className="art-poster-scroll"
        aria-label="Scroll to gallery"
      >
        <span className="art-poster-scroll-label">Scroll</span>
        <span className="art-poster-scroll-dot" />
      </a>
    </section>
  );
}
