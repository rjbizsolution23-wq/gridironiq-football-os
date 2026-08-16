'use client'

/**
 * AnalyticsIQ™ — Postgame Intelligence.
 *
 * Coach's analytics dashboard summarizing team performance across the season
 * + per-game. Reads the shared Zustand `selectedGameId`:
 *   - null  → "All Season" aggregate (default)
 *   - <id>  → filtered to that single game
 *
 * Self-contained: ships its own React Query client.
 *
 * Layout (top → bottom, natural page scroll):
 *   1. Header — title + game selector + (optional) current game strip
 *   2. KPI cards row (6 cards)
 *   3. Concept performance table (sortable)
 *   4. Two-column charts (concept bar / pass-run pie / exp-neg bar)
 *   5. Self-Scout warnings panel
 *   6. Game log table (per-game summary, top concept, W/L badge)
 */

import * as React from 'react'
import { useMemo, useState } from 'react'
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import { Activity, BarChart3, Loader2, Target, Trophy } from 'lucide-react'

import { useAppStore } from '@/lib/store'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ConceptPerformance, GameSummary } from '@/lib/data'

import { KpiCards } from './kpi-cards'
import { ConceptTable } from './concept-table'
import { AnalyticsCharts } from './analytics-charts'
import { SelfScoutWarnings } from './self-scout-warnings'

// ----------------------------------------------------------------------------
//  Types — what we read from /api/gridiron
// ----------------------------------------------------------------------------

interface OpponentRef {
  id: string
  name: string
  mascot: string | null
}

interface GameRow {
  id: string
  week: number
  date: string
  location: string
  ourScore: number | null
  oppScore: number | null
  result: string | null
  opponent: OpponentRef | null
}

interface SnapRow {
  id: string
  gameId: string | null
  opponentId: string | null
  quarter: number
  down: number
  distance: number
  yardLine: number
  concept: string | null
  playType: string | null
  yardsGained: number
  success: boolean
  explosive: boolean
  negative: boolean
}

interface GridironApiResponse {
  games: GameRow[]
  snapResults: SnapRow[]
  conceptPerformance: ConceptPerformance[]
  gameSummary: GameSummary
}

// ----------------------------------------------------------------------------
//  Pure analytics derivation — mirrors lib/data.ts getConceptPerformance +
//  getGameSummary but runs client-side on a filtered snap subset.
// ----------------------------------------------------------------------------

function computeAnalytics(snaps: SnapRow[]): {
  summary: GameSummary
  conceptPerformance: ConceptPerformance[]
} {
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
  const conceptPerformance = Array.from(byConcept.values())
  for (const c of conceptPerformance) {
    c.avgYards = c.attempts ? round1(c.yards / c.attempts) : 0
    c.successRate = c.attempts
      ? round1((c.successes / c.attempts) * 100)
      : 0
  }
  conceptPerformance.sort((a, b) => b.attempts - a.attempts)

  const total = snaps.length
  const successes = snaps.filter((s) => s.success).length
  const yards = snaps.reduce((a, s) => a + s.yardsGained, 0)
  const explosives = snaps.filter((s) => s.explosive).length
  const negatives = snaps.filter((s) => s.negative).length
  const pass = snaps.filter((s) => s.playType === 'pass').length
  const run = snaps.filter((s) => s.playType === 'run').length

  const ranked = [...conceptPerformance].sort((a, b) => b.avgYards - a.avgYards)
  const best = ranked[0] ?? null
  const worst = ranked[ranked.length - 1] ?? null

  const summary: GameSummary = {
    totalPlays: total,
    successRate: total ? round1((successes / total) * 100) : 0,
    yardsPerPlay: total ? round1(yards / total) : 0,
    explosives,
    negatives,
    bestConcept: best
      ? {
          concept: best.concept,
          avgYards: best.avgYards,
          successRate: best.successRate,
        }
      : null,
    worstConcept: worst
      ? {
          concept: worst.concept,
          avgYards: worst.avgYards,
          successRate: worst.successRate,
        }
      : null,
    passRunRatio: { pass, run },
  }

  return { summary, conceptPerformance }
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

// ----------------------------------------------------------------------------
//  Main module
// ----------------------------------------------------------------------------

const SEASON_VALUE = '__season__'

export default function AnalyticsIQ() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, refetchOnWindowFocus: false },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AnalyticsIQBody />
    </QueryClientProvider>
  )
}

