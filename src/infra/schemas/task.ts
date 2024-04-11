import { z } from 'zod'

const getTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
})

const createTaskSchema = z.object({
  title: z.string().min(3),
})

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  completed: z.boolean().optional(),
})

const updateTaskResponseSchema = z.object({
  task: getTaskSchema,
  message: z.string(),
})

const taskParamsSchema = z.object({
  id: z.string(),
})

export type CreateTaskSchema = z.infer<typeof createTaskSchema>
export type UpdateTaskSchema = z.infer<typeof updateTaskSchema>

const getTasksResponseSchema = z.object({
  tasks: z.array(getTaskSchema),
})

export const taskSchema = {
  getTaskSchema,
  getTasksResponseSchema,
  createTaskSchema,
  updateTaskSchema,
  updateTaskResponseSchema,
  taskParamsSchema,
}
