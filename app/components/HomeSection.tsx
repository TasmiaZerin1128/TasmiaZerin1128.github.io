"use client";

import Image from "next/image";
import TypingEffect from "./TypingEffect";

const typingStrings = ["Student", "Designer", "Programmer", "Developer"];

export default function HomeSection() {
  return (
    <section className="home" id="home">
      <div className="max-width">
        <div className="home-content">
          <Image
            src="/images/mySign.png"
            alt="Signature"
            className="mySign"
            width={300}
            height={180}
            style={{ height: "180px", width: "auto" }}
            priority
          />
          <div className="text-1">Hello, my name is</div>
          <div className="text-2">Tasmia Zerin</div>
          <div className="text-3">
            &amp; I am a{" "}
            <TypingEffect strings={typingStrings} className="typing" />
          </div>
          <a href="#about">Know More</a>
        </div>
      </div>
    </section>
  );
}
