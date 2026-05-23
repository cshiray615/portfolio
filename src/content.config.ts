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
