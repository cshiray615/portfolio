# Casey Shiray Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy Casey Shiray's portfolio as a multi-page Astro site on Cloudflare Pages, replacing the existing Squarespace site at caseyshiray.com.

**Architecture:** Static Astro site with MDX content collections for case studies + hobby projects, vanilla CSS using custom properties (no Tailwind), a single locked palette rendered across light + dark surfaces via `[data-theme]` cascade, Lenis + GSAP for motion, deployed from a GitHub repo to Cloudflare Pages, with domain transferred from Squarespace registrar to Cloudflare Registrar at cutover.

**Tech Stack:** Astro 5+ · TypeScript · MDX · Vanilla CSS with custom properties · Google Fonts (League Spartan, IBM Plex Sans/Mono/Serif, Caveat) · Lenis (smooth scroll) · GSAP + ScrollTrigger (motion) · Vitest (logic tests only) · Cloudflare Pages (hosting) · Cloudflare Registrar (domain).

**Source documents:**
- Spec: [`docs/superpowers/specs/2026-05-22-portfolio-migration-design.md`](../specs/2026-05-22-portfolio-migration-design.md) — authoritative
- Reference design (palette discarded; content + voice preserved): [`reference/portfolio-v1.html`](../../../reference/portfolio-v1.html)

**Scope check:** This is a single coherent project — one frontend site, one content model, one deployment target, one domain migration. Plan stays as a single document.

---

## Verification strategy

Since this is a content-driven static site, traditional TDD is the right tool for some pieces (logic in `theme-init.ts`, content-collection schemas) and the wrong tool for others (visual layout, typography rhythm, motion). The plan uses:

| Concern | Verification |
|---|---|
| TypeScript correctness | `npx astro check` after every component-modifying task |
| Content collection schema validity | `npx astro check` (Astro validates frontmatter against `config.ts` at build time) |
| `theme-init.ts` logic (localStorage + matchMedia + data-theme) | Vitest unit tests, written before implementation (real TDD) |
| Build correctness | `npx astro build` at the end of each phase |
| Component visual correctness | Dev server (`npx astro dev`) + manual browser check against the spec mockups |
| Light + dark surface parity | Toggle via DarkToggle in dev server; confirm both surfaces render every page correctly |
| Reduced motion | Browser DevTools → emulate `prefers-reduced-motion: reduce` → confirm animations skip to final state |
| Lighthouse | Final phase, on the deployed `.pages.dev` preview, ≥95 in all four categories on both surfaces |
| Routing + navigation | Click every link in dev server; confirm no 404s |

Commit cadence: after each task, with a conventional-commit message. Frequent commits, never amend.

---

## File structure

What gets created across the whole plan:

```
casey-website/  (= current working directory)
├── astro.config.mjs                         (Astro config; integrations: mdx; site: caseyshiray.com)
├── tsconfig.json                            (extends astro/tsconfigs/strict)
├── package.json
├── package-lock.json
├── vitest.config.ts                         (test runner for logic-only files)
├── .gitignore                               (node_modules, dist, .DS_Store, .superpowers, .env)
├── README.md                                (one-pager: how to dev / build / deploy)
├── public/
│   ├── favicon.svg                          (placeholder; final asset later)
│   ├── og-image.png                         (1200×630 social card)
│   └── assets/
│       ├── case-studies/{slug}/             (image assets per case study)
│       └── hobbies/{category}/              (image assets per hobby category)
├── reference/portfolio-v1.html              (EXISTS — do not modify)
├── docs/superpowers/                        (EXISTS — do not modify)
└── src/
    ├── content/
    │   ├── config.ts                        (3 collections: case-studies, hobby-categories, hobby-projects)
    │   ├── case-studies/
    │   │   ├── designs-that-matter.mdx
    │   │   ├── day-one-for-real.mdx
    │   │   ├── the-form-that-worked.mdx
    │   │   └── manager-defense.mdx
    │   ├── hobby-categories/
    │   │   ├── costuming.md
    │   │   ├── woodworking.md
    │   │   ├── painting.md
    │   │   ├── games.md
    │   │   └── ...                         (placeholder for Casey to add up to 5–7)
    │   └── hobby-projects/
    │       ├── sample-favorite.mdx          (one example with favorite: true)
    │       └── sample-tile.md               (one example with favorite: false)
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
    │   ├── index.astro                      (/)
    │   ├── work/
    │   │   ├── index.astro                  (/work)
    │   │   └── [...slug].astro              (/work/[slug])
    │   ├── about.astro                      (/about)
    │   ├── hobbies/
    │   │   ├── index.astro                  (/hobbies)
    │   │   └── [category]/
    │   │       ├── index.astro              (/hobbies/[category])
    │   │       └── [slug].astro             (/hobbies/[category]/[slug])
    │   └── 404.astro
    ├── lib/
    │   ├── motion.ts                        (Lenis + GSAP init, with prefers-reduced-motion guard)
    │   ├── theme-init.ts                    (inline-script body for data-theme decision)
    │   └── theme-init.test.ts               (Vitest tests for theme-init logic)
    └── styles/
        ├── global.css                       (resets, fonts, palette tokens, base typography, base components)
        └── treatments.css                   (.hl, .name-badge, .tilt-l, .tilt-r — the playful motifs)
```

---

## Phase 0 — Repository scaffolding

### Task 0.1: Initialize git repository

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: Initialize git in the current directory**

Run:
```bash
git init
git branch -M main
```
Expected: `Initialized empty Git repository in C:/Users/diggy/OneDrive/Desktop/Casey Website/.git/`

- [ ] **Step 2: Create `.gitignore`**

Create `.gitignore` with:
```
# build output
dist/
.astro/

# dependencies
node_modules/

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# environment
.env
.env.local
.env.production

# macOS / Windows
.DS_Store
Thumbs.db

# editors
.vscode/
.idea/
*.swp

# Claude / superpowers (do not commit brainstorm artifacts)
.superpowers/
.claude/
```

- [ ] **Step 3: Commit the existing reference + docs to the new repo**

Run:
```bash
git add .gitignore reference/ docs/
git commit -m "chore: initial commit — spec + reference + gitignore"
```
Expected: a commit with reference/portfolio-v1.html, docs/superpowers/specs/..., docs/superpowers/plans/..., and .gitignore tracked.

---

### Task 0.2: Scaffold Astro project in-place

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/env.d.ts`, `src/pages/index.astro` (placeholder)

- [ ] **Step 1: Run the Astro create-astro command in the current directory**

Run:
```bash
npm create astro@latest . -- --template minimal --typescript strict --no-install --no-git
```

When prompted "Directory is not empty. Continue?" → **Yes**. If the CLI complains about flags, run `npm create astro@latest -- --help` and adjust — the exact flag names drift between create-astro versions.

This creates `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/`, `public/`, and a placeholder `src/pages/index.astro`.

- [ ] **Step 2: Install dependencies**

Run:
```bash
npm install
npm install @astrojs/mdx @astrojs/check typescript
npm install -D vitest @types/node
```
Expected: `node_modules/` populates, `package-lock.json` is created. No errors.

- [ ] **Step 3: Add the MDX integration**

Run:
```bash
npx astro add mdx --yes
```
Expected: `astro.config.mjs` is modified to import and use `mdx()`.

- [ ] **Step 4: Configure `astro.config.mjs`**

Open `astro.config.mjs` and replace contents with:
```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://caseyshiray.com',
  integrations: [mdx()],
  output: 'static',
  build: {
    format: 'directory',
  },
  trailingSlash: 'never',
  vite: {
    resolve: {
      alias: {
        '~': '/src',
      },
    },
  },
});
```

- [ ] **Step 5: Verify build runs**

Run:
```bash
npx astro check
npx astro build
```
Expected: Both commands exit 0. Build outputs `dist/index.html` (or similar) for the placeholder page.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json src/ public/
git commit -m "chore: scaffold Astro project with MDX integration"
```

---

### Task 0.3: Add Vitest config and a smoke test

**Files:**
- Create: `vitest.config.ts`, `src/lib/smoke.test.ts`

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: { '~': '/src' },
  },
});
```

- [ ] **Step 2: Add the test script to `package.json`**

Open `package.json`. In the `"scripts"` object, add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create a smoke test**

Create `src/lib/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest';

describe('vitest is wired up', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 4: Run the test**

Run:
```bash
npm test
```
Expected: 1 test passes. No errors.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts package.json src/lib/smoke.test.ts
git commit -m "chore: add vitest with smoke test"
```

---

## Phase 1 — Design system foundation (palette + typography + treatments)

### Task 1.1: Create global.css with palette tokens (both surfaces)

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Write `src/styles/global.css`**

```css
/* ============================================
   Casey Shiray Portfolio — Global Styles
   Palette: one brand, two surfaces (light + dark)
   ============================================ */

/* --- Font preconnect handled in <head> via Base.astro --- */

/* --- Reset + base --- */
*, *::before, *::after { box-sizing: border-box; }
html, body, h1, h2, h3, h4, h5, h6, p, ul, ol, li, figure, blockquote { margin: 0; padding: 0; }
ul, ol { list-style: none; }
img, picture, svg, video { display: block; max-width: 100%; }
a { color: inherit; text-decoration: none; }
button { font: inherit; background: none; border: none; padding: 0; color: inherit; cursor: pointer; }
html { scroll-behavior: smooth; }

/* --- Font stack variables --- */
:root {
  --font-display: 'League Spartan', system-ui, sans-serif;
  --font-body:    'IBM Plex Sans', system-ui, sans-serif;
  --font-mono:    'IBM Plex Mono', ui-monospace, monospace;
  --font-serif:   'IBM Plex Serif', Georgia, serif;
  --font-hand:    'Caveat', cursive;
}

/* --- Brand accent colors — surface-independent --- */
:root {
  --vermillion:      #FF5E3A;
  --lime:            #88C23E;
  --plum:            #4B2C5A;
  --lavender:        #C8B4D0;
  --vermillion-deep: #A8462B;
  --lime-deep:       #4A7A1A;  /* used inside the cream work card on dark surface */
}

/* --- Light surface (default) --- */
:root {
  --bg:              #FEF6E4;
  --surf:            #FEF6E4;
  --text:            #1D1D1F;
  --text-soft:       rgba(29, 29, 31, 0.6);
  --card-dark-bg:    #1D1D1F;          /* the special ink work card on light surface */
  --card-dark-text:  #FEF6E4;
  --tertiary-loud:   var(--plum);
  --tertiary-soft:   var(--lavender);
  --divider:         #1D1D1F;
}

/* --- Dark surface --- */
[data-theme="dark"] {
  --bg:              #1C1820;
  --surf:            #261F30;
  --text:            #FAF3E0;
  --text-soft:       rgba(250, 243, 224, 0.55);
  --card-dark-bg:    #FEF6E4;          /* INVERTED: cream "letter on the table" */
  --card-dark-text:  #1D1D1F;
  --tertiary-loud:   var(--lavender);  /* lavender promoted */
  --tertiary-soft:   var(--plum);
  --divider:         rgba(250, 243, 224, 0.18);
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.65;
  overflow-x: hidden;
  transition: background 0.35s ease, color 0.35s ease;
}

/* --- Base typography --- */
h1, h2, h3 {
  font-family: var(--font-display);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1;
  text-transform: uppercase;
}
h1 { font-size: clamp(48px, 7vw, 88px); font-weight: 900; line-height: 0.9; }
h2 { font-size: clamp(36px, 4.5vw, 56px); }
h3 { font-size: clamp(20px, 2.2vw, 28px); }

p { font-family: var(--font-body); }

em { font-family: var(--font-serif); font-style: italic; }

/* --- Layout primitives --- */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 56px;
}
@media (max-width: 640px) {
  .container { padding: 0 24px; }
}

.section {
  padding: 96px 0;
  border-top: 1.5px solid var(--divider);
}

.section-num {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--vermillion);
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--vermillion-deep);
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
[data-theme="dark"] .eyebrow { color: var(--vermillion); }

.eyebrow::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--vermillion);
}

/* --- Cards --- */
.card {
  background: var(--surf);
  border: 1.5px solid var(--divider);
  border-radius: 14px;
  padding: 24px;
}

/* --- Reduced motion baseline (overrides applied in motion.ts also) --- */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.001s !important;
    transition-duration: 0.001s !important;
  }
}
```

- [ ] **Step 2: Verify it parses**

There's no Astro page using this yet. Just verify the file exists and is well-formed:
```bash
npx astro check
```
Expected: no errors (CSS isn't checked but TS is).

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(styles): add palette + base typography (light + dark surfaces)"
```

---

### Task 1.2: Create treatments.css with the three playful motifs

**Files:**
- Create: `src/styles/treatments.css`

- [ ] **Step 1: Write `src/styles/treatments.css`**

```css
/* ============================================
   Casey Shiray — Playful treatments
   Per spec §6.3 — LOCKED VALUES, do not adjust
   without re-checking optical alignment in the
   browser at hero scale.
   ============================================ */

/* --- Highlighted-block keywords (H1 + section headings) --- */
.hl {
  display: inline-block;
  padding: 6px 12px 2px;   /* LOCKED: lifted 6/2 compensates for all-caps having no descenders */
  line-height: 0.9;
}
.hl--vermillion { background: var(--vermillion);     color: var(--bg);  }
.hl--lime       { background: var(--lime);           color: var(--text); }   /* light: ink on lime; dark: cream on lime — both legible */
.hl--plum       { background: var(--tertiary-loud);  color: var(--bg);  }    /* swaps to lavender on dark via token */

/* Rotation modifiers — apply on top of .hl */
.tilt-l { transform: rotate(-1.5deg); }
.tilt-r { transform: rotate( 1deg);   }

/* On dark surface, .hl--lime needs ink text against the lime block; on light it's the same */
[data-theme="dark"] .hl--lime { color: var(--bg); }

/* --- Rotated name badge --- */
.name-badge {
  display: inline-block;
  background: var(--text);          /* ink on cream, cream on dark — high contrast either way */
  color: var(--bg);
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 13px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding: 7px 14px;
  transform: rotate(-2deg);
}
.name-badge::after {
  content: ' ✺';
  color: var(--lime);               /* signature accent */
}
```

- [ ] **Step 2: Verify**

```bash
npx astro check
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/styles/treatments.css
git commit -m "feat(styles): add .hl + .name-badge treatments (locked padding 6/12/2)"
```

---

### Task 1.3: Create Base.astro layout with fonts loaded

**Files:**
- Create: `src/layouts/Base.astro`

- [ ] **Step 1: Write `src/layouts/Base.astro`**

```astro
---
import '~/styles/global.css';
import '~/styles/treatments.css';

export interface Props {
  title: string;
  description?: string;
  ogImage?: string;
}

const {
  title,
  description = 'Casey Shiray — Senior Tech Instructional Designer. Designing behavior change for teams that actually use the training.',
  ogImage = '/og-image.png',
} = Astro.props;

const canonical = new URL(Astro.url.pathname, Astro.site).toString();
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />

    <!-- Open Graph -->
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={new URL(ogImage, Astro.site).toString()} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonical} />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;500;600;700;800;900&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Serif:ital,wght@0,400;1,400&family=Caveat:wght@400;600;700&display=swap"
      rel="stylesheet"
    />

    <!-- Theme-init script will be inlined here in Phase 2. Placeholder for now. -->
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 2: Verify the layout file is recognized**

```bash
npx astro check
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Base.astro
git commit -m "feat(layout): add Base.astro with font loading + SEO meta"
```

---

### Task 1.4: Smoke-test the design system on the placeholder homepage

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Replace `src/pages/index.astro` contents**

```astro
---
import Base from '~/layouts/Base.astro';
---

