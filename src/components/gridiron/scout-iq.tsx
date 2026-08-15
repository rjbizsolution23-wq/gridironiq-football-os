'use client'

/**
 * ScoutIQ™ — Opponent tendency intelligence dashboard.
 *
 * Self-contained: ships its own React Query client. Reads the shared
 * Zustand `selectedOpponentId` — if null, defaults to the first opponent
 * and persists that back to the store so other modules see the same
 * opponent.
 *
 * Layout (top → bottom):
 *   1. Header: opponent selector + opponent identity strip
 *   2. Scout Summary card (auto-generated, deterministic)
 *   3. Conditional Probability Matrix (heatmap)
 *   4. Two-column: Situation Breakdown (left) + Coverage/Pressure chart (right)
 *   5. Defensive Recommendation callout panel
 *
 * Natural page scroll — no internal overflow containers trap scroll.
 */

import * as React from 'react'
import { useEffect, useMemo, useState } from 'react'
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import {
  Activity,
  Crosshair,
  Loader2,
  Target,
  TrendingUp,
} from 'lucide-react'

import { useAppStore } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { TendencyHeatmap } from './tendency-heatmap'
import { CoveragePressureChart } from './coverage-pressure-chart'
import { SituationBreakdown } from './situation-breakdown'
import { DefensiveRecommendationPanel } from './defensive-recommendation'
import {
  buildScoutSummary,
  type OpponentSnapshot,
  type SnapResultRow,
} from './scout-utils'

// ----------------------------------------------------------------------------
//  Data fetching
// ----------------------------------------------------------------------------

interface GridironApiResponse {
  opponents: OpponentSnapshot[]
  snapResults: SnapResultRow[]
}

function useGridironScout() {
  return useQuery<GridironApiResponse>({
    queryKey: ['gridiron'],
    queryFn: async () => {
      const r = await fetch('/api/gridiron')
      if (!r.ok) throw new Error('failed to load scout data')
      return (await r.json()) as GridironApiResponse
    },
  })
}

// ----------------------------------------------------------------------------
//  Main module
// ----------------------------------------------------------------------------

export default function ScoutIQ() {
  // Each instance gets its own React Query client — keeps the module
  // self-contained; the integrator does not need to wire a provider.
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
      <ScoutIQBody />
    </QueryClientProvider>
  )
}

