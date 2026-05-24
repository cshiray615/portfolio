# Casey Shiray Portfolio — Style Guide

Living guidelines for content, voice, design, and component patterns. Update this when a decision lands; it's the source of truth for any future agent or collaborator.

---

## 1. Voice & Writing

### Casey's voice (use for all prose I draft)
- **Skeptical of training-as-default.** First question is always: *"Is training even the right intervention here?"*
- Performance-first, evidence-seeking, systems-building.
- Humor as precision tool. Not decorative. Helps name truth without sounding like a compliance memo.
- Signature phrases: *"nonsense rock"*, *"chaos goblin problems"*, *"knowledge lasagnas"*, *"not anti-fun, very anti-parsley"*.
- Casey's one-sentence self-description: "performance-first, evidence-seeking, systems-building learning designer who uses design, technology, humor, and ruthless clarity to turn messy business problems into tools people can actually use."

### Mechanical rules
- **No em dashes (—).** Replace with periods, commas, colons, parens, or "and"/"but".
- En dashes (–) for ranges and middots (·) for inline separators are fine.
- **Punch line at the end** of each card body or section: leave the reader with a beat.
- **Spell out acronyms on first use** in each context (page, case study body, etc.). Examples:
  - L&D → Learning & Development (L&D)
  - LMS → Learning Management System (LMS)
  - EHR → Electronic Health Record (EHR)
  - CMO → Chief Medical Officer (CMO)
  - SaaS → Software-as-a-Service (SaaS)
  - LXD → Learning Experience Design (LXD)
  - QA → Quality Assurance (QA)
  - CMS → Content Management System (CMS)
  - ILT / vILT → instructor-led / virtual instructor-led training
- Use **real data, not fabricated**. When inferring details, mark them as `{/* TODO: confirm */}` or use bracketed placeholders like `[N years]`.

---

## 2. Visual System

### Color palette (defined in `src/styles/global.css`)
| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#FEF6E4` cream | `#1C1820` ink | Page background |
| `--text` | `#1D1D1F` ink | `#FAF3E0` cream | Body text |
| `--surf` | cream | `#261F30` elevated | Cards / surfaces |
| `--vermillion` | `#FF5E3A` | same | Primary accent |
| `--lime` | `#88C23E` | same | Secondary accent |
| `--plum` | `#4B2C5A` | same | Tertiary accent |
| `--lavender` | `#C8B4D0` | same | Plum's dark-mode partner |
| `--card-dark-bg` | ink | cream | "Letter on the table" inverted card |
| `--divider` | ink | 18% cream | Section dividers |
| `--tertiary-loud` | plum | lavender | Theme-swapping plum |
| `--tertiary-soft` | lavender | plum | Reverse |

### Typography stack
- **Display** (`--font-display`) → League Spartan 800/900 — H1, H2, badges, big numbers
- **Body** (`--font-body`) → IBM Plex Sans — prose, captions
- **Mono** (`--font-mono`) → IBM Plex Mono — labels, eyebrows, metadata, chips, code
- **Serif** (`--font-serif`) → IBM Plex Serif italic — taglines, pull quotes, "lessons learned" prose
- **Hand** (`--font-hand`) → Caveat — Hero subtitle only

### Minimum font size
- **14px floor.** Nothing reads smaller than 14px in the rendered UI.
- Exceptions: SVG sparkline labels, skip-link (visually-hidden until focused).

### Highlight pill (`.hl`)
- Always uses `::before` pseudo for background paint (so descender area is properly cropped)
- `.hl--vermillion` / `.hl--lime` → text color is `var(--text)` ink in both modes (overrides for dark mode)
- `.hl--plum` → **always plum bg + cream text** in both modes (no theme swap)
- Default `inset: -0.10em 0 0.08em 0` — block extends ~0.10em above caps and ~0.08em below baseline
- `tilt-l` (-1.5deg) and `tilt-r` (1deg) rotation modifiers

### Spacing rhythm
- Section padding: `96px 0` (default `.section`)
- Hero padding: varies per page (Home `96px 0 80px`, About `80px 0 64px`, Case study `80px 0 48px`)
- Card padding: 28–36px
- Inline figure margins: `32px 0`

### Other visual rules
- **Lightbox is global.** Any case-study image with `data-lightbox-trigger` opens the shared `<Lightbox />` placed once in CaseStudy + HobbyDetail layouts.
- **Tagline (cs-tagline)** must be prominent: serif italic, `clamp(22px, 2.4vw, 30px)`, full text color (not text-soft).
- **DarkToggle** is a fixed floater at bottom-right, not in nav.
- **Mobile nav** uses a hamburger drawer at ≤640px; eyebrow inside the badge hides on mobile.

---

## 3. Component Library

All components live in `src/components/`. Case-study-specific ones live in `src/components/case-study/`. Registered in `src/pages/work/[...slug].astro` for MDX use.

### Layout / global
- `Nav.astro` — fixed top nav with hamburger drawer
- `Footer.astro` — minimal © line
- `DarkToggle.astro` — floating bottom-right theme switch
- `Hero.astro` — homepage hero with meta strip + bloom backgrounds
- `MetricsTease.astro` — homepage 4-stat strip
- `SelectedWorkTease.astro` — homepage 3 featured WorkCards
- `WorkCard.astro` — horizontal dark case-study card (used on Home + Work index)
- `WorkIndex.astro` — full work list page with search bar
- `PhilosophySection.astro`, `ProcessSection.astro`, `WorkHistory.astro`, `ContactBlock.astro`, `Recommendations.astro` — About page sections