<Base title="Casey Shiray — Senior Tech Instructional Designer">
  <main style="padding: 64px 56px;">
    <div class="name-badge" style="margin-bottom: 24px;">Casey Shiray</div>
    <div class="eyebrow" style="margin-bottom: 20px;">Senior Tech Instructional Designer</div>
    <h1>
      Is training <span class="hl hl--vermillion tilt-l">actually</span><br />
      the answer <span class="hl hl--lime tilt-r">here</span>?
    </h1>
    <p style="margin-top: 24px; font-family: var(--font-hand); font-size: 36px; color: var(--tertiary-loud);">
      …or did everyone just panic and ask for slides?
    </p>
  </main>
</Base>
```

- [ ] **Step 2: Run dev server and view the page**

Run:
```bash
npx astro dev
```
Open `http://localhost:4321` in a browser.

Expected:
- Cream background, ink text
- Name badge tilted -2°, lime ✺ visible
- H1 in League Spartan, all-caps
- "actually" in a tilted vermillion block, "here" in a tilted lime block
- Caveat-italic subtitle below in deep plum
- Highlight blocks are visually centered on the letters (padding 6/12/2 doing its job)

- [ ] **Step 3: Confirm dark surface works manually (temporary)**

In the browser DevTools console:
```js
document.documentElement.dataset.theme = 'dark'
```
Expected:
- Background flips to warm near-black
- Text flips to cream off-white
- Plum subtitle becomes lavender (via `--tertiary-loud` token swap)
- Highlight blocks still legible (vermillion/lime unchanged)

Then reset:
```js
delete document.documentElement.dataset.theme
```

- [ ] **Step 4: Stop the dev server and commit**

```bash
git add src/pages/index.astro
git commit -m "feat(pages): smoke-test design system on placeholder home"
```

---

## Phase 2 — Theme system (DarkToggle + auto detection)

### Task 2.1: Write theme-init tests first (TDD)

**Files:**
- Create: `src/lib/theme-init.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/theme-init.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resolveTheme, applyTheme } from './theme-init';

describe('resolveTheme', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns "dark" when localStorage has explicit "dark"', () => {
    localStorage.setItem('casey-theme', 'dark');
    expect(resolveTheme(true)).toBe('dark');
    expect(resolveTheme(false)).toBe('dark');
  });

  it('returns "light" when localStorage has explicit "light"', () => {
    localStorage.setItem('casey-theme', 'light');
    expect(resolveTheme(true)).toBe('light');
    expect(resolveTheme(false)).toBe('light');
  });

  it('falls back to prefers-color-scheme when no localStorage value', () => {
    expect(resolveTheme(true)).toBe('dark');
    expect(resolveTheme(false)).toBe('light');
  });

  it('ignores invalid localStorage values and falls back', () => {
    localStorage.setItem('casey-theme', 'fuchsia');
    expect(resolveTheme(true)).toBe('dark');
    expect(resolveTheme(false)).toBe('light');
  });
});

describe('applyTheme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('sets data-theme="dark" on documentElement when given "dark"', () => {
    applyTheme('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('removes data-theme attribute when given "light"', () => {
    document.documentElement.dataset.theme = 'dark';
    applyTheme('light');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });
});
```

- [ ] **Step 2: Update vitest config to use jsdom for these tests**

Open `vitest.config.ts` and replace contents:
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: { '~': '/src' },
  },
});
```

- [ ] **Step 3: Install jsdom**

```bash
npm install -D jsdom
```

- [ ] **Step 4: Run the tests — they should fail**

```bash
npm test
```
Expected: test failures referencing `Cannot find module './theme-init'` or `resolveTheme is not exported`. This confirms the tests are wired up correctly before the implementation exists.

- [ ] **Step 5: Commit the failing tests**

```bash
git add src/lib/theme-init.test.ts vitest.config.ts package.json package-lock.json
git commit -m "test(theme-init): add failing tests for resolveTheme + applyTheme"
```

---

### Task 2.2: Implement theme-init to make the tests pass

**Files:**
- Create: `src/lib/theme-init.ts`

- [ ] **Step 1: Write `src/lib/theme-init.ts`**

```ts
/**
 * Theme initialization — called both:
 * (1) inline in <head> before first paint, to prevent flash-of-wrong-theme
 * (2) by the DarkToggle component when the user manually flips
 */

const STORAGE_KEY = 'casey-theme';
type Theme = 'light' | 'dark';

export function resolveTheme(prefersDark: boolean): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return prefersDark ? 'dark' : 'light';
}

export function applyTheme(theme: Theme): void {
  if (theme === 'dark') {
    document.documentElement.dataset.theme = 'dark';
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

export function persistTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEY, theme);
}

export function toggleTheme(): Theme {
  const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  const next: Theme = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  persistTheme(next);
  return next;
}

/**
 * Self-executing inline script body. This is the string that gets stamped
 * into <head> via a <script is:inline> tag in Base.astro.
 *
 * It runs synchronously before first paint, so visitors never see a
 * flash-of-wrong-theme.
 */
export const inlineScript = `
(function() {
  try {
    var stored = localStorage.getItem('${STORAGE_KEY}');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = (stored === 'dark' || stored === 'light') ? stored : (prefersDark ? 'dark' : 'light');
    if (theme === 'dark') {
      document.documentElement.dataset.theme = 'dark';
    }
  } catch (e) { /* no-op: fall back to default light */ }
})();
`.trim();
```

- [ ] **Step 2: Run the tests**

```bash
npm test
```
Expected: all 6 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/theme-init.ts
git commit -m "feat(theme): implement theme-init logic (resolve/apply/persist/toggle)"
```

---

### Task 2.3: Wire the inline theme-init script into Base.astro

**Files:**
- Modify: `src/layouts/Base.astro`

- [ ] **Step 1: Edit Base.astro**

In `src/layouts/Base.astro`, add at the top of the frontmatter (after the existing imports):
```ts
import { inlineScript } from '~/lib/theme-init';
```

Then in the `<head>`, replace the placeholder comment:
```astro
<!-- Theme-init script will be inlined here in Phase 2. Placeholder for now. -->
```
with:
```astro
<script is:inline set:html={inlineScript}></script>
```

The `<script is:inline>` directive tells Astro not to bundle this — it goes into the HTML as-is, runs synchronously before paint.

- [ ] **Step 2: Verify in browser**

Run `npx astro dev`. Open `http://localhost:4321`.

In DevTools → Application → Local Storage → `http://localhost:4321`, manually set `casey-theme` = `dark` and hard-reload (Ctrl+Shift+R). Expected: page loads in dark mode with no flicker.

Set it to `light` and reload. Expected: light mode, no flicker.

Delete the key entirely and reload while emulating dark via DevTools → Rendering → "Emulate CSS prefers-color-scheme: dark". Expected: dark mode.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Base.astro
git commit -m "feat(theme): inline theme-init script in Base.astro head (prevents FOUT)"
```

---

### Task 2.4: Build the DarkToggle component

**Files:**
- Create: `src/components/DarkToggle.astro`

- [ ] **Step 1: Write `src/components/DarkToggle.astro`**

```astro
---
// Small sun/moon button. Renders the icon for the *current* theme,
// flips on click. CSS uses [data-theme] to swap icons.
---

<button class="dark-toggle" id="dark-toggle" aria-label="Toggle dark mode" type="button">
  <span class="icon icon--sun" aria-hidden="true">☀</span>
  <span class="icon icon--moon" aria-hidden="true">☾</span>
</button>

<style>
  .dark-toggle {
    width: 36px;
    height: 36px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--text);
    transition: background 0.15s ease;
  }
  .dark-toggle:hover {
    background: rgba(0, 0, 0, 0.06);
  }
  [data-theme="dark"] .dark-toggle:hover {
    background: rgba(255, 255, 255, 0.08);
  }
  .icon {
    font-size: 16px;
    line-height: 1;
  }
  /* Show sun in light mode (current theme = light, click would go to dark) */
  .icon--sun  { display: inline; }
  .icon--moon { display: none; }
  [data-theme="dark"] .icon--sun  { display: none; }
  [data-theme="dark"] .icon--moon { display: inline; }
</style>

<script>
  import { toggleTheme } from '~/lib/theme-init';

  const btn = document.getElementById('dark-toggle');
  btn?.addEventListener('click', () => {
    toggleTheme();
  });
</script>
```

- [ ] **Step 2: Drop it into the homepage to test**

Edit `src/pages/index.astro`. Add to the imports:
```astro
import DarkToggle from '~/components/DarkToggle.astro';
```
Add `<DarkToggle />` at the top of the `<main>`.

- [ ] **Step 3: Run dev server and verify**

```bash
npx astro dev
```
Open `http://localhost:4321`. Expected: sun icon visible in light mode, moon icon in dark mode. Click flips the theme and persists across reload. OS preference is respected when localStorage is empty.

- [ ] **Step 4: Commit**

```bash
git add src/components/DarkToggle.astro src/pages/index.astro
git commit -m "feat(theme): add DarkToggle component (sun/moon icon, persists choice)"
```

---

## Phase 3 — Shared layout components (Nav, Footer)

### Task 3.1: Build Nav.astro

**Files:**
- Create: `src/components/Nav.astro`

- [ ] **Step 1: Write `src/components/Nav.astro`**

```astro
---
import DarkToggle from './DarkToggle.astro';

const links = [
  { href: '/work', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/hobbies', label: 'Hobbies' },
];

const currentPath = Astro.url.pathname;
function isActive(href: string): boolean {
  if (href === '/' && currentPath === '/') return true;
  if (href !== '/' && currentPath.startsWith(href)) return true;
  return false;
}
---

<nav class="nav">
  <div class="container nav-inner">
    <a class="nav-brand" href="/">
      <span class="nav-dot" aria-hidden="true"></span>
      <span class="nav-name">Casey Shiray</span>
    </a>

    <div class="nav-links">
      {links.map((l) => (
        <a class={`nav-link${isActive(l.href) ? ' nav-link--active' : ''}`} href={l.href}>{l.label}</a>
      ))}
    </div>

    <div class="nav-right">
      <a class="nav-cta" href="/about#contact">Get in touch</a>
      <DarkToggle />
    </div>
  </div>
</nav>

<style>
  .nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
    background: color-mix(in oklab, var(--bg) 82%, transparent);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--divider);
  }
  .nav-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 56px;
  }
  @media (max-width: 640px) { .nav-inner { padding: 12px 24px; } }

  .nav-brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 16px;
    letter-spacing: -0.01em;
    color: var(--text);
  }
  .nav-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    background: var(--vermillion);
  }
  .nav-links {
    display: flex;
    gap: 4px;
  }
  @media (max-width: 640px) { .nav-links { display: none; } }
  .nav-link {
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-soft);
    padding: 8px 12px;
    border-radius: 6px;
    transition: color 0.15s, background 0.15s;
  }
  .nav-link:hover { color: var(--text); background: rgba(0,0,0,0.05); }
  [data-theme="dark"] .nav-link:hover { background: rgba(255,255,255,0.06); }
  .nav-link--active { color: var(--text); }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .nav-cta {
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 9px 16px;
    border-radius: 6px;
    background: var(--vermillion);
    color: var(--bg);
  }
  @media (max-width: 640px) { .nav-cta { display: none; } }
</style>
```

- [ ] **Step 2: Add Nav to Base.astro**

In `src/layouts/Base.astro`, change the body to:
```astro
<body>
  <Nav />
  <slot />
  <Footer />
</body>
```
(Footer placeholder; will be filled in next task.)

Add to Base.astro frontmatter imports:
```ts
import Nav from '~/components/Nav.astro';
import Footer from '~/components/Footer.astro';
```

- [ ] **Step 3: Adjust body to offset for fixed nav**

In `src/styles/global.css`, find the `body` rule and add:
```css
body {
  /* existing rules... */
  padding-top: 64px;  /* offset for fixed nav */
}
@media (max-width: 640px) {
  body { padding-top: 56px; }
}
```

- [ ] **Step 4: Commit (skip browser verify until Footer exists)**

```bash
git add src/components/Nav.astro src/styles/global.css
git commit -m "feat(layout): add Nav with brand + links + CTA + DarkToggle"
```

---

### Task 3.2: Build Footer.astro

**Files:**
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Write `src/components/Footer.astro`**

```astro
---
const year = new Date().getFullYear();
---

<footer class="footer">
  <div class="container footer-inner">
    <div class="footer-brand">
      <strong>Casey Shiray</strong>
      <span class="footer-tag">Senior Tech Instructional Designer</span>
    </div>
    <nav class="footer-links" aria-label="Footer">
      <a href="/work">Work</a>
      <a href="/about">About</a>
      <a href="/hobbies">Hobbies</a>
      <a href="/about#contact">Contact</a>
    </nav>
    <div class="footer-copy">© {year} · caseyshiray.com</div>
  </div>
</footer>

<style>
  .footer {
    margin-top: 96px;
    padding: 48px 0;
  }
  .footer-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-soft);
    letter-spacing: 0.04em;
  }
  .footer-brand { display: flex; flex-direction: column; gap: 2px; }
  .footer-brand strong {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 14px;
    color: var(--text);
    letter-spacing: -0.01em;
  }
  .footer-links { display: flex; gap: 24px; }
  .footer-links a { transition: color 0.15s; }
  .footer-links a:hover { color: var(--text); }
  .footer-copy { opacity: 0.6; }
  @media (max-width: 640px) {
    .footer-inner { flex-direction: column; align-items: flex-start; }
  }
</style>
```

- [ ] **Step 2: Verify**

```bash
npx astro dev
```
Visit `http://localhost:4321`. Expected: Nav at top with brand + 3 links + Get in touch + sun/moon. Footer at bottom with brand + 4 links + copyright. Both flip correctly with the toggle.

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer.astro src/layouts/Base.astro
git commit -m "feat(layout): add Footer; wire Nav + Footer into Base layout"
```

---

## Phase 4 — Content collections

### Task 4.1: Define content collection schemas

**Files:**
- Create: `src/content/config.ts`

- [ ] **Step 1: Write `src/content/config.ts`**

```ts
import { defineCollection, z } from 'astro:content';

const caseStudies = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    tagline: z.string().optional(),
    role: z.string(),
    year: z.number(),
    client: z.string(),
    tag: z.string(),
    accent: z.enum(['vermillion', 'lime', 'plum']),
    stack: z.array(z.string()),
    summary: z.object({
      problem: z.string(),
      solution: z.string(),
      outcome: z.string(),
    }),
    order: z.number(),
    featured: z.boolean().default(false),
    cover: z.string().optional(),
    next: z.string().optional(),
  }),
});

const hobbyCategories = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    intro: z.string(),
    cover: z.string().optional(),
    accent: z.enum(['vermillion', 'lime', 'plum']),
    order: z.number(),
  }),
});

const hobbyProjects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    category: z.string(),
    year: z.number(),
    cover: z.string(),
    gallery: z.array(z.object({
      src: z.string(),
      caption: z.string().optional(),
    })).optional(),
    caption: z.string(),
    favorite: z.boolean().default(false),
    order: z.number().optional(),
  }),
});

export const collections = {
  'case-studies': caseStudies,
  'hobby-categories': hobbyCategories,
  'hobby-projects': hobbyProjects,
};
```

- [ ] **Step 2: Verify Astro accepts the schema**

```bash
npx astro check
```
Expected: no errors. Astro will warn that the collection folders don't yet exist — that's fine.

- [ ] **Step 3: Commit**

```bash
git add src/content/config.ts
git commit -m "feat(content): define case-studies + hobby-categories + hobby-projects collections"
```

---

### Task 4.2: Author 4 case study MDX files (frontmatter + summary, body stubbed)

**Files:**
- Create: `src/content/case-studies/designs-that-matter.mdx`
- Create: `src/content/case-studies/day-one-for-real.mdx`
- Create: `src/content/case-studies/the-form-that-worked.mdx`
- Create: `src/content/case-studies/manager-defense.mdx`

The frontmatter + inline Problem/Solution/Outcome strings are real content; the MDX bodies are stubbed because their components (`<ProblemBlock />` etc.) are built in Phase 6. We come back and fill the bodies once those components exist.

- [ ] **Step 1: Create `designs-that-matter.mdx`**

```mdx
---
title: "Designs That Matter."
tagline: "A vocabulary stakeholders can hear — and learners can act on."
role: "Designer, Author"
year: 2026
client: "DevLearn 2026 · self-directed"
tag: "Micro-learning · Course design"
accent: vermillion
stack: ["9 modules", "Rise", "Mayer", "Animated SVG"]
summary:
  problem: "L&D teams know bad training when they see it — but can't name what's wrong, so they can't fix it. The result: design-by-committee and stakeholders who keep asking for slides."
  solution: "A 4-phase micro-learning course — Spot it · Explain it · Fix it · Defend it. Built around Mayer's multimedia principles, each lesson pairs a concept video with a low-stakes activity (sort, rewrite, draft a stakeholder reply)."
  outcome: "**~90 minutes** of micro-lessons that ship with a vocabulary stakeholders can hear — and learners can act on, in their next deck review."
