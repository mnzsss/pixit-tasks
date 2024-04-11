import { FastifyPluginCallback } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

import { AuthService } from '../infra/modules/auth/auth.service'
import { TasksService } from '../infra/modules/tasks/tasks.service'
import { authSchema } from '../infra/schemas/auth'
import { schemas } from '../infra/schemas'
import { taskSchema } from '../infra/schemas/task'

export const routes: FastifyPluginCallback = (api, _, done) => {
  const zodApi = api.withTypeProvider<ZodTypeProvider>()

  zodApi.get(
    '/',
    {
      schema: {
        tags: ['Root'],
        summary: 'Root',
        description: 'Root',
        operationId: 'root',
        response: {
          200: schemas.defaultResponseSchema,
        },
      },
    },
    async (_, reply) => {
      return reply.send({
        message: 'Pixit Tasks API',
      })
    },
  )

  zodApi.post(
    '/register',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Register',
        description: 'Register',
        operationId: 'authRegister',
        body: authSchema.registerSchema,
        response: {
          201: schemas.defaultResponseSchema,
          401: schemas.defaultResponseSchema,
          500: schemas.defaultResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const authService = new AuthService()

        await authService.register(request.body)

        return reply.status(201).send({
          message: 'User created successfully',
        })
      } catch (error) {
        if (error instanceof Error) {
          return reply.status(401).send({ message: error.message })
        }
      }
    },
  )

  zodApi.post(
    '/login',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Login',
        description: 'Login',
        operationId: 'authLogin',
        body: authSchema.loginSchema,
        reply: authSchema.loginResponseSchema,
        response: {
          200: authSchema.loginResponseSchema,
          401: schemas.defaultResponseSchema,
          500: schemas.defaultResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const authService = new AuthService()

        const user = await authService.login(request.body)

        const token = await reply.jwtSign({
          id: user.id,
        })

        return reply.status(200).send({
          token,
        })
      } catch (error) {
        if (error instanceof Error) {
          return reply.status(401).send({ message: error.message })
        }
      }
    },
  )

  zodApi.get(
    '/tasks',
    {
      schema: {
        operationId: 'getTasks',
        tags: ['Tasks'],
        summary: 'Get tasks',
        description: 'Get tasks',
        response: {
          200: taskSchema.getTasksResponseSchema,
        },
        security: [{ Authorization: ['Bearer'] }],
      },
      onRequest: [zodApi.authenticate],
    },
    async (request, reply) => {
      const taskService = new TasksService(request.user.id)

      return reply.send({
        tasks: await taskService.getTasks(),
      })
    },
  )

  zodApi.get(
    '/tasks/:id',
    {
      schema: {
        operationId: 'getTask',
        tags: ['Tasks'],
        summary: 'Get task',
        description: 'Get task',
        params: taskSchema.taskParamsSchema,
        response: {
          200: taskSchema.getTaskSchema,
          400: schemas.defaultResponseSchema,
        },
        security: [{ Authorization: ['Bearer'] }],
      },
    },
    async (request, reply) => {
      await zodApi.authenticate(request, reply)

      const taskService = new TasksService(request.user.id)

      const task = await taskService.getTask(request.params.id)

      if (!task) {
        return reply.status(400).send({ message: 'Task not found' })
      }

      return reply.send(task)
    },
  )

  zodApi.post(
    '/tasks',
    {
      schema: {
        operationId: 'createTask',
        tags: ['Tasks'],
        summary: 'Create task',
        description: 'Create task',
        body: taskSchema.createTaskSchema,
        response: {
          201: schemas.updateTaskResponseSchema,
          400: schemas.defaultResponseSchema,
        },
        security: [{ Authorization: ['Bearer'] }],
      },
    },
    async (request, reply) => {
      try {
        await zodApi.authenticate(request, reply)

        const taskService = new TasksService(request.user.id)

        const task = await taskService.createTask(request.body)

        return reply.status(201).send({
          task,
          message: 'Task created successfully',
        })
      } catch (error) {
        if (error instanceof Error) {
          return reply.status(401).send({ message: error.message })
        }
      }
    },
  )

  zodApi.put(
    '/tasks/:id',
    {
      schema: {
        operationId: 'updateTask',
        tags: ['Tasks'],
        summary: 'Update task',
        description: 'Update task',
        body: taskSchema.updateTaskSchema,
        params: taskSchema.taskParamsSchema,
        response: {
          200: taskSchema.updateTaskResponseSchema,
          400: schemas.defaultResponseSchema,
        },
        security: [{ Authorization: ['Bearer'] }],
      },
    },
    async (request, reply) => {
      await zodApi.authenticate(request, reply)

      const taskService = new TasksService(request.user.id)

      try {
        const task = await taskService.updateTask(
          request.params.id,
          request.body,
        )

        return reply.send({
          message: 'Task updated successfully',
          task,
        })
      } catch (error) {
        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message })
        }
      }
    },
  )

  zodApi.delete(
    '/tasks/:id',
    {
      schema: {
        operationId: 'deleteTask',
        tags: ['Tasks'],
        summary: 'Delete task',
        description: 'Delete task',
        params: taskSchema.taskParamsSchema,
        response: {
          204: schemas.defaultResponseSchema,
          400: schemas.defaultResponseSchema,
        },
        security: [{ Authorization: ['Bearer'] }],
      },
    },
    async (request, reply) => {
      try {
        await api.authenticate(request, reply)

        const taskService = new TasksService(request.user.id)

        await taskService.deleteTask(request.params.id)

        return reply.status(204).send({
          message: 'Task deleted successfully',
        })
      } catch (error) {
        if (error instanceof Error) {
          return reply.status(400).send({ message: error.message })
        }
      }
    },
  )

  done()
}
