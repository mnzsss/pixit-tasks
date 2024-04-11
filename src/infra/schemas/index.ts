import { z } from 'zod'
import { authSchema } from './auth'
import { taskSchema } from './task'

const defaultResponseSchema = z.object({
  message: z.string(),
})

export const schemas = {
  defaultResponseSchema,
  ...authSchema,
  ...taskSchema,
}