order: 1
featured: true
next: day-one-for-real
---

{/* MDX body filled in Task 7.1 once case study components exist */}
```

- [ ] **Step 2: Create `day-one-for-real.mdx`**

```mdx
---
title: "Day One, For Real."
tagline: "Onboarding that hires actually finish — and managers stop re-teaching."
role: "Lead Designer"
year: 2024
client: "Fortune 500 retailer · 14k frontline hires/year"
tag: "Onboarding · Branching simulation"
accent: lime
stack: ["Storyline", "Branching", "Voice-over", "SCORM"]
summary:
  problem: "A 4-hour compliance video had a 38% completion rate. New hires were skipping out — and managers were re-teaching everything in week one anyway."
  solution: "Cut the video to 22 minutes of essential content. Replaced the rest with a branching shift-simulation where hires made the same decisions they'd face on the floor — with consequences they could feel."
  outcome: "Completion jumped to **94%**, manager re-teach time dropped **~60%**, and 30-day retention improved by **11 points**."
order: 2
next: the-form-that-worked
---

{/* MDX body filled in Task 7.2 */}
```

- [ ] **Step 3: Create `the-form-that-worked.mdx`**

```mdx
---
title: "The Form That Worked."
tagline: "It wasn't a training problem. It was a form problem."
role: "Designer, Workflow consultant"
year: 2023
client: "Healthcare network · 3,200 clinicians"
tag: "Tool adoption · Performance support"
accent: plum
stack: ["Workflow audit", "EHR redesign", "Job aids"]
summary:
  problem: "Adoption of a new EHR module sat at 41%. Stakeholders blamed clinician resistance and asked for a 90-minute training."
  solution: "Talked to ten clinicians before designing anything. The form was the problem. Worked with engineering to consolidate three screens into one, then built a 4-minute walkthrough — not a course."
  outcome: "Adoption rose to **89%** in six weeks. Training spend was reallocated to **two other workflow fixes** — same approach, same payoff."
order: 3
next: manager-defense
---

{/* MDX body filled in Task 7.3 */}
```

- [ ] **Step 4: Create `manager-defense.mdx`**

```mdx
---
title: "Manager Defense."
tagline: "Cohort coaching that ends with a real decision, defended."
role: "Program Lead"
year: 2024
client: "SaaS scale-up · 120 new managers"
tag: "Leadership · Cohort program"
accent: vermillion
stack: ["Cohort design", "Coaching", "Async + live", "Capstone"]
summary:
  problem: "New managers were promoted on technical chops, then handed a leadership LMS path and a 'good luck.' 65% reported feeling unprepared at the 90-day check-in."
  solution: "An 8-week cohort: short async micro-lessons + a live coaching session each Friday, capped by a capstone where managers defended one real decision they'd made in the last 30 days."
  outcome: "90-day 'feel prepared' scores climbed from 35% → **82%**, and the cohort design became the default for every leadership level above."
order: 4
next: designs-that-matter
---

{/* MDX body filled in Task 7.4 */}
```

- [ ] **Step 5: Verify schemas pass**

```bash
npx astro check
```
Expected: no errors. The 4 case studies validate against the schema.

- [ ] **Step 6: Commit**

```bash
git add src/content/case-studies/
git commit -m "feat(content): add 4 case studies with frontmatter + inline summaries (bodies stubbed)"
```

---

### Task 4.3: Author placeholder hobby categories

**Files:**
- Create: `src/content/hobby-categories/costuming.md`
- Create: `src/content/hobby-categories/woodworking.md`
- Create: `src/content/hobby-categories/painting.md`
- Create: `src/content/hobby-categories/games.md`

These are placeholders Casey will edit. They validate the schema and let the index render.

- [ ] **Step 1: Create `costuming.md`**

```md
---
name: "Costuming"
intro: "Cosplay and original costume builds — fabric construction, foam armor, leatherwork, hand-painted detail."
accent: vermillion
order: 1
---
```

- [ ] **Step 2: Create `woodworking.md`**

```md
---
name: "Woodworking"
intro: "Furniture and small builds. Mostly hand tools, occasionally a router when patience runs out."
accent: lime
order: 2
---
```

- [ ] **Step 3: Create `painting.md`**

```md
---
name: "Painting"
intro: "Mostly miniatures and acrylic — color theory practice, weathering experiments, the occasional larger piece."
accent: plum
order: 3
---
```

- [ ] **Step 4: Create `games.md`**

```md
---
name: "Games"
intro: "Board games, video games, and the occasional design notebook for both. Currently chasing perfect-information puzzle design."
accent: vermillion
order: 4
---
```

- [ ] **Step 5: Add a sample hobby project (favorite + non-favorite)**

Create `src/content/hobby-projects/sample-favorite.mdx`:
```mdx
---
title: "Sample Favorite Project"
category: costuming
year: 2024
cover: "/assets/hobbies/costuming/sample-favorite.jpg"
caption: "A standout build — placeholder until Casey adds real content."
favorite: true
order: 1
---

{/* MDX body filled when Casey writes real favorites. Placeholder structure: */}

## What I made
Placeholder paragraph.

## How
Placeholder paragraph.

## What I'd do differently
Placeholder paragraph.
```

Create `src/content/hobby-projects/sample-tile.md`:
```md
---
title: "Sample Tile Project"
category: costuming
year: 2023
cover: "/assets/hobbies/costuming/sample-tile.jpg"
caption: "A simpler build — appears as a gallery tile without a detail page."
favorite: false
order: 2
---
```

- [ ] **Step 6: Verify all collections parse**

```bash
npx astro check
```
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/content/hobby-categories/ src/content/hobby-projects/
git commit -m "feat(content): seed hobby categories (4) + sample projects (2)"
```

---

## Phase 5 — Homepage

### Task 5.1: Build Hero.astro

**Files:**
- Create: `src/components/Hero.astro`

- [ ] **Step 1: Write `src/components/Hero.astro`**

```astro
---
// Homepage hero — name badge + eyebrow + H1 with highlighted keywords + Caveat subtitle + meta strip
---

<header class="hero">
  <div class="container">
    <div class="name-badge">Casey Shiray</div>
    <div class="eyebrow">Senior Tech Instructional Designer</div>

    <h1 class="hero-h1">
      Is training <span class="hl hl--vermillion tilt-l">actually</span><br />
      the answer <span class="hl hl--lime tilt-r">here</span>?
    </h1>

    <p class="hero-sub">…or did everyone just panic and ask for slides?</p>

    <div class="hero-meta">
      <div class="meta-item">
        <strong>Based</strong>
        <span>Remote · Pacific Time</span>
      </div>
      <div class="meta-item">
        <strong>Focus</strong>
        <span>Learning · Performance · Tech</span>
      </div>
      <div class="meta-item">
        <strong>Available</strong>
        <span>Q3 2026 onward</span>
      </div>
      <div class="meta-item">
        <strong>Email</strong>
        <a href="mailto:casey@caseyshiray.com">casey@caseyshiray.com</a>
      </div>
    </div>
  </div>

  <span class="hero-bloom hero-bloom--1" aria-hidden="true"></span>
  <span class="hero-bloom hero-bloom--2" aria-hidden="true"></span>
</header>

<style>
  .hero {
    position: relative;
    padding: 96px 0 80px;
    overflow: hidden;
  }
  .name-badge { margin-bottom: 32px; }
  .eyebrow { margin-bottom: 24px; }

  .hero-h1 {
    font-size: clamp(56px, 9vw, 120px);
    line-height: 0.9;
    max-width: 1100px;
  }

  .hero-sub {
    margin-top: 28px;
    font-family: var(--font-hand);
    font-size: clamp(28px, 3.4vw, 42px);
    color: var(--tertiary-loud);  /* swaps plum→lavender on dark */
    line-height: 1.2;
  }

  .hero-meta {
    margin-top: 48px;
    display: flex;
    flex-wrap: wrap;
    gap: 32px;
  }
  .meta-item {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--text-soft);
    line-height: 1.5;
  }
  .meta-item strong {
    display: block;
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text);
    opacity: 0.75;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .meta-item a { color: inherit; }
  .meta-item a:hover { color: var(--vermillion); }

  .hero-bloom {
    position: absolute;
    pointer-events: none;
    border-radius: 50%;
  }
  .hero-bloom--1 {
    top: -120px; right: -120px;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(255, 94, 58, 0.14) 0%, transparent 70%);
  }
  .hero-bloom--2 {
    bottom: -160px; left: 25%;
    width: 520px; height: 520px;
    background: radial-gradient(circle, rgba(75, 44, 90, 0.18) 0%, transparent 70%);
  }
  [data-theme="dark"] .hero-bloom--1 {
    background: radial-gradient(circle, rgba(255, 94, 58, 0.18) 0%, transparent 70%);
  }
  [data-theme="dark"] .hero-bloom--2 {
    background: radial-gradient(circle, rgba(200, 180, 208, 0.12) 0%, transparent 70%);
  }
</style>
```

- [ ] **Step 2: Drop into the homepage**

Replace `src/pages/index.astro` contents:
```astro
---
import Base from '~/layouts/Base.astro';
import Hero from '~/components/Hero.astro';
---

<Base title="Casey Shiray — Senior Tech Instructional Designer">
  <Hero />
</Base>
```

- [ ] **Step 3: Visual verify**

`npx astro dev` → `http://localhost:4321`. Compare against the locked design mockup. Toggle dark mode and confirm both surfaces look right (subtitle changes plum → lavender via the token).

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero.astro src/pages/index.astro
git commit -m "feat(home): add Hero component with name badge, highlighted H1, Caveat sub"
```

---

### Task 5.2: Build MetricsTease.astro

**Files:**
- Create: `src/components/MetricsTease.astro`

- [ ] **Step 1: Write `src/components/MetricsTease.astro`**

```astro
---
const metrics = [
  { num: '62', unit: '%',    label: 'Avg lift in completion rates',          accent: 'vermillion' },
  { num: '3.4', unit: '×',   label: 'Faster time-to-competence vs baseline', accent: 'lime'       },
  { num: '41', unit: 'k',    label: 'Learners served across 12 orgs',        accent: 'plum'       },
  { num: '9',  unit: '/10',  label: 'Stakeholders re-engage on next project',accent: 'vermillion' },
] as const;
---

<section class="metrics section">
  <div class="container">
    <div class="section-hdr">
      <span class="section-num">02</span>
      <h2>The <span class="hl hl--lime tilt-r">numbers</span>.</h2>
    </div>
    <p class="section-lead">
      Outcomes from the last <strong>five years</strong> — across compliance, onboarding, tool adoption, and leadership.
    </p>
    <div class="metrics-grid">
      {metrics.map((m) => (
        <div class="metric">
          <div class="metric-num">
            {m.num}<span class={`metric-unit metric-unit--${m.accent}`}>{m.unit}</span>
          </div>
          <div class="metric-lbl">{m.label}</div>
        </div>
      ))}
    </div>
  </div>
</section>

<style>
  .section-hdr {
    display: flex; align-items: baseline; gap: 18px;
    margin-bottom: 28px;
  }
  .section-lead {
    max-width: 780px;
    font-size: 18px;
    color: var(--text-soft);
    line-height: 1.7;
    margin-bottom: 48px;
  }
  .section-lead strong { color: var(--text); font-weight: 700; }
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  @media (max-width: 1024px) { .metrics-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 640px)  { .metrics-grid { grid-template-columns: 1fr; } }
  .metric {
    background: var(--surf);
    border: 1.5px solid var(--divider);
    border-radius: 14px;
    padding: 28px 22px;
  }
  .metric-num {
    font-family: var(--font-display);
    font-weight: 900;
    font-size: clamp(48px, 6vw, 80px);
    line-height: 0.95;
    letter-spacing: -0.025em;
  }
  .metric-unit { font-size: 36px; font-weight: 800; margin-left: 4px; }
  .metric-unit--vermillion { color: var(--vermillion); }
  .metric-unit--lime       { color: var(--lime); }
  .metric-unit--plum       { color: var(--tertiary-loud); }
  .metric-lbl {
    margin-top: 12px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-soft);
    line-height: 1.5;
  }
</style>
```

- [ ] **Step 2: Add to homepage**

In `src/pages/index.astro`:
```astro
---
import Base from '~/layouts/Base.astro';
import Hero from '~/components/Hero.astro';
import MetricsTease from '~/components/MetricsTease.astro';
---

<Base title="Casey Shiray — Senior Tech Instructional Designer">
  <Hero />
  <MetricsTease />
</Base>
```

- [ ] **Step 3: Visual verify**

`npx astro dev`. Confirm the 4 metric cards render with correct unit colors. Toggle dark mode — the plum unit (3rd card) should become lavender via the token.

- [ ] **Step 4: Commit**

```bash
git add src/components/MetricsTease.astro src/pages/index.astro
git commit -m "feat(home): add MetricsTease with 4 career-level stats"
```

---

### Task 5.3: Build SelectedWorkTease.astro + WorkCard.astro

**Files:**
- Create: `src/components/WorkCard.astro`
- Create: `src/components/SelectedWorkTease.astro`

- [ ] **Step 1: Write `src/components/WorkCard.astro`**

This component is reused on the homepage tease AND on `/work`. It's the inline P/S/O card.

```astro
---
import type { CollectionEntry } from 'astro:content';

export interface Props {
  caseStudy: CollectionEntry<'case-studies'>;
}

const { caseStudy } = Astro.props;
const { data, slug } = caseStudy;
const href = `/work/${slug}`;
---

<a class={`work-card work-card--${data.accent}`} href={href}>
  <div class="work-meta">
    <div class="work-tag">{data.tag}</div>
    <div class="work-title">
      {data.title.split(' ').slice(0, -1).join(' ')}{' '}
      <span class={`hl hl--${data.accent} tilt-l`}>{data.title.split(' ').slice(-1)[0]}</span>
    </div>
    <div class="work-client">{data.client}</div>
    <div class="work-stack">
      {data.stack.map((s) => <span class="chip">{s}</span>)}
    </div>
  </div>
  <div class="work-body">
    <div class="row row--prob">
      <span class="label label--prob">Problem</span>
      <span class="txt" set:html={data.summary.problem} />
    </div>
    <div class="row row--soln">
      <span class="label label--soln">Solution</span>
      <span class="txt" set:html={data.summary.solution} />
    </div>
    <div class="row row--out">
      <span class="label label--out">Outcome</span>
      <span class="txt" set:html={data.summary.outcome} />
    </div>
    <span class="work-link">Read the case study →</span>
  </div>
</a>

