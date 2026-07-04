import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const caseStudies = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/case-studies' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string().optional(),
    role: z.string(),
    year: z.number(),
    client: z.string(),
    tag: z.string(),
    accent: z.enum(['vermillion', 'lime', 'plum']),
    // Exact phrase within `title` to highlight in the hero + work card.
    // Defaults to the last word of the title when omitted.
    highlight: z.string().optional(),
    stack: z.array(z.string()),
    summary: z.object({
      problem: z.string(),
      solution: z.string(),
      outcome: z.string(),
    }),
    order: z.number(),
    featured: z.boolean().default(false),
    cover: z.string().optional(),
    coverBg: z.string().optional(),
    coverCaption: z.string().optional(),
    coverQuote: z.object({
      lines: z.array(z.string()),
      coda: z.string().optional(),
      highlight: z.string().optional(),
    }).optional(),
    next: z.string().optional(),
  }),
});

const hobbyCategories = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/hobby-categories' }),
  schema: z.object({
    name: z.string(),
    intro: z.string(),
    cover: z.string().optional(),
    coverPosition: z.string().optional(),  // CSS object-position override for the category tile crop
    accent: z.enum(['vermillion', 'lime', 'plum']),
    order: z.number(),
    // 'projects' (default) renders hobby-projects tiles; 'gallery' renders a simple image grid.
    layout: z.enum(['projects', 'gallery']).default('projects'),
    // Gallery items used when layout === 'gallery'.
    // An item is either a single image (src) or a carousel (images: [...]).
    gallery: z.array(z.object({
      src: z.string().optional(),
      caption: z.string().optional(),
      alt: z.string().optional(),
      // When present, the item renders as a carousel — user can cycle through the images
      images: z.array(z.object({
        src: z.string(),
        caption: z.string().optional(),
        alt: z.string().optional(),
      })).optional(),
    })).optional(),
  }),
});

const hobbyProjects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/hobby-projects' }),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    year: z.number(),
    cover: z.string(),
    coverCaption: z.string().optional(),
    coverPosition: z.string().optional(),  // CSS object-position override for the tile crop, e.g. "center" or "center bottom"
    medium: z.string().optional(),
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
