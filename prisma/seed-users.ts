import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Find or create the team
  let team = await prisma.team.findFirst()
  if (!team) {
    team = await prisma.team.create({
      data: {
        name: 'Riverside Warriors',
        philosophy: 'Spread / RPO-heavy',
        primaryColor: '#16a34a',
      },
    })
    console.log('Created team:', team.name)
  }

  // Demo users with different roles
  const users = [
    { name: 'Coach Jefferson', email: 'coach@rjbusinesssolutions.org', password: 'gridiron2024', role: 'head_coach' },
    { name: 'OC Martinez', email: 'oc@rjbusinesssolutions.org', password: 'gridiron2024', role: 'coach' },
    { name: 'Analyst Reed', email: 'analyst@rjbusinesssolutions.org', password: 'gridiron2024', role: 'analyst' },
    { name: 'QB Marcus Bell', email: 'player@rjbusinesssolutions.org', password: 'gridiron2024', role: 'player' },
  ]

  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } })
    if (existing) {
      console.log(`User already exists: ${u.email} (${u.role})`)
      continue
    }
    const passwordHash = await bcrypt.hash(u.password, 10)
    const user = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        teamId: team.id,
      },
    })
    console.log(`Created user: ${user.name} (${user.email}) — role: ${user.role}`)
  }

  console.log('\n--- Demo Login Credentials ---')
  console.log('Head Coach:  coach@rjbusinesssolutions.org / gridiron2024')
  console.log('Coordinator:  oc@rjbusinesssolutions.org / gridiron2024')
  console.log('Analyst:     analyst@rjbusinesssolutions.org / gridiron2024')
  console.log('Player:       player@rjbusinesssolutions.org / gridiron2024')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
