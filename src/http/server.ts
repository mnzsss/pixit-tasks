import 'dotenv/config'

import fastify from 'fastify'

import fJwt, { FastifyJWT } from '@fastify/jwt'
import fSwagger from '@fastify/swagger'
import fSwaggerUI from '@fastify/swagger-ui'

import { env } from '../env'
import { routes } from './router'
import { prisma } from '../lib/prisma'

import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

async function main() {
  const f = fastify({
    logger: env.NODE_ENV === 'development',
  })

  f.setValidatorCompiler(validatorCompiler)
  f.setSerializerCompiler(serializerCompiler)

  f.register(fSwagger, {
    swagger: {
      info: {
        title: 'My API',
        description: 'API documentation',
        version: '0.1.0',
      },
      securityDefinitions: {
        Authorization: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
          description: 'Bearer token for authentication',
        },
      },
      basePath: '/api',
    },
    transform: jsonSchemaTransform,
  })

  f.register(fSwaggerUI, {
    routePrefix: '/docs',
  })

  await f.register(import('@fastify/rate-limit'), {
    max: 100,
    timeWindow: '1 minute',
  })

  f.register(fJwt, {
    secret: env.JWT_SECRET,
    sign: {
      algorithm: 'HS256',
      expiresIn: '1h',
    },
  })

  f.decorate('authenticate', async (request, reply) => {
    try {
      const payload = await request.jwtDecode<FastifyJWT['payload']>()

      if (!payload) {
        throw new Error('Invalid token')
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.id },
      })

      if (!user) {
        throw new Error('Invalid token')
      }

      request.user = user
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(401).send({ message: error.message })
      }
    }
  })

  f.register(routes, {
    prefix: '/api',
  })

  await f.ready()

  f.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
    if (err) {
      console.error(err)

      if (env.NODE_ENV !== 'test') {
        process.exit(1)
      }
    }

    console.log(`Server listening at ${address}/api`)
    console.log(`Docs available at ${address}/docs`)
  })

  return f
}

export const app = main()
