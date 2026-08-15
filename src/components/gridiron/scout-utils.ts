/**
 * ScoutIQ™ — shared types, constants, and deterministic summary builders.
 *
 * Pure TypeScript. No React, no Prisma, no Node-only APIs. Safe to import
 * from any client or server module. ES module syntax. No default export.
 *
 * The summary + recommendation engines are 100% deterministic — they
 * derive their output from the opponent's tendency rows + sample sizes.
 * No AI / network calls. Same opponent → same report every time.
 */

// ============================================================================
//  Types — mirror the Prisma Opponent/Tendency/SnapResult shapes that the
//  /api/gridiron endpoint serializes to the client.
// ============================================================================

export interface TendencyRow {
  id: string
  opponentId: string
  situation: string // e.g. "3rd_&_4_6", "1st_&_10", "red_zone"
  formationKey: string | null // "Trips", "Empty", "Ace", "I-Pro", ...
  personnel: string | null // "11", "10", "21", ...
  hash: string | null // "L" | "R" | "M"
  result: string // "pass" | "run" | "coverage" | "pressure"
  value: string // "Mesh", "Cover 3", "QB Draw", ...
  probability: number // 0..1
  sampleSize: number
  confidence: string // "HIGH" | "MEDIUM" | "LOW" — pre-labeled by the scout
  notes: string | null
}

export interface GameRow {
  id: string
  week: number
  date: string | Date
  location: string // home | away | neutral
  ourScore: number | null
  oppScore: number | null
  result: string | null // "W" | "L" | "T"
}

export interface OpponentSnapshot {
  id: string
  teamId: string
  name: string
  mascot: string | null
  league: string | null
  scoutSummary: string | null
  tendencies: TendencyRow[]
  games: GameRow[]
}

export interface SnapResultRow {
  id: string
  opponentId: string | null
  quarter: number
  down: number
  distance: number
  yardLine: number
  formation: string | null
  personnel: string | null
  concept: string | null
  front: string | null
  coverage: string | null
  pressure: string | null
  playType: string | null
  yardsGained: number
  success: boolean
  explosive: boolean
  negative: boolean
  turnover: boolean
}

// ============================================================================
//  Constants
// ============================================================================

/** Map of tendency situation id → human-readable label. */
export const SITUATION_LABELS: Record<string, string> = {
  '1st_&_10': '1st & 10',
  '2nd_&_long': '2nd & Long',
  '2nd_&_medium': '2nd & Medium',
  '2nd_&_short': '2nd & Short',
  '3rd_&_short': '3rd & Short',
  '3rd_&_4_6': '3rd & Medium',
  '3rd_&_7+': '3rd & Long',
  '4th_&_short': '4th & Short',
  '4th_&_medium': '4th & Medium',
  red_zone: 'Red Zone',
  goal_line: 'Goal Line',
  backed_up: 'Backed Up',
  'high_red': 'High Red',
  'low_red': 'Low Red',
  '2_minute': '2 Minute',
  '4_minute': '4 Minute',
}

/** Canonical row ordering for the heatmap and situation breakdown. */
export const SITUATION_ORDER = [
  '1st_&_10',
  '2nd_&_long',
  '2nd_&_medium',
  '2nd_&_short',
  '3rd_&_short',
  '3rd_&_4_6',
  '3rd_&_7+',
  '4th_&_short',
  '4th_&_medium',
  'red_zone',
  'high_red',
  'low_red',
  'goal_line',
  'backed_up',
  '2_minute',
  '4_minute',
]

/**
 * Situations to surface as breakdown cards (in display order).
 * Mirrors the spec: 1st & 10, 2nd & Long, 3rd & Short (1-3),
 * 3rd & Medium (4-6), 3rd & Long (7+), Red Zone.
 */
export const BREAKDOWN_SITUATIONS = [
  '1st_&_10',
  '2nd_&_long',
  '3rd_&_short',
  '3rd_&_4_6',
  '3rd_&_7+',
  'red_zone',
] as const

/** Friendly subtitle for each breakdown card. */
export const SITUATION_DESCRIPTIONS: Record<string, string> = {
  '1st_&_10': 'Base down — openers & RPO game',
  '2nd_&_long': 'Long-yardage — pass-heavy downs',
  '3rd_&_short': '1-3 yards — conversion zone',
  '3rd_&_4_6': '4-6 yards — medium conversion',
  '3rd_&_7+': '7+ yards — long conversion',
  red_zone: 'Inside the 20 — finish zone',
}

/**
 * Formation keys to display as heatmap columns, in canonical order.
 * Any formation found in the data not present here gets appended
 * alphabetically at the end.
 */
