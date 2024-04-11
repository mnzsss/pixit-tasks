import { prisma } from '../../../lib/prisma'
import { CreateTaskSchema, UpdateTaskSchema } from '../../schemas/task'

export class TasksService {
  constructor(protected userId: string) {}

  public async getTask(id: string) {
    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: this.userId,
      },
    })

    return task
  }

  public async getTasks() {
    const tasks = await prisma.task.findMany({
      where: {
        userId: this.userId,
      },
    })

    return tasks
  }

  public async createTask(data: CreateTaskSchema) {
    const task = await prisma.task.create({
      data: {
        ...data,
        userId: this.userId,
      },
    })

    return task
  }

  public async updateTask(id: string, data: UpdateTaskSchema) {
    const task = await this.getTask(id)

    if (!task) {
      throw new Error('Task not found')
    }

    const updatedTask = await prisma.task.update({
      where: {
        id,
      },
      data,
    })

    return updatedTask
  }

  public async deleteTask(id: string) {
    const task = await this.getTask(id)

    if (!task) {
      throw new Error('Task not found')
    }

    await prisma.task.delete({
      where: {
        id,
      },
    })
  }
}
