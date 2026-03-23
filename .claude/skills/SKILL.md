---
name: gsap-portfolio
description: Build artistic, GSAP-animated portfolio websites and sections for software engineers. Use this skill whenever the user asks to create a portfolio, personal website, developer landing page, about-me page, skills section, project showcase, hero section, or any portfolio-related web component — especially if they want it to feel creative, animated, or visually distinctive while maintaining a developer/engineer identity. Also trigger when the user mentions GSAP, ScrollTrigger, timeline animations, scroll-driven animations, or wants to add cinematic motion to a webpage. Even if they just say "make my portfolio cooler" or "animate my site", use this skill.
---

# GSAP Portfolio Skill

Build portfolio websites that feel like a creative studio made them — but with the soul of a software engineer. The goal is never "corporate dev portfolio with a hero and cards." The goal is an experience that makes someone stop scrolling.

## Philosophy

Developer portfolios fail in two ways: they're either boring (white page, cards grid, "Hi I'm a developer") or they try too hard with effects that feel disconnected from the content. The sweet spot is **purposeful drama** — every animation should feel like it's revealing something, not just moving for the sake of it.

Think of the portfolio as a **narrative**, not a page. The visitor is being guided through a story: who you are → what you've built → how you think → how to reach you.

## GSAP Integration

Always load GSAP from CDN. Use the latest version from the GSAP CDN (not cdnjs):

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
```

For React projects, install via npm:
```bash
npm install gsap
```

```js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
```

### Core GSAP Patterns to Use

**1. Staggered Reveals** — The bread and butter. Never reveal a group of elements all at once.
```js
gsap.from('.skill-item', {
  y: 60,
  opacity: 0,
  duration: 0.8,
  stagger: 0.12,
  ease: 'power3.out',
  scrollTrigger: {
    trigger: '.skills-section',
    start: 'top 80%',
  }
});
```

**2. Text Split Animations** — Split headings into chars/words and animate them in. This is the single highest-impact animation you can add. Use SplitText plugin if available, or manually split with spans:
```js
// Manual char split
const heading = document.querySelector('.hero-title');
heading.innerHTML = heading.textContent.split('').map(
  (char, i) => `<span class="char" style="display:inline-block">${char === ' ' ? '&nbsp;' : char}</span>`
).join('');

gsap.from('.char', {
  y: 120,
  opacity: 0,
  rotateX: -80,
  stagger: 0.03,
  duration: 1,
  ease: 'power4.out',
});
```

**3. Scroll-Driven Pinning** — Pin sections and animate content within them as the user scrolls. Creates that "cinematic" feel.
```js
gsap.timeline({
  scrollTrigger: {
    trigger: '.pinned-section',
    start: 'top top',
    end: '+=200%',
    pin: true,
    scrub: 1,
  }
})
.from('.reveal-1', { xPercent: -100, opacity: 0 })
.from('.reveal-2', { yPercent: 50, opacity: 0 }, '-=0.3')
.from('.reveal-3', { scale: 0.8, opacity: 0 }, '-=0.3');
```

**4. Parallax Layers** — Give depth with different scroll speeds.
```js
gsap.to('.bg-layer', {
  yPercent: -30,
  ease: 'none',
  scrollTrigger: {
    trigger: '.parallax-section',
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
  }
});
```

**5. Magnetic / Follow Cursor Effects** — For interactive elements like CTAs or featured projects.
```js
const btn = document.querySelector('.magnetic-btn');
btn.addEventListener('mousemove', (e) => {
  const rect = btn.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;
  gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: 'power2.out' });
});
btn.addEventListener('mouseleave', () => {
  gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
});
```

**6. Horizontal Scroll Sections** — Perfect for project showcases. Scroll vertically but the content moves horizontally.
```js
const track = document.querySelector('.horizontal-track');
const items = gsap.utils.toArray('.project-card');

