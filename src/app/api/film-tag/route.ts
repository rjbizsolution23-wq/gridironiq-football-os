import { NextRequest } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { getAllPlays, getOpponents } from '@/lib/data'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const SYSTEM_PROMPT = `You are FilmIQ™ — the film tagging engine inside GridironIQ™, a Football Intelligence Operating System used by football coaches.

Your job: take a coach's natural-language description of a film clip and produce a structured tag JSON that captures the football-relevant metadata.

You output STRICT JSON only — no markdown, no prose, no commentary. The JSON shape is:
{
  "personnel": "11" | "10" | "12" | "21" | "22" | "23" | null,
  "formation": "Gun Trips" | "Gun Doubles" | "Empty" | "I-Pro" | "Ace" | "Pistol" | "Bunch" | "Wing-T" | null,
  "formationStrength": "field" | "boundary" | "right" | "left" | null,
  "motion": "jet" | "orbit" | "shift" | "rocket" | "none" | null,
  "concept": "inside_zone" | "outside_zone" | "split_zone" | "duo" | "power" | "counter" | "gt_counter" | "jet_sweep" | "mesh" | "stick" | "flood" | "four_verticals" | "y_cross" | "smash" | "spacing" | "snag" | "levels" | "sail" | "dagger" | "mills" | "post_wheel" | "tunnel_screen" | "bubble_screen" | "rb_screen" | "iz_glance_rpo" | "bubble_rpo" | "pa_flood" | "pa_boot" | "qb_draw" | "qb_counter" | "zone_read" | "power_read" | null,
  "playType": "run" | "pass" | "rpo" | "play_action" | "screen" | "boot" | null,
  "front": "4-2-5" | "4-3" | "3-4" | "3-3-5" | "tite" | "bear" | "nickel" | "dime" | null,
  "coverage": "cover_0" | "cover_1" | "cover_1_robber" | "cover_2" | "tampa_2" | "cover_3" | "cover_3_match" | "quarters" | "palms" | "cover_6" | null,
  "pressure": "none" | "four_man" | "five_man" | "six_man" | "simulated" | "creeper" | "fire_zone" | "overload" | "edge" | "interior" | null,
  "result": "completion" | "incompletion" | "touchdown" | "interception" | "fumble" | "sack" | "tfl" | "explosive" | "first_down" | "short_gain" | "no_gain" | null,
  "yardsGained": number | null,
  "explosive": boolean,
  "turnover": boolean,
  "tags": string[],
  "coachingNote": string
}

Rules:
- If the description doesn't mention a field, return null for it.
- "explosive" = true if yardsGained >= 15 (pass) or >= 12 (run).
- "turnover" = true if result is "interception" or "fumble".
- Tags should include situational labels like "3rd_&_medium", "red_zone", "two_minute", "backed_up" when applicable.
- coachingNote = 1 short sentence summarizing the key coaching takeaway from the clip.
- Do NOT invent data. Only tag what the description actually says.`

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      description: string
      title?: string
      opponentId?: string
    }

    if (!body.description || typeof body.description !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing "description" in body.' }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      )
    }

    const [plays, opponents] = await Promise.all([getAllPlays(), getOpponents()])
    const playCatalog = plays
      .slice(0, 25)
      .map((p) => `${p.playId}|${p.name}|${p.concept}`)
      .join('\n')
    const opponentNames = opponents.map((o) => o.name).join(', ')

    const prompt = `Tag the following film clip description. Return STRICT JSON only.

INSTALLED PLAY CATALOG (for concept matching):
${playCatalog}

OPPONENTS: ${opponentNames}

CLIP DESCRIPTION:
${body.description}

Return JSON now.`

    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
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
      return new Response(
        JSON.stringify({
          error: 'FilmIQ returned unparseable JSON.',
          raw: cleaned.slice(0, 1500),
        }),
        { status: 502, headers: { 'content-type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        tags: parsed,
        title: body.title ?? body.description.slice(0, 60),
        opponentId: body.opponentId ?? null,
        generatedAt: new Date().toISOString(),
      }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[film-tag] error:', msg)
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    )
  }
}
