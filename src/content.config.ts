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
    accent: z.enum(['vermillion', 'lime', 'plum']),
    order: z.number(),
  }),
});

const hobbyProjects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/hobby-projects' }),
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