export const COMMON_FORMATIONS = [
  'Trips',
  'Doubles',
  'Empty',
  'Ace',
  'I-Pro',
  'Wing-T',
  'Pistol',
  'Bunch',
  'Quads',
  'Trey',
] as const

// ============================================================================
//  Confidence badge helpers
// ============================================================================

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW'

/**
 * Derive a confidence level from sample size.
 *  - HIGH  : sampleSize >= 25
 *  - MEDIUM: 10 <= sampleSize < 25
 *  - LOW   : sampleSize < 10  (badge shows "limited sample" tooltip)
 */
export function confidenceFromSample(sampleSize: number): ConfidenceLevel {
  if (sampleSize >= 25) return 'HIGH'
  if (sampleSize >= 10) return 'MEDIUM'
  return 'LOW'
}

/** Tailwind classes for each confidence badge — theme tokens only, NO indigo/blue. */
export const CONFIDENCE_BADGE_CLASS: Record<ConfidenceLevel, string> = {
  HIGH: 'bg-primary/15 text-primary border-primary/30',
  MEDIUM: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  LOW: 'bg-destructive/15 text-destructive border-destructive/30',
}

// ============================================================================
//  Scout summary — deterministic, sample-weighted analytics
// ============================================================================

export interface ScoutSummary {
  /** Estimated overall run/pass split as percentages (sum to 100, or 0/0 if no data). */
  overallRunPass: { run: number; pass: number }
  /** Most-frequent formationKey across all tendency rows (by summed sampleSize). */
  topFormation: string
  /** Top 3 concepts ranked by (probability × sampleSize). */
  topConcepts: Array<{ concept: string; prob: number; sample: number }>
  /** Up to 4 distinct pass concepts, ranked by prob × sample. */
  passingStrengths: string[]
  /** One-line third-down narrative. */
  thirdDownTendency: string
  /** One-line red-zone narrative. */
  redZoneTendency: string
  /** 3-4 sentence auto-narrative combining the above. */
  summary: string
  /** Total charted sample across all tendencies. */
  totalSamples: number
}

/** Compute the sample-weighted pass% for a subset of tendencies. Returns 0..1. */
function passRate(rows: TendencyRow[]): number {
  let passW = 0
  let runW = 0
  for (const t of rows) {
    const w = t.probability * t.sampleSize
    if (t.result === 'pass') passW += w
    else if (t.result === 'run') runW += w
  }
  const total = passW + runW
  return total > 0 ? passW / total : 0
}

/**
 * Build a deterministic scout summary from an opponent's tendency rows.
 * Same opponent → same summary every time. No AI / network calls.
 */