<style>
  .work-card {
    display: grid;
    grid-template-columns: 1fr 1.4fr;
    gap: 36px;
    background: var(--card-dark-bg);
    color: var(--card-dark-text);
    border-radius: 18px;
    padding: 36px;
    transition: transform 0.25s ease;
  }
  .work-card:hover { transform: translateY(-3px); }
  @media (max-width: 1024px) {
    .work-card { grid-template-columns: 1fr; gap: 24px; padding: 28px; }
  }

  .work-meta { display: flex; flex-direction: column; gap: 12px; }
  .work-tag {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--vermillion);
  }
  .work-card--lime .work-tag       { color: var(--lime); }
  .work-card--plum .work-tag       { color: var(--tertiary-loud); }

  .work-title {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: clamp(28px, 3.4vw, 42px);
    line-height: 1;
    letter-spacing: -0.015em;
    text-transform: uppercase;
    color: var(--card-dark-text);
  }
  .work-client {
    font-family: var(--font-mono);
    font-size: 12px;
    color: color-mix(in oklab, var(--card-dark-text) 60%, transparent);
    letter-spacing: 0.06em;
  }
  .work-stack { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
  .chip {
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 3px;
    border: 1px solid color-mix(in oklab, var(--card-dark-text) 30%, transparent);
    color: color-mix(in oklab, var(--card-dark-text) 70%, transparent);
  }

  .work-body { display: flex; flex-direction: column; gap: 16px; }
  .row { display: flex; gap: 14px; align-items: flex-start; }
  .label {
    flex: 0 0 80px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    padding-top: 2px;
  }
  .label--prob { color: var(--vermillion); }
  .label--soln { color: var(--lime); }
  .label--out  { color: var(--tertiary-loud); }
  .txt {
    font-family: var(--font-body);
    font-size: 14px;
    line-height: 1.65;
    color: var(--card-dark-text);
    flex: 1;
  }
  .row--prob .txt { color: color-mix(in oklab, var(--card-dark-text) 70%, transparent); }
  .row--out :global(b) { color: var(--tertiary-loud); font-weight: 700; }
  .work-link {
    margin-top: 4px;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--vermillion);
  }
  .work-card--lime .work-link { color: var(--lime); }
  .work-card--plum .work-link { color: var(--tertiary-loud); }
</style>
```

- [ ] **Step 2: Write `src/components/SelectedWorkTease.astro`**

```astro
---
import { getCollection } from 'astro:content';
import WorkCard from './WorkCard.astro';

const all = await getCollection('case-studies');
const featured = all
  .sort((a, b) => a.data.order - b.data.order)
  .filter((c) => c.data.featured)
  .slice(0, 3);

// If fewer than 3 are marked featured, fall back to first 3 by order
const display = featured.length >= 3 ? featured : all.sort((a, b) => a.data.order - b.data.order).slice(0, 3);
---

<section class="section">
  <div class="container">
    <div class="section-hdr">
      <span class="section-num">03</span>
      <h2>Selected <span class="hl hl--vermillion tilt-l">work</span>.</h2>
    </div>
    <p class="section-lead">
      A few projects that turned <strong>"we need training"</strong> into something the business — and the learner — actually wanted.
    </p>
    <div class="work-list">
      {display.map((cs) => <WorkCard caseStudy={cs} />)}
    </div>
    <a class="see-all" href="/work">See all work →</a>
  </div>
</section>

<style>
  .work-list {
    display: flex; flex-direction: column; gap: 28px;
  }
  .see-all {
    display: inline-block;
    margin-top: 36px;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--vermillion);
    padding-bottom: 4px;
    border-bottom: 1.5px solid var(--vermillion);
  }
</style>
```

- [ ] **Step 3: Add to homepage**

```astro
---
import Base from '~/layouts/Base.astro';
import Hero from '~/components/Hero.astro';
import MetricsTease from '~/components/MetricsTease.astro';
import SelectedWorkTease from '~/components/SelectedWorkTease.astro';
---

<Base title="Casey Shiray — Senior Tech Instructional Designer">
  <Hero />
  <MetricsTease />
  <SelectedWorkTease />
</Base>
```

- [ ] **Step 4: Visual verify**

`npx astro dev`. Expected: 3 inline work cards on the homepage. Each card uses its `accent` color (vermillion / lime / plum) on the tag, label, and link. Clicking a card goes to `/work/[slug]` (404 for now — fine).

- [ ] **Step 5: Commit**

```bash
git add src/components/WorkCard.astro src/components/SelectedWorkTease.astro src/pages/index.astro
git commit -m "feat(home): add SelectedWorkTease with 3 featured case studies"
```

---

### Task 5.4: Build ClosingCTA.astro

**Files:**
- Create: `src/components/ClosingCTA.astro`

- [ ] **Step 1: Write `src/components/ClosingCTA.astro`**

```astro
---
---

<section class="closing section">
  <div class="container">
    <h2 class="closing-h">
      Have a project that <span class="hl hl--vermillion tilt-l">earned its place</span>?
    </h2>
    <p class="closing-sub">Let's figure out if training is the answer — together.</p>
    <div class="closing-actions">
      <a class="cta cta--primary" href="mailto:casey@caseyshiray.com">Email Casey</a>
      <a class="cta cta--ghost" href="/about">More about Casey</a>
    </div>
  </div>
</section>

<style>
  .closing { padding: 120px 0; text-align: center; }
  .closing-h {
    font-size: clamp(40px, 6vw, 84px);
    line-height: 0.95;
  }
  .closing-sub {
    margin-top: 20px;
    font-family: var(--font-hand);
    font-size: clamp(28px, 3vw, 38px);
    color: var(--tertiary-loud);
  }
  .closing-actions {
    margin-top: 40px;
    display: flex;
    justify-content: center;
    gap: 14px;
    flex-wrap: wrap;
  }
  .cta {
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 16px 28px;
    border-radius: 8px;
  }
  .cta--primary { background: var(--vermillion); color: var(--bg); }
  .cta--ghost { background: transparent; border: 1.5px solid var(--divider); color: var(--text); }
  .cta--ghost:hover { border-color: var(--vermillion); }
</style>
```

- [ ] **Step 2: Add to homepage**

```astro
---
import Base from '~/layouts/Base.astro';
import Hero from '~/components/Hero.astro';
import MetricsTease from '~/components/MetricsTease.astro';
import SelectedWorkTease from '~/components/SelectedWorkTease.astro';
import ClosingCTA from '~/components/ClosingCTA.astro';
---

<Base title="Casey Shiray — Senior Tech Instructional Designer">
  <Hero />
  <MetricsTease />
  <SelectedWorkTease />
  <ClosingCTA />
</Base>
```

- [ ] **Step 3: Build and verify**

```bash
npx astro check
npx astro build
```
Expected: both pass with no errors. Visit dev server to confirm closing CTA renders.

- [ ] **Step 4: Commit**

```bash
git add src/components/ClosingCTA.astro src/pages/index.astro
git commit -m "feat(home): add closing CTA section"
```

---

## Phase 6 — Work pages (index + case study detail)

### Task 6.1: Build /work index page (WorkIndex.astro + pages/work/index.astro)

**Files:**
- Create: `src/components/WorkIndex.astro`
- Create: `src/pages/work/index.astro`

- [ ] **Step 1: Write `src/components/WorkIndex.astro`**

```astro
---
import { getCollection } from 'astro:content';
import WorkCard from './WorkCard.astro';

const all = (await getCollection('case-studies')).sort((a, b) => a.data.order - b.data.order);
---

<section class="section">
  <div class="container">
    <div class="section-hdr">
      <span class="section-num">·</span>
      <h2>All <span class="hl hl--vermillion tilt-l">work</span>.</h2>
    </div>
    <p class="section-lead">
      Every project that earned a write-up. Problem → solution → outcome. Click any card for the full story.
    </p>
    <div class="work-list">
      {all.map((cs) => <WorkCard caseStudy={cs} />)}
    </div>
  </div>
</section>

<style>
  .work-list { display: flex; flex-direction: column; gap: 28px; }
</style>
```

- [ ] **Step 2: Write `src/pages/work/index.astro`**

```astro
---
import Base from '~/layouts/Base.astro';
import WorkIndex from '~/components/WorkIndex.astro';
---

<Base title="Work — Casey Shiray" description="Selected instructional design projects. Problem, solution, outcome.">
  <WorkIndex />
</Base>
```

- [ ] **Step 3: Verify**

`npx astro dev`. Navigate to `/work`. Expected: all 4 case studies stacked vertically.

- [ ] **Step 4: Commit**

```bash
git add src/components/WorkIndex.astro src/pages/work/index.astro
git commit -m "feat(work): add /work index page listing all case studies"
```

---

### Task 6.2: Build case study detail components

**Files:**
- Create: `src/components/case-study/CaseStudyHero.astro`
- Create: `src/components/case-study/ProblemBlock.astro`
- Create: `src/components/case-study/ProcessBlock.astro`
- Create: `src/components/case-study/OutcomeBlock.astro`
- Create: `src/components/case-study/ArtifactsGallery.astro`
- Create: `src/components/case-study/LessonsBlock.astro`
- Create: `src/components/case-study/NextCaseStudy.astro`

- [ ] **Step 1: Write `CaseStudyHero.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';

export interface Props {
  caseStudy: CollectionEntry<'case-studies'>;
}

const { caseStudy } = Astro.props;
const { data } = caseStudy;
const titleWords = data.title.split(' ');
const last = titleWords.pop() ?? data.title;
const rest = titleWords.join(' ');
---

<header class="cs-hero">
  <div class="container">
    <div class="cs-breadcrumb">
      <a href="/work">Work</a>
      <span aria-hidden="true">/</span>
      <span>{data.title.replace(/\.$/, '')}</span>
    </div>

    <div class="eyebrow" style="margin-bottom: 14px;">
      Case Study · {data.tag} · {data.year}
    </div>

    <h1 class="cs-h1">
      {rest}{' '}
      <span class={`hl hl--${data.accent} tilt-l`}>{last}</span>
    </h1>

    {data.tagline && <p class="cs-tagline">{data.tagline}</p>}

    <div class="cs-meta">
      <div><strong>Role</strong>{data.role}</div>
      <div><strong>Year</strong>{data.year}</div>
      <div><strong>Client</strong>{data.client}</div>
    </div>
  </div>
</header>

<style>
  .cs-hero { padding: 80px 0 48px; }
  .cs-breadcrumb {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: 28px;
    display: inline-flex; gap: 8px; align-items: center;
  }
  .cs-breadcrumb a { color: var(--text-soft); }
  .cs-breadcrumb a:hover { color: var(--text); }
  .cs-breadcrumb span[aria-hidden] { color: var(--vermillion); }

  .cs-h1 { font-size: clamp(48px, 7vw, 84px); line-height: 0.92; max-width: 1000px; }
  .cs-tagline {
    margin-top: 20px;
    font-family: var(--font-serif);
    font-style: italic;
    font-size: clamp(18px, 1.8vw, 22px);
    color: var(--text-soft);
    max-width: 720px;
  }
  .cs-meta {
    margin-top: 40px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    padding: 24px 0;
    border-top: 1.5px solid var(--divider);
    border-bottom: 1.5px solid var(--divider);
  }
  @media (max-width: 640px) { .cs-meta { grid-template-columns: 1fr; gap: 16px; } }
  .cs-meta > div { font-family: var(--font-mono); font-size: 13px; }
  .cs-meta strong {
    display: block;
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-soft);
    margin-bottom: 4px;
    font-weight: 600;
  }
</style>
```

- [ ] **Step 2: Write `ProblemBlock.astro`, `ProcessBlock.astro`, `OutcomeBlock.astro`**

Create `src/components/case-study/ProblemBlock.astro`:
```astro
---
---

<section class="cs-block cs-block--prob">
  <div class="container">
    <div class="cs-block-label">Problem</div>
    <div class="cs-block-body">
      <slot />
    </div>
  </div>
</section>

<style>
  .cs-block { padding: 48px 0; }
  .cs-block-label {
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--vermillion);
    margin-bottom: 16px;
  }
  .cs-block-body {
    max-width: 720px;
    font-size: 17px;
    line-height: 1.7;
  }
  .cs-block-body :global(p) { margin-bottom: 16px; }
  .cs-block-body :global(p:last-child) { margin-bottom: 0; }
  .cs-block-body :global(em) { font-family: var(--font-serif); font-style: italic; }
</style>
```

Create `src/components/case-study/ProcessBlock.astro` (identical structure, `--lime` label color):
```astro
---
---

<section class="cs-block cs-block--proc">
  <div class="container">
    <div class="cs-block-label">Process</div>
    <div class="cs-block-body">
      <slot />
    </div>
  </div>
</section>

<style>
  .cs-block { padding: 48px 0; }
  .cs-block-label {
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--lime);
    margin-bottom: 16px;
  }
  .cs-block-body {
    max-width: 720px;
    font-size: 17px;
    line-height: 1.7;
  }
  .cs-block-body :global(p) { margin-bottom: 16px; }
  .cs-block-body :global(p:last-child) { margin-bottom: 0; }
  .cs-block-body :global(em) { font-family: var(--font-serif); font-style: italic; }
</style>
```

Create `src/components/case-study/OutcomeBlock.astro`:
```astro
---
export interface Props {
  metrics?: Array<{ value: string; label: string }>;
}

const { metrics } = Astro.props;
---

<section class="cs-block cs-block--out">
  <div class="container">
    <div class="cs-block-label">Outcome</div>
    {metrics && (
      <div class="cs-metric-strip">
        {metrics.map((m) => (
          <div class="cs-metric">
            <div class="cs-metric-val">{m.value}</div>
            <div class="cs-metric-lbl">{m.label}</div>
          </div>
        ))}
      </div>
    )}
    <div class="cs-block-body">
      <slot />
    </div>
  </div>
</section>

<style>
  .cs-block { padding: 48px 0; }
  .cs-block-label {
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--tertiary-loud);
    margin-bottom: 16px;
  }
  .cs-metric-strip {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 18px;
    margin-bottom: 28px;
    padding: 20px 0;
    border-top: 1.5px solid var(--divider);
    border-bottom: 1.5px solid var(--divider);
  }
  .cs-metric-val {
    font-family: var(--font-display);
    font-weight: 900;
    font-size: clamp(32px, 4vw, 48px);
    line-height: 1;
    color: var(--tertiary-loud);
    letter-spacing: -0.02em;
  }
  .cs-metric-lbl {
    margin-top: 6px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-soft);
  }
  .cs-block-body {
    max-width: 720px;
    font-size: 17px;
    line-height: 1.7;
  }
  .cs-block-body :global(p) { margin-bottom: 16px; }
  .cs-block-body :global(p:last-child) { margin-bottom: 0; }
  .cs-block-body :global(b) { color: var(--tertiary-loud); font-weight: 700; }
</style>
```

- [ ] **Step 3: Write `ArtifactsGallery.astro`**

```astro
---
export interface Props {
  images: Array<{ src: string; caption?: string; alt?: string }>;
}
const { images } = Astro.props;
---

<section class="cs-gallery">
  <div class="container">
    <div class="gallery-grid">
      {images.map((img) => (
        <figure class="gallery-item">
          <img src={img.src} alt={img.alt ?? img.caption ?? ''} loading="lazy" />
          {img.caption && <figcaption>{img.caption}</figcaption>}
        </figure>
      ))}
    </div>
  </div>
</section>

<style>
  .cs-gallery { padding: 48px 0; }
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }
  .gallery-item { display: flex; flex-direction: column; gap: 8px; }
  .gallery-item img {
    width: 100%;
    aspect-ratio: 4/3;
    object-fit: cover;
    border-radius: 12px;
    border: 1.5px solid var(--divider);
  }
  figcaption {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    color: var(--text-soft);
  }
</style>
```

- [ ] **Step 4: Write `LessonsBlock.astro`**

```astro
---
---

<section class="cs-lessons">
  <div class="container">
    <div class="lessons-label">What I'd do differently</div>
    <div class="lessons-body"><slot /></div>
  </div>
</section>

<style>
  .cs-lessons {
    padding: 64px 0;
    border-top: 1.5px solid var(--divider);
  }
  .lessons-label {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--text-soft);
    margin-bottom: 16px;
  }
  .lessons-body {
    max-width: 720px;
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 18px;
    line-height: 1.7;
    color: var(--text);
  }
