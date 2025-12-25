import { z } from 'zod';

export const devPersonaStatsSchema = z.object({
  conversationCount: z.number().int().nonnegative(),
  messageCount: z.number().int().nonnegative(),
  projectCount: z.number().int().nonnegative(),
});

export const devPersonaSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  stats: devPersonaStatsSchema,
  credits: z.string(),
});

export const devPersonasResponseSchema = z.object({
  personas: z.array(devPersonaSchema),
});

export type DevPersonaStats = z.infer<typeof devPersonaStatsSchema>;
export type DevPersona = z.infer<typeof devPersonaSchema>;
export type DevPersonasResponse = z.infer<typeof devPersonasResponseSchema>;