export function buildScoutSummary(opponent: OpponentSnapshot): ScoutSummary {
  const tendencies = opponent.tendencies ?? []
  const totalSamples = tendencies.reduce((a, t) => a + t.sampleSize, 0)

  // Overall run/pass split, weighted by sampleSize × probability.
  const overallPassRate = passRate(tendencies)
  const passPct = Math.round(overallPassRate * 100)
  const runPct = 100 - passPct

  // Top formation by total sampleSize across all tendencies.
  const formationSamples = new Map<string, number>()
  for (const t of tendencies) {
    if (!t.formationKey) continue
    formationSamples.set(
      t.formationKey,
      (formationSamples.get(t.formationKey) ?? 0) + t.sampleSize,
    )
  }
  let topFormation = '—'
  let topFormationSamples = 0
  for (const [f, s] of formationSamples) {
    if (s > topFormationSamples) {
      topFormation = f
      topFormationSamples = s
    }
  }

  // Top 3 concepts by (probability × sampleSize).
  const conceptScores = tendencies
    .map((t) => ({
      concept: t.value,
      prob: t.probability,
      sample: t.sampleSize,
      score: t.probability * t.sampleSize,
    }))
    .sort((a, b) => b.score - a.score)
  const topConcepts = conceptScores.slice(0, 3)

  // Passing strengths — distinct pass concepts, ranked by prob × sample.
  const passConcepts = tendencies
    .filter((t) => t.result === 'pass')
    .map((t) => ({
      concept: t.value,
      score: t.probability * t.sampleSize,
    }))
    .sort((a, b) => b.score - a.score)
  const passingStrengths = Array.from(
    new Set(passConcepts.map((c) => c.concept)),
  ).slice(0, 4)

  // Third-down narrative.
  const thirdDowns = tendencies.filter((t) => t.situation.startsWith('3rd'))
  const tdPassRate = passRate(thirdDowns)
  const tdPassPct = Math.round(tdPassRate * 100)
  const thirdDownTendency =
    thirdDowns.length === 0
      ? 'Insufficient 3rd-down data'
      : tdPassRate >= 0.65
        ? `Pass-heavy (${tdPassPct}% pass) — favor simulated pressure`
        : tdPassRate >= 0.5
          ? `Pass-leaning (${tdPassPct}% pass) — mix match coverage`
          : `Run-leaning (${100 - tdPassPct}% run) — load the box`

  // Red-zone narrative.
  const rz = tendencies.filter((t) => t.situation === 'red_zone')
  const rzRunRate = 1 - passRate(rz)
  const rzRunPct = Math.round(rzRunRate * 100)
  const rzHasData = rz.length > 0
  const redZoneTendency = !rzHasData
    ? 'Insufficient red-zone data'
    : rzRunRate >= 0.55
      ? `Run-heavy (${rzRunPct}% run) — gap-exchange + boundary leverage`
      : rzRunRate >= 0.4
        ? `Balanced (${rzRunPct}% run / ${100 - rzRunPct}% pass) — mix looks`
        : `Pass-heavy (${100 - rzRunPct}% pass) — rally to QB, play pass-first`

  // Top 3 highest-probability tendencies (used in the narrative).
  const top3ByProb = [...tendencies]
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3)

  // 3-4 sentence auto-narrative.
  const mascot = opponent.mascot ? ` ${opponent.mascot}` : ''
  const parts: string[] = []
  parts.push(
    `${opponent.name}${mascot} shows a ${runPct}% run / ${passPct}% pass split across ${totalSamples} charted snaps.`,
  )
  if (topFormation !== '—') {
    parts.push(
      `Favorite personnel grouping is ${topFormation} (${topFormationSamples} charted snaps).`,
    )
  }
  if (top3ByProb.length > 0) {
    parts.push(
      `Highest-probability concepts: ${top3ByProb
        .map((t) => `${t.value} ${Math.round(t.probability * 100)}%`)
        .join(', ')}.`,
    )
  }
  if (thirdDowns.length > 0) parts.push(`${thirdDownTendency}.`)
  const summary = parts.join(' ')

  return {
    overallRunPass: { run: runPct, pass: passPct },
    topFormation,
    topConcepts,
    passingStrengths,
    thirdDownTendency,
    redZoneTendency,
    summary,
    totalSamples,
  }
}

// ============================================================================
//  Defensive recommendations — deterministic rule engine
// ============================================================================

export interface DefensiveRecommendation {
  id: string
  /** The opponent tendency that triggered the recommendation. */
  trigger: string
  /** Short headline recommendation. */
  recommendation: string
  /** Coverage behind the call. */
  coverage: string
  /** Pressure / rush plan. */
  pressure: string
  /** Teaching point for the position group. */
  coachingPoint: string
  /** Priority weight — drives badge color and ordering. */
  priority: 'high' | 'medium' | 'low'
}

/** Formation-share helper — fraction of charted snaps in a given formation. */
function formationShare(tendencies: TendencyRow[], formation: string): number {
  const samples = new Map<string, number>()
  let total = 0
  for (const t of tendencies) {
    if (!t.formationKey) continue
    samples.set(
      t.formationKey,
      (samples.get(t.formationKey) ?? 0) + t.sampleSize,
    )
    total += t.sampleSize
  }
  return total > 0 ? (samples.get(formation) ?? 0) / total : 0
}

/**
 * Build defensive recommendations from the opponent's tendencies.
 * Implements the 5 rule families from the spec + a sensible fallback.
 * Same opponent → same recommendations every time.
 */