function useGridironAnalytics() {
  return useQuery<GridironApiResponse>({
    queryKey: ['gridiron'],
    queryFn: async () => {
      const r = await fetch('/api/gridiron')
      if (!r.ok) throw new Error('failed to load analytics data')
      return (await r.json()) as GridironApiResponse
    },
  })
}

function AnalyticsIQBody() {
  const { data, isLoading, isError } = useGridironAnalytics()
  const selectedGameId = useAppStore((s) => s.selectedGameId)
  const setSelectedGameId = useAppStore((s) => s.setSelectedGameId)

  const games = data?.games ?? []
  const snapResults = data?.snapResults ?? []

  const selectValue = selectedGameId ?? SEASON_VALUE
  const onSelect = (v: string) => {
    setSelectedGameId(v === SEASON_VALUE ? null : v)
  }

  // Filtered snaps for the current view (game-specific or season aggregate).
  const filteredSnaps = useMemo(() => {
    if (!selectedGameId) return snapResults
    return snapResults.filter((s) => s.gameId === selectedGameId)
  }, [snapResults, selectedGameId])

  const { summary, conceptPerformance } = useMemo(
    () => computeAnalytics(filteredSnaps),
    [filteredSnaps],
  )

  // Season aggregate — used as trend baseline when viewing a single game.
  const seasonBaseline = useMemo(() => {
    if (!selectedGameId) return null
    return computeAnalytics(snapResults).summary
  }, [snapResults, selectedGameId])

  const gameLog = useMemo(() => {
    return games
      .slice()
      .sort((a, b) => a.week - b.week)
      .map((g) => {
        const gSnaps = snapResults.filter((s) => s.gameId === g.id)
        const a = computeAnalytics(gSnaps)
        const top = a.conceptPerformance[0] ?? null
        const totalYards = gSnaps.reduce((acc, s) => acc + s.yardsGained, 0)
        return { game: g, summary: a.summary, topConcept: top, totalYards }
      })
  }, [games, snapResults])

  const currentGame = useMemo(
    () => games.find((g) => g.id === selectedGameId) ?? null,
    [games, selectedGameId],
  )

  const sortedGamesForSelect = useMemo(
    () => games.slice().sort((a, b) => a.week - b.week),
    [games],
  )

  return (
    <div className="flex flex-col gap-4 p-3 lg:p-4">
      {/* ============================================================
          1. Header
         ============================================================ */}
      <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              GridironIQ™
            </div>
            <h2 className="text-base font-semibold tracking-tight">
              AnalyticsIQ
              <span className="ml-1 align-super text-[10px] text-muted-foreground">
                ™
              </span>
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                Postgame Intelligence
              </span>
            </h2>
          </div>

          <Select value={selectValue} onValueChange={onSelect}>
            <SelectTrigger
              className="w-[260px]"
              aria-label="Select game"
            >
              <SelectValue placeholder="Select game…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SEASON_VALUE}>
                All Season (aggregate)
              </SelectItem>
              {sortedGamesForSelect.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  W{g.week} · {g.opponent?.name ?? 'Unknown'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentGame ? (
          <div className="flex flex-col items-start gap-1 lg:items-end">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Trophy className="size-4 text-primary" />
              Week {currentGame.week} ·{' '}
              {currentGame.opponent?.name ?? 'Unknown'}
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">
              {currentGame.location} · {formatResult(currentGame)}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-1 lg:items-end">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Trophy className="size-4 text-primary" />
              Season Aggregate
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">
              {games.length} game{games.length === 1 ? '' : 's'} ·{' '}
              {snapResults.length} snaps
            </div>
          </div>
        )}
      </header>

      {/* ============================================================
          States
         ============================================================ */}
      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
          <span className="text-sm">Loading analytics…</span>
        </div>
      ) : isError ? (
        <Card className="flex h-64 flex-col items-center justify-center gap-2 border-destructive/40 text-destructive">
          <Target className="size-10 opacity-60" />
          <span className="text-sm">Failed to load analytics data.</span>
          <span className="text-xs text-muted-foreground">
            Check that /api/gridiron is reachable.
          </span>
        </Card>
      ) : games.length === 0 && snapResults.length === 0 ? (
        <Card className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
          <Activity className="size-10 opacity-50" />
          <span className="text-sm">
            No game or snap data in the database yet.
          </span>
        </Card>
      ) : (
        <>
          {/* 2. KPI cards */}
          <section>
            <SectionLabel icon={<Activity className="size-3.5" />}>
              Key Performance Indicators
            </SectionLabel>
            <div className="mt-2">
              <KpiCards summary={summary} baseline={seasonBaseline} />
            </div>
          </section>

          {/* 3. Concept performance table */}
          <section>
            <SectionLabel icon={<BarChart3 className="size-3.5" />}>
              Concept Performance
            </SectionLabel>
            <div className="mt-2">
              <ConceptTable rows={conceptPerformance} />
            </div>
          </section>

          {/* 4. Two-column charts */}
          <section>
            <SectionLabel icon={<BarChart3 className="size-3.5" />}>
              Visual Breakdown
            </SectionLabel>
            <div className="mt-2">
              <AnalyticsCharts rows={conceptPerformance} summary={summary} />
            </div>
          </section>

          {/* 5. Self-scout warnings */}
          <section>
            <SelfScoutWarnings
              rows={conceptPerformance}
              summary={summary}
            />
          </section>

          {/* 6. Game log */}
          <section>
            <SectionLabel icon={<Trophy className="size-3.5" />}>
              Game Log
            </SectionLabel>
            <div className="mt-2">
              <GameLogTable rows={gameLog} />
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function SectionLabel({
  children,
  icon,
}: {
  children: React.ReactNode
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {children}
      </span>
    </div>
  )
}

function formatResult(g: GameRow): string {
  if (g.result === 'W' || g.result === 'L' || g.result === 'T') {
    return `${g.result} ${g.ourScore ?? 0}-${g.oppScore ?? 0}`
  }
  if (g.ourScore !== null && g.oppScore !== null) {
    return `${g.ourScore}-${g.oppScore}`
  }
  return '—'
}

// ----------------------------------------------------------------------------
//  Game log table
// ----------------------------------------------------------------------------

interface GameLogRow {
  game: GameRow
  summary: GameSummary
  topConcept: ConceptPerformance | null
  totalYards: number
}

function GameLogTable({ rows }: { rows: GameLogRow[] }) {
  if (rows.length === 0) {
    return (
      <Card className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        No games in the database yet.
      </Card>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border/60 hover:bg-transparent">
            <TableHead className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Week
            </TableHead>
            <TableHead className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Opponent
            </TableHead>
            <TableHead className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Result
            </TableHead>
            <TableHead className="text-right font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Plays
            </TableHead>
            <TableHead className="text-right font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Yards
            </TableHead>
            <TableHead className="text-right font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Succ %
            </TableHead>
            <TableHead className="text-right font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Exp %
            </TableHead>
            <TableHead className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Top Concept
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => {
            const s = r.summary
            const total = s.totalPlays
            const expPct = total ? (s.explosives / total) * 100 : 0
            const oppName = r.game.opponent?.name ?? '—'
            return (
              <TableRow key={r.game.id} className="hover:bg-muted/30">
                <TableCell className="font-mono font-medium tabular-nums">
                  {r.game.week}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {oppName}
                  <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {r.game.location}
                  </span>
                </TableCell>
                <TableCell>
                  <ResultBadge
                    result={r.game.result}
                    ourScore={r.game.ourScore}
                    oppScore={r.game.oppScore}
                  />
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {total}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {r.totalYards}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {s.successRate.toFixed(1)}%
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {expPct.toFixed(1)}%
                </TableCell>
                <TableCell className="font-medium">
                  {r.topConcept ? r.topConcept.concept : '—'}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function ResultBadge({
  result,
  ourScore,
  oppScore,
}: {
  result: string | null
  ourScore: number | null
  oppScore: number | null
}) {
  if (result === 'W') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/15 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
        W {ourScore ?? 0}-{oppScore ?? 0}
      </span>
    )
  }
  if (result === 'L') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/15 px-2 py-0.5 font-mono text-xs font-semibold text-destructive">
        L {ourScore ?? 0}-{oppScore ?? 0}
      </span>
    )
  }
  if (result === 'T') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-muted-foreground">
        T {ourScore ?? 0}-{oppScore ?? 0}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
      —
    </span>
  )
}
