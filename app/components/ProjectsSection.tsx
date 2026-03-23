"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type LinkType = "github" | "play" | "view";

interface Project {
  image: string;
  title: string;
  description: string;
  link: string;
  linkType: LinkType;
}

const projects: Project[] = [
  {
    image: "/images/chemouflage.jpg",
    title: "Chemouflage",
    description: "An interactive AR learning app for Chemistry",
    link: "https://github.com/TasmiaZerin1128/Chemouflage",
    linkType: "github",
  },
  {
    image: "/images/fusics.gif",
    title: "FUSICS",
    description: "Learn Physics in an interactive and fun way",
    link: "https://github.com/TasmiaZerin1128/Software-Project-Lab-1",
    linkType: "github",
  },
  {
    image: "/images/educhain.PNG",
    title: "EduChain",
    description: "A blockchain based educational course provider app",
    link: "https://github.com/jsureka/BUET_Hackathon_GGWP",
    linkType: "github",
  },
  {
    image: "/images/khelahobe.PNG",
    title: "Khela Hobe",
    description:
      "A web application made with Angular and NodeJs for viewing online games",
    link: "https://github.com/jaf107/origin-mtm",
    linkType: "github",
  },
  {
    image: "/images/c4.gif",
    title: "Connect 4",
    description: "A game to connect 4 dots in any direction with AI Opponent",
    link: "https://connect4play.netlify.app/",
    linkType: "play",
  },
  {
    image: "/images/clippy.png",
    title: "Clippy",
    description: "Smart PDF Reader for better Paper Reading Experience and Knowledge Mining",
    link: "https://github.com/jaf107/Clippy?tab=readme-ov-file",
    linkType: "github",
  },
  {
    image: "/images/wumpusWorldHome.png",
    title: "Wumpus World",
    description:
      "An AI player based game to steal golds and kill the wumpus",
    link: "https://wumpusworld.netlify.app/",
    linkType: "play",
  },
  {
    image: "/images/naruto.png",
    title: "Naruto Shippuden Intros",
    description: "Simple webpage showing 4 intros of Naruto Shippuden",
    link: "https://narutoshippudenintros.netlify.app/",
    linkType: "view",
  },
  {
    image: "/images/dsse.png",
    title: "DSSE Research Group",
    description: "A website for the research group I am part of at University of Dhaka",
    link: "https://dsse.iit.du.ac.bd/",
    linkType: "view",
  },
];

function BadgeIcon({ type }: { type: LinkType }) {
  if (type === "github") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    );
  }
  if (type === "play") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
    );
  }
  // view / external link
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

const ITEMS_PER_PAGE = 3;
const AUTO_SCROLL_INTERVAL = 5000;
const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);

export default function ProjectsSection() {
  const [page, setPage] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isAnimating = useRef(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const decorLineRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPaused = useRef(false);

  const slideTo = useCallback((newPage: number) => {
    if (isAnimating.current || !trackRef.current) return;
    isAnimating.current = true;

    const cards = trackRef.current.querySelectorAll(".proj-card");

    gsap.to(cards, {
      opacity: 0,
      y: 30,
      stagger: 0.06,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        setPage(newPage);
      },
    });
  }, []);

  // Animate in new cards after page state updates
  useEffect(() => {
    if (!trackRef.current) return;
    const cards = trackRef.current.querySelectorAll(".proj-card");

    gsap.fromTo(
      cards,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        duration: 0.5,
        ease: "power3.out",
        onComplete: () => {
          isAnimating.current = false;
        },
      }
    );
  }, [page]);

  // Auto-scroll timer
  useEffect(() => {
    const startTimer = () => {
      autoTimer.current = setInterval(() => {
        if (isPaused.current || isAnimating.current) return;
        setPage((prev) => {
          const next = (prev + 1) % totalPages;
          // trigger the slide animation
          if (trackRef.current) {
            isAnimating.current = true;
            const cards = trackRef.current.querySelectorAll(".proj-card");
            gsap.to(cards, {
              opacity: 0,
              y: 30,
              stagger: 0.06,
              duration: 0.3,
              ease: "power2.in",
              onComplete: () => {
                setPage(next);
              },
            });
          }
          return prev; // don't update yet, onComplete will
        });
      }, AUTO_SCROLL_INTERVAL);
    };

    startTimer();
    return () => {
      if (autoTimer.current) clearInterval(autoTimer.current);
    };
  }, []);

  // Pause auto-scroll on hover
  const handleMouseEnter = () => { isPaused.current = true; };
  const handleMouseLeave = () => { isPaused.current = false; };

  // Scroll-triggered entrance for header
  useEffect(() => {
    const ctx = gsap.context(() => {
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
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const start = page * ITEMS_PER_PAGE;
  const visible = projects.slice(start, start + ITEMS_PER_PAGE);

  const goPrev = () => {
    if (page > 0) slideTo(page - 1);
  };
  const goNext = () => {
    if (page < totalPages - 1) slideTo(page + 1);
  };

  return (
    <section className="teams" id="projects" ref={sectionRef}>
      <div className="max-width">
        <div className="proj-header">
          <h2 className="proj-title" ref={titleRef}>My Software Projects</h2>
          <div className="proj-title-line" ref={decorLineRef}></div>
          <span className="proj-subtitle" ref={tagRef}>What I Made</span>
        </div>

        <div
          className="proj-carousel"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Prev arrow */}
          <button
            className="proj-arrow proj-arrow-left"
            onClick={goPrev}
            disabled={page === 0}
            aria-label="Previous projects"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Cards track */}
          <div className="proj-track" ref={trackRef}>
            {visible.map((project) => (
              <a
                className="proj-card"
                key={project.title}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="proj-card-img">
                  <Image
                    src={project.image}
                    alt={project.title}
                    width={500}
                    height={300}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    unoptimized
                  />
                  <span className="proj-card-badge">
                    <BadgeIcon type={project.linkType} />
                  </span>
                </div>
                <div className="proj-card-body">
                  <h3 className="proj-card-title">{project.title}</h3>
                  <p className="proj-card-desc">{project.description}</p>
                </div>
              </a>
            ))}
          </div>

          {/* Next arrow */}
          <button
            className="proj-arrow proj-arrow-right"
            onClick={goNext}
            disabled={page === totalPages - 1}
            aria-label="Next projects"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Dots */}
        <div className="proj-dots">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`proj-dot ${i === page ? "proj-dot-active" : ""}`}
              onClick={() => { if (i !== page) slideTo(i); }}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