export function buildDefensiveRecommendations(
  opponent: OpponentSnapshot,
): DefensiveRecommendation[] {
  const recs: DefensiveRecommendation[] = []
  const tendencies = opponent.tendencies ?? []

  // ---- Inputs ----------------------------------------------------------
  const thirdMed = tendencies.filter((t) => t.situation === '3rd_&_4_6')
  const tmPassRate = passRate(thirdMed)

  const rz = tendencies.filter((t) => t.situation === 'red_zone')
  const rzQbRun = rz.find((t) => /qb/i.test(t.value) && t.result === 'run')
  const rzQbRunProb = rzQbRun?.probability ?? 0

  const tripsShare = formationShare(tendencies, 'Trips')
  const emptyShare = formationShare(tendencies, 'Empty')

  const glanceTendency = tendencies.find((t) => /glance/i.test(t.value))
  const glanceProb = glanceTendency?.probability ?? 0

  // ---- Rule 1: 3rd & medium pass-heavy (> 60%) ------------------------
  if (tmPassRate > 0.6) {
    recs.push({
      id: 'third-med-pass',
      trigger: `Opponent passes ${Math.round(tmPassRate * 100)}% on 3rd & medium (4-6 yds).`,
      recommendation: 'Nickel simulated pressure with Cover 3 Match behind',
      coverage:
        'Cover 3 Match — apex replaces the flat, safety rotates to the stick',
      pressure:
        'Simulated pressure — show 6 rushers, drop 2 (DE + Mike), bring 4 from a 6-man look',
      coachingPoint:
        'Disguise the drop until the QB commits his eyes. The simulated look freezes the OL protection count and forces the QB to hold the ball — match-routes rally downhill.',
      priority: 'high',
    })
  }

  // ---- Rule 2: Red-zone QB run > 25% ----------------------------------
  if (rzQbRunProb > 0.25) {
    recs.push({
      id: 'rz-qb-run',
      trigger: `QB run rate ${Math.round(rzQbRunProb * 100)}% in the red zone — they will pull and run the QB.`,
      recommendation: 'Gap exchange + QB spy with B-gap responsibility',
      coverage: 'Red Zone Match — man-match with a deep-half safety',
      pressure:
        'Keep 4 rushers — exchange B-gap (3-tech & Will) to confuse the read',
      coachingPoint:
        'Assign a LB as QB spy with eyes on the QB\'s front shoulder. The B-gap exchange flips the read — he pulls into a free hitter, you fit the run.',
      priority: 'high',
    })
  }

  // ---- Rule 3: Trips formation > 40% of snaps -------------------------
  if (tripsShare > 0.4) {
    recs.push({
      id: 'trips-heavy',
      trigger: `Trips formation used ${Math.round(tripsShare * 100)}% of snaps — they live in 3x1.`,
      recommendation: 'Stack-shell to Trips + rotate safety into the box',
      coverage:
        'Palms / Quarters to Trips with stack-shell corner — collision #2 & #3',
      pressure: 'Edge setter with contain — force the ball out on time',
      coachingPoint:
        'Disrupt the #2 receiver\'s release at the snap. The stack-shell takes away the quick glance and stick — forces the QB to his 3rd read with the safety driving downhill.',
      priority: 'medium',
    })
  }

  // ---- Rule 4: Empty formation > 25% of snaps -------------------------
  if (emptyShare > 0.25) {
    recs.push({
      id: 'empty-heavy',
      trigger: `Empty formation used ${Math.round(emptyShare * 100)}% of snaps — spread the field, throw quickly.`,
      recommendation: 'Dime + free-rush creeper to disrupt the QB\'s rhythm',
      coverage:
        'Cover 1 Robber — man-free with a robber safety reading the QB\'s eyes',
      pressure:
        'Creeper — DL shows rush, drops to flat; LB replaces him as the 4th rusher',
      coachingPoint:
        'In Empty the QB expects space. The creeper removes the run check and forces a faster clock — the robber undercuts the glance and tunnel screens Empty teams love.',
      priority: 'medium',
    })
  }

  // ---- Rule 5: Glance RPO > 15% probability --------------------------
  if (glanceProb > 0.15) {
    recs.push({
      id: 'glance-rpo',
      trigger: `Glance RPO appears with ${Math.round(glanceProb * 100)}% probability — they\'re reading the apex.`,
      recommendation: 'Apex leverage + boundary corner squat',
      coverage: 'Cover 3 Cloud to the Glance side — apex flattens to slant',
      pressure: 'No blitz — play sound zone with eyes on the QB\'s shoulder',
      coachingPoint:
        'Align the apex at 4x4 outside the EMOL. On the snap, he squat-and-rally: hands up like he\'s keeping the ball, eyes on the QB\'s shoulder. If the QB pulls, fit the run; if he throws glance, drive the slant.',
      priority: 'high',
    })
  }

  // ---- Fallback: nothing triggered -----------------------------------
  if (recs.length === 0) {
    recs.push({
      id: 'fallback-base',
      trigger: 'No high-confidence exploitable pattern detected in the charted data.',
      recommendation: 'Base 4-2-5 with Cover 3 — play sound fundamentals',
      coverage: 'Cover 3 — read the QB\'s eyes, rally downhill',
      pressure: '4-man rush with contain — keep the QB in the pocket',
      coachingPoint:
        'Without strong tendency data, play base defense and let your players\' rules take over. Adjust after the first quarter based on what you see live.',
      priority: 'low',
    })
  }

  // Sort: high → medium → low (stable within each tier by insertion order)
  const weight = { high: 0, medium: 1, low: 2 } as const
  recs.sort((a, b) => weight[a.priority] - weight[b.priority])
  return recs
}
