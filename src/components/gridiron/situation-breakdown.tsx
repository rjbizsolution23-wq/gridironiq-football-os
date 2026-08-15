'use client'

/**
 * ScoutIQ™ — Situation Breakdown Cards.
 *
 * Grid of cards for: 1st & 10, 2nd & Long, 3rd & Short (1-3),
 * 3rd & Medium (4-6), 3rd & Long (7+), Red Zone.
 *
 * Each card shows:
 *   - Run/Pass split bar (primary green = run, gold = pass)
 *   - Top concepts (by probability × sample)
 *   - Sample size badge
 *   - Confidence badge (HIGH/MEDIUM/LOW with tooltip on LOW)
 */

import * as React from 'react'
import { TrendingUp } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import {
  BREAKDOWN_SITUATIONS,
  CONFIDENCE_BADGE_CLASS,
  SITUATION_DESCRIPTIONS,
  SITUATION_LABELS,
  confidenceFromSample,
  type OpponentSnapshot,
  type TendencyRow,
} from './scout-utils'

interface SituationBreakdownProps {
  opponent: OpponentSnapshot
}

export function SituationBreakdown({ opponent }: SituationBreakdownProps) {
  const tendencies = opponent.tendencies ?? []

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {BREAKDOWN_SITUATIONS.map((sit) => {
        const rows = tendencies.filter((t) => t.situation === sit)
        const totalSample = rows.reduce((a, t) => a + t.sampleSize, 0)
        const confLevel = confidenceFromSample(totalSample)

        // Pass/run weights within this situation (sample × probability).
        let passW = 0
        let runW = 0
        for (const t of rows) {
          const w = t.probability * t.sampleSize
          if (t.result === 'pass') passW += w
          else if (t.result === 'run') runW += w
        }
        const total = passW + runW
        const passPct = total > 0 ? Math.round((passW / total) * 100) : 0
        const runPct = total > 0 ? 100 - passPct : 0

        const topConcepts = [...rows]
          .sort(
            (a, b) =>
              b.probability * b.sampleSize - a.probability * a.sampleSize,
          )
          .slice(0, 3)

        return (
          <Card
            key={sit}
            className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
          >
            <header className="mb-2 flex items-start justify-between gap-2">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {SITUATION_LABELS[sit] ?? sit}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {SITUATION_DESCRIPTIONS[sit] ?? ''}
                </div>
              </div>
              <ConfidenceBadge level={confLevel} />
            </header>

            {total === 0 ? (
              <div className="py-3 text-center text-xs text-muted-foreground">
                No charted data
              </div>
            ) : (
              <>
                {/* Run/Pass bar */}
                <div className="mb-1.5 flex items-center gap-2">
                  <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-muted/40">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${runPct}%` }}
                    />
                    <div
                      className="h-full bg-chart-3"
                      style={{ width: `${passPct}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    n={totalSample}
                  </span>
                </div>
                <div className="mb-2 flex items-center justify-between font-mono text-[10px]">
                  <span className="text-primary">{runPct}% RUN</span>
                  <span className="text-chart-3">{passPct}% PASS</span>
                </div>

                {/* Top concepts */}
                <ul className="space-y-1">
                  {topConcepts.map((c) => (
                    <li
                      key={`${sit}-${c.id}`}
                      className="flex items-center justify-between gap-2 text-[11px]"
                    >
                      <span className="truncate text-foreground">{c.value}</span>
                      <span className="shrink-0 font-mono text-muted-foreground">
                        {Math.round(c.probability * 100)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>
        )
      })}
    </div>
  )
}

/**
 * Confidence badge with "limited sample" tooltip for LOW-confidence readings.
 */
function ConfidenceBadge({
  level,
}: {
  level: ReturnType<typeof confidenceFromSample>
}) {
  if (level === 'LOW') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              'cursor-help text-[10px]',
              CONFIDENCE_BADGE_CLASS.LOW,
            )}
          >
            LOW
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="border border-border bg-popover text-popover-foreground">
          Limited sample — treat with caution
        </TooltipContent>
      </Tooltip>
    )
  }
  return (
    <Badge
      variant="outline"
      className={cn('text-[10px]', CONFIDENCE_BADGE_CLASS[level])}
    >
      {level}
    </Badge>
  )
}

export default SituationBreakdown
