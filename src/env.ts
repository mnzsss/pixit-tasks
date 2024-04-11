import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.number().optional().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string(),
  PASSWORD_ENCRYPTION_KEY: z.string(),
})

export const env = envSchema.parse(process.env)
