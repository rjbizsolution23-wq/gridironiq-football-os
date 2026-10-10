import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  // Set consentGiven=true for all existing players so they can log in
  await prisma.user.updateMany({
    where: { role: 'player' },
    data: { consentGiven: true },
  })
  console.log('Updated player accounts with consentGiven=true')
}
main().catch(console.error).finally(() => prisma.$disconnect())
