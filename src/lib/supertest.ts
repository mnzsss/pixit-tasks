import { afterAll, beforeAll, beforeEach } from 'vitest'
import { app } from '../http/server'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'

let api: Awaited<typeof app>
export let client: TestAgent

beforeEach(async () => {
  await api.ready()
})

beforeAll(async () => {
  api = await app

  client = supertest(api.server)
})

afterAll(async () => {
  await api.close()
})
