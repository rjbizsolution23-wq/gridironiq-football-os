import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/film-clips — list all clips for the team
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const teamId = (session.user as { teamId?: string | null }).teamId
  const clips = await db.filmClip.findMany({
    where: teamId ? { teamId } : {},
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({
    clips: clips.map((c) => ({
      ...c,
      tags: c.tags ? JSON.parse(c.tags) : {},
    })),
  })
}

// POST /api/film-clips — create a new clip
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const teamId = (session.user as { teamId?: string | null }).teamId

  const clip = await db.filmClip.create({
    data: {
      teamId: teamId ?? null,
      title: body.title || body.description?.slice(0, 60) || 'Untitled clip',
      description: body.description || '',
      opponentId: body.opponentId || null,
      tags: JSON.stringify(body.tags ?? {}),
      videoUrl: body.videoUrl || null,
    },
  })
  return NextResponse.json({ clip: { ...clip, tags: JSON.parse(clip.tags) } })
}

// DELETE /api/film-clips?id=xxx — delete a clip
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await db.filmClip.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