gsap.to(items, {
  xPercent: -100 * (items.length - 1),
  ease: 'none',
  scrollTrigger: {
    trigger: track,
    pin: true,
    scrub: 1,
    end: () => '+=' + track.scrollWidth,
  }
});
```

Read `references/gsap-patterns.md` for more advanced patterns including morphing shapes, custom cursor trails, noise-based movement, and WebGL integration hints.

## Aesthetic Direction

For a software engineer's portfolio, these aesthetic directions work best. Pick one per project — never blend them:

### 1. Terminal Noir
Dark background, monospaced type mixed with a sharp sans-serif, green/amber/cyan accent on black. Feels like you're inside a terminal — but a beautiful one. Use scanline overlays, blinking cursors, typing animations. Think: hacker aesthetic meets editorial design.

### 2. Brutalist Code
Raw, exposed structure. Visible grid lines, large mono type, harsh contrast. Elements feel like they were placed with `position: absolute` on purpose. Animations are snappy and mechanical — no ease-out, use `steps()` or `power4.inOut`. Think: if a compiler had taste.

### 3. Soft Engineering
Light backgrounds with warm neutrals, generous whitespace, elegant serif for headings paired with a clean sans. Smooth, flowing animations. Feels premium and calm. Think: if Dieter Rams designed a portfolio.

### 4. Neon Architect
Dark base, vivid neon accents (magenta, electric blue, lime), glassmorphism, glow effects. Animations are fluid and feel almost liquid. Grid-based layout with overlapping elements. Think: Blade Runner meets Swiss design.

### 5. Analog Digital
Paper textures, hand-drawn elements mixed with sharp digital type, subtle grain overlays. Warm color palette. Animations mimic physical movement — things slide like paper, stack like cards. Think: a developer who also sketches.

## Section Architecture

A strong portfolio follows this structure. Each section should feel like its own "scene":

### Hero
The first 3 seconds matter most. Start with text animation — the visitor should see your name come alive. Include a subtle ambient animation in the background (floating particles, morphing shapes, gradient animation). Keep the message dead simple: Name + one-line identity.

### About / Philosophy
Don't just list facts. Express a worldview. Use a scroll-triggered reveal to unveil text line by line. A photo is optional but if included, use a creative treatment (duotone, clip-path reveal, parallax offset).

### Skills / Tech Stack
NEVER use a boring grid of logos. Instead try: an orbital visualization, a scrolling ticker/marquee, interactive tags that react to hover, a constellation map, or a terminal-style list that "types" itself.

### Projects
The centerpiece. Each project needs breathing room. Use either: horizontal scroll gallery, full-screen stacked cards that pin and transition, or expandable cards with scroll-triggered reveals. Each project should show: title, brief description, tech used, and a visual (screenshot, video, or creative illustration).

### Contact / Footer
End with intention. A large typographic CTA, maybe a time-based greeting ("Good evening — let's talk"), and clean contact links. Keep it punchy.

Read `references/portfolio-sections.md` for detailed HTML/CSS/JS templates for each section type.

## Typography Rules

Import fonts from Google Fonts. Never use system fonts or Inter/Roboto.

Good pairings for developer portfolios:
- **Display + Body**: "Clash Display" + "Satoshi" (via fontshare.com CDN)
- **Display + Body**: "Syne" + "Work Sans" (Google Fonts)
- **Display + Body**: "Space Grotesk" + "DM Sans" (Google Fonts) — only if doing a techy vibe
- **Mono + Sans**: "JetBrains Mono" + "General Sans" (fontshare) — for terminal aesthetic
- **Serif + Sans**: "Playfair Display" + "Source Sans 3" — for the soft/premium direction
- **Display + Body**: "Anybody" + "Instrument Sans" (Google Fonts)
- **Display + Body**: "Bricolage Grotesque" + "Geist" (via CDN)

Load via:
```html
<link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@400,500,700&display=swap" rel="stylesheet">
```
or
```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Work+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
```

## Color Rules

Define a palette using CSS custom properties. Every palette needs:
- `--bg`: main background
- `--fg`: main text
- `--accent`: primary pop color
- `--accent-2`: secondary accent (optional)
- `--muted`: subdued text / borders
- `--surface`: card/section backgrounds

Example (Terminal Noir):
```css
:root {
  --bg: #0a0a0a;
  --fg: #e8e8e8;
  --accent: #00ff88;
  --accent-2: #0088ff;
  --muted: #333;
  --surface: #111;
}
```

Example (Soft Engineering):
```css
:root {
  --bg: #f8f5f0;
  --fg: #1a1a1a;
  --accent: #c45d3e;
  --accent-2: #2d5a7b;
  --muted: #b8b0a4;
  --surface: #ffffff;
}
```

## Performance Rules

GSAP is performant by default, but follow these:
- Use `will-change: transform` on animated elements
- Prefer `transform` and `opacity` over layout properties (width, height, top, left)
- Use `ScrollTrigger.batch()` for many similar elements instead of individual triggers
- Add `loading="lazy"` to images below the fold
- Keep total page weight under 2MB (excluding videos)
- Use `gsap.matchMedia()` to disable heavy animations on mobile:
```js
gsap.matchMedia().add('(max-width: 768px)', () => {
  // Simpler mobile animations here
});
```

## Responsiveness

Every section must work on mobile. Key rules:
- Font sizes: use `clamp()` for fluid scaling — e.g., `clamp(2rem, 5vw, 5rem)`
- Horizontal scroll sections should convert to vertical stacking on mobile
- Pinned sections: reduce pin duration or remove pin on mobile via `gsap.matchMedia()`
- Touch targets: buttons/links at least 44px
- Test at 375px, 768px, 1440px breakpoints

## Accessibility

Animated portfolios still need to be accessible:
- Respect `prefers-reduced-motion`:
```js
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReduced) {
  gsap.globalTimeline.timeScale(0); // or skip animations entirely
}
```
- Semantic HTML: use `<main>`, `<section>`, `<nav>`, `<header>`, `<footer>`
- Alt text on all images
- Keyboard-navigable interactive elements
- Sufficient color contrast (4.5:1 minimum for body text)

## When Building

1. Start with the aesthetic direction — confirm with user or pick based on their vibe
2. Build the HTML structure with semantic sections
3. Style with CSS (custom properties, fluid type, grid/flexbox)
4. Layer in GSAP animations section by section
5. Add ScrollTrigger for scroll-driven reveals
6. Add interactivity (hover states, cursor effects, micro-interactions)
7. Make responsive
8. Add `prefers-reduced-motion` handling
9. Optimize (lazy loading, will-change, matchMedia for mobile)

Always output a single HTML file with embedded CSS and JS unless the user specifies a framework.
