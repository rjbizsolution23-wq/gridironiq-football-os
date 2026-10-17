import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const dbPath = '/Users/kalivibecoding/Downloads/football/db/custom.db'
const localSqliteUrl = `file:${dbPath}`
process.env.DATABASE_URL = localSqliteUrl

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: localSqliteUrl,
      },
    },
    log: ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db