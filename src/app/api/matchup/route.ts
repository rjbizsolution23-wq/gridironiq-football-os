import { NextRequest } from 'next/server'
import {
  getAllPlays,
  getOpponents,
  getConceptPerformance,
  getGameSummary,
  getTeam,
  getGames,
} from '@/lib/data'
import { createChatCompletion, ChatMessage } from '@/lib/ai-client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const SYSTEM_PROMPT = `You are MatchupIQ™ — the head-to-head game prediction engine inside GridironIQ™, a Football Intelligence Operating System used by football coaches.

Your job: take our team's performance data + an opponent's tendency data and produce a structured game prediction JSON.

You output STRICT JSON only — no markdown, no prose, no commentary. The JSON shape is:
{
  "winProbability": number (0-100, our team's chance to win),
  "predictedScore": { "ours": number, "theirs": number },
  "spread": string (e.g., "+3.5" if we're favored by 3.5, "-7" if we're underdogs by 7),
  "totalPoints": number (predicted combined score),
  "gameScript": string (2-3 sentence narrative of how the game will play out),
  "keyMatchups": [
    {
      "title": string (e.g., "Their Trips vs Our Quarters"),
      "advantage": "us" | "them" | "even",
      "rationale": string (1-2 sentences explaining the matchup edge),
      "stat": string (e.g., "Opponent 71% pass from Trips; our Quarters allowing 4.2 yds/play")
    }
  ],
  "criticalFactors": [
    {
      "factor": string (e.g., "Win 1st down"),
      "why": string,
      "ifWin": string (what happens if we win this factor),
      "ifLose": string
    }
  ],
  "openingScriptSuggestions": string[] (3-5 play concept names to open with),
  "defensiveGamePlan": string (2-3 sentence summary of defensive approach),
  "offensiveGamePlan": string (2-3 sentence summary of offensive approach),
  "xFactor": string (1 player or situational factor that could swing the game),
  "redFlag": string (1 thing that could blow up in our face)
}

Rules:
- keyMatchups: 3-5 entries
- criticalFactors: 3-4 entries
- Be specific — reference real concept names, real coverage names, real tendencies from the data.
- If we don't have enough data, say so honestly in the relevant field.`

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      opponentId?: string
      location?: 'home' | 'away' | 'neutral'
      weather?: string
      injuries?: string
      model?: string
    }

    const [plays, opponents, perf, summary, team, games] = await Promise.all([
      getAllPlays(),
      getOpponents(),
      getConceptPerformance(),
      getGameSummary(),
      getTeam(),
      getGames(),
    ])

    const opponent = body.opponentId
      ? opponents.find((o) => o.id === body.opponentId)
      : opponents[0]

    if (!opponent) {
      return new Response(
        JSON.stringify({ error: 'No opponent found.' }),
        { status: 404, headers: { 'content-type': 'application/json' } }
      )
    }

    const ourRecord = (() => {
      const wins = games.filter((g) => g.result === 'W').length
      const losses = games.filter((g) => g.result === 'L').length
      const ties = games.filter((g) => g.result === 'T').length
      return `${wins}-${losses}${ties > 0 ? `-${ties}` : ''}`
    })()

    const ourPerf = perf
      .slice(0, 8)
      .map(
        (c) =>
          `${c.concept}: ${c.attempts} att, ${c.successRate}% SR, ${c.avgYards} yds/play, ${c.explosive} explosive, ${c.negative} negative`
      )
      .join('\n')

    const oppTendencies = opponent.tendencies
      .map(
        (t) =>
          `${t.situation} | ${t.formationKey ?? '-'} | ${t.result}:${t.value} | p=${Math.round(
            t.probability * 100
          )}% | n=${t.sampleSize} | conf=${t.confidence}`
      )
      .join('\n')

    const contextBlock = [
      `OUR TEAM: ${team?.name ?? 'Riverside Warriors'} | Record: ${ourRecord} | Philosophy: ${team?.philosophy ?? 'Spread / RPO-heavy'}`,
      `LOCATION: ${body.location ?? 'home'}${body.weather ? ` | Weather: ${body.weather}` : ''}${body.injuries ? ` | Injuries: ${body.injuries}` : ''}`,
      `OUR SEASON SUMMARY: ${summary.totalPlays} plays | ${summary.successRate}% SR | ${summary.yardsPerPlay} yds/play | ${summary.passRunRatio.pass}P / ${summary.passRunRatio.run}R | ${summary.explosives} explosive | ${summary.negatives} negative.`,
      `OUR BEST CONCEPT: ${summary.bestConcept?.concept ?? 'n/a'} (${summary.bestConcept?.avgYards ?? 0} yds)`,
      `OUR WORST CONCEPT: ${summary.worstConcept?.concept ?? 'n/a'} (${summary.worstConcept?.avgYards ?? 0} yds)`,
      `OUR TOP CONCEPTS:\n${ourPerf}`,
      `OPPONENT: ${opponent.name} (${opponent.mascot ?? ''}) — League: ${opponent.league ?? 'n/a'}`,
      `OPPONENT TENDENCIES:\n${oppTendencies}`,
      `INSTALLED PLAY CATALOG (top 25):\n${plays
        .slice(0, 25)
        .map((p) => `${p.playId}|${p.name}|${p.concept}|targets:[${p.coverageTargets.join(',')}]`)
        .join('\n')}`,
    ].join('\n\n')

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Predict the matchup. Return STRICT JSON only.\n\n${contextBlock}`,
      },
    ]

    const raw = await createChatCompletion({
      messages,
      model: body.model || 'openrouter/free',
      temperature: 0.2,
    })

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
          error: 'MatchupIQ returned unparseable JSON.',
          raw: cleaned.slice(0, 2000),
        }),
        { status: 502, headers: { 'content-type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        prediction: parsed,
        opponent: { id: opponent.id, name: opponent.name, mascot: opponent.mascot },
        team: team?.name ?? null,
        modelUsed: body.model || 'openrouter/free',
        generatedAt: new Date().toISOString(),
      }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[matchup] error:', msg)
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    )
  }
}