</style>
```

- [ ] **Step 5: Write `NextCaseStudy.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';

export interface Props {
  next: CollectionEntry<'case-studies'>;
}
const { next } = Astro.props;
---

<a class={`next-case next-case--${next.data.accent}`} href={`/work/${next.slug}`}>
  <div class="container next-inner">
    <div class="next-eyebrow">Next case study →</div>
    <div class="next-title">{next.data.title}</div>
    <div class="next-tag">{next.data.tag}</div>
  </div>
</a>

<style>
  .next-case {
    display: block;
    padding: 80px 0;
    background: var(--card-dark-bg);
    color: var(--card-dark-text);
    margin-top: 64px;
    transition: transform 0.25s ease;
  }
  .next-case:hover { transform: translateY(-2px); }
  .next-eyebrow {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--vermillion);
    margin-bottom: 12px;
  }
  .next-case--lime .next-eyebrow { color: var(--lime); }
  .next-case--plum .next-eyebrow { color: var(--tertiary-loud); }
  .next-title {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: clamp(36px, 5vw, 60px);
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: -0.02em;
  }
  .next-tag {
    margin-top: 10px;
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.1em;
    color: color-mix(in oklab, var(--card-dark-text) 60%, transparent);
  }
</style>
```

- [ ] **Step 6: Verify**

```bash
npx astro check
```
Expected: no errors. None of these are wired into a page yet.

- [ ] **Step 7: Commit**

```bash
git add src/components/case-study/
git commit -m "feat(case-study): add Hero + Problem/Process/Outcome blocks + Gallery + Lessons + Next"
```

---

### Task 6.3: Build CaseStudy.astro layout + dynamic route /work/[slug]

**Files:**
- Create: `src/layouts/CaseStudy.astro`
- Create: `src/pages/work/[...slug].astro`

- [ ] **Step 1: Write `src/layouts/CaseStudy.astro`**

```astro
---
import Base from '~/layouts/Base.astro';
import CaseStudyHero from '~/components/case-study/CaseStudyHero.astro';
import NextCaseStudy from '~/components/case-study/NextCaseStudy.astro';
import type { CollectionEntry } from 'astro:content';
import { getEntry } from 'astro:content';

export interface Props {
  caseStudy: CollectionEntry<'case-studies'>;
}

const { caseStudy } = Astro.props;
const { data } = caseStudy;

const nextEntry = data.next ? await getEntry('case-studies', data.next) : null;
---

<Base title={`${data.title} — Casey Shiray`} description={data.tagline ?? data.summary.problem}>
  <CaseStudyHero caseStudy={caseStudy} />
  <slot />
  {nextEntry && <NextCaseStudy next={nextEntry} />}
</Base>
```

- [ ] **Step 2: Write `src/pages/work/[...slug].astro`**

```astro
---
import { getCollection } from 'astro:content';
import CaseStudy from '~/layouts/CaseStudy.astro';
import ProblemBlock from '~/components/case-study/ProblemBlock.astro';
import ProcessBlock from '~/components/case-study/ProcessBlock.astro';
import OutcomeBlock from '~/components/case-study/OutcomeBlock.astro';
import ArtifactsGallery from '~/components/case-study/ArtifactsGallery.astro';
import LessonsBlock from '~/components/case-study/LessonsBlock.astro';

export async function getStaticPaths() {
  const studies = await getCollection('case-studies');
  return studies.map((cs) => ({ params: { slug: cs.slug }, props: { caseStudy: cs } }));
}

const { caseStudy } = Astro.props;
const { Content } = await caseStudy.render();
---

<CaseStudy caseStudy={caseStudy}>
  <Content components={{ ProblemBlock, ProcessBlock, OutcomeBlock, ArtifactsGallery, LessonsBlock }} />
</CaseStudy>
```

- [ ] **Step 3: Verify routing works (even though MDX bodies are empty)**

```bash
npx astro dev
```
Visit `http://localhost:4321/work/designs-that-matter`. Expected:
- CaseStudyHero renders (breadcrumb, title with vermillion highlight on "Matter.", role/year/client meta)
- Empty content area (bodies are still stubbed)
- NextCaseStudy at the bottom pointing to Day One, For Real

Click "Next case study →" — confirm it goes to `/work/day-one-for-real`.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/CaseStudy.astro src/pages/work/
git commit -m "feat(work): add dynamic /work/[slug] route + CaseStudy layout"
```

---

## Phase 7 — Fill case study MDX bodies

For each case study, the body uses `<ProblemBlock />`, `<ProcessBlock />`, `<OutcomeBlock />`, `<ArtifactsGallery />` (optional, depends on assets being added), and `<LessonsBlock />`.

### Task 7.1: Write the body for `designs-that-matter.mdx`

**Files:**
- Modify: `src/content/case-studies/designs-that-matter.mdx`

- [ ] **Step 1: Replace the body placeholder**

Edit `src/content/case-studies/designs-that-matter.mdx`. After the frontmatter `---`, replace `{/* MDX body filled in Task 7.1 once case study components exist */}` with:

```mdx
<ProblemBlock>

Most L&D teams know bad training when they see it. They watch a learner click through a course, sigh audibly, then walk back to their desk and ask a colleague the same question they were just "trained" on. The team feels the problem — but they can't name it.

Without a shared vocabulary for *why* something doesn't work, design conversations devolve into preference fights. "I think the slides need more color." "I think there should be a quiz." Stakeholders pile on requests because the only thing they can articulate is *more*. The result is design-by-committee: training that ships with a hundred small additions and not one principled choice.

I wanted a course that gave L&D practitioners — and the stakeholders they work with — a shared language. Not theory for theory's sake. The kind you can use on Monday.

</ProblemBlock>

<ProcessBlock>

Four phases, organized around what you do with a problem when you see one: **Spot it**, **Explain it**, **Fix it**, **Defend it**.

Each phase is three short lessons (10 minutes each), built on Richard Mayer's multimedia learning principles. Concept video → low-stakes activity → reflection. The activities are small on purpose: sort some examples, rewrite a bad slide title, draft a one-paragraph reply to a stakeholder asking for "just one more thing." Nothing that takes longer than a coffee break.

The hardest design decision was what to *cut*. Mayer's research catalogs over 15 principles. I picked five — coherence, signaling, redundancy, modality, generative activity — because those five cover ~80% of the bad-training cases I've seen in the wild. The other ten get a one-paragraph footnote per lesson and a "go deeper" reading list at the end. The course isn't a textbook. It's a tool.

I piloted phase 1 with twelve L&D practitioners before building phases 2–4. Three of them couldn't articulate why a particular example was bad — even though they all agreed it *was* bad. That confirmed the vocabulary gap was real. It also reshaped how I wrote the "Spot it" lessons: less about identifying problems by category, more about asking the right diagnostic questions.

</ProcessBlock>

<OutcomeBlock metrics={[
  { value: '~90 min', label: 'Total course length' },
  { value: '9', label: 'Lessons across 4 phases' },
  { value: '12', label: 'Pilot practitioners' },
]}>

The course ships as a Rise package with 9 modules, animated SVG diagrams for each principle, and a printable "stakeholder reply" cheatsheet. Pilot practitioners reported they could name the principle behind a bad design choice within two weeks — and that they used the vocabulary in their next deck review with stakeholders.

The unexpected outcome: three of the pilot practitioners asked if they could co-teach the principles to their own teams. The cheatsheet has been screenshotted on LinkedIn enough times that I now find it in other people's slide decks.

</OutcomeBlock>

<LessonsBlock>

I underbuilt the "Defend it" phase in v1. The activities asked practitioners to draft replies to stakeholder pushback, but I didn't give them enough framing for *why* the pushback usually happens. In v2 I'd add a short lesson on the political dynamics of training requests — most of which are really about something else (a manager who needs cover, a process that's broken, a tool that's confusing) — before asking practitioners to defend a design choice.

</LessonsBlock>
```

- [ ] **Step 2: Verify**

```bash
npx astro check
npx astro dev
```
Visit `/work/designs-that-matter`. Expected: full case study renders with Problem (vermillion), Process (lime), Outcome (plum, with metrics strip), Lessons block, Next case study card.

- [ ] **Step 3: Commit**

```bash
git add src/content/case-studies/designs-that-matter.mdx
git commit -m "feat(content): write Designs That Matter case study body"
```

---

### Task 7.2: Write the body for `day-one-for-real.mdx`

**Files:**
- Modify: `src/content/case-studies/day-one-for-real.mdx`

- [ ] **Step 1: Replace body placeholder with:**

```mdx
<ProblemBlock>

Fourteen thousand frontline hires a year. A four-hour day-one compliance video. A thirty-eight percent completion rate.

The video had been the standard for six years. Nobody loved it, but nobody had a better idea, and switching tools meant a six-month procurement cycle. So new hires sat through it, mostly didn't finish, and managers spent week one re-teaching the parts the new hires had skipped. The compliance team thought we had a learner-engagement problem. The operations leaders thought we had a content problem. Both were partially right and neither was the real problem.

The real problem was that the format had nothing to do with the job. Day one on the floor is fast, social, and full of small decisions a video can't simulate. Watching someone else make those decisions on a screen is not how anyone learns them.

</ProblemBlock>

<ProcessBlock>

I started by riding along with three regional ops managers for a week. Every time they corrected a week-one hire, I wrote down the correction. By the end of the week I had ninety-three. When I sorted them, eighty-seven fell into four buckets: customer escalation handling, register-and-cash discrepancies, safety-and-incident reporting, and shift handoff.

Those four became the simulation. We kept the legally-required compliance content as a 22-minute video — short enough to actually watch, with the regulatory content the lawyers needed verbatim. Everything else became a branching scenario built in Storyline: hires played a fictional shift, made the same calls they'd face on the floor, and saw consequences play out over the next "two hours" of simulated time.

The hardest design decision was how *consequential* to make the wrong choices. Too soft and the sim feels like a video game where everyone wins. Too punitive and hires get demoralized in their first hour. I landed on "consequences they could feel but not be hurt by": a wrong escalation lost them a customer (and a coaching moment from a virtual manager), but not a job. We tested the calibration on a small group before rolling out.

</ProcessBlock>

<OutcomeBlock metrics={[
  { value: '94%', label: 'Completion rate (up from 38%)' },
  { value: '~60%', label: 'Reduction in week-one re-teach time' },
  { value: '+11pt', label: '30-day retention vs prior cohort' },
]}>

Completion jumped to ninety-four percent in the first month, and held there. Manager re-teach time dropped roughly sixty percent — they could spend week one coaching on edge cases instead of re-teaching cash handling. Thirty-day retention improved by eleven points compared to the prior year's cohort, which translates to a meaningful number when you multiply by fourteen thousand hires.

The simulation file became the template for three other markets the company runs in. We translated the scripts (not the simulation engine) and rolled it to the international ops org six months later.

</OutcomeBlock>

<LessonsBlock>

In retrospect, I wish I'd built the analytics dashboard alongside the simulation, not three months after. The completion rate was easy to track from the LMS, but the *which branch did hires choose* data — the part that would have let us iterate on the calibration — wasn't visible to the design team until I built a separate report. Next time the dashboard ships with v1.

</LessonsBlock>
```

- [ ] **Step 2: Verify in dev**

`npx astro dev` → `/work/day-one-for-real`. Expected full render.

- [ ] **Step 3: Commit**

```bash
git add src/content/case-studies/day-one-for-real.mdx
git commit -m "feat(content): write Day One, For Real case study body"
```

---

### Task 7.3: Write the body for `the-form-that-worked.mdx`

**Files:**
- Modify: `src/content/case-studies/the-form-that-worked.mdx`

- [ ] **Step 1: Replace body with:**

```mdx
<ProblemBlock>

Adoption of a new EHR module at a 3,200-clinician healthcare network sat at forty-one percent six weeks after launch. Stakeholders had a confident diagnosis: the clinicians were resistant to change, and the solution was a ninety-minute mandatory training.

I asked if I could talk to ten clinicians first before designing anything. I knew the answer wasn't going to be a ninety-minute training, because nobody resists change for ninety minutes' worth of reasons. People resist change when the new thing makes their job harder, or when they don't trust the people asking them to change. I wanted to know which.

</ProblemBlock>

<ProcessBlock>

Ten clinician interviews, twenty minutes each, over two weeks. Nine of the ten said the same thing in slightly different words: the new module had three screens for what used to be one. They weren't resisting the change. They were resisting paying a thirty-second tax on every patient encounter.

The form was the problem. Not the training. Not the clinicians. The form.

I took that finding to the engineering team and to the product manager for the EHR. After two weeks of pushback ("but the three screens map to the three regulatory domains") and a session walking them through ten clinician examples, we got to a redesigned single screen that consolidated the three. Then — and only then — did I build a four-minute walkthrough video. Not a course. A walkthrough.

