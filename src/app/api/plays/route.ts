import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// POST /api/plays — save a new play or update an existing one
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const teamId = (session.user as { teamId?: string | null }).teamId

  // Only head_coach, coach, and analyst can edit plays
  const role = (session.user as { role?: string }).role
  if (role === 'player') {
    return NextResponse.json({ error: 'Players cannot edit plays' }, { status: 403 })
  }

  if (body.id) {
    // Update existing play
    const updated = await db.play.update({
      where: { id: body.id },
      data: {
        name: body.name,
        coachingPoints: body.coachingPoints,
        assignments: body.assignments ? JSON.stringify(body.assignments) : undefined,
        routes: body.routes ? JSON.stringify(body.routes) : undefined,
        diagram: body.diagram ? JSON.stringify(body.diagram) : undefined,
      },
    })
    return NextResponse.json({ play: updated })
  }

  // Create new play
  const play = await db.play.create({
    data: {
      teamId: teamId ?? null,
      playId: body.playId || `OFF-CUSTOM-${Date.now()}`,
      name: body.name || 'New Play',
      side: body.side || 'offense',
      personnel: body.personnel || null,
      motion: body.motion || null,
      concept: body.concept || 'custom',
      coachingPoints: body.coachingPoints || null,
      assignments: body.assignments ? JSON.stringify(body.assignments) : null,
      routes: body.routes ? JSON.stringify(body.routes) : null,
      diagram: body.diagram ? JSON.stringify(body.diagram) : null,
      constraints: body.constraints ? JSON.stringify(body.constraints) : '[]',
      preferredFronts: body.preferredFronts ? JSON.stringify(body.preferredFronts) : '[]',
      coverageTargets: body.coverageTargets ? JSON.stringify(body.coverageTargets) : '[]',
      fieldZones: body.fieldZones ? JSON.stringify(body.fieldZones) : '[]',
      complementary: body.complementary ? JSON.stringify(body.complementary) : '[]',
    },
  })
  return NextResponse.json({ play })
}

// DELETE /api/plays?id=xxx
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as { role?: string }).role
  if (role === 'player' || role === 'analyst') {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await db.play.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
