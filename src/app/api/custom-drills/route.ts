import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/custom-drills
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const teamId = (session.user as { teamId?: string | null }).teamId
  const drills = await db.customDrill.findMany({
    where: teamId ? { teamId } : {},
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({
    drills: drills.map((d) => ({
      ...d,
      equipment: d.equipment ? JSON.parse(d.equipment) : [],
      coachingPoints: d.coachingPoints ? JSON.parse(d.coachingPoints) : [],
      progression: d.progression ? JSON.parse(d.progression) : [],
      tags: d.tags ? JSON.parse(d.tags) : [],
    })),
  })
}

// POST /api/custom-drills
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const teamId = (session.user as { teamId?: string | null }).teamId

  const drill = await db.customDrill.create({
    data: {
      teamId: teamId ?? null,
      name: body.name,
      category: body.category || 'individual',
      duration: body.duration || 10,
      intensity: body.intensity || 'medium',
      group: body.group || 'offense',
      equipment: JSON.stringify(body.equipment ?? []),
      coachingPoints: JSON.stringify(body.coachingPoints ?? []),
      progression: JSON.stringify(body.progression ?? []),
      tags: JSON.stringify(body.tags ?? []),
    },
  })
  return NextResponse.json({ drill })
}

// DELETE /api/custom-drills?id=xxx
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await db.customDrill.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