The walkthrough was deliberately short because the form was now intuitive enough that anything longer was insulting. The video covered three things: where the consolidated screen lives in the workflow, what changed about the underlying data (it hadn't, but clinicians wanted to know), and a one-paragraph reassurance from the CMO that this was the new official version.

</ProcessBlock>

<OutcomeBlock metrics={[
  { value: '89%', label: 'Adoption (up from 41%) within 6 weeks' },
  { value: '4 min', label: 'Walkthrough length (vs 90-min planned training)' },
  { value: '2', label: 'Other workflows audited using the same approach' },
]}>

Adoption rose to eighty-nine percent within six weeks of the form redesign. The four-minute walkthrough was watched once by ninety-three percent of clinicians (we didn't make it mandatory) and re-watched by less than two percent — which is exactly the engagement profile you want for a short reference video.

The compliance lead reallocated the training budget that would have gone toward the ninety-minute mandatory course to two other workflow fixes the clinicians had flagged in the same interviews. Same approach, same payoff. The phrase "is this actually a training problem?" became something the L&D team got asked, instead of having to ask.

</OutcomeBlock>

<LessonsBlock>

I should have presented the ten-interview finding to the executive sponsor in person, not in a deck. The deck version (which I led with) made it look like an L&D recommendation; the in-person version (which I followed up with) made it land as a clinical leadership recommendation. Same content, very different reception. The lesson is about *who needs to feel ownership of the finding* — and I'd build a stakeholder map up front next time.

</LessonsBlock>
```

- [ ] **Step 2: Verify + commit**

```bash
npx astro check
git add src/content/case-studies/the-form-that-worked.mdx
git commit -m "feat(content): write The Form That Worked case study body"
```

---

### Task 7.4: Write the body for `manager-defense.mdx`

**Files:**
- Modify: `src/content/case-studies/manager-defense.mdx`

- [ ] **Step 1: Replace body with:**

```mdx
<ProblemBlock>

A SaaS scale-up was promoting forty new managers a quarter — most of them strong individual contributors who had earned the title by being technically excellent. The company knew the gap. They had bought a leadership LMS path and assigned it as part of the promotion package. Then they handed each new manager a calendar invite to the LMS, a Slack channel for peer questions, and "good luck."

At the ninety-day mark, sixty-five percent of new managers reported feeling unprepared for the role. The LMS completion rate was high — they were earnest about it — but completion wasn't the same as confidence. The content was *correct* and the format was *wrong*. You don't learn to make hard decisions by watching someone else describe how to make them.

</ProblemBlock>

<ProcessBlock>

An eight-week cohort, built around a single load-bearing constraint: every manager would defend, in front of their cohort and a coach, **one real decision they made in the previous thirty days.**

The cohort runs in three rhythms. Async micro-lessons (15-20 minutes, twice a week) cover the conceptual scaffolding: feedback frames, escalation paths, performance management, hiring loops. Live coaching sessions every Friday for ninety minutes, where the cohort gets one of three formats — case discussion, peer-coaching, or "manager autopsy" (anonymized retrospective on a decision a senior leader has agreed to share). And a capstone in week eight: the defense.

The defense is the hinge. New managers don't actually want to discuss "leadership" in the abstract — they want to test their judgment against people who'll push them. The capstone forces them to pick a real decision they made in the previous month, walk the cohort through it, and field questions for fifteen minutes. The coaching staff sits in but doesn't lead. Everyone watches everyone's defense. By the end of week eight you've seen forty real management decisions argued, defended, and refined.

I built the program with two senior leaders — a VP of Engineering and a VP of CS — who agreed to be the first capstone coaches. Their participation signaled what the program was *actually for* (rigorous judgment-building) versus what it could have been mistaken for (another leadership training).

</ProcessBlock>

<OutcomeBlock metrics={[
  { value: '82%', label: 'Ninety-day "feel prepared" score (up from 35%)' },
  { value: '8 weeks', label: 'Cohort length' },
  { value: '40', label: 'Real decisions defended per cohort' },
]}>

Ninety-day "feel prepared" scores climbed from thirty-five to eighty-two percent across the first three cohorts. More importantly, the *retention of new managers* through their first year improved meaningfully — and the cohort design became the default for every leadership level above (senior manager, director, VP) within twelve months.

The capstones generated a quiet secondary effect: senior leaders began asking to sit in on cohort defenses, partly out of curiosity and partly because the defense quality forced them to clarify how *they* were making decisions. The capstone format spread laterally, into product review and design critique, before any of us suggested it should.

</OutcomeBlock>

<LessonsBlock>

The async micro-lessons were the weakest part of v1. I built them assuming new managers would do them solo, between live sessions. About half of them watched at 1.5x and forgot the content by Friday. In v2 I'd structure the async work as paired-watching — two managers from the cohort assigned to watch a lesson together over Zoom or in person, with a short shared reflection. Costs nothing extra and would have lifted retention of the conceptual scaffolding by a lot.

</LessonsBlock>
```

- [ ] **Step 2: Verify + commit**

```bash
npx astro check
npx astro build
git add src/content/case-studies/manager-defense.mdx
git commit -m "feat(content): write Manager Defense case study body"
```

- [ ] **Step 3: Run a full link check by clicking through all 4 case studies**

`npx astro dev`, then navigate `/` → `/work` → click each card → click next-case-study chain. Expected: full circular navigation works. Both light and dark surfaces render every page correctly.

---

## Phase 8 — About page

### Task 8.1: Build PhilosophySection.astro

**Files:**
- Create: `src/components/PhilosophySection.astro`

- [ ] **Step 1: Write the component**

```astro
---
const cards = [
  { tag: 'Diagnose first', h: 'Find the real cause.', body: 'Five "whys" before any design move. If the answer is "the process is broken," I say so — and we fix the process, not the people.', accent: 'vermillion' },
  { tag: 'Design with evidence', h: 'Less box-check.', body: 'Every design choice cites a principle. Cognitive load, signaling, dual channels, generative activity. If it can\'t earn its place, it doesn\'t ship.', accent: 'lime' },
  { tag: 'Defend the call', h: 'Stakeholders, partnered.', body: 'A design defense isn\'t "no." It\'s "here\'s what this choice costs the learner — and here\'s a better path." Stakeholders become collaborators, not opponents.', accent: 'plum' },
] as const;
---

<section class="section" id="philosophy">
  <div class="container">
    <div class="section-hdr">
      <span class="section-num">01</span>
      <h2>How I <span class="hl hl--vermillion tilt-l">work</span>.</h2>
    </div>
    <p class="section-lead">
      Most learning problems aren't learning problems. They're <strong>process problems</strong>, <strong>tool problems</strong>, or <strong>seventeen-spreadsheets-all-claiming-to-be-the-single-source-of-truth problems</strong>. The work is figuring out which — before anyone builds a course.
    </p>
    <div class="philo-grid">
      {cards.map((c) => (
        <article class={`philo-card philo-card--${c.accent}`}>
          <div class="philo-tag">{c.tag}</div>
          <h3 class="philo-h">{c.h}</h3>
          <p class="philo-body">{c.body}</p>
        </article>
      ))}
    </div>
  </div>
</section>

<style>
  .section-hdr { display: flex; align-items: baseline; gap: 18px; margin-bottom: 28px; }
  .section-lead {
    max-width: 780px;
    font-size: 18px;
    line-height: 1.7;
    color: var(--text-soft);
    margin-bottom: 56px;
  }
  .section-lead strong { color: var(--text); font-weight: 700; }

  .philo-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  @media (max-width: 1024px) { .philo-grid { grid-template-columns: 1fr; } }

  .philo-card {
    background: var(--surf);
    border: 1.5px solid var(--divider);
    border-radius: 14px;
    padding: 28px;
    border-top: 6px solid var(--vermillion);
  }
  .philo-card--lime { border-top-color: var(--lime); }
  .philo-card--plum { border-top-color: var(--tertiary-loud); }

  .philo-tag {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 14px;
    color: var(--vermillion);
  }
  .philo-card--lime .philo-tag { color: var(--lime); }
  .philo-card--plum .philo-tag { color: var(--tertiary-loud); }

  .philo-h {
    font-size: clamp(20px, 2vw, 26px);
    margin-bottom: 12px;
  }
  .philo-body {
    font-size: 14px;
    line-height: 1.65;
    color: var(--text-soft);
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PhilosophySection.astro
git commit -m "feat(about): add PhilosophySection (3 cards with rotating accent borders)"
```

---

### Task 8.2: Build ProcessSection.astro

**Files:**
- Create: `src/components/ProcessSection.astro`

- [ ] **Step 1: Write**

```astro
---
const steps = [
  { num: '01', h: 'Spot it.',    body: 'Interviews + observations. Define the actual performance gap — not the stated training request.', accent: 'vermillion' },
  { num: '02', h: 'Explain it.', body: 'Map the cognitive load. Name the principles that apply. Decide whether training is part of the answer at all.', accent: 'lime' },
  { num: '03', h: 'Fix it.',     body: 'Build the lightest intervention that solves the problem — course, simulation, job aid, process change, or a mix.', accent: 'plum' },
  { num: '04', h: 'Defend it.',  body: 'Measure. Adjust. Help stakeholders see why each design choice earned its place. Hand off something they can maintain.', accent: 'vermillion' },
] as const;
---

<section class="section" id="process">
  <div class="container">
    <div class="section-hdr">
      <span class="section-num">02</span>
      <h2>How a <span class="hl hl--lime tilt-r">project</span> runs.</h2>
    </div>
    <p class="section-lead">
      Four phases, in order. Most projects skip phase 4 — that's usually why they don't stick. <strong>I won't.</strong>
    </p>
    <div class="process-grid">
      {steps.map((s) => (
        <div class={`proc-step proc-step--${s.accent}`}>
          <div class="proc-num">{s.num}</div>
          <h3 class="proc-h">{s.h}</h3>
          <p class="proc-body">{s.body}</p>
        </div>
      ))}
    </div>
  </div>
</section>

<style>
  .section-hdr { display: flex; align-items: baseline; gap: 18px; margin-bottom: 28px; }
  .section-lead {
    max-width: 780px;
    font-size: 18px;
    line-height: 1.7;
    color: var(--text-soft);
    margin-bottom: 56px;
  }
  .section-lead strong { color: var(--text); font-weight: 700; }
  .process-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  @media (max-width: 1024px) { .process-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 640px)  { .process-grid { grid-template-columns: 1fr; } }

  .proc-step {
    background: var(--surf);
    border: 1.5px solid var(--divider);
    border-radius: 14px;
    padding: 28px 24px;
  }
  .proc-num {
    font-family: var(--font-display);
    font-weight: 900;
    font-size: 44px;
    line-height: 1;
    letter-spacing: -0.02em;
    color: var(--vermillion);
  }
  .proc-step--lime .proc-num { color: var(--lime); }
  .proc-step--plum .proc-num { color: var(--tertiary-loud); }
  .proc-h {
    margin-top: 14px;
    font-size: clamp(20px, 2vw, 26px);
  }
  .proc-body {
    margin-top: 10px;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--text-soft);
    line-height: 1.65;
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ProcessSection.astro
git commit -m "feat(about): add ProcessSection (4 phases with rotating accent numbers)"
```

---

### Task 8.3: Build WorkHistory.astro

**Files:**
- Create: `src/components/WorkHistory.astro`

This holds the resume content. The data is hard-coded for now — Casey can edit this file directly.

- [ ] **Step 1: Write**

```astro
---
const roles = [
  { period: 'Current',  title: 'Senior Tech Instructional Designer', org: 'Independent' },
  { period: '2022–2024',title: 'Lead Instructional Designer',         org: 'Confidential (healthcare network, 3,200 clinicians)' },
  { period: '2019–2022',title: 'Senior Learning Designer',            org: 'Fortune 500 retailer' },
  { period: '2016–2019',title: 'Instructional Designer',              org: 'SaaS scale-up' },
];

const credentials = [
  { period: '—',         title: 'M.S. Learning Design & Technology', detail: "Bloom's-anchored" },
  { period: '—',         title: 'ATD Master Trainer · CPLP',         detail: '' },
];

const talks = [
  { period: '2026', title: 'Designs That Matter',                            detail: 'DevLearn conference talk + self-directed course' },
];
---

<section class="section" id="resume">
  <div class="container">
    <div class="section-hdr">
      <span class="section-num">03</span>
      <h2>Work <span class="hl hl--plum tilt-l">history</span>.</h2>
    </div>

    <div class="history-block">
      <h3 class="history-h">Roles</h3>
      <ul class="history-list">
        {roles.map((r) => (
          <li>
            <span class="history-period">{r.period}</span>
            <span class="history-title">{r.title}</span>
            <span class="history-org">{r.org}</span>
          </li>
        ))}
      </ul>
    </div>

    <div class="history-block">
      <h3 class="history-h">Credentials</h3>
      <ul class="history-list">
        {credentials.map((c) => (
          <li>
            <span class="history-period">{c.period}</span>
            <span class="history-title">{c.title}</span>
            <span class="history-org">{c.detail}</span>
          </li>
        ))}
      </ul>
    </div>

    <div class="history-block">
      <h3 class="history-h">Talks &amp; publications</h3>
      <ul class="history-list">
        {talks.map((t) => (
          <li>
            <span class="history-period">{t.period}</span>
            <span class="history-title">{t.title}</span>
            <span class="history-org">{t.detail}</span>
          </li>
        ))}
      </ul>
    </div>

    <p class="hobbies-line">
      Outside of work: <a href="/hobbies">board games · video games · dinosaurs · and other things →</a>
    </p>
  </div>
</section>

<style>
  .section-hdr { display: flex; align-items: baseline; gap: 18px; margin-bottom: 40px; }
  .history-block { margin-bottom: 48px; }
  .history-block:last-of-type { margin-bottom: 24px; }
  .history-h {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--vermillion);
    margin-bottom: 18px;
  }
  .history-list { display: flex; flex-direction: column; gap: 12px; }
  .history-list li {
    display: grid;
    grid-template-columns: 110px 1fr 1fr;
    gap: 18px;
    padding: 12px 0;
    border-bottom: 1px solid var(--divider);
    align-items: baseline;
  }
  @media (max-width: 640px) {
    .history-list li { grid-template-columns: 1fr; gap: 4px; }
  }
  .history-period {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-soft);
  }
  .history-title {
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 15px;
  }
  .history-org {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-soft);
  }
  .hobbies-line {
    margin-top: 32px;
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 16px;
    color: var(--text-soft);
  }
  .hobbies-line a { color: var(--tertiary-loud); }
  .hobbies-line a:hover { text-decoration: underline; }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/WorkHistory.astro
git commit -m "feat(about): add WorkHistory with roles + credentials + talks"
```

---

### Task 8.4: Build ContactBlock.astro

**Files:**
- Create: `src/components/ContactBlock.astro`

- [ ] **Step 1: Write**

```astro
---
---

<section class="section" id="contact">
  <div class="container contact-inner">
    <h2 class="contact-h">
      Have a project that <span class="hl hl--vermillion tilt-l">earned its place</span>?
    </h2>
    <p class="contact-sub">Let's figure out if training is the answer — together.</p>
    <div class="contact-actions">
      <a class="cta cta--primary" href="mailto:casey@caseyshiray.com">Email Casey</a>
      <a class="cta cta--ghost" href="/resume.pdf">Download portfolio (PDF)</a>
      <a class="cta cta--ghost" href="https://www.linkedin.com/in/caseyshiray" target="_blank" rel="noopener">LinkedIn</a>
    </div>
  </div>
</section>

<style>
  .contact-inner { text-align: center; }
  .contact-h { font-size: clamp(40px, 6vw, 84px); line-height: 0.95; }
  .contact-sub {
    margin-top: 20px;
    font-family: var(--font-hand);
    font-size: clamp(28px, 3vw, 38px);
    color: var(--tertiary-loud);
  }
  .contact-actions {
    margin-top: 40px;
    display: flex;
    justify-content: center;
    gap: 14px;
    flex-wrap: wrap;
  }
  .cta {
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 16px 28px;
    border-radius: 8px;
  }
  .cta--primary { background: var(--vermillion); color: var(--bg); }
  .cta--ghost { background: transparent; border: 1.5px solid var(--divider); color: var(--text); }
  .cta--ghost:hover { border-color: var(--vermillion); }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ContactBlock.astro
git commit -m "feat(about): add ContactBlock for the about page footer"
```

---

### Task 8.5: Assemble the About page

**Files:**
- Create: `src/pages/about.astro`

- [ ] **Step 1: Write**

```astro
---
import Base from '~/layouts/Base.astro';
import PhilosophySection from '~/components/PhilosophySection.astro';
import ProcessSection from '~/components/ProcessSection.astro';
import WorkHistory from '~/components/WorkHistory.astro';
import ContactBlock from '~/components/ContactBlock.astro';
---

<Base
  title="About — Casey Shiray"
  description="How Casey works. The principles, the process, and the career behind the portfolio."
>
  <header class="about-hero">
    <div class="container">
      <div class="eyebrow">About</div>
      <h1 class="about-h1">
        I make <s class="strike">training</s>
        <span class="solutions">solutions</span><br />
        that <span class="hl hl--lime tilt-r">help people do their jobs</span>.
      </h1>
    </div>
  </header>

  <PhilosophySection />
  <ProcessSection />
  <WorkHistory />
  <ContactBlock />
</Base>

<style>
  .about-hero { padding: 80px 0 64px; }
  .about-h1 {
    font-size: clamp(48px, 7vw, 88px);
    line-height: 0.95;
    margin-top: 18px;
  }
  .strike {
    text-decoration: line-through;
    text-decoration-color: var(--vermillion);
    text-decoration-thickness: 5px;
    color: var(--text-soft);
  }
  .solutions {
    font-family: var(--font-hand);
    color: var(--vermillion);
    font-weight: 700;
    font-style: normal;
    text-transform: none;
    font-size: 0.95em;
  }
</style>
```

- [ ] **Step 2: Verify**

`npx astro dev` → `/about`. Expected: hero with the strike-through "training" / handwritten "solutions" treatment, then Philosophy (3 cards), Process (4 steps), Work History (roles/credentials/talks), Contact CTA.

- [ ] **Step 3: Commit**

```bash
git add src/pages/about.astro
git commit -m "feat(about): assemble /about page with hero + philosophy + process + history + contact"
```

---

## Phase 9 — Hobbies system

### Task 9.1: Build HobbyIndex.astro and the /hobbies page

**Files:**
- Create: `src/components/HobbyIndex.astro`
- Create: `src/pages/hobbies/index.astro`

- [ ] **Step 1: Write `HobbyIndex.astro`**

```astro
---
import { getCollection } from 'astro:content';

const cats = (await getCollection('hobby-categories')).sort((a, b) => a.data.order - b.data.order);
---

