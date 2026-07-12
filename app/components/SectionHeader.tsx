"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  /** set on sections with a dark background so the title renders white */
  dark?: boolean;
}

export default function SectionHeader({
  title,
  subtitle,
  dark = false,
}: SectionHeaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const scrollTrigger = {
        trigger: rootRef.current,
        start: "top 85%",
      };
      gsap.from(titleRef.current, {
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger,
      });
      gsap.from(lineRef.current, {
        scaleX: 0,
        duration: 0.6,
        delay: 0.3,
        ease: "power2.out",
        scrollTrigger,
      });
      gsap.from(subtitleRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        delay: 0.5,
        ease: "power2.out",
        scrollTrigger,
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      className={`sec-header${dark ? " sec-header-dark" : ""}`}
      ref={rootRef}
    >
      <h2 className="sec-title" ref={titleRef}>
        {title}
      </h2>
      <div className="sec-line" ref={lineRef}></div>
      <span className="sec-subtitle" ref={subtitleRef}>
        {subtitle}
      </span>
    </div>
  );
}