### Hobby
- `HobbyIndex.astro` — category overview grid (3 cat-tiles)
- `HobbyCategoryPage.astro` — mirrors WorkIndex layout (section-hdr + section-lead + vertical card stack)
- `HobbyTile.astro` — horizontal dark card matching WorkCard structure
- `hobby/HobbyHero.astro` — mirrors CaseStudyHero shape
- `hobby/HobbyNavigation.astro` — mirrors CaseNavigation

### Case study (in `src/components/case-study/`)
**Structural:** `CaseStudyHero`, `ProblemBlock`, `ProcessBlock`, `OutcomeBlock`, `LessonsBlock` (vermillion-tinted callout, no top divider), `References`, `Appendix` (collapsible `<details>`), `CaseNavigation` (asymmetric Prev/Next strip), `Lightbox`

**Media:** `Figure` (single inline image, fits content), `ArtifactsGallery` (grid), `BeforeAfter` (drag-compare slider), `AnnotatedScreenshot` (numbered markers + legend), `ScrollStory` + `ScrollScene` (sticky media + scrolling scenes)

**Data:** `BigStat`, `BarChart`, `SparklineTrend` (pure SVG/CSS, palette-themed)

**Narrative:** `PullQuote`, `CodeSample` (Shiki syntax highlighting), `ProcessDiagram` (horizontal or vertical), `LearnerCard` (3-column learner profile), `InterventionMatrix` (gap → solution grid, type-color-coded)

---

## 4. Case Study Structure

### Frontmatter schema (`src/content.config.ts`)
```yaml
title:    string             # punchy, period at end
tagline:  string             # one-line, serif italic on hero
role:     string             # Casey's role on the project
year:     number             # project year
client:   string             # "Company · Team" or "School · Mock client"
tag:      string             # tag(s) for the work-tag chip
accent:   vermillion | lime | plum
stack:    string[]           # tools/methods chips
summary:                     # appears on WorkCard
  problem: string            # 1-2 sentences
  solution: string           # 1-2 sentences
  outcome: string            # 1-2 sentences, may include <b> for metrics
order:    number             # for sorting in All Work
featured: boolean            # appears on homepage SelectedWorkTease (top 3)
cover:    string?            # /case-studies/<slug>/cover.png
coverBg:  string?            # bg color behind transparent covers
next:     string?            # slug of next case study (forms cycle)
```

### Standard body shape
```mdx
<ProblemBlock>
  …setup, what was being asked for, what the real problem looked like
</ProblemBlock>

<ProcessBlock>
  …how Casey diagnosed and built. Inline Figure, BeforeAfter, ProcessDiagram,
  CodeSample, LearnerCard, InterventionMatrix as appropriate.
</ProcessBlock>

<OutcomeBlock metrics={[
  { value: '94%', label: 'Completion (up from 38%)' },
  …
]}>
  Body paragraph(s) on what shipped and how it landed.
</OutcomeBlock>

<ArtifactsGallery images={[…]} />   {/* optional grouped artifacts */}

<LessonsBlock>
  One paragraph in serif italic. Self-critique or "what I'd do differently."
</LessonsBlock>

<References>            {/* optional */}
- Author. (Year). *Title.* Publisher.
</References>

<Appendix title="Optional deep-dive">
  …supplementary content collapsed by default
</Appendix>
```

### Case-study graph
- Each case has `next: <slug>` forming a navigation cycle
- `CaseNavigation` computes Prev as "whichever case points TO this via `next`"
- When inserting a new case, update the previous case's `next` to point to the new slug

### Slugs
- kebab-case, descriptive
- Match the title's verb/noun, e.g. `the-form-that-worked`, `from-shared-drive-to-platform`
- Academic work slugs include the project name, not "OPWL 530"

---

## 5. Content Rules

### Real vs placeholder
- Use real data when available (resume, old portfolio, deliverables)
- Mark inferred or speculative content with `{/* TODO: confirm */}` MDX comments
- Mark bracketed placeholders like `[N years]` or `[Name]` for user to swap

### Academic work
- Goes in the same `case-studies` collection
- Client field uses `"Boise State MS coursework · Mock client engagement"` format
- Tag includes "Academic" or "Coursework" so it's visually distinguishable

### Images
- Real screenshots / artifacts go in `public/case-studies/<slug>/`
- Naming: `01-description.png`, `02-description.png` for sequencing
- Use real images over placehold.co tiles whenever available
- Replace generic screenshots with native components where it makes sense (charts → BarChart/SparklineTrend, learner profiles → LearnerCard, intervention matrices → InterventionMatrix)

---

## 6. Accessibility

- WCAG 2.4.7 focus rings on all interactive elements (vermillion outline)
- Skip link at top of every page (`Base.astro`)
- All buttons have `aria-label` when icon-only
- AnnotatedScreenshot markers ≥36px tap target
- Lightbox uses native `<dialog>` (Escape closes, focus-trapped)
- Search input has `aria-label="Search work samples"`

---

## 7. File Conventions

- Astro components → PascalCase.astro
- Pages → kebab-case (matches URL)
- Content collections → kebab-case slugs
- Style blocks scoped per-component unless in `global.css` or `treatments.css`
- Inline `style="..."` only for genuinely dynamic prop-driven values (bg color, position %, ratio); static styling goes in `<style>` block

---

## 8. Open / In-progress

- Old portfolio migration in progress (Aug 2026 batch). Tracked in conversation; case studies being added one at a time with content review before publish.
- Academic case studies (OPWL 530 Tamrack, OPWL 535 Saint Lukes) queued.
- DevLearn stub conflict resolution pending.
- Cloudflare Pages deployment not yet wired (DNS still on Squarespace).