<section class="section">
  <div class="container">
    <div class="section-hdr">
      <span class="section-num">·</span>
      <h2>Outside of <span class="hl hl--plum tilt-l">work</span>.</h2>
    </div>
    <p class="section-lead">
      What I make when nobody's grading me. Costumes, furniture, paintings, games. Each tile is a category — click for the build log.
    </p>
    <div class="cat-grid">
      {cats.map((c) => (
        <a class={`cat-tile cat-tile--${c.data.accent}`} href={`/hobbies/${c.slug}`}>
          <div class="cat-name">{c.data.name}</div>
          <div class="cat-intro">{c.data.intro}</div>
          <div class="cat-arrow">→</div>
        </a>
      ))}
    </div>
  </div>
</section>

<style>
  .section-hdr { display: flex; align-items: baseline; gap: 18px; margin-bottom: 28px; }
  .section-lead {
    max-width: 780px;
    font-size: 18px;
    line-height: 1.7;
    color: var(--text-soft);
    margin-bottom: 48px;
  }
  .cat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 18px;
  }
  .cat-tile {
    background: var(--surf);
    border: 1.5px solid var(--divider);
    border-radius: 14px;
    padding: 28px;
    border-top: 6px solid var(--vermillion);
    transition: transform 0.2s ease, border-top-color 0.2s ease;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 200px;
  }
  .cat-tile--lime { border-top-color: var(--lime); }
  .cat-tile--plum { border-top-color: var(--tertiary-loud); }
  .cat-tile:hover { transform: translateY(-3px); }

  .cat-name {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: clamp(24px, 2.6vw, 32px);
    text-transform: uppercase;
    letter-spacing: -0.015em;
  }
  .cat-intro {
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-soft);
    flex: 1;
  }
  .cat-arrow {
    font-family: var(--font-mono);
    font-weight: 700;
    font-size: 18px;
    color: var(--vermillion);
  }
  .cat-tile--lime .cat-arrow { color: var(--lime); }
  .cat-tile--plum .cat-arrow { color: var(--tertiary-loud); }
</style>
```

- [ ] **Step 2: Write `src/pages/hobbies/index.astro`**

```astro
---
import Base from '~/layouts/Base.astro';
import HobbyIndex from '~/components/HobbyIndex.astro';
---

<Base title="Hobbies — Casey Shiray" description="Costumes, woodworking, painting, games. What Casey makes outside of work.">
  <HobbyIndex />
</Base>
```

- [ ] **Step 3: Verify**

`/hobbies` shows 4 category tiles with rotating accent border-tops. Click each — they'll 404 until Task 9.2.

- [ ] **Step 4: Commit**

```bash
git add src/components/HobbyIndex.astro src/pages/hobbies/index.astro
git commit -m "feat(hobbies): add /hobbies index page with category tiles"
```

---

### Task 9.2: Build HobbyTile.astro and HobbyCategoryPage.astro

**Files:**
- Create: `src/components/HobbyTile.astro`
- Create: `src/components/HobbyCategoryPage.astro`
- Create: `src/pages/hobbies/[category]/index.astro`

- [ ] **Step 1: Write `HobbyTile.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';

export interface Props {
  project: CollectionEntry<'hobby-projects'>;
  category: string;
}

const { project, category } = Astro.props;
const href = project.data.favorite ? `/hobbies/${category}/${project.slug}` : null;
const Tag = href ? 'a' : 'div';
---

<Tag class="hobby-tile" {...(href ? { href } : {})}>
  <img class="hobby-img" src={project.data.cover} alt={project.data.title} loading="lazy" />
  <div class="hobby-body">
    <div class="hobby-meta">
      <span class="hobby-year">{project.data.year}</span>
      {project.data.favorite && <span class="hobby-fav">Favorite</span>}
    </div>
    <h3 class="hobby-title">{project.data.title}</h3>
    <p class="hobby-cap">{project.data.caption}</p>
    {href && <span class="hobby-link">Read more →</span>}
  </div>
</Tag>

<style>
  .hobby-tile {
    background: var(--surf);
    border: 1.5px solid var(--divider);
    border-radius: 14px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: transform 0.2s ease;
  }
  a.hobby-tile:hover { transform: translateY(-3px); }
  .hobby-img {
    width: 100%;
    aspect-ratio: 4/3;
    object-fit: cover;
  }
  .hobby-body { padding: 18px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
  .hobby-meta {
    display: flex;
    gap: 10px;
    align-items: center;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-soft);
  }
  .hobby-fav {
    background: var(--lime);
    color: var(--bg);
    padding: 2px 8px;
    border-radius: 3px;
    font-weight: 700;
  }
  .hobby-title {
    font-size: clamp(18px, 1.6vw, 22px);
    line-height: 1.1;
  }
  .hobby-cap { font-size: 13px; line-height: 1.55; color: var(--text-soft); flex: 1; }
  .hobby-link {
    margin-top: 6px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--vermillion);
  }
</style>
```

- [ ] **Step 2: Write `HobbyCategoryPage.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import HobbyTile from './HobbyTile.astro';

export interface Props {
  category: CollectionEntry<'hobby-categories'>;
}
const { category } = Astro.props;

const allProjects = await getCollection('hobby-projects');
const projects = allProjects
  .filter((p) => p.data.category === category.slug)
  .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
---

<header class="cat-hero">
  <div class="container">
    <div class="cs-breadcrumb">
      <a href="/hobbies">Hobbies</a>
      <span aria-hidden="true">/</span>
      <span>{category.data.name}</span>
    </div>
    <div class="eyebrow">Category</div>
    <h1 class={`cat-h1 cat-h1--${category.data.accent}`}>
      <span class={`hl hl--${category.data.accent} tilt-l`}>{category.data.name}</span>
    </h1>
    <p class="cat-intro">{category.data.intro}</p>
  </div>
</header>

<section class="section">
  <div class="container">
    {projects.length === 0 ? (
      <p class="empty">Casey hasn't added projects to this category yet.</p>
    ) : (
      <div class="hobby-grid">
        {projects.map((p) => <HobbyTile project={p} category={category.slug} />)}
      </div>
    )}
  </div>
</section>

<style>
  .cat-hero { padding: 64px 0 24px; }
  .cs-breadcrumb {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: 24px;
    display: inline-flex; gap: 8px; align-items: center;
  }
  .cs-breadcrumb a { color: var(--text-soft); }
  .cs-breadcrumb a:hover { color: var(--text); }
  .cs-breadcrumb span[aria-hidden] { color: var(--tertiary-loud); }
  .cat-h1 { font-size: clamp(48px, 8vw, 92px); margin-top: 14px; }
  .cat-intro {
    margin-top: 18px;
    max-width: 640px;
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 18px;
    color: var(--text-soft);
    line-height: 1.55;
  }
  .hobby-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 18px;
  }
  .empty {
    font-family: var(--font-serif);
    font-style: italic;
    color: var(--text-soft);
    text-align: center;
    padding: 64px 0;
  }
</style>
```

- [ ] **Step 3: Write `src/pages/hobbies/[category]/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import Base from '~/layouts/Base.astro';
import HobbyCategoryPage from '~/components/HobbyCategoryPage.astro';

export async function getStaticPaths() {
  const cats = await getCollection('hobby-categories');
  return cats.map((c) => ({ params: { category: c.slug }, props: { category: c } }));
}

const { category } = Astro.props;
---

<Base
  title={`${category.data.name} — Casey Shiray`}
  description={category.data.intro}
>
  <HobbyCategoryPage category={category} />
</Base>
```

- [ ] **Step 4: Verify**

`/hobbies` → click "Costuming". Expected: category hero with breadcrumb, "Costuming" highlighted in vermillion, intro paragraph, the sample project tiles below (one favorite, one non-favorite).

- [ ] **Step 5: Commit**

```bash
git add src/components/HobbyTile.astro src/components/HobbyCategoryPage.astro src/pages/hobbies/[category]/
git commit -m "feat(hobbies): add category page route + HobbyTile + HobbyCategoryPage"
```

---

### Task 9.3: Build HobbyDetail layout + favorite project detail route

**Files:**
- Create: `src/layouts/HobbyDetail.astro`
- Create: `src/pages/hobbies/[category]/[slug].astro`

- [ ] **Step 1: Write `src/layouts/HobbyDetail.astro`**

```astro
---
import Base from '~/layouts/Base.astro';
import type { CollectionEntry } from 'astro:content';
import { getEntry } from 'astro:content';

export interface Props {
  project: CollectionEntry<'hobby-projects'>;
}

const { project } = Astro.props;
const category = await getEntry('hobby-categories', project.data.category);
---

<Base
  title={`${project.data.title} — ${category?.data.name ?? 'Hobby'} — Casey Shiray`}
  description={project.data.caption}
>
  <header class="hd-hero">
    <div class="container">
      <div class="cs-breadcrumb">
        <a href="/hobbies">Hobbies</a>
        <span aria-hidden="true">/</span>
        <a href={`/hobbies/${project.data.category}`}>{category?.data.name ?? project.data.category}</a>
        <span aria-hidden="true">/</span>
        <span>{project.data.title}</span>
      </div>
      <div class="eyebrow">Favorite · {project.data.year}</div>
      <h1 class="hd-h1">{project.data.title}</h1>
      <img class="hd-cover" src={project.data.cover} alt={project.data.title} />
    </div>
  </header>

  <section class="hd-body">
    <div class="container">
      <slot />
    </div>
  </section>
</Base>

<style>
  .hd-hero { padding: 64px 0 32px; }
  .cs-breadcrumb {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: 24px;
    display: inline-flex; gap: 8px; align-items: center;
  }
  .cs-breadcrumb a { color: var(--text-soft); }
  .cs-breadcrumb a:hover { color: var(--text); }
  .cs-breadcrumb span[aria-hidden] { color: var(--tertiary-loud); }
  .hd-h1 { font-size: clamp(40px, 6vw, 72px); margin-top: 14px; }
  .hd-cover {
    margin-top: 32px;
    width: 100%;
    border-radius: 14px;
    aspect-ratio: 16/9;
    object-fit: cover;
    border: 1.5px solid var(--divider);
  }
  .hd-body { padding: 48px 0 96px; }
  .hd-body :global(h2) {
    margin-top: 40px;
    margin-bottom: 16px;
    font-size: clamp(24px, 2.4vw, 32px);
  }
  .hd-body :global(p) {
    font-size: 17px;
    line-height: 1.7;
    margin-bottom: 16px;
    max-width: 720px;
  }
</style>
```

- [ ] **Step 2: Write `src/pages/hobbies/[category]/[slug].astro`**

```astro
---
import { getCollection } from 'astro:content';
import HobbyDetail from '~/layouts/HobbyDetail.astro';

export async function getStaticPaths() {
  const projects = await getCollection('hobby-projects');
  return projects
    .filter((p) => p.data.favorite)   // only favorites get detail pages
    .map((p) => ({
      params: { category: p.data.category, slug: p.slug },
      props: { project: p },
    }));
}

const { project } = Astro.props;
const { Content } = await project.render();
---

<HobbyDetail project={project}>
  <Content />
</HobbyDetail>
```

- [ ] **Step 3: Add a placeholder cover image so the page doesn't 404 on the image**

Create the directory and a placeholder image file. Since this is just a placeholder, write a simple SVG:

```bash
mkdir -p public/assets/hobbies/costuming
```

Create `public/assets/hobbies/costuming/sample-favorite.jpg` — for now, place any 1200x900 placeholder. Easiest: copy a small placeholder image, or use an SVG. For the plan, use a 1×1 SVG placeholder named with the right extension. The engineer should replace with a real photo before launch.

For the plan we'll create an SVG placeholder named `.svg` and update the frontmatter cover paths to point to it:
```bash
# Create placeholder
```

Create `public/assets/hobbies/costuming/sample-favorite.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900"><rect fill="#1D1D1F" width="1200" height="900"/><text x="600" y="450" fill="#FEF6E4" font-family="monospace" font-size="48" text-anchor="middle" dominant-baseline="middle">Placeholder · Sample Favorite</text></svg>
```

Then update `src/content/hobby-projects/sample-favorite.mdx` frontmatter `cover` value to `/assets/hobbies/costuming/sample-favorite.svg`.

Also create `public/assets/hobbies/costuming/sample-tile.svg` similarly:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900"><rect fill="#7A5490" width="1200" height="900"/><text x="600" y="450" fill="#FEF6E4" font-family="monospace" font-size="48" text-anchor="middle" dominant-baseline="middle">Placeholder · Sample Tile</text></svg>
```

Update `src/content/hobby-projects/sample-tile.md` `cover` value to `/assets/hobbies/costuming/sample-tile.svg`.

- [ ] **Step 4: Verify**

`/hobbies/costuming/sample-favorite` should render with breadcrumb, title, cover image (the SVG placeholder), and the MDX body content. The non-favorite tile has no detail page — clicking it does nothing (the tile is rendered as a `<div>` not an `<a>`).

- [ ] **Step 5: Commit**

```bash
git add src/layouts/HobbyDetail.astro src/pages/hobbies/[category]/[slug].astro public/assets/hobbies/ src/content/hobby-projects/
git commit -m "feat(hobbies): add favorite detail route + placeholder cover assets"
```

---

## Phase 10 — Motion (Lenis + GSAP + reduced-motion)

### Task 10.1: Install Lenis + GSAP

- [ ] **Step 1: Install**

```bash
npm install lenis gsap
```

- [ ] **Step 2: Commit the lockfile bump**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): add lenis + gsap"
```

---

### Task 10.2: Implement motion.ts

**Files:**
- Create: `src/lib/motion.ts`

- [ ] **Step 1: Write `src/lib/motion.ts`**

```ts
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function reducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function initMotion(): void {
  if (reducedMotion()) {
    // Set final states immediately, do not initialize Lenis/animations
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  // --- Smooth scroll ---
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  lenis.on('scroll', ScrollTrigger.update);

  // --- Hero entrance ---
  const heroH1 = document.querySelector('.hero-h1');
  if (heroH1) {
    gsap.from(heroH1.children, {
      opacity: 0, y: 18, duration: 0.6, stagger: 0.04, ease: 'power2.out',
    });
  }
  const heroSub = document.querySelector('.hero-sub');
  if (heroSub) {
    gsap.from(heroSub, {
      opacity: 0, y: 12, duration: 0.5, delay: 0.4, ease: 'power2.out',
    });
  }

  // --- Section header reveal on scroll ---
  document.querySelectorAll<HTMLElement>('.section-hdr').forEach((el) => {
    gsap.from(el, {
      opacity: 0, y: 18, duration: 0.6, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 80%' },
    });
  });

  // --- Metric counters ---
  document.querySelectorAll<HTMLElement>('.metric-num').forEach((el) => {
    const text = el.textContent ?? '';
    const match = text.match(/^([\d.]+)/);
    if (!match) return;
    const final = parseFloat(match[1]);
    const unitNode = el.querySelector('.metric-unit')?.outerHTML ?? '';
    const obj = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: final,
          duration: 1.2,
          ease: 'power2.out',
          onUpdate: () => {
            const display = final >= 10 ? Math.floor(obj.val) : obj.val.toFixed(1);
            el.innerHTML = `${display}${unitNode}`;
          },
        });
      },
    });
  });
}
```

- [ ] **Step 2: Wire into Base.astro**

In `src/layouts/Base.astro`, add a `<script>` block at the bottom of the body:

```astro
<body>
  <Nav />
  <slot />
  <Footer />

  <script>
    import { initMotion } from '~/lib/motion';

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initMotion);
    } else {
      initMotion();
    }
  </script>
