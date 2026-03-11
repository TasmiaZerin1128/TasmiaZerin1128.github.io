"use client";

import { useState, useEffect, useCallback } from "react";

interface TypingEffectProps {
  strings: string[];
  typeSpeed?: number;
  backSpeed?: number;
  className?: string;
}

export default function TypingEffect({
  strings,
  typeSpeed = 80,
  backSpeed = 60,
  className,
}: TypingEffectProps) {
  const [text, setText] = useState("");
  const [stringIndex, setStringIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const tick = useCallback(() => {
    const currentString = strings[stringIndex];

    if (!isDeleting) {
      if (charIndex < currentString.length) {
        setText(currentString.substring(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      } else {
        setTimeout(() => setIsDeleting(true), 1200);
        return;
      }
    } else {
      if (charIndex > 0) {
        setText(currentString.substring(0, charIndex - 1));
        setCharIndex((prev) => prev - 1);
      } else {
        setIsDeleting(false);
        setStringIndex((prev) => (prev + 1) % strings.length);
      }
    }
  }, [charIndex, isDeleting, stringIndex, strings]);

  useEffect(() => {
    const speed = isDeleting ? backSpeed : typeSpeed;
    const timer = setTimeout(tick, speed);
    return () => clearTimeout(timer);
  }, [tick, isDeleting, backSpeed, typeSpeed]);

  return <span className={className}>{text}</span>;
}
