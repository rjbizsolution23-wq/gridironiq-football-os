import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/weekly-tasks — list all tasks for the team
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const teamId = (session.user as { teamId?: string | null }).teamId
  const tasks = await db.weeklyTask.findMany({
    where: teamId ? { teamId } : {},
    orderBy: [{ day: 'asc' }, { sortOrder: 'asc' }],
  })
  return NextResponse.json({ tasks })
}

// POST /api/weekly-tasks — create or update a task
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const teamId = (session.user as { teamId?: string | null }).teamId

  // If id is provided, update; otherwise create
  if (body.id) {
    const updated = await db.weeklyTask.update({
      where: { id: body.id },
      data: {
        label: body.label,
        done: body.done,
        day: body.day,
        sortOrder: body.sortOrder,
      },
    })
    return NextResponse.json({ task: updated })
  }

  const task = await db.weeklyTask.create({
    data: {
      teamId: teamId ?? null,
      day: body.day || 'Sunday',
      label: body.label || 'New task',
      done: body.done ?? false,
      sortOrder: body.sortOrder ?? 0,
      isCustom: true,
    },
  })
  return NextResponse.json({ task })
}

// DELETE /api/weekly-tasks?id=xxx
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await db.weeklyTask.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