</body>
```

- [ ] **Step 3: Verify**

`npx astro dev`. On the homepage:
- Hero H1 fades in word-by-word (~600ms)
- Caveat subtitle fades in after
- Scrolling: section headers slide up + fade as they hit 80% of viewport
- Metrics: numbers count up from 0 when they enter viewport

In DevTools → Rendering → emulate `prefers-reduced-motion: reduce`. Reload. Expected: animations skip to final state immediately; no Lenis smooth scroll.

- [ ] **Step 4: Commit**

```bash
git add src/lib/motion.ts src/layouts/Base.astro
git commit -m "feat(motion): add Lenis smooth scroll + GSAP entrances + scroll reveals + metric counters"
```

---

## Phase 11 — Polish + 404 + assets

### Task 11.1: Build the 404 page

**Files:**
- Create: `src/pages/404.astro`

- [ ] **Step 1: Write**

```astro
---
import Base from '~/layouts/Base.astro';
---

<Base title="404 — Casey Shiray" description="Page not found.">
  <main class="four-oh-four">
    <div class="container">
      <div class="eyebrow">404 — Lost?</div>
      <h1 class="four-h1">
        That page <span class="hl hl--vermillion tilt-l">isn't here</span>.
      </h1>
      <p class="four-sub">…or did everyone just panic and move it?</p>
      <div class="four-actions">
        <a class="cta cta--primary" href="/">Go home</a>
        <a class="cta cta--ghost" href="/work">See the work</a>
      </div>
    </div>
  </main>
</Base>

<style>
  .four-oh-four { padding: 120px 0; text-align: center; min-height: 60vh; }
  .four-h1 { font-size: clamp(48px, 7vw, 88px); line-height: 0.95; margin-top: 14px; }
  .four-sub {
    margin-top: 20px;
    font-family: var(--font-hand);
    font-size: clamp(28px, 3vw, 38px);
    color: var(--tertiary-loud);
  }
  .four-actions {
    margin-top: 40px;
    display: flex; justify-content: center; gap: 14px; flex-wrap: wrap;
  }
  .cta {
    font-family: var(--font-mono);
    font-size: 13px; font-weight: 700;
    letter-spacing: 0.14em; text-transform: uppercase;
    padding: 16px 28px; border-radius: 8px;
  }
  .cta--primary { background: var(--vermillion); color: var(--bg); }
  .cta--ghost { background: transparent; border: 1.5px solid var(--divider); color: var(--text); }
</style>
```

- [ ] **Step 2: Verify**

`npx astro dev` → visit `/totally-fake-page`. Expected: branded 404 with the same voice.

- [ ] **Step 3: Commit**

```bash
git add src/pages/404.astro
git commit -m "feat(404): add branded 404 page"
```

---

### Task 11.2: Add favicon + OG image placeholders

**Files:**
- Create: `public/favicon.svg`
- Create: `public/og-image.png` (placeholder — instruct user to replace before launch)

- [ ] **Step 1: Write a simple SVG favicon**

`public/favicon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#FEF6E4"/>
  <circle cx="16" cy="16" r="6" fill="#FF5E3A"/>
</svg>
```

- [ ] **Step 2: Create a placeholder og-image**

For now, create `public/og-image.png` as a 1200×630 file. If you don't have an image tool handy, create `public/og-image.svg` with similar content and reference it from Base.astro. Either way, leave a note in `README.md` that the final OG image needs to be a real PNG before launch.

`public/og-image.svg` (temporary):
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <rect width="1200" height="630" fill="#FEF6E4"/>
  <text x="80" y="280" font-family="'League Spartan', sans-serif" font-weight="900" font-size="120" fill="#1D1D1F" text-transform="uppercase">CASEY SHIRAY</text>
  <text x="80" y="360" font-family="'IBM Plex Mono', monospace" font-size="32" fill="#A8462B" letter-spacing="6">SENIOR TECH INSTRUCTIONAL DESIGNER</text>
  <text x="80" y="500" font-family="'Caveat', cursive" font-size="56" fill="#4B2C5A">…or did everyone just panic and ask for slides?</text>
</svg>
```

In `src/layouts/Base.astro`, change the `ogImage` default from `/og-image.png` to `/og-image.svg` (or keep `.png` if you produced a real one).

- [ ] **Step 3: Commit**

```bash
git add public/favicon.svg public/og-image.svg src/layouts/Base.astro
git commit -m "chore(assets): add favicon + placeholder OG image"
```

---

### Task 11.3: Write the README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write**

```md
# Casey Shiray Portfolio

[caseyshiray.com](https://caseyshiray.com) — built with Astro, deployed to Cloudflare Pages.

## Local dev

```bash
npm install
npm run dev       # http://localhost:4321
```

## Build

```bash
npm run build
npm run preview   # serve the built site
```

## Tests

```bash
npm test          # vitest (theme-init logic only)
```

## Type / content checks

```bash
npx astro check
```

## Content authoring (for Casey)

### Add a new case study
Create `src/content/case-studies/<slug>.mdx`:
```mdx
---
title: "Project Name."
tagline: "Optional one-liner."
role: "Your role"
year: 2026
client: "Client / context"
tag: "Category · Type"
accent: vermillion          # or lime or plum
stack: ["Tool 1", "Tool 2"]
summary:
  problem: "One inline paragraph."
  solution: "One inline paragraph."
  outcome: "**Bold metrics** allowed."
order: 5                    # display order on /work
featured: true              # show on homepage tease
next: another-slug          # next case study in the chain
---

<ProblemBlock>Long-form problem narrative.</ProblemBlock>
<ProcessBlock>Long-form process narrative.</ProcessBlock>
<OutcomeBlock metrics={[{ value: '94%', label: 'Completion rate' }]}>
  Outcome narrative.
</OutcomeBlock>
<LessonsBlock>What I'd change.</LessonsBlock>
```

### Add a new hobby category
Create `src/content/hobby-categories/<slug>.md`:
```md
---
name: "Category Name"
intro: "1–2 sentence intro."
accent: vermillion          # or lime or plum
order: 5
---
```

### Add a new hobby project
Create `src/content/hobby-projects/<slug>.md` (non-favorite) or `.mdx` (favorite):
```mdx
---
title: "Project Name"
category: costuming         # matches a category slug
year: 2025
cover: "/assets/hobbies/costuming/project.jpg"
caption: "One-line caption."
favorite: false             # true to give it a /hobbies/[cat]/[slug] detail page
order: 1
---

# Only used when favorite: true
Long-form MDX body.
```

## Pre-launch checklist
- [ ] Replace `public/favicon.svg` with finalized brand favicon
- [ ] Replace `public/og-image.svg` with a real `og-image.png` (1200×630)
- [ ] Replace placeholder hobby images in `public/assets/hobbies/`
- [ ] Add real cover images for case studies in `public/assets/case-studies/`
- [ ] Confirm `casey@caseyshiray.com` email forwarding works on Cloudflare
- [ ] Lighthouse ≥95 on production preview, both light and dark surfaces
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with dev/build/content authoring instructions"
```

---

### Task 11.4: Full build + visual regression sweep

- [ ] **Step 1: Full build**

```bash
npx astro check
npx astro build
```
Expected: both pass with zero errors.

- [ ] **Step 2: Preview the production build**

```bash
npm run preview
```
Open `http://localhost:4321`. Click through every page:
- `/` — Hero, MetricsTease, SelectedWorkTease (3 cards), ClosingCTA
- `/work` — all 4 case studies in WorkIndex
- `/work/designs-that-matter`, `/day-one-for-real`, `/the-form-that-worked`, `/manager-defense` — confirm full case studies render with hero, problem/process/outcome, lessons, and next-case-study chain
- `/about` — hero, philosophy (3 cards), process (4 steps), work history, contact CTA
- `/hobbies` — 4 category tiles
- `/hobbies/costuming` — category page with 2 sample projects
- `/hobbies/costuming/sample-favorite` — favorite detail page
- `/totally-fake` — branded 404

Toggle dark mode on every page. Confirm:
- No flash-of-wrong-theme on page load (especially after a hard reload with `casey-theme=dark` in localStorage)
- Plum subtitle becomes lavender on dark surface
- Work cards invert correctly (cream-on-dark)
- All link colors remain legible

Test reduced motion via DevTools → Rendering → emulate `prefers-reduced-motion: reduce`. Confirm animations skip and Lenis is disabled.

- [ ] **Step 3: Commit any fixes**

If the sweep surfaces issues, fix them in the relevant component and commit each fix as a separate commit (`fix(component): description`).

---

## Phase 12 — Deployment to Cloudflare Pages

### Task 12.1: Push to GitHub

- [ ] **Step 1: Create a private GitHub repo**

Either via the GitHub web UI or `gh`:
```bash
gh repo create caseyshiray-portfolio --private --source=. --remote=origin
```
If `gh` isn't installed, do it through the web UI and then:
```bash
git remote add origin https://github.com/<your-username>/caseyshiray-portfolio.git
```

- [ ] **Step 2: Push**

```bash
git push -u origin main
```

- [ ] **Step 3: Confirm the repo shows the latest commit on GitHub**

---

### Task 12.2: Connect Cloudflare Pages to the repo

Cloudflare Pages setup is done through the Cloudflare dashboard, not the CLI. The steps below are UI clicks — record them as performed.

- [ ] **Step 1: Log into Cloudflare → Workers & Pages → Create**

- [ ] **Step 2: Select "Pages" → "Connect to Git"**

Authorize Cloudflare to access the GitHub repo created in Task 12.1.

- [ ] **Step 3: Configure the build**

- Production branch: `main`
- Framework preset: **Astro**
- Build command: `npm run build`
- Build output directory: `dist`
- Environment variables: none required

- [ ] **Step 4: Trigger the first deploy**

Wait for the build to finish. Cloudflare will assign a preview URL like `casey-portfolio.pages.dev` (or a similar randomized variant).

- [ ] **Step 5: Verify the preview deploy**

Open `casey-portfolio.pages.dev` in a browser. Run through the same visual sweep as Task 11.4 — all pages, both surfaces, reduced-motion test. **Casey is not the user testing here; you are.** Confirm parity with the local production preview.

- [ ] **Step 6: Run Lighthouse on the preview**

In Chrome DevTools → Lighthouse → run on `/`, `/work`, `/work/designs-that-matter`, `/about`, `/hobbies`. Both light and dark surfaces. Target: ≥95 on all four categories. Address any flagged issues with follow-up commits (push triggers a new deploy).

- [ ] **Step 7: Commit notes about the deploy if anything was tweaked**

If Lighthouse surfaced fixes, fix and commit:
```bash
git push
```
(Cloudflare auto-deploys on push.)

---

## Phase 13 — Domain & DNS migration (Squarespace → Cloudflare)

**Critical:** the new site stays at the `.pages.dev` URL until *after* Casey has had a chance to review and approve. Squarespace stays live the entire time. Do not initiate the domain transfer until Casey signs off on the new site.

### Task 13.1: Casey review gate

- [ ] **Step 1: Send Casey the preview URL**

Confirm Casey:
- Has clicked through every page
- Approves the case study content (these are real projects — confirm the metrics and narratives match her records)
- Approves the placeholder hobby content placement (she'll replace with real later)
- Approves the design at both surfaces

**DO NOT PROCEED until Casey has explicitly approved.**

- [ ] **Step 2: Replace placeholder content with real**

If Casey provides real case study cover images, hobby images, OG image, or a finalized favicon, drop them into the appropriate `public/assets/` paths, update frontmatter where needed, and commit. Each push deploys to the preview URL.

---

### Task 13.2: Set up Cloudflare Email Routing BEFORE moving DNS

If `casey@caseyshiray.com` currently routes through Squarespace's email forwarding, set up the equivalent on Cloudflare *first* — otherwise email will break at cutover.

- [ ] **Step 1: Check where the email currently lives**

Ask Casey, or check Squarespace dashboard → Domains → Email. Common cases:
- Squarespace email forwarding to a real Gmail/Outlook inbox → we replicate this on Cloudflare
- Google Workspace MX records → we preserve those MX records exactly when DNS moves
- Squarespace native email → confirm Casey is OK migrating to forwarding

- [ ] **Step 2: Set up Cloudflare Email Routing**

In Cloudflare dashboard (only after the domain is in Cloudflare DNS — see 13.3): enable Email Routing → add `casey@caseyshiray.com` → forward to her real inbox → verify forwarding by sending a test email.

This step depends on Task 13.3 finishing. Keep this as a pinned reminder.

---

### Task 13.3: Initiate domain transfer (Squarespace → Cloudflare Registrar)

- [ ] **Step 1: In Squarespace**

- Domains → caseyshiray.com → Advanced → Unlock domain
- Disable WHOIS privacy if Cloudflare requires it (re-enable after transfer)
- Request the EPP / Auth code → save it

- [ ] **Step 2: In Cloudflare**

- Dashboard → Domain Registration → Transfer Domain
- Enter `caseyshiray.com`
- Paste the auth code from step 1
- Pay the transfer fee (typically $9–10/yr for `.com`, no markup over wholesale)
- Confirm contact info

Cloudflare will email Squarespace's registrar to release the domain. The process typically takes 5–7 days. **The Squarespace site remains live throughout** because DNS hasn't changed yet.

- [ ] **Step 3: Approve the transfer in Squarespace email confirmation**

Squarespace will send a confirmation email asking to approve or deny the transfer. Approve.

- [ ] **Step 4: Wait for transfer completion**

Cloudflare will email when the transfer completes. The domain now shows in Cloudflare's Registrar dashboard.

---

### Task 13.4: Point caseyshiray.com at Cloudflare Pages

- [ ] **Step 1: Add the custom domain to the Pages project**

Pages dashboard → casey-portfolio → Custom Domains → Add custom domain → `caseyshiray.com`.
Then: → Add custom domain → `www.caseyshiray.com`.

Cloudflare automatically creates the CNAME / A records. SSL provisions within minutes.

- [ ] **Step 2: Verify both apex and www resolve**

```bash
curl -I https://caseyshiray.com
curl -I https://www.caseyshiray.com
```
Expected: 200 responses with `cf-ray` headers and a valid TLS cert.

- [ ] **Step 3: Visit both URLs in a browser**

Confirm visual parity with the `.pages.dev` preview.

- [ ] **Step 4: Enable email routing (if not already done in Task 13.2)**

Set up the forwarding now. Send a test email to `casey@caseyshiray.com` → confirm it lands in the destination inbox.

---

### Task 13.5: Stability window + Squarespace cancellation

- [ ] **Step 1: Wait 48 hours**

Confirm `caseyshiray.com` and `www.caseyshiray.com` resolve correctly, no email outages, no DNS weirdness from cached records.

- [ ] **Step 2: Cancel Squarespace subscription**

Only after 48h stable. Squarespace → Billing → Cancel subscription. Confirm the cancellation completes after the current billing period.

- [ ] **Step 3: Final smoke**

```bash
curl -I https://caseyshiray.com
curl -I https://caseyshiray.com/work/designs-that-matter
curl -I https://caseyshiray.com/about
curl -I https://caseyshiray.com/hobbies
```
Expected: all 200, all with valid SSL.

---

## Final verification

- [ ] All four pages (`/`, `/work`, `/about`, `/hobbies`) render correctly in both light and dark surfaces
- [ ] All four case study detail pages render with hero + Problem + Process + Outcome + Lessons + NextCaseStudy
- [ ] Hobbies index → category page → favorite detail navigation works end-to-end
- [ ] DarkToggle respects `prefers-color-scheme` on first load, overrides correctly, persists across page navigation
- [ ] No flash-of-wrong-theme on hard reload in dark mode
- [ ] Lighthouse ≥95 on Performance, Accessibility, Best Practices, SEO on production, both surfaces, on the three most-visited pages
- [ ] Reduced motion test: animations skip and Lenis disabled when `prefers-reduced-motion: reduce` is set
- [ ] All 5 unit tests (3 resolveTheme + 2 applyTheme + 1 smoke) pass via `npm test`
- [ ] `caseyshiray.com` resolves, `www.caseyshiray.com` resolves, SSL valid on both
- [ ] Email forwarding to Casey's real inbox works (send a test)
- [ ] Squarespace subscription cancelled after 48h stability
