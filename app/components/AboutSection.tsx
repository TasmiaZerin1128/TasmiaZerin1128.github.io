"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const imageRevealRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLParagraphElement>(null);
  const btnsRef = useRef<HTMLDivElement>(null);
  const decorLineRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title slide in
      gsap.from(titleRef.current, {
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      // Decorative line grows
      gsap.from(decorLineRef.current, {
        scaleX: 0,
        duration: 0.6,
        delay: 0.3,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      // Tag text fades in
      gsap.from(tagRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        delay: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      // Image reveal - overlay slides away to reveal image
      const imgTl = gsap.timeline({
        scrollTrigger: {
          trigger: imageWrapRef.current,
          start: "top 75%",
        },
      });

      imgTl
        .from(imageWrapRef.current, {
          x: -80,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
        })
        .to(
          imageRevealRef.current,
          {
            scaleX: 0,
            transformOrigin: "right center",
            duration: 0.7,
            ease: "power3.inOut",
          },
          0.3
        );

      // Right side staggered content
      const rightTl = gsap.timeline({
        scrollTrigger: {
          trigger: bioRef.current,
          start: "top 80%",
        },
      });

      rightTl
        .from(bioRef.current, {
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
        })
        .from(
          btnsRef.current,
          {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.2"
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="about" id="about" ref={sectionRef}>
      <div className="max-width">
        {/* Section header with decorative elements */}
        <div className="about-header">
          <h2 className="about-title" ref={titleRef}>
            About Me
          </h2>
          <div className="about-title-line" ref={decorLineRef}></div>
          <span className="about-subtitle" ref={tagRef}>
            Who I Am
          </span>
        </div>

        <div className="about-content">
          {/* Image with reveal overlay */}
          <div className="column left">
            <div className="about-img-wrap" ref={imageWrapRef}>
              <div className="about-img-reveal" ref={imageRevealRef}></div>
              <Image
                src="/images/tasmiazerin.jpg"
                alt="Tasmia Zerin"
                width={400}
                height={500}
                style={{ height: "auto", width: "100%" }}
              />
              {/* Floating accent frame */}
              <div className="about-img-frame"></div>
            </div>
          </div>

          {/* Text content */}
          <div className="column right">
            <p className="about-bio" ref={bioRef}>
              I am currently working as a Software Engineer at Cefalo
              Bangladesh Ltd. I completed my bachelors and masters from
              Institute of Information Technology, University of Dhaka. As of
              extra curricular activities, I can do digital arts and
              illustrations, little editing stuffs and develop app UIs. I had my
              HSC from Holy Cross College in 2018 and had my SSC from Holy Cross
              Girls&apos; High School in 2016. Glad to know you visited my
              portfolio. Thank you!
            </p>
            <div className="about-btns" ref={btnsRef}>
              <a className="about-btn about-btn-primary" href="/CV.png" download="TasmiaCV">
                Download CV
              </a>
              <Link className="about-btn about-btn-outline" href="/cv">
                View Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
