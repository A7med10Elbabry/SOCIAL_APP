import { resolve } from 'node:path'
import { config } from 'dotenv'

export const NODE_ENV = process.env.NODE_ENV


console.log({ en: NODE_ENV});


config({ path: resolve(`./.env.${NODE_ENV}`) })


export const PORT = process.env.PORT

export const DB_URI = process.env.DB_URI as string
export const SYSTEM_TOKEN_SECERET_KEY = process.env.SYSTEM_TOKEN_SECERET_KEY as string
export const SYSTEM_REFRESH_TOKEN_SECERET_KEY = process.env.SYSTEM_REFRESH_TOKEN_SECERET_KEY as string
export const USER_TOKEN_SECERET_KEY = process.env.USER_TOKEN_SECERET_KEY as string
export const USER_REFRESH_TOKEN_SECERET_KEY = process.env.USER_REFRESH_TOKEN_SECERET_KEY as string


export const ACCESS_EXPIRES_IN = parseInt(process.env.ACCESS_EXPIRES_IN as string) 
export const REFRESH_EXPIRSES_IN = parseInt(process.env.REFRESH_EXPIRSES_IN as string) 
export const REDIS_URI = process.env.REDIS_URI as string
export const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD as string
export const EMAIL_APP = process.env.EMAIL_APP as string
export const APPLICATION_NAME = process.env.APPLICATION_NAME as string
export const SALT_ROUND = parseInt(process.env.SALT_ROUND ?? '10')

export const facebookLink = process.env.facebookLink as string
export const twitterLink = process.env.twitterLink as string
export const instegram = process.env.instegram as string
console.log({SALT_ROUND});
