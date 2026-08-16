'use client'

/**
 * AnalyticsIQ™ — KPI cards row.
 *
 * Renders 6 metric cards (Total Plays, Yards/Play, Success Rate, Explosives,
 * Negatives, Pass/Run Ratio) from a GameSummary. When a `baseline` summary is
 * provided (e.g. the season aggregate while viewing a single game), each card
 * shows a small trend arrow comparing current vs baseline.
 *
 * Theme tokens only — primary green, accent orange, destructive red, chart-3
 * gold. NO indigo / blue.
 */

import * as React from 'react'
import {
  Activity,
  BarChart3,
  Minus,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import type { GameSummary } from '@/lib/data'

interface KpiCardsProps {
  summary: GameSummary
  /** Season aggregate, used for trend comparison when viewing a single game. */
  baseline?: GameSummary | null
}

type Trend = 'up' | 'down' | 'flat'

interface KpiCardDef {
  key: string
  label: string
  value: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  trend?: Trend
  trendHint?: string
  /** When true, "up" trend is bad (red) and "down" is good (green). */
  inverse?: boolean
}

export function KpiCards({ summary, baseline }: KpiCardsProps) {
  const cards = React.useMemo<KpiCardDef[]>(() => {
    const total = summary.totalPlays
    const passPct = ratioPct(summary.passRunRatio, 'pass')
    const runPct = ratioPct(summary.passRunRatio, 'run')
    const passBasePct = baseline ? ratioPct(baseline.passRunRatio, 'pass') : null

    const yppDelta = baseline ? round1(summary.yardsPerPlay - baseline.yardsPerPlay) : null
    const srDelta = baseline ? round1(summary.successRate - baseline.successRate) : null
    const expDelta = baseline ? summary.explosives - baseline.explosives : null
    const negDelta = baseline ? summary.negatives - baseline.negatives : null

    return [
      {
        key: 'total',
        label: 'Total Plays',
        value: String(total),
        subtitle: total > 0 ? 'snaps charted' : 'no data',
        icon: Activity,
      },
      {
        key: 'ypp',
        label: 'Yards / Play',
        value: summary.yardsPerPlay.toFixed(1),
        subtitle: 'avg gain',
        icon: TrendingUp,
        trend: trendFromDelta(yppDelta, 0.05),
        trendHint:
          yppDelta === null
            ? undefined
            : `vs season ${yppDelta >= 0 ? '+' : ''}${yppDelta.toFixed(1)}`,
      },
      {
        key: 'sr',
        label: 'Success Rate',
        value: `${summary.successRate.toFixed(1)}%`,
        subtitle: 'successes / total',
        icon: Target,
        trend: trendFromDelta(srDelta, 0.5),
        trendHint:
          srDelta === null
            ? undefined
            : `vs season ${srDelta >= 0 ? '+' : ''}${srDelta.toFixed(1)}pt`,
      },
      {
        key: 'exp',
        label: 'Explosives',
        value: String(summary.explosives),
        subtitle: `${pctLabel(summary.explosives, total)} of plays`,
        icon: Zap,
        trend: trendFromDelta(expDelta, 0),
        trendHint:
          expDelta === null
            ? undefined
            : `vs season ${expDelta >= 0 ? '+' : ''}${expDelta}`,
      },
      {
        key: 'neg',
        label: 'Negatives',
        value: String(summary.negatives),
        subtitle: `${pctLabel(summary.negatives, total)} of plays`,
        icon: TrendingDown,
        trend: trendFromDelta(negDelta, 0),
        trendHint:
          negDelta === null
            ? undefined
            : `vs season ${negDelta >= 0 ? '+' : ''}${negDelta}`,
        inverse: true,
      },
      {
        key: 'pr',
        label: 'Pass / Run',
        value: `${passPct}% / ${runPct}%`,
        subtitle: `${summary.passRunRatio.pass}p / ${summary.passRunRatio.run}r`,
        icon: BarChart3,
        trend:
          passBasePct === null
            ? undefined
            : trendFromDelta(passPct - passBasePct, 1),
        trendHint:
          passBasePct === null
            ? undefined
            : `pass vs season ${
                passPct - passBasePct >= 0 ? '+' : ''
              }${Math.round(passPct - passBasePct)}pt`,
      },
    ]
  }, [summary, baseline])

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {cards.map((c) => (
        <KpiCard key={c.key} def={c} />
      ))}
    </div>
  )
}

function KpiCard({ def }: { def: KpiCardDef }) {
  const Icon = def.icon
  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-5 transition-colors hover:border-primary/30">
      <div className="flex items-start justify-between gap-2">
        <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {def.label}
        </div>
        <Icon className="size-3.5 text-muted-foreground/70" />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="font-mono text-xl font-bold tabular-nums text-foreground sm:text-2xl lg:text-3xl">
          {def.value}
        </div>
        {def.trend ? <TrendArrow trend={def.trend} inverse={def.inverse} /> : null}
      </div>
      <div className="mt-1 truncate text-[11px] text-muted-foreground">
        {def.subtitle}
      </div>
      {def.trendHint ? (
        <div className="mt-0.5 font-mono text-[10px] text-muted-foreground/80">
          {def.trendHint}
        </div>
      ) : null}
    </div>
  )
}

function TrendArrow({ trend, inverse }: { trend: Trend; inverse?: boolean }) {
  if (trend === 'flat') {
    return <Minus className="size-3.5 text-muted-foreground/60" />
  }
  const isUp = trend === 'up'
  const isGood = inverse ? !isUp : isUp
  const Icon = isUp ? TrendingUp : TrendingDown
  return (
    <Icon
      className={cn(
        'size-3.5',
        isGood ? 'text-primary' : 'text-destructive',
      )}
    />
  )
}

// ---- helpers -------------------------------------------------------------

function trendFromDelta(delta: number | null, threshold: number): Trend {
  if (delta === null) return 'flat'
  if (delta > threshold) return 'up'
  if (delta < -threshold) return 'down'
  return 'flat'
}

function ratioPct(ratio: { pass: number; run: number }, side: 'pass' | 'run'): number {
  const t = ratio.pass + ratio.run
  if (!t) return 0
  return Math.round(((side === 'pass' ? ratio.pass : ratio.run) / t) * 100)
}

function pctLabel(num: number, total: number): string {
  if (!total) return '0%'
  return `${Math.round((num / total) * 100)}%`
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

export default KpiCards
