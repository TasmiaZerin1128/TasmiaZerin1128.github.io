"use client";

import Image from "next/image";
import Link from "next/link";
import TypingEffect from "./TypingEffect";

const typingStrings = ["Student", "Designer", "Programmer", "Developer"];

export default function AboutSection() {
  return (
    <section className="about" id="about">
      <div className="max-width">
        <h2 className="title">About Me</h2>
        <div className="about-content">
          <div className="column left">
            <Image
              src="/images/TasmiaYellow.jpg"
              alt="Tasmia Zerin"
              width={400}
              height={500}
              style={{ height: "500px", width: "auto" }}
            />
          </div>
          <div className="column right">
            <div className="text">
              I&apos;m Tasmia and I&apos;m a{" "}
              <TypingEffect strings={typingStrings} />
            </div>
            <p>
              Hello! I am currently studying in Institute of Information
              Technology, University of Dhaka. So I am basically studying on
              Software Engineering. As of extra curricular activities, I can do
              digital arts and illustrations, little editing stuffs and develop
              app UIs. I had my HSC from Holy Cross College in 2018 and had my
              SSC from Holy Cross Girls&apos; High School in 2016. Glad to know
              you visited my portfolio. Thank you!
            </p>
            <a className="down" href="/CV.png" download="TasmiaCV">
              Download CV
            </a>
            <Link className="view" href="/cv">
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
