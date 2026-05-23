# Casey Shiray Portfolio — Migration & Redesign Spec

**Date:** 2026-05-22 (revised through brainstorming session)
**Status:** Draft, awaiting final user review
**Reference design:** `/reference/portfolio-v1.html` — used for content, voice, and component anatomy; **visual palette is replaced** by the locked palette in §6
**Current production site:** [caseyshiray.com](https://www.caseyshiray.com/) (Squarespace)

---

## 1. Goal

Migrate Casey Shiray's portfolio from Squarespace to **Cloudflare Pages**, redesigned around a new visual direction ("playful brutalist-lite" — cream + ink + vermillion + lime + deep plum, with lavender as a soft tint on dark surfaces). The redesign carries over the strong opinionated voice already drafted in `portfolio-v1.html` ("Is training *actually* the answer here?"), four real case studies with dedicated detail pages, a multi-page IA (Home / Work / About / Hobbies), and a category-based Hobbies section with optional per-project detail pages.

The site is shipped as a single tuned theme — no theme picker — because the locked palette is tight enough that swapping any one color would break the system. Each playful treatment (rotated name badge, highlighted-block H1, highlighted-block section headings) earns its place.

This spec covers what we're building, not the step-by-step plan to build it. The implementation plan comes next.

---

## 2. Locked decisions

| Decision | Value |
|---|---|
| Stack | Astro + MDX + TypeScript |
| Styling | Hand-authored CSS using CSS custom properties for the locked palette. No Tailwind/CSS-in-JS. |
| Motion | Lenis (smooth scroll) + GSAP (entrances, counters, scroll-triggered reveals). Astro View Transitions for nav between pages. |
| Hosting | Cloudflare Pages, deployed from a GitHub repo |
| Domain | `caseyshiray.com` — currently registered + DNS at Squarespace. Will transfer registrar to Cloudflare (free) and move DNS at the same time. |
| Content authoring | Case studies + hobby projects in MDX. Casey edits Markdown frontmatter + body for new entries. |
| Maintenance | Casey is semi-technical; comfortable with Markdown in a Git workflow. No CMS UI for v1. |
| Fonts | **League Spartan** (display), **IBM Plex Sans** (body), **IBM Plex Mono** (metadata + labels), **IBM Plex Serif italic** (emphasis in body), **Caveat** (handwritten subtitle accent). Loaded from Google Fonts. |
| Palette | **Light surface:** Cream `#FEF6E4` · Ink `#1D1D1F` · Vermillion `#FF5E3A` · Lime `#88C23E` · Deep Plum `#4B2C5A` · Lavender `#C8B4D0`. **Dark surface:** warm near-black `#1C1820` · elevated dark `#261F30` · cream-off-white text `#FAF3E0` · Vermillion + Lime unchanged · Lavender `#C8B4D0` is promoted to fill plum's role. Inside the inverted cream work card on dark surface, plum returns to its full `#4B2C5A`. See §6 for jobs and rules. |
| Themes | **One brand, two surfaces.** Single visual identity rendered in light and dark variants — not a multi-theme picker. Dark mode activates automatically via `prefers-color-scheme: dark`, with a small manual toggle (sun/moon in the nav) that overrides and persists to localStorage. |
| Treatments | **Three playful moves:** (1) rotated name badge in hero, (2) highlighted-block treatment on hero H1 keywords ("actually" / "here"), (3) highlighted-block treatment on section headings (one word per heading). Featured-ribbon and dual-rotated-card treatments cut for restraint. |
| IA | 4 top-level pages: Home / Work / About / Hobbies. Case study detail pages under `/work/[slug]`. Hobby category pages under `/hobbies/[category]` with optional project detail at `/hobbies/[category]/[slug]` for "favorites." No standalone Contact or Resume page — both fold into About. |
| Case study content | 4 real case studies ship at launch: *Designs That Matter*, *Day One, For Real*, *The Form That Worked*, *Manager Defense*. Each gets a full detail page. |
| Hobbies | 5–7 categories (Costuming, Woodworking, Painting, etc.). Each example is a photo + caption by default. "Favorite" examples get dedicated detail pages with long-form story (process, materials, lessons). |

---

## 3. Site map

Four top-level routes plus case study detail pages. **No standalone Contact page** — contact info lives at the bottom of About. **No standalone Resume page** — work history is folded into About.

```
/                            Home — personality + selected work tease
  └─ Hero (H1 with highlighted-block keywords + Caveat subtitle + meta strip)
  └─ Metrics tease (4 career-level stats)
  └─ Selected work (3 featured cards → /work)
  └─ Closing CTA → /about (contact lives at the bottom of /about)

/work                        Work — full case study index
  └─ Intro
  └─ All case study cards sorted by `order`

/work/designs-that-matter    Case study detail
/work/day-one-for-real       Case study detail
/work/the-form-that-worked   Case study detail
/work/manager-defense        Case study detail

/about                       About — no traditional bio paragraph
  └─ Philosophy (3 cards: Diagnose / Design with evidence / Defend the call)
  └─ Process (4 phases: Spot it / Explain it / Fix it / Defend it)
  └─ Full work history (roles, education, certs, talks, publications)
  └─ ContactBlock at bottom (email + LinkedIn + downloadable PDF resume)

/hobbies                     Hobbies — category tile grid (5–7 tiles)
/hobbies/costuming           Category page — intro + project gallery
/hobbies/woodworking         Category page
/hobbies/painting            Category page
…and so on per category

/hobbies/costuming/witch-from-the-wilds-2024   Favorite-project detail (only for `favorite: true`)
…and other favorites

/404                         Branded 404
```

**Section reassignments from portfolio-v1.html → new structure:**

| Section in `portfolio-v1.html` | Lives in v1 redesign |
|---|---|
| Hero | `/` Home (and re-used on `/about` as a smaller variant if desired) |
| Philosophy (`#philosophy`) | `/about` |
| Selected Work (`#work`) | Teased on `/`, full on `/work` |
| Metrics (`#metrics`) | `/` Home (tease) — career-level proof points belong on the front door |
| Process (`#process`) | `/about` |
| About (`#about`) | `/about` (folded into the larger About page, but **no separate bio paragraph** per Casey's direction; the philosophy + process + work history *are* the about) |
| Contact (`#contact`) | Bottom of `/about` (no standalone page) |

**Departure from current Squarespace site:** The original has About / Resume / Portfolio / Hobbies. The new site reorganizes to Home / Work / About / Hobbies — Resume becomes a section of About, Portfolio becomes Work, and the new opinionated Philosophy + Process content is folded into About to replace a traditional bio.

---

## 4. Content model

### 4.1 Case study collection

Astro Content Collection at `src/content/case-studies/`. Each case study is one `.mdx` file. Frontmatter schema:

```ts
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const caseStudies = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),              // "Designs That Matter."
    tagline: z.string().optional(), // Short editorial subtitle for the detail page hero
    slug: z.string(),               // designs-that-matter
    role: z.string(),               // "Designer, Author"
    year: z.number(),               // 2026
    client: z.string(),             // "DevLearn 2026 · self-directed"
    tag: z.string(),                // "Micro-learning · Course design"
    accent: z.enum(['vermillion', 'lime', 'plum']),
    stack: z.array(z.string()),     // ["9 modules", "Rise", "Mayer", "Animated SVG"]
    summary: z.object({
      problem: z.string(),          // Inline Problem text (homepage card)
      solution: z.string(),         // Inline Solution text
      outcome: z.string(),          // Inline Outcome text (markdown-able for <b> tags)
    }),
    order: z.number(),              // Sort order on /#work
    featured: z.boolean().default(false),
    cover: z.string().optional(),   // Hero image for detail page
    next: z.string().optional(),    // slug of next case study (for "next" footer)
  }),
});

export const collections = { 'case-studies': caseStudies };
```

### 4.2 Case study MDX body structure

Each case study `.mdx` body uses a consistent set of components:

```mdx
---
title: "Designs That Matter."
slug: designs-that-matter
year: 2026
# ...frontmatter
---

import { ProblemBlock, ProcessBlock, OutcomeBlock, ArtifactsGallery, LessonsBlock } from '~/components/case-study';

<ProblemBlock>
Long-form Problem narrative — context, stakeholders, what was actually broken.
Two to four paragraphs.
</ProblemBlock>

<ProcessBlock>
How Casey worked through it — steps, decisions, tradeoffs, what got cut.
</ProcessBlock>

<ArtifactsGallery images={[
  { src: '/assets/case-studies/dtm/storyboard.jpg', caption: 'Module 1 storyboard' },
  { src: '/assets/case-studies/dtm/screenshot-1.png', caption: 'Final Rise output' },
]} />

<OutcomeBlock metrics={[
  { value: '94%', label: 'Completion rate' },
  { value: '11pt', label: '30-day retention lift' },
]}>
Outcome narrative — beyond the metrics.
</OutcomeBlock>

<LessonsBlock>
What I'd change next time. Reflection paragraph.
</LessonsBlock>
```

Adding a new case study = create one new `.mdx` file. No code changes needed.

### 4.3 Hobbies collections

Two collections work together: **categories** and **hobby projects**.

**Categories collection** (`src/content/hobby-categories/`) — one `.md` (or `.json`) file per category:

```ts
const hobbyCategories = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),                 // "Costuming"
    slug: z.string(),                 // costuming
    intro: z.string(),                // 1–2 sentence intro shown on the index tile and category page
    cover: z.string().optional(),     // Tile image on /hobbies index
    accent: z.enum(['vermillion','lime','plum']),
    order: z.number(),                // Display order on /hobbies
  }),
});
```

Casey writes 5–7 of these (Costuming, Woodworking, Painting, etc.).

**Hobby projects collection** (`src/content/hobby-projects/`) — one `.mdx` file per example:

```ts
const hobbyProjects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),                // "Witch from the Wilds — 2024"
    slug: z.string(),
    category: z.string(),             // matches a category slug
    year: z.number(),
    cover: z.string(),                // Primary image (used in gallery + detail hero)
    gallery: z.array(z.object({       // Optional extra images
      src: z.string(),
      caption: z.string().optional(),
    })).optional(),
    caption: z.string(),              // Short caption for gallery view (1–2 sentences)
    favorite: z.boolean().default(false), // If true, the project gets its own /hobbies/[cat]/[slug] detail page; MDX body is used
    order: z.number().optional(),
  }),
});
```

Project handling:
- **`favorite: false`** (default) — appears in the category gallery as image + caption only. MDX body is ignored at render time, so non-favorites can use either `.md` (just frontmatter) or `.mdx` (if Casey thinks they might promote it later).
- **`favorite: true`** — appears in the gallery AND gets a dedicated detail page at `/hobbies/[category]/[slug]`. Must be `.mdx` because the body renders the long-form story (process, materials, lessons). The gallery thumbnail becomes a clickable link to the detail page.

Adding a new hobby project = create one file in `src/content/hobby-projects/`. Promoting an example to a "favorite" = flip the `favorite` flag, rename to `.mdx` if it isn't already, fill out the body.

---

## 5. Component map

### 5.1 Shared layout components

| Component | Notes |
|---|---|
| `<Nav />` | Fixed top bar. Brand mark + links to `/work`, `/about`, `/hobbies` + contact CTA + `<DarkToggle />` (small sun/moon button at the right end). On homepage, active-section tracking via IntersectionObserver. |
| `<DarkToggle />` | Tiny button — sun glyph in light mode, moon in dark. Click flips `data-theme` on `<html>` and persists `prefers-color-scheme` override to localStorage. Falls back to `matchMedia('(prefers-color-scheme: dark)')` when no override is set. |
| `<Footer />` | Bottom strip — brand, page links, copyright. |

No `<ThemePicker />` — single brand. The `<DarkToggle />` is a surface switch, not a theme switch.

### 5.2 Homepage components

| Component | Notes |
|---|---|
| `<Hero />` | League Spartan H1 with **rotated ink-on-cream name badge**, eyebrow with vermillion dot, **highlighted-block treatment** on "actually" (vermillion) and "here" (lime), Caveat subtitle in deep plum, meta strip in Plex Mono. |
| `<MetricsTease />` | Compact 4-stat row. Numbers in ink with units in vermillion / lime / plum / vermillion. Animates up on scroll-into-view. |
| `<SelectedWorkTease />` | Section heading with one highlighted word ("Selected **work**.") + 3 featured case study cards from the collection. Last card is a "see all work →" link. |
| `<ClosingCTA />` | Bottom-of-home call-to-action — short copy + link to `/about` (where contact info lives). |

### 5.3 Work components

| Component | Notes |
|---|---|
| `<WorkIndex />` | Full case study list on `/work`. Loops all case studies sorted by `order`. |
| `<WorkCard />` | Inline card showing tag, title (with highlighted-block treatment on the keyword), client, chip stack, and inline Problem / Solution / Outcome rows. Links to `/work/[slug]`. |

### 5.4 Case study detail components

| Component | Notes |
|---|---|
| `<CaseStudyHero />` | Tag + title (with highlighted-block keyword) + tagline + role / year / client / outcome meta strip. |
| `<ProblemBlock />` | Long-form narrative with the vermillion "PROBLEM" label. |
| `<ProcessBlock />` | Long-form narrative with the lime "PROCESS" label. |
| `<OutcomeBlock />` | Long-form narrative with the plum "OUTCOME" label + optional inline metrics grid. |
| `<ArtifactsGallery />` | Responsive image + caption grid. No lightbox in v1. |
| `<LessonsBlock />` | "What I'd change" reflection — lighter visual treatment. |
| `<NextCaseStudy />` | Footer card linking to the next case study (explicit `next` slug from frontmatter). |

### 5.5 About components

| Component | Notes |
|---|---|
| `<PhilosophySection />` | Three cards (Diagnose / Design with evidence / Defend the call) with rotating border-top accents: vermillion, lime, plum. |
| `<ProcessSection />` | Four-step grid (Spot it / Explain it / Fix it / Defend it) with rotating number accent colors. |
| `<WorkHistory />` | Resume content — roles, education, certs, talks, publications. Structured list with Plex Mono dates and Plex Sans titles. |
| `<ContactBlock />` | Email + LinkedIn + downloadable PDF resume. Sits at the bottom of `/about`. No standalone Contact page. |

### 5.6 Hobbies components

| Component | Notes |
|---|---|
| `<HobbyIndex />` | `/hobbies` — tile grid of categories. Each tile uses the category's `accent` (vermillion / lime / plum). Links to `/hobbies/[category]`. |
| `<HobbyCategoryPage />` | Category landing — intro + gallery of all projects in this category. Each project is a `<HobbyTile />`. |
| `<HobbyTile />` | Image + title + caption. If `favorite: true`, wraps in a link to `/hobbies/[category]/[slug]`. |
| `<HobbyDetail />` | Full project detail page used only by "favorites." Hero image + title + long-form MDX body. |

### 5.7 Layouts

- `src/layouts/Base.astro` — shared `<head>`, Nav, Footer, font preconnects, motion init. Used by everything.
- `src/layouts/CaseStudy.astro` — extends Base. Adds breadcrumb + `<CaseStudyHero />` + `<NextCaseStudy />` around MDX content.
- `src/layouts/HobbyDetail.astro` — extends Base. Adds breadcrumb (`/hobbies` → category → project) + hero + MDX body. Used only by `favorite: true` hobby projects.

---

## 6. Visual system

### 6.1 Palette — six colors with assigned jobs, two surfaces

```css
:root {
  /* === Brand accents — same on both surfaces === */
  --vermillion:      #FF5E3A;   /* primary loud — Problem, hero highlight 1 */
  --lime:            #88C23E;   /* secondary loud — Solution, hero highlight 2 */
  --plum:            #4B2C5A;   /* tertiary gravitas — Outcome on cream surfaces */
  --lavender:        #C8B4D0;   /* soft tint on dark surfaces; promoted to plum's role on dark */
  --vermillion-deep: #A8462B;   /* deep vermillion for eyebrow text on cream */

  /* === Light surface (default) === */
  --bg:           #FEF6E4;       /* cream — page background */
  --surf:         #FEF6E4;       /* card surfaces blend into bg by default */
  --text:         #1D1D1F;       /* ink — primary text */
  --text-soft:    rgba(29,29,31,.6);
  --card-dark-bg: #1D1D1F;       /* the special "ink card" (work card) on light surface */
  --card-dark-text: #FEF6E4;     /* cream text inside the ink card */
  --tertiary-loud: var(--plum);  /* on cream, plum is the third loud color */
  --tertiary-soft: var(--lavender); /* on cream, lavender stays a dark-card tint */
}

[data-theme="dark"] {
  --bg:           #1C1820;       /* warm near-black */
  --surf:         #261F30;       /* elevated dark surface — philosophy cards, etc. */
  --text:         #FAF3E0;       /* warm cream off-white */
  --text-soft:    rgba(250,243,224,.55);
  --card-dark-bg: #FEF6E4;       /* INVERTED — the work card becomes the cream "letter on the table" */
  --card-dark-text: #1D1D1F;     /* ink text inside the cream card */
  --tertiary-loud: var(--lavender); /* on dark, lavender takes plum's loud role */
  --tertiary-soft: var(--plum);  /* on dark, plum becomes the recessive variant (used inside inverted cream cards) */
}
```

**Surface activation:** `<html>` has `data-theme="dark"` applied:
- When user has explicitly chosen dark via the `<DarkToggle />` (persisted in localStorage), OR
- When no user choice is stored AND `prefers-color-scheme: dark` matches.

An inline script in `<head>` (before first paint) reads localStorage and `matchMedia` and sets `data-theme` synchronously — prevents the flash-of-wrong-theme on load.

### 6.2 Color jobs (the only rule that matters)

The table below describes the **light surface** mapping. On the dark surface, plum and lavender swap roles via the `--tertiary-loud` / `--tertiary-soft` tokens defined in §6.1 — components reference the tokens, not the raw color names, so the same component renders correctly on either surface.

| Color | Where it appears (light surface) | Where it does NOT |
|---|---|---|
| **Cream** | Page background; light card surfaces; text inside the ink work card | Never as primary text on a light page |
| **Ink** | All body text on cream; dark card backgrounds; name badge background (light mode); section dividers (1.5px lines) | Never the dominant page surface on light mode |
| **Vermillion** | Hero highlight 1 ("actually" block); Problem label on case study cards; eyebrow dot; "primary" section heading word | Body text (too saturated); large surfaces (overwhelming) |
| **Lime** | Hero highlight 2 ("here" block); Solution label on case study cards; name-badge star accent (✺); positive-feedback moments | Body text on cream (illegible contrast); anywhere "calm" |
| **Plum (deep)** | Caveat subtitle ("…or did everyone just panic…"); Outcome label on case study cards; About section accent (eyebrow text, philosophy card 3 border); breadcrumbs on case study and hobby detail pages. **On dark surface: only inside the inverted cream work card.** | Hero H1 highlights (vermillion/lime own those); chip borders on dark cards (lavender owns that); anywhere on dark surface OUTSIDE the inverted cream card (illegible) |
| **Lavender** | On light surface: chip borders / muted text on the ink work card only. **On dark surface: promoted to plum's role everywhere — Caveat subtitle, Outcome label, About accent, philosophy card 3 border.** | Anywhere on the cream page surface (washes out — too light for legibility against cream) |

**The system's invariant:** any given screen is ≥80% surface (cream on light, dark near-black on dark) + text. The accents are punctuation. If a single accent occupies more than ~15% of the visible viewport, the page is over-saturated and the proportions need tuning.

**Dark-mode-specific notes:**
- The work card on light surface is **ink-on-cream**; on dark surface it inverts to **cream-on-dark** (same "this card is special" intent, opposite visual mechanic).
- Inside the inverted cream work card on dark surface, the labels return to their cream-surface values (Problem = vermillion, Solution = a deeper lime `#4A7A1A` for contrast against cream, Outcome = plum `#4B2C5A`). The card is a "light island" with full light-surface logic — only the page around it is dark.
- The name badge inverts (light mode: ink chip on cream → dark mode: cream chip on dark) so the contrast direction is preserved.
- Hero radial-gradient blooms use the same vermillion + lavender/plum tints but with adjusted alpha for the darker backdrop.
- `<DarkToggle />` icon: sun (☀) in light mode, moon (☾) in dark. Plex Mono, 14px. Sits at the right of the nav with subtle hover (`background: var(--text-soft)`).

### 6.3 Playful treatments (shipped)

Three motifs carry the personality. Defined once in CSS, reused across the site:

1. **Rotated name badge** — `Casey Shiray ✺` as a tilted (`rotate(-2deg)`) ink-on-cream chip in the hero. The ✺ glyph uses `color: var(--lime)`. Used on the homepage hero only.

2. **Highlighted-block keywords (H1)** — wrap the colored hero keywords ("actually", "here") in tilted color blocks:
   ```html
   <span class="hl hl--vermillion tilt-l">actually</span>
   <span class="hl hl--lime tilt-r">here</span>
   ```
   ```css
   .hl {
     display: inline-block;
     padding: 6px 12px 2px;  /* lifted 6/2 — more top than bottom to compensate for all-caps having no descenders. Locked: do not change without re-checking optical alignment. */
   }
   .hl--vermillion { background: var(--vermillion); color: var(--bg); }
   .hl--lime       { background: var(--lime);       color: var(--ink); }
   .hl--plum       { background: var(--tertiary-loud); color: var(--bg); }  /* uses --tertiary-loud token so it swaps to lavender on dark surface */
   .tilt-l { transform: rotate(-1.5deg); }
   .tilt-r { transform: rotate( 1deg);  }
   ```
   Used in the homepage hero H1.

3. **Highlighted-block section headings** — one word per section heading gets the same `.hl` treatment (same `6px 12px 2px` padding lock). The colored word rotates by ~1° in alternating directions so consecutive section headings don't all lean the same way.
   - `Selected work.` — "work" in `.hl--vermillion`
   - `The numbers.` — "numbers" in `.hl--lime`
   - `How I work.` (on About) — "work" in `.hl--plum`
   - `About Casey.` — "Casey" in `.hl--plum`

**Treatments deliberately NOT shipped:** the tilted "Featured" ribbon on case study cards, the second-color rotated card variants. Cut for restraint — the three treatments above are enough to mark personality without overdoing it.

### 6.4 Fonts

| Stack variable | Font | Weights | Where it lives |
|---|---|---|---|
| `--font-display` | League Spartan | 400 / 700 / 800 / 900 | All H1/H2/section headings, name badge, work card titles. Display only — never below ~20px. |
| `--font-body` | IBM Plex Sans | 400 / 500 / 600 | Body copy, philosophy card body, work card narrative text, About lead paragraphs. |
| `--font-mono` | IBM Plex Mono | 400 / 500 / 600 | Eyebrow labels, metadata strips, chip text, breadcrumbs, captions, "section 01" numbers. |
| `--font-serif-italic` | IBM Plex Serif italic | 400 italic | In-body emphasis (`<em>`) and accent phrases. Adds warmth where Sans alone would feel cold. |
| `--font-hand` | Caveat | 600 | Hero subtitle only ("…or did everyone just panic and ask for slides?"). One signature use — adds personality, doesn't get diluted. |

All five loaded from Google Fonts via `<link rel="preconnect">` in `Base.astro`. Self-hosting deferred to v1.1.

### 6.5 Spacing, radii, borders

- Border radius: `14px` for cards, `18px` for the dark ink work card, `999px` for chips and CTA buttons, `0px` for highlighted-block treatments (sharp edges contrast with the rounded cards).
- Border weight: `1.5px` for card outlines on cream (heavier than typical so they hold their own visually); `1px` for muted dividers on dark surfaces.
- Section dividers: `1.5px solid var(--ink)` horizontal line between top-level sections on the homepage and About.
- Card padding: `24–32px` on cards, `48px` on page sections, `48–64px` on hero.

---

## 7. Motion strategy

Restrained but present. Motion exists to reward attention, never to delay or block content.

| Surface | Motion |
|---|---|
| Page load | Lenis smooth scroll initialized. Hero H1 split-text reveal (word-by-word fade-in, ~400ms). Caveat subtitle slide+fade in 200ms after H1. |
| Scroll | Section numbers and headings fade up on scroll-into-view (GSAP ScrollTrigger). Threshold: 20% in view. |
| Metrics section | Numbers count up from 0 when entering viewport. Once per visit. |
| Work cards | CSS-only hover lift (already in source). No JS needed. |
| Highlighted-block treatments | No motion — they're static positional rotations baked into CSS. |
| Nav | Transitions between homepage and case studies use Astro View Transitions (cross-fade + shared element on the case study title where possible). |
| Reduced motion | All GSAP timelines wrapped in a `prefers-reduced-motion` check that skips to final state. Lenis disabled. |

GSAP and Lenis are loaded as ES modules on routes that need them (not the 404 page). No CDN script tags.

---

## 8. Repo structure

```
casey-website/
├── astro.config.mjs
├── tsconfig.json
├── package.json
├── .gitignore
├── README.md
├── public/
│   ├── favicon.ico
│   ├── og-image.png
│   └── assets/
│       ├── case-studies/
│       │   ├── designs-that-matter/
│       │   ├── day-one-for-real/
│       │   ├── the-form-that-worked/
│       │   └── manager-defense/
│       └── hobbies/
│           ├── costuming/
│           ├── woodworking/
│           ├── painting/
│           └── ...
├── reference/
│   └── portfolio-v1.html          (uploaded source; reference only, NOT shipped)
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-05-22-portfolio-migration-design.md
└── src/
    ├── content/
    │   ├── config.ts                                (3 collections: case-studies, hobby-categories, hobby-projects)
    │   ├── case-studies/
    │   │   ├── designs-that-matter.mdx
    │   │   ├── day-one-for-real.mdx
    │   │   ├── the-form-that-worked.mdx
    │   │   └── manager-defense.mdx
    │   ├── hobby-categories/
    │   │   ├── costuming.md
    │   │   ├── woodworking.md
    │   │   ├── painting.md
    │   │   └── ...
    │   └── hobby-projects/
    │       └── ...one .mdx per project; `favorite: true` ones have a full body
    ├── components/
    │   ├── Nav.astro
    │   ├── DarkToggle.astro
    │   ├── Footer.astro
    │   ├── Hero.astro
    │   ├── MetricsTease.astro
    │   ├── SelectedWorkTease.astro
    │   ├── ClosingCTA.astro
    │   ├── WorkIndex.astro
    │   ├── WorkCard.astro
    │   ├── PhilosophySection.astro
    │   ├── ProcessSection.astro
    │   ├── WorkHistory.astro
    │   ├── ContactBlock.astro
    │   ├── HobbyIndex.astro
    │   ├── HobbyCategoryPage.astro
    │   ├── HobbyTile.astro
    │   └── case-study/
    │       ├── CaseStudyHero.astro
    │       ├── ProblemBlock.astro
    │       ├── ProcessBlock.astro
    │       ├── OutcomeBlock.astro
    │       ├── ArtifactsGallery.astro
    │       ├── LessonsBlock.astro
    │       └── NextCaseStudy.astro
    ├── layouts/
    │   ├── Base.astro
    │   ├── CaseStudy.astro
    │   └── HobbyDetail.astro
    ├── pages/
    │   ├── index.astro                              (/)
    │   ├── work/
    │   │   ├── index.astro                          (/work — case study index)
    │   │   └── [...slug].astro                      (/work/[slug] — case study detail)
    │   ├── about.astro                              (/about)
    │   ├── hobbies/
    │   │   ├── index.astro                          (/hobbies — category tile grid)
    │   │   └── [category]/
    │   │       ├── index.astro                      (/hobbies/[category])
    │   │       └── [slug].astro                     (/hobbies/[category]/[slug] — only renders for `favorite: true`)
    │   └── 404.astro
    ├── lib/
    │   ├── motion.ts                                (Lenis + GSAP init, with prefers-reduced-motion guard)
    │   └── theme-init.ts                            (sync inline-script snippet that reads localStorage + prefers-color-scheme and sets data-theme before first paint)
    └── styles/
        ├── global.css                               (resets, base typography, palette tokens for both surfaces, components)
        └── treatments.css                           (.hl, .name-badge, .tilt-l, .tilt-r — the playful motifs)
```

No `themes.css`, no `ThemePicker.astro` — single brand with two surfaces (light + dark), not a theme system.

---

## 9. Domain & DNS migration plan

Current state: `caseyshiray.com` registered AND DNS managed at Squarespace.

Target state: domain registered at Cloudflare Registrar, DNS managed at Cloudflare, site served by Cloudflare Pages.

**Order of operations:**

1. **Build & test in isolation.** Initial deploys go to `casey-portfolio.pages.dev` (Cloudflare's free preview URL). Squarespace stays live the whole time.
2. **Sign up for Cloudflare** (if no account yet), create Pages project, connect GitHub repo, verify builds.
3. **Soft-launch verification.** Send `casey-portfolio.pages.dev` to Casey for review against the live Squarespace site. Confirm all pages (Home / Work / About / Hobbies + case study and hobby detail pages), mobile, accessibility.
4. **Initiate domain transfer.** From Squarespace dashboard: unlock domain, get EPP/auth code. From Cloudflare: start transfer, paste auth code. Process takes ~5–7 days. **Squarespace site remains live during transfer** because DNS hasn't moved yet.
5. **Once transfer completes** and `caseyshiray.com` shows in Cloudflare:
   - Add `caseyshiray.com` as a custom domain on the Pages project.
   - Cloudflare auto-creates the CNAME / A records for Pages.
   - SSL provisions in minutes (Cloudflare Universal SSL).
   - Verify both `caseyshiray.com` and `www.caseyshiray.com` resolve to the new site.
6. **Cancel Squarespace subscription** once we've confirmed the new site is live and stable for 48 hours.

**Email:** if `casey@caseyshiray.com` is currently a Squarespace-routed email, we'll need to set up email forwarding via Cloudflare Email Routing (free) **before** cutting over DNS, so emails keep flowing. If email is at Google Workspace / elsewhere, this is a non-issue — we just preserve the MX records.

**Rollback:** if anything breaks post-cutover, we can revert by changing Pages custom domain back to the preview URL and re-pointing `caseyshiray.com` at Squarespace's nameservers. Squarespace account stays open until we've passed the stability window.

---

## 10. Out of scope (v1)

Deliberately not building these in v1, to keep scope focused:

- **Theme system / picker** — single brand ships with light + dark surfaces only (see §6.1). No multi-theme picker. Alt brands can be added later only as one-off seasonal swaps.
- **Pull quotes on case study pages** — picked out in the case study structure question. If Casey wants them later, a `<PullQuote />` component can be added.
- **"Featured" ribbon and second-color rotated card variants** — playful treatments picked out for restraint. The three shipping treatments (badge + H1 + section headings) are enough.
- **CMS UI** (Decap, Sanity, etc.) — Casey edits MDX directly. Revisit if authoring friction shows up.
- **Blog / writing section** — possible v1.1 if Casey wants a place to publish thoughts.
- **Lightbox / fullscreen artifacts gallery** — basic image+caption grid for v1.
- **Search** — content volume doesn't justify it. Revisit at 10+ case studies.
- **Analytics** — Cloudflare Web Analytics (free, privacy-respecting) added at launch; no Google Analytics.
- **RSS feed** — only worth it once a blog exists.
- **Self-hosted fonts** — Google Fonts is fine for v1; revisit for perf in v1.1.
- **Internationalization** — single language (English).
- **Newsletter signup** — not in current design.

---

## 11. Success criteria

- All 4 top-level pages (Home / Work / About / Hobbies) ship with the locked palette and three playful treatments applied consistently.
- All 4 case study detail pages render from MDX with the documented component set.
- The Hobbies system supports 5–7 categories and per-project detail pages for "favorites," and Casey can add a new project (favorite or not) by creating one `.mdx` file with no code changes.
- **Both light and dark surfaces render every page correctly.** `prefers-color-scheme: dark` is respected on first load. The `<DarkToggle />` overrides and persists across navigation. No flash-of-wrong-theme on initial paint.
- Lighthouse scores ≥ 95 on Performance, Accessibility, Best Practices, and SEO on a deployed Pages preview, in both light and dark modes.
- `caseyshiray.com` resolves to the new site, with valid SSL, and email continues to work uninterrupted through the cutover.
- Visual proportions hold: no single accent color (vermillion, lime, plum/lavender) occupies more than ~15% of any rendered viewport at default settings.
- Reduced-motion preference is respected — Lenis and GSAP timelines skip to final state without breaking layout.

---

## 12. Open questions parked for the implementation plan

- **Brand doc alignment** — user referenced an existing brand doc with Module 0/8 specifying plum as gravitas and pink as emphasis. If that doc is shared before implementation starts, the palette may shift to match (likely swapping or adding pink). Tracked as a v1 risk.
- Whether to use Astro's built-in image optimization or `@astrojs/image` — depends on actual asset weights.
- Whether `<NextCaseStudy />` should auto-link based on `order` field or use the explicit `next` slug in frontmatter. (Leaning: explicit, so Casey has control.)
- Cloudflare Web Analytics setup — confirm at deploy time.
- Email migration specifics — confirm where `casey@caseyshiray.com` currently routes before initiating domain transfer.
