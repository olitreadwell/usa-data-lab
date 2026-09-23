import { z } from 'zod';

/**
 * Boundary validation for environment variables (12-factor III).
 *
 * Validates `process.env` once at module load. Server vars live on `env`,
 * client-exposed vars (must start with `NEXT_PUBLIC_`) live on `clientEnv`.
 *
 * Keep this file small. If it grows past ~30 lines, the project probably
 * has too many env vars — group them in feature-specific config modules.
 *
 * The BLS series this site reads is keyless. A source that needs a key goes
 * on `serverSchema` and stays server-side.
 */

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url().optional(),
});

const clientSchema = z.object({
  // Used by the deploy for canonical URLs and OG tags. Defaulted so local and
  // CI builds without the var still pass; the deploy sets the real URL.
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
});

export const env = serverSchema.parse(process.env);

export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});
