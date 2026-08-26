import { defineCollection, z } from 'astro:content';

const wish = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    festival: z.enum(['rakhi', 'diwali', 'holi', 'dussehra', 'navratri']),
    languages: z.object({
      en: z.string().min(5).max(500),
      hi: z.string().min(5).max(500),
      hinglish: z.string().min(5).max(500),
    }),
    relations: z.array(z.enum(['brother', 'sister', 'bhaiya-bhabhi', 'family', 'friend', 'spouse', 'parent'])),
    tones: z.array(z.enum(['short', 'emotional', 'funny', 'formal', 'devotional', 'warm'])).default(['warm']),
    formats: z.array(z.enum(['card', 'whatsapp', 'status', 'long'])).default(['whatsapp']),
    imageAssets: z.object({
      square: z.string().optional(),
      portrait: z.string().optional(),
    }).optional(),
    altText: z.record(z.string()).optional(),
    source: z.literal('original'),
    reviewStatus: z.enum(['pending', 'approved', 'rejected']).default('pending'),
    reviewedBy: z.enum(['reviewer-agent', 'owner']).optional(),
    humanReviewedSeed: z.boolean().default(false),
  }),
});

const festival = defineCollection({
  type: 'data',
  schema: z.object({
    slug: z.string(),
    displayName: z.string(),
    aliases: z.array(z.string()),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    dateSourceUrl: z.string().url(),
    dateVerifiedAt: z.string().datetime(),
    region: z.string(),
    calendarConvention: z.string(),
    languages: z.array(z.enum(['en', 'hi', 'hinglish'])),
    defaultIndexableCollections: z.array(z.string()),
    minimums: z.object({
      approvedWishes: z.number(),
      approvedCards: z.number(),
      uniqueIndexableCollections: z.number(),
    }),
    publishLeadTimeDays: z.number().default(42),
    humanReviewRequired: z.boolean().default(true),
  }),
});

export const collections = { wish, festival };
