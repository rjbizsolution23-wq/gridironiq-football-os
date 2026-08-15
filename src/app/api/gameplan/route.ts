import { NextRequest } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { getAllPlays, getOpponents, getConceptPerformance, getTeam } from '@/lib/data'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

interface GamePlanRequest {
  opponentId?: string
  mode: 'opening_script' | 'situation_recommendation'
  situation?: {
    down: number
    distance: number
    hash: 'L' | 'R' | 'M'
    yardLine: number
    quarter: number
    scoreMargin: number
  }
  personnelNotes?: string
  coachingGoal?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as GamePlanRequest
    if (body.mode !== 'opening_script' && body.mode !== 'situation_recommendation') {
      return new Response(
        JSON.stringify({ error: 'Invalid mode. Use opening_script or situation_recommendation.' }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      )
    }

    const [plays, opponents, perf, team] = await Promise.all([
      getAllPlays(),
      getOpponents(),
      getConceptPerformance(),
      getTeam(),
    ])

    const opponent = body.opponentId
      ? opponents.find((o) => o.id === body.opponentId)
      : opponents[0]

    const playCatalog = plays
      .filter((p) => p.side === 'offense')
      .map(
        (p) =>
          `${p.playId} | ${p.name} | concept=${p.concept} | personnel=${p.personnel ?? '-'} | motion=${
            p.motion ?? '-'
          } | targets=[${p.coverageTargets.join('/')}] | zones=[${p.fieldZones.join('/')}]`
      )
      .join('\n')

    const oppTendencies = opponent
      ? opponent.tendencies
          .map(
            (t) =>
              `${t.situation} | ${t.formationKey ?? '-'} | ${t.result}:${t.value} | p=${Math.round(
                t.probability * 100
              )}% | n=${t.sampleSize} | conf=${t.confidence}`
          )
          .join('\n')
      : 'No opponent tendencies available.'

    const ourPerf = perf
      .slice(0, 8)
      .map(
        (c) =>
          `${c.concept}: ${c.attempts} att, ${c.successRate}% SR, ${c.avgYards} yds/play, ${c.explosive} explosive`
      )
      .join('\n')

    const baseContext = [
      `Team: ${team?.name ?? 'Riverside Warriors'} | Philosophy: ${team?.philosophy ?? 'Spread / RPO-heavy'}`,
      `Opponent: ${opponent?.name ?? 'TBD'} (${opponent?.mascot ?? ''})`,
      `OUR RECENT PERFORMANCE:\n${ourPerf}`,
      `OPPONENT TENDENCIES:\n${oppTendencies}`,
      `INSTALLED PLAY CATALOG:\n${playCatalog}`,
    ].join('\n\n')

    const prompt =
      body.mode === 'opening_script'
        ? `Generate a 15-play opening script for this matchup. The script should test the opponent early across box/edge/coverage/safety/man-zone dimensions, then layer constraints.

Return STRICT JSON in this exact shape (no markdown fences, no prose):
{
  "title": "string — short title for the script",
  "rationale": "string — 2-3 sentence strategic rationale grounded in opponent tendencies",
  "plays": [
    {
      "order": 1,
      "playId": "OFF-...-...",
      "name": "string",
      "concept": "string",
      "personnel": "string",
      "testTag": "string — e.g. TEST BOX, TEST EDGE, TEST COVERAGE, MAN/Z0 CHECK, TEST SAFETY",
      "expectedDefensiveReaction": "string",
      "complementNote": "string — what to come back to if this works",
      "coachingPoint": "string"
    }
  ],
  "complementaryPlan": ["string — 3-5 follow-up concepts to install if the script hits"],
  "selfScoutWarning": "string — one self-scout risk the script creates"
}

Ground truth context:
${baseContext}

The playId field MUST come from the INSTALLED PLAY CATALOG above. Pick real installed plays.`
        : `Coach is in this situation:
Down: ${body.situation?.down ?? 1} | Distance: ${body.situation?.distance ?? 10} | Hash: ${
            body.situation?.hash ?? 'M'
          } | Yard Line: ${body.situation?.yardLine ?? 35} | Quarter: ${
            body.situation?.quarter ?? 1
          } | Score Margin: ${body.situation?.scoreMargin ?? 0}
Personnel Notes: ${body.personnelNotes ?? 'none'}
Coaching Goal: ${body.coachingGoal ?? 'move the chains / win the down'}

Recommend the 3 best installed plays for this situation, in priority order. Return STRICT JSON (no markdown, no prose) in this exact shape:
{
  "recommendations": [
    {
      "rank": 1,
      "playId": "OFF-...-...",
      "name": "string",
      "concept": "string",
      "rationale": "string — why this fits the situation & opponent",
      "expectedDefensiveReaction": "string",
      "complementaryPlay": "string — what to come back to",
      "explanation": "string — single sentence explainability for the coach"
    }
  ]
}

Ground truth context:
${baseContext}

The playId MUST come from INSTALLED PLAY CATALOG above. Pick real installed plays.`

    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content:
            'You are GamePlanIQ™, the AI game-planning engine inside GridironIQ™. You output STRICT JSON only — no markdown fences, no commentary.',
        },
        { role: 'user', content: prompt },
      ],
      thinking: { type: 'disabled' },
    })

    const raw = completion.choices[0]?.message?.content ?? ''

    // Strip code fences if the model added them
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
          error: 'GamePlanIQ returned unparseable JSON.',
          raw: cleaned.slice(0, 2000),
        }),
        { status: 502, headers: { 'content-type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        result: parsed,
        opponent: opponent?.name ?? null,
        generatedAt: new Date().toISOString(),
      }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[gameplan] error:', msg)
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    )
  }
}
