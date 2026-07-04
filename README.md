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
- [x] Confirm `casey@caseyshiray.com` email forwarding works on Cloudflare
- [ ] Lighthouse ≥95 on production preview, both light and dark surfaces
