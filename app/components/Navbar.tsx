"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [sticky, setSticky] = useState(false);
  const [menuActive, setMenuActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMenuClick = () => {
    setMenuActive(false);
  };

  return (
    <nav className={`navbar${sticky ? " sticky" : ""}`}>
      <div className="max-width">
        <div className="logo">
          <Link href="/">
            Portfo<span>lio.</span>
          </Link>
        </div>
        <ul className={`menu${menuActive ? " active" : ""}`}>
          <li>
            <a href="#home" onClick={handleMenuClick}>
              Home
            </a>
          </li>
          <li>
            <a href="#about" onClick={handleMenuClick}>
              About
            </a>
          </li>
          <li>
            <a href="#services" onClick={handleMenuClick}>
              Services
            </a>
          </li>
          <li>
            <a href="#skills" onClick={handleMenuClick}>
              Skills
            </a>
          </li>
          <li>
            <a href="#projects" onClick={handleMenuClick}>
              Projects
            </a>
          </li>
          <li>
            <a href="#gallery" onClick={handleMenuClick}>
              Gallery
            </a>
          </li>
        </ul>
        <div
          className="menu-btn"
          onClick={() => setMenuActive(!menuActive)}
        >
          <i className={`fas fa-${menuActive ? "times" : "bars"}`}></i>
        </div>
      </div>
    </nav>
  );
}
