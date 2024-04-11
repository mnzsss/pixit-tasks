import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export type LoginSchema = z.infer<typeof loginSchema>

const loginResponseSchema = z.object({
  token: z.string(),
})

const registerSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
})

export type RegisterSchema = z.infer<typeof registerSchema>

export const authSchema = {
  loginSchema,
  registerSchema,
  loginResponseSchema,
}
