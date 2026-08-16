import { NextRequest } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import {
  getAllPlays,
  getOpponents,
  getConceptPerformance,
  getGameSummary,
  getTeam,
} from '@/lib/data'
import { PHILOSOPHIES, OFFENSIVE_CONCEPTS, DEFENSIVE_FRONTS, COVERAGES } from '@/lib/football/knowledge'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const SYSTEM_PROMPT = `You are Coach AI™, the coordinator-level football intelligence assistant inside GridironIQ™ — a Football Intelligence Operating System used by football coaches.

You reason about football at a coordinator + analyst + quality-control level. You are NOT an autonomous coach; you always leave final authority to the human coaching staff.

Your capabilities:
- Play design, play DNA analysis, concept families
- Opponent scouting, tendency exploitation
- Game planning, opening scripts, situational recommendations
- Personnel deployment, protection & coverage analysis
- Practice scripting, installation, player development
- Self-scouting and postgame intelligence

Style guidelines:
- Speak in clear, decisive football language a high-school or college coach understands.
- Use bullet structure for recommendations, with WHY / WHAT / HOW framing.
- Always include an "EXPLAINABILITY" line when recommending a play or call — explain why this fits the situation and what defensive reaction it forces.
- Reference real concept families (Inside Zone family, Mesh family, RPO family, etc.) and standard coverage names (Cover 3, Quarters, Cover 1 Robber, Tampa 2).
- When you don't have enough information, ask a sharp follow-up instead of guessing.
- Never invent statistics. If you don't have a number, say so.
- Keep responses to ≤350 words unless the coach asks for depth.

You are anchored to the team's actual playbook and opponent data, which will be provided in the user message context. Treat that context as ground truth.`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { message, history = [] } = body as {
      message: string
      history?: Array<{ role: 'user' | 'assistant'; content: string }>
    }

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing "message" in body.' }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      )
    }

    // Build live context from the database (lightweight snapshot)
    const [plays, opponents, perf, summary, team] = await Promise.all([
      getAllPlays(),
      getOpponents(),
      getConceptPerformance(),
      getGameSummary(),
      getTeam(),
    ])

    const contextBlock = [
      `TEAM: ${team?.name ?? 'Unknown'} | Philosophy: ${team?.philosophy ?? 'n/a'}`,
      `PLAYBOOK: ${plays.length} plays installed.`,
      `Top concepts by attempts: ${perf
        .slice(0, 6)
        .map((c) => `${c.concept} (${c.attempts} att, ${c.successRate}% SR, ${c.avgYards} yds)`)
        .join('; ') || 'n/a'}`,
      `Season summary: ${summary.totalPlays} plays | ${summary.successRate}% SR | ${summary.yardsPerPlay} yds/play | ${
        summary.passRunRatio.pass
      }P / ${summary.passRunRatio.run}R | ${summary.explosives} explosive | ${summary.negatives} negative.`,
      `Best: ${summary.bestConcept?.concept ?? 'n/a'} (${summary.bestConcept?.avgYards ?? 0} yds) | Worst: ${
        summary.worstConcept?.concept ?? 'n/a'
      } (${summary.worstConcept?.avgYards ?? 0} yds).`,
      `OPPONENTS: ${opponents
        .map(
          (o) =>
            `${o.name} — top tendencies: ${o.tendencies
              .slice(0, 4)
              .map((t) => `${t.situation} ${t.result}:${t.value} (${Math.round(t.probability * 100)}% n=${t.sampleSize})`)
              .join(', ')}`
        )
        .join(' || ')}`,
      `AVAILABLE PHILOSOPHIES: ${PHILOSOPHIES.map((p) => p.name).join(', ')}.`,
      `OFFENSIVE CONCEPTS IN LIBRARY: ${OFFENSIVE_CONCEPTS.length}. DEFENSIVE FRONTS: ${DEFENSIVE_FRONTS.length}. COVERAGES: ${COVERAGES.length}.`,
      `INSTALLED PLAY IDS: ${plays
        .slice(0, 25)
        .map((p) => p.playId)
        .join(', ')}.`,
    ].join('\n')

    const zai = await ZAI.create()

    const messages: Array<{ role: 'assistant' | 'user'; content: string }> = [
      { role: 'assistant', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content:
          'Here is live context from GridironIQ™. Use it as ground truth for your answers.\n\n' +
          contextBlock,
      },
      ...history.slice(-6),
      { role: 'user', content: message },
    ]

    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: 'disabled' },
    })

    const responseText =
      completion.choices[0]?.message?.content ??
      'Coach AI was unable to generate a response. Please rephrase your question.'

    return new Response(
      JSON.stringify({
        response: responseText,
        context: {
          team: team?.name ?? null,
          playsAvailable: plays.length,
          opponents: opponents.map((o) => o.name),
        },
        createdAt: new Date().toISOString(),
      }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[coach-ai] error:', msg)
    return new Response(
      JSON.stringify({
        error: msg,
        response:
          'Coach AI is offline. Try again in a moment — the football intelligence service may be warming up.',
      }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    )
  }
}
