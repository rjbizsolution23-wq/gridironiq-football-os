import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ZAI from 'z-ai-web-dev-sdk'
import { getAllPlays, getOpponents } from '@/lib/data'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const SYSTEM_PROMPT = `You are FilmIQ™ — the AI film analysis engine inside GridironIQ™, a Football Intelligence Operating System used by football coaches.

Your job: analyze a single video frame from a football film clip and produce a structured tag JSON describing what you see.

You output STRICT JSON only — no markdown, no prose, no commentary. The JSON shape is:
{
  "personnel": "11" | "10" | "12" | "21" | "22" | "23" | null,
  "formation": "Gun Trips" | "Gun Doubles" | "Empty" | "I-Pro" | "Ace" | "Pistol" | "Bunch" | "Wing-T" | null,
  "formationStrength": "field" | "boundary" | "right" | "left" | null,
  "down": 1 | 2 | 3 | 4 | null,
  "distance": number | null,
  "fieldPosition": "own_goal" | "backed_up" | "own_territory" | "midfield" | "opponent_territory" | "red_zone" | "goal_line" | null,
  "offensiveConcept": "inside_zone" | "outside_zone" | "split_zone" | "power" | "counter" | "jet_sweep" | "mesh" | "stick" | "flood" | "four_verticals" | "y_cross" | "smash" | "screen" | "rpo" | "play_action" | "boot" | "qb_run" | null,
  "defensiveFront": "4-2-5" | "4-3" | "3-4" | "3-3-5" | "nickel" | "dime" | null,
  "coverage": "cover_0" | "cover_1" | "cover_2" | "cover_3" | "quarters" | "palms" | "cover_6" | null,
  "pressure": "none" | "four_man" | "five_man" | "blitz" | "simulated" | null,
  "preSnapRead": string (what the QB should read pre-snap based on alignment),
  "postSnapAction": string (what actually happens in the frame — motion, ball carrier, route progression),
  "coachingNote": string (1 short coaching takeaway from this frame)
}

Rules:
- If you can't see or determine a field, return null for it.
- Be conservative — only tag what you can clearly see in the frame.
- Use real football terminology (not vague descriptions).
- coachingNote = 1 short sentence with actionable coaching insight.`

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { imageUrl, base64Image, description } = body as {
      imageUrl?: string
      base64Image?: string
      description?: string
    }

    if (!imageUrl && !base64Image && !description) {
      return NextResponse.json(
        { error: 'Provide imageUrl, base64Image, or description' },
        { status: 400 }
      )
    }

    // Get context for grounded tagging
    const [plays, opponents] = await Promise.all([getAllPlays(), getOpponents()])
    const playCatalog = plays
      .slice(0, 15)
      .map((p) => `${p.playId}|${p.name}|${p.concept}`)
      .join('\n')

    const zai = await ZAI.create()

    // Use VLM to analyze the image if provided
    const messages: Array<{ role: 'assistant' | 'user'; content: unknown }> = [
      { role: 'assistant', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this football film frame. Return STRICT JSON only.\n\nINSTALLED PLAY CATALOG:\n${playCatalog}\n\n${description ? `Coach description: ${description}` : ''}`,
          },
          ...(imageUrl
            ? [{ type: 'image_url', image_url: { url: imageUrl } }]
            : base64Image
            ? [{ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }]
            : []),
        ],
      },
    ]

    const completion = await zai.chat.completions.create({
      messages: messages as Array<{ role: 'assistant' | 'user'; content: string }>,
      thinking: { type: 'disabled' },
    })

    const raw = completion.choices[0]?.message?.content ?? ''
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim()

    let parsed: unknown
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      return NextResponse.json(
        { error: 'VLM returned unparseable JSON.', raw: cleaned.slice(0, 1500) },
        { status: 502 }
      )
    }

    return NextResponse.json({
      tags: parsed,
      analyzedAt: new Date().toISOString(),
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[analyze-frame] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
