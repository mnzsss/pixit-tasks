import 'dotenv/config'

import * as crypto from 'crypto'
import * as bcrypt from 'bcryptjs'
import { env } from '../env'

// https://hub.packtpub.com/encrypt-and-hash-passwords/
// https://dropbox.tech/security/how-dropbox-securely-stores-your-passwords
const BCRYPT_SALT_ROUNDS = 10
const IV_LEN = 16
const ALGORITHM = 'AES-256-CTR'
const KEY = env.PASSWORD_ENCRYPTION_KEY

function sha512(input: string): string {
  const hasher = crypto.createHash('SHA512')
  hasher.update(input)
  return hasher.digest('base64')
}

function encrypt(input: string): string {
  const IV = Buffer.from(crypto.randomBytes(IV_LEN))

  const cipher = crypto.createCipheriv(ALGORITHM, KEY, IV)
  cipher.setEncoding('base64')
  cipher.write(input)
  cipher.end()

  const cipherText = cipher.read()

  // IV is not a secret. We can store it along the password
  return cipherText + '$' + IV.toString('base64')
}

export async function hashAndEncryptPassword(input: string): Promise<string> {
  const sha512hash = sha512(input)

  return new Promise((resolve, reject) => {
    bcrypt.hash(sha512hash, BCRYPT_SALT_ROUNDS, function (err, result) {
      let encryptedHash
      if (err) {
        return reject(err)
      }

      try {
        encryptedHash = encrypt(result)
      } catch (err) {
        return reject(err)
      }

      resolve(encryptedHash)
    })
  })
}

function decrypt(input?: string | null) {
  let result

  if (input == null) {
    return null
  }

  const [cipherText, IV] = input.split('$')
  const buffIV = Buffer.from(IV, 'base64')
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, buffIV)
  result = decipher.update(cipherText, 'base64', 'utf8')
  result += decipher.final('utf8')
  return result
}

export async function comparePassword(
  clearPassword: string,
  encryptedPassword?: string,
): Promise<boolean> {
  if (typeof encryptedPassword !== 'string') {
    return false
  }

  const hash = decrypt(encryptedPassword)

  return new Promise((resolve, reject) => {
    if (hash == null) {
      return resolve(false)
    }

    bcrypt.compare(sha512(clearPassword), hash, (err, value) => {
      if (err) {
        reject(err)
      }

      resolve(value)
    })
  })
}
