"use client";

import { useState, useEffect } from "react";

export default function ScrollUpButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className={`scroll-up-btn${show ? " show" : ""}`}
      onClick={scrollToTop}
    >
      <i className="fas fa-angle-up"></i>
    </div>
  );
}