function ScoutIQBody() {
  const { data, isLoading, isError } = useGridironScout()

  const selectedOpponentId = useAppStore((s) => s.selectedOpponentId)
  const setSelectedOpponentId = useAppStore((s) => s.setSelectedOpponentId)

  const opponents = data?.opponents ?? []
  const snapResults = data?.snapResults ?? []

  // Derive the effective opponent id — fall back to the first opponent
  // when nothing has been selected yet. Pure derivation (useMemo-friendly).
  const currentOpponentId =
    selectedOpponentId ?? opponents[0]?.id ?? null

  // Persist the derived default back to the store so other modules
  // (GameplanIQ, CallSheet, …) see the same opponent. This is a
  // side-effect of persisting state, not derived state.
  useEffect(() => {
    if (currentOpponentId && currentOpponentId !== selectedOpponentId) {
      setSelectedOpponentId(currentOpponentId)
    }
  }, [currentOpponentId, selectedOpponentId, setSelectedOpponentId])

  const currentOpponent = useMemo(
    () => opponents.find((o) => o.id === currentOpponentId) ?? null,
    [opponents, currentOpponentId],
  )

  const summary = useMemo(
    () => (currentOpponent ? buildScoutSummary(currentOpponent) : null),
    [currentOpponent],
  )

  // Snap results for this opponent only (drives the coverage/pressure chart).
  const opponentSnaps = useMemo(
    () => snapResults.filter((s) => s.opponentId === currentOpponentId),
    [snapResults, currentOpponentId],
  )

  const gamesCount = currentOpponent?.games?.length ?? 0

  return (
    <div className="flex flex-col gap-4 p-3 lg:p-4">
      {/* ============================================================
          1. Header — opponent selector + identity strip
         ============================================================ */}
      <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              GridironIQ™
            </div>
            <h2 className="text-base font-semibold tracking-tight">ScoutIQ</h2>
          </div>

          <Select
            value={currentOpponentId ?? ''}
            onValueChange={(v) => v && setSelectedOpponentId(v)}
          >
            <SelectTrigger
              className="w-[260px]"
              aria-label="Select opponent"
            >
              <SelectValue placeholder="Select opponent…" />
            </SelectTrigger>
            <SelectContent>
              {opponents.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name}
                  {o.mascot ? ` ${o.mascot}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentOpponent && (
          <div className="flex flex-col items-start gap-1 lg:items-end">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Crosshair className="size-4 text-primary" />
              {currentOpponent.name}
              {currentOpponent.mascot ? ` ${currentOpponent.mascot}` : ''}
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">
              {currentOpponent.league ?? 'No league'} · {gamesCount} game
              {gamesCount === 1 ? '' : 's'}
            </div>
          </div>
        )}
      </header>

      {/* ============================================================
          States — loading / error / empty
         ============================================================ */}
      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
          <span className="text-sm">Loading scout data…</span>
        </div>
      ) : isError ? (
        <Card className="flex h-64 flex-col items-center justify-center gap-2 border-destructive/40 text-destructive">
          <Target className="size-10 opacity-60" />
          <span className="text-sm">Failed to load scout data.</span>
          <span className="text-xs text-muted-foreground">
            Check that /api/gridiron is reachable.
          </span>
        </Card>
      ) : opponents.length === 0 ? (
        <Card className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
          <Target className="size-10 opacity-50" />
          <span className="text-sm">No opponents in the database yet.</span>
        </Card>
      ) : !currentOpponent || !summary ? (
        <Card className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
          <Target className="size-10 opacity-50" />
          <span className="text-sm">No opponent selected.</span>
        </Card>
      ) : (
        <>
          {/* ========================================================
              2. Scout Summary (auto-generated, deterministic)
             ======================================================== */}
          <Card className="rounded-lg border border-border bg-card p-4">
            <header className="mb-2 flex items-center gap-2">
              <Activity className="size-3.5 text-muted-foreground" />
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Scout Summary
              </span>
              <Badge
                variant="outline"
                className="ml-auto font-mono text-[10px]"
              >
                {summary.totalSamples} charted snaps
              </Badge>
            </header>

            <p className="text-sm leading-relaxed text-foreground/90">
              {summary.summary}
            </p>

            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <SummaryStat
                label="Top formation"
                value={summary.topFormation}
              />
              <SummaryStat
                label="Run / Pass"
                value={`${summary.overallRunPass.run}% / ${summary.overallRunPass.pass}%`}
              />
              <SummaryStat
                label="3rd-down"
                value={summary.thirdDownTendency.split('—')[0].trim()}
              />
              <SummaryStat
                label="Red zone"
                value={summary.redZoneTendency.split('—')[0].trim()}
              />
            </div>

            {summary.topConcepts.length > 0 && (
              <div className="mt-3 border-t border-border/50 pt-2">
                <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Top concepts by probability × sample
                </div>
                <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  {summary.topConcepts.map((c) => (
                    <li
                      key={c.concept}
                      className="flex items-baseline gap-1.5"
                    >
                      <span className="font-medium text-foreground">
                        {c.concept}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {Math.round(c.prob * 100)}% · n={c.sample}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* ========================================================
              3. Conditional Probability Matrix (heatmap)
             ======================================================== */}
          <TendencyHeatmap opponent={currentOpponent} />

          {/* ========================================================
              4. Situation Breakdown + Coverage/Pressure chart
             ======================================================== */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <section className="lg:col-span-7">
              <header className="mb-2 flex items-center gap-2">
                <TrendingUp className="size-3.5 text-muted-foreground" />
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Situation Breakdown
                </span>
              </header>
              <SituationBreakdown opponent={currentOpponent} />
            </section>
            <section className="lg:col-span-5">
              <CoveragePressureChart snapResults={opponentSnaps} />
            </section>
          </div>

          {/* ========================================================
              5. Defensive Recommendation callout panel
             ======================================================== */}
          <DefensiveRecommendationPanel opponent={currentOpponent} />
        </>
      )}
    </div>
  )
}

// ----------------------------------------------------------------------------
//  Small presentational helpers
// ----------------------------------------------------------------------------

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/50 bg-muted/20 p-2">
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 truncate text-xs font-medium text-foreground">
        {value}
      </div>
    </div>
  )
}
