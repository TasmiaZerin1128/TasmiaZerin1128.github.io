"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ArtNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`art-nav${scrolled ? " art-nav-scrolled" : ""}`}>
      <div className="art-nav-inner">
        <Link href="/art" className="art-nav-logo">
          TASMIA
        </Link>
        <ul className="art-nav-menu">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <a href="#art-gallery">Portfolio</a>
          </li>
          <li>
            <Link href="/#about">About</Link>
          </li>
          <li>
            <a href="#art-gallery">Albums</a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
