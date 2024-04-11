import { expect, test, suite } from 'vitest'
import { client } from '../lib/supertest'

suite('API Server', () => {
  test('with a running server', async () => {
    const response = await client.get('/api').expect(200)

    expect(response.body).toStrictEqual({
      message: 'Pixit Tasks API',
    })
  })

  test('it should be able to rete limit', async () => {
    await Promise.all(
      Array.from({ length: 99 }).map(() => client.get('/api').expect(200)),
    )

    const lastResponse = await client.get('/api').expect(429)

    expect(lastResponse.status).toStrictEqual(429)
  })
})
