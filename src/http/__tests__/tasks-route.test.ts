import { beforeAll, expect, test, suite, vi, beforeEach } from 'vitest'
import { hashAndEncryptPassword } from '../../lib/password'
import { User } from '@prisma/client'
import { prisma } from '../../lib/__mocks__/prisma'
import { client } from '../../lib/supertest'

vi.mock('../../lib/prisma')

const newUserData = {
  email: 'jhon@example.com',
  name: 'Jhon Doe',
  password: '123456',
}

let user: User
let token: string

const newTaskData = {
  createdAt: new Date(),
  title: 'New Task',
  completed: false,
}

suite('Tasks Route', () => {
  beforeEach(() => {
    prisma.user.findUnique.mockResolvedValue(user)
    prisma.task.create.mockResolvedValue({
      ...newTaskData,
      id: '123',
      userId: user.id,
    })
    prisma.task.findFirst.mockResolvedValue({
      ...newTaskData,
      id: '123',
      userId: user.id,
    })
  })

  beforeAll(async () => {
    user = {
      id: 'cisjdjsd',
      createdAt: new Date(),
      ...newUserData,
      password: await hashAndEncryptPassword(newUserData.password),
    }

    prisma.user.findUnique.mockResolvedValue(user)

    const response = await client.post('/api/login').send(newUserData)

    token = response.body.token
  })

  test('GET /tasks - It should be able to list tasks of user', async () => {
    prisma.task.findMany.mockResolvedValue([])

    const response = await client
      .get('/api/tasks')
      .auth(token, { type: 'bearer' })

    expect(response.status).toBe(200)
    expect(response.body.tasks).toEqual([])
  })

  test('GET /tasks/:id - It should be able to get a task', async () => {
    prisma.task.findFirst.mockResolvedValue({
      ...newTaskData,
      id: '123',
      userId: user.id,
    })

    const response = await client
      .get('/api/tasks/123')
      .auth(token, { type: 'bearer' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      id: '123',
      completed: false,
      title: 'New Task',
    })
  })

  test('GET /tasks/:id - It should return 400 when task is not found', async () => {
    prisma.task.findFirst.mockResolvedValue(null)

    const response = await client
      .get('/api/tasks/123')
      .auth(token, { type: 'bearer' })

    expect(response.status).toBe(400)
  })

  test('POST /tasks - It should be able to create a task', async () => {
    prisma.task.create.mockResolvedValue({
      ...newTaskData,
      userId: user.id,
      id: '123',
    })

    const response = await client
      .post('/api/tasks')
      .send(newTaskData)
      .auth(token, { type: 'bearer' })

    expect(response.status).toBe(201)
    expect(response.body.task).toEqual({
      id: '123',
      completed: false,
      title: 'New Task',
    })
  })

  test('POST /tasks - It should return 401 when token is invalid', async () => {
    const response = await client
      .post('/api/tasks')
      .send(newTaskData)
      .auth('invalid-token', { type: 'bearer' })

    expect(response.status).toBe(401)
    expect(response.body.message).toBe(
      'Authorization token is invalid: The token is malformed.',
    )
  })

  test('POST /tasks - It should return 401 when token is missing', async () => {
    const response = await client.post('/api/tasks').send(newTaskData)

    expect(response.status).toBe(401)
    expect(response.body.message).toBe(
      'No Authorization was found in request.headers',
    )
  })

  test('POST /tasks - It should return 400 when title is missing', async () => {
    const response = await client
      .post('/api/tasks')
      .send({ ...newTaskData, title: '' })
      .auth(token, { type: 'bearer' })

    expect(response.status).toBe(400)
  })

  test('PUT /tasks/:id - It should be able to update a task', async () => {
    prisma.task.update.mockResolvedValue({
      ...newTaskData,
      id: '123',
      userId: user.id,
    })

    const response = await client
      .put('/api/tasks/123')
      .send(newTaskData)
      .auth(token, { type: 'bearer' })

    expect(response.status).toBe(200)
    expect(response.body.task).toEqual({
      id: '123',
      completed: false,
      title: 'New Task',
    })
  })

  test('PUT /tasks/:id - It should return 400 when title is missing', async () => {
    const response = await client
      .put('/api/tasks/123')
      .send({ ...newTaskData, title: '' })
      .auth(token, { type: 'bearer' })

    expect(response.status).toBe(400)
  })

  test('PUT /tasks/:id - It should return 400 when task is not found', async () => {
    prisma.task.findFirst.mockResolvedValue(null)

    const response = await client
      .put('/api/tasks/123')
      .send(newTaskData)
      .auth(token, { type: 'bearer' })

    expect(response.status).toBe(400)
  })

  test('DELETE /tasks/:id - It should be able to delete a task', async () => {
    prisma.task.delete.mockResolvedValue({
      ...newTaskData,
      id: '123',
      userId: user.id,
    })

    const response = await client
      .delete('/api/tasks/123')
      .auth(token, { type: 'bearer' })

    expect(response.status).toBe(204)
  })

  test('DELETE /tasks/:id - It should return 400 when task is not found', async () => {
    prisma.task.findFirst.mockResolvedValue(null)

    const response = await client
      .delete('/api/tasks/123')
      .auth(token, { type: 'bearer' })

    expect(response.status).toBe(400)
  })
})
