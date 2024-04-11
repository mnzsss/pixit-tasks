import { beforeAll, expect, test, suite, vi } from 'vitest'
import { prisma } from '../../lib/__mocks__/prisma'
import { hashAndEncryptPassword } from '../../lib/password'
import { User } from '@prisma/client'
import { client } from '../../lib/supertest'

vi.mock('../../lib/prisma')

const newUserData = {
  email: 'jhon@example.com',
  name: 'Jhon Doe',
  password: '123456',
}

let user: User

suite('Auth Routes', () => {
  beforeAll(async () => {
    user = {
      id: 'cisjdjsd',
      createdAt: new Date(),
      ...newUserData,
      password: await hashAndEncryptPassword(newUserData.password),
    }
  })

  test('POST /register - It should be able to register a new user', async () => {
    const response = await client.post('/api/register').send(newUserData)

    expect(response.status).toBe(201)
    expect(response.body).toStrictEqual({
      message: 'User created successfully',
    })
  })

  test('POST /register - It should return 401 when the email is already in use', async () => {
    prisma.user.findUnique.mockResolvedValue(user)

    const response = await client.post('/api/register').send(newUserData)

    expect(response.status).toBe(401)
    expect(response.body).toStrictEqual({
      message: 'Email is already in use',
    })
  })

  test('POST /register - It should return 400 when the email is invalid', async () => {
    const response = await client.post('/api/register').send({
      ...newUserData,
      email: 'invalid-email',
    })

    expect(response.status).toBe(400)
    expect(response.body?.code).toStrictEqual('FST_ERR_VALIDATION')
  })

  test('POST /register - It should return 400 when has required fields', async () => {
    const response = await client.post('/api/register').send({
      ...newUserData,
      email: null,
    })

    expect(response.status).toBe(400)
    expect(response.body?.code).toStrictEqual('FST_ERR_VALIDATION')
  })

  test('POST /login - It should be able to login a user', async () => {
    prisma.user.findUnique.mockResolvedValue(user)

    const response = await client.post('/api/login').send(newUserData)

    expect(response.status).toBe(200)
    expect(response.body).toStrictEqual({
      token: expect.any(String),
    })
  })

  test('POST /login - It should return 401 when the user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null)

    const response = await client.post('/api/login').send(newUserData)

    expect(response.status).toBe(401)
    expect(response.body).toStrictEqual({
      message: 'Email or password is incorrect',
    })
  })

  test('POST /login - It should return 401 when the password is incorrect', async () => {
    prisma.user.findUnique.mockResolvedValue({
      ...user,
      password: await hashAndEncryptPassword('wrong-password'),
    })

    const response = await client.post('/api/login').send(newUserData)

    expect(response.status).toBe(401)
    expect(response.body).toStrictEqual({
      message: 'Email or password is incorrect',
    })
  })

  test('POST /login - It should return 400 when the email is invalid', async () => {
    const response = await client.post('/api/login').send({
      ...newUserData,
      email: 'invalid-email',
    })

    expect(response.status).toBe(400)
    expect(response.body?.code).toStrictEqual('FST_ERR_VALIDATION')
  })

  test('POST /login - It should return 400 when has required fields', async () => {
    const response = await client.post('/api/login').send({
      ...newUserData,
      email: null,
    })

    expect(response.status).toBe(400)
    expect(response.body?.code).toStrictEqual('FST_ERR_VALIDATION')
  })
})
