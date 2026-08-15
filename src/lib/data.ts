/**
 * Server-side data access helpers for GridironIQ™.
 * Thin wrappers around Prisma that serialize JSON-string fields into objects
 * before returning to the client.
 */

import { db } from '@/lib/db'

function parse<T = unknown>(value: string | null | undefined): T | null {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export interface SerializedPlay {
  id: string
  playId: string
  name: string
  side: string
  personnel: string | null
  motion: string | null
  concept: string
  readType: string | null
  readDefender: string | null
  protection: string | null
  qbFootwork: string | null
  constraints: string[]
  preferredFronts: string[]
  coverageTargets: string[]
  fieldZones: string[]
  coachingPoints: string | null
  assignments: Array<{
    position: string
    alignment: string
    assignment: string
    landmark: string
    vsMan: string
    vsZone: string
  }>
  routes: Array<{ player: string; route: string; depth: string }>
  diagram: {
    players: Array<{ id: string; x: number; y: number; label: string }>
    paths: Array<{
      type: 'route' | 'block' | 'motion' | 'handoff' | 'read'
      from: string
      toX: number
      toY: number
      label?: string
      dashed?: boolean
    }>
    hash: 'L' | 'R' | 'M'
    yardLine: number
  } | null
  complementary: string[]
  formation: {
    id: string
    code: string
    name: string
    personnel: string
    side: string
    backfield: string | null
    strength: string | null
  } | null
  family: { id: string; code: string; name: string; baseConcept: string } | null
}

export async function getAllPlays(): Promise<SerializedPlay[]> {
  const plays = await db.play.findMany({
    include: { formation: true, family: true },
    orderBy: [{ side: 'asc' }, { playId: 'asc' }],
  })
  return plays.map((p) => ({
    id: p.id,
    playId: p.playId,
    name: p.name,
    side: p.side,
    personnel: p.personnel,
    motion: p.motion,
    concept: p.concept,
    readType: p.readType,
    readDefender: p.readDefender,
    protection: p.protection,
    qbFootwork: p.qbFootwork,
    constraints: parse<string[]>(p.constraints) ?? [],
    preferredFronts: parse<string[]>(p.preferredFronts) ?? [],
    coverageTargets: parse<string[]>(p.coverageTargets) ?? [],
    fieldZones: parse<string[]>(p.fieldZones) ?? [],
    coachingPoints: p.coachingPoints,
    assignments: parse(p.assignments) ?? [],
    routes: parse(p.routes) ?? [],
    diagram: parse(p.diagram),
    complementary: parse<string[]>(p.complementary) ?? [],
    formation: p.formation
      ? {
          id: p.formation.id,
          code: p.formation.code,
          name: p.formation.name,
          personnel: p.formation.personnel,
          side: p.formation.side,
          backfield: p.formation.backfield,
          strength: p.formation.strength,
        }
      : null,
    family: p.family
      ? {
          id: p.family.id,
          code: p.family.code,
          name: p.family.name,
          baseConcept: p.family.baseConcept,
        }
      : null,
  }))
}

export async function getPlayById(id: string): Promise<SerializedPlay | null> {
  const plays = await getAllPlays()
  return plays.find((p) => p.id === id || p.playId === id) ?? null
}

export async function getFormations() {
  return db.formation.findMany({ orderBy: [{ side: 'asc' }, { name: 'asc' }] })
}

export async function getPlayFamilies() {
  return db.playFamily.findMany({
    orderBy: [{ side: 'asc' }, { name: 'asc' }],
    include: { plays: { select: { playId: true, name: true, id: true } } },
  })
}

export async function getTeam() {
  return db.team.findFirst({
    include: { players: { orderBy: [{ group: 'asc' }, { jersey: 'asc' }] } },
  })
}

export async function getOpponents() {
  return db.opponent.findMany({
    include: {
      tendencies: true,
      games: { orderBy: { week: 'asc' } },
    },
    orderBy: { name: 'asc' },
  })
}

export async function getOpponentById(id: string) {
  const opponents = await getOpponents()
  return opponents.find((o) => o.id === id) ?? null
}

export async function getGames() {
  return db.game.findMany({
    include: { opponent: true, snapResults: true },
    orderBy: { week: 'asc' },
  })
}

export async function getSnapResults() {
  return db.snapResult.findMany({
    include: { play: true, opponent: true, game: { include: { opponent: true } } },
    orderBy: { createdAt: 'asc' },
  })
}

export async function getCallSheets() {
  const sheets = await db.callSheet.findMany({
    include: { team: true, game: { include: { opponent: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return sheets.map((s) => ({
    ...s,
    sections: parse(s.sections) ?? [],
  }))
}

export async function getInstallPlans() {
  const plans = await db.installPlan.findMany({
    include: { team: true },
    orderBy: { day: 'asc' },
  })
  return plans.map((p) => ({
    ...p,
    sections: parse(p.sections) ?? [],
  }))
}

// ---------- Derived analytics ----------

export interface ConceptPerformance {
  concept: string
  attempts: number
  successes: number
  yards: number
  explosive: number
  negative: number
  avgYards: number
  successRate: number
}

export async function getConceptPerformance(): Promise<ConceptPerformance[]> {
  const snaps = await db.snapResult.findMany({
    where: { playType: { not: null } },
  })
  const byConcept = new Map<string, ConceptPerformance>()
  for (const s of snaps) {
    const concept = s.concept ?? 'unknown'
    const entry =
      byConcept.get(concept) ??
      {
        concept,
        attempts: 0,
        successes: 0,
        yards: 0,
        explosive: 0,
        negative: 0,
        avgYards: 0,
        successRate: 0,
      }
    entry.attempts += 1
    entry.successes += s.success ? 1 : 0
    entry.yards += s.yardsGained
    entry.explosive += s.explosive ? 1 : 0
    entry.negative += s.negative ? 1 : 0
    byConcept.set(concept, entry)
  }
  const arr = Array.from(byConcept.values())
  for (const c of arr) {
    c.avgYards = c.attempts ? Math.round((c.yards / c.attempts) * 10) / 10 : 0
    c.successRate = c.attempts
      ? Math.round((c.successes / c.attempts) * 1000) / 10
      : 0
  }
  arr.sort((a, b) => b.attempts - a.attempts)
  return arr
}

export interface GameSummary {
  totalPlays: number
  successRate: number
  yardsPerPlay: number
  explosives: number
  negatives: number
  bestConcept: { concept: string; avgYards: number; successRate: number } | null
  worstConcept: { concept: string; avgYards: number; successRate: number } | null
  passRunRatio: { pass: number; run: number }
}

export async function getGameSummary(): Promise<GameSummary> {
  const snaps = await db.snapResult.findMany()
  const total = snaps.length
  const successes = snaps.filter((s) => s.success).length
  const yards = snaps.reduce((a, s) => a + s.yardsGained, 0)
  const explosives = snaps.filter((s) => s.explosive).length
  const negatives = snaps.filter((s) => s.negative).length

  const perf = await getConceptPerformance()
  const ranked = [...perf].sort((a, b) => b.avgYards - a.avgYards)
  const best = ranked[0] ?? null
  const worst = ranked[ranked.length - 1] ?? null

  const pass = snaps.filter((s) => s.playType === 'pass').length
  const run = snaps.filter((s) => s.playType === 'run').length

  return {
    totalPlays: total,
    successRate: total ? Math.round((successes / total) * 1000) / 10 : 0,
    yardsPerPlay: total ? Math.round((yards / total) * 10) / 10 : 0,
    explosives,
    negatives,
    bestConcept: best
      ? { concept: best.concept, avgYards: best.avgYards, successRate: best.successRate }
      : null,
    worstConcept: worst
      ? { concept: worst.concept, avgYards: worst.avgYards, successRate: worst.successRate }
      : null,
    passRunRatio: { pass, run },
  }
}
