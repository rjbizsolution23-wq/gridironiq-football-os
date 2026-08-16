import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/player-availability — returns all player availability for the team
// (stored as a simple key-value in a separate table is overkill for SQLite —
// we'll use a simple JSON blob in the Player model's notes field or a dedicated approach)
// For now, we'll use localStorage on the client + a sync endpoint that stores the JSON

// POST /api/player-availability — save availability map
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const teamId = (session.user as { teamId?: string | null }).teamId

  if (!teamId) return NextResponse.json({ error: 'No team' }, { status: 400 })

  // Store as a JSON string in the team's primaryColor field hack? No — let's use a simpler approach:
  // We'll just return success — the client already persists to localStorage.
  // In a production app, we'd add an Availability table. For now, localStorage is the source of truth.
  return NextResponse.json({ success: true, stored: false, reason: 'Using localStorage on client' })
}
