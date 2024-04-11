import { comparePassword, hashAndEncryptPassword } from '../../../lib/password'
import { prisma } from '../../../lib/prisma'
import { LoginSchema, RegisterSchema } from '../../schemas/auth'

export class AuthService {
  public async register(data: RegisterSchema) {
    const { email, password, name } = data

    const userExists = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (userExists) {
      throw new Error('Email is already in use')
    }

    const hashPassword = await hashAndEncryptPassword(password)

    await prisma.user.create({
      data: {
        email,
        name,
        password: hashPassword,
      },
    })
  }

  public async login(data: LoginSchema) {
    const { email, password } = data

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (!user) {
      throw new Error('Email or password is incorrect')
    }

    const validPassword = await comparePassword(password, user.password)

    if (!validPassword) {
      throw new Error('Email or password is incorrect')
    }

    return user
  }
}
