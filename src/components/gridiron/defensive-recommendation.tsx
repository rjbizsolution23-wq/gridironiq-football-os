'use client'

/**
 * ScoutIQ™ — Defensive Recommendation callout panel.
 *
 * Rule-based (deterministic) recommendations derived from the opponent's
 * tendency rows. Each recommendation surfaces:
 *   - Trigger condition (what the opponent does that we're exploiting)
 *   - Headline recommendation
 *   - Coverage behind
 *   - Pressure / rush plan
 *   - Coaching point
 *
 * Same opponent → same recommendations every time.
 */

import * as React from 'react'
import { AlertTriangle, Shield, Target } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import {
  buildDefensiveRecommendations,
  type DefensiveRecommendation,
  type OpponentSnapshot,
} from './scout-utils'

interface DefensiveRecommendationPanelProps {
  opponent: OpponentSnapshot
}

const PRIORITY_BADGE: Record<
  DefensiveRecommendation['priority'],
  { label: string; className: string; iconClassName: string }
> = {
  high: {
    label: 'High priority',
    className: 'border-destructive/30 bg-destructive/15 text-destructive',
    iconClassName: 'text-destructive',
  },
  medium: {
    label: 'Situational',
    className: 'border-chart-3/30 bg-chart-3/15 text-chart-3',
    iconClassName: 'text-chart-3',
  },
  low: {
    label: 'Base',
    className: 'border-border bg-muted text-muted-foreground',
    iconClassName: 'text-muted-foreground',
  },
}

export function DefensiveRecommendationPanel({
  opponent,
}: DefensiveRecommendationPanelProps) {
  const recs = React.useMemo(
    () => buildDefensiveRecommendations(opponent),
    [opponent],
  )

  return (
    <Card className="rounded-lg border border-border bg-card p-4">
      <header className="mb-3 flex items-center gap-2">
        <Shield className="size-3.5 text-muted-foreground" />
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Defensive Recommendation
        </span>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">
          {recs.length} call{recs.length === 1 ? '' : 's'} · auto-generated
        </span>
      </header>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {recs.map((r) => {
          const pr = PRIORITY_BADGE[r.priority]
          return (
            <div
              key={r.id}
              className={cn(
                'rounded-lg border bg-muted/20 p-3 transition-colors',
                'hover:border-primary/40',
                r.priority === 'high'
                  ? 'border-destructive/30 bg-destructive/5'
                  : 'border-border/60',
              )}
            >
              {/* Header */}
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    className={cn(
                      'mt-0.5 size-4 shrink-0',
                      pr.iconClassName,
                    )}
                  />
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {r.recommendation}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {r.trigger}
                    </div>
                  </div>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-md border px-1.5 py-0.5 font-mono text-[10px]',
                    pr.className,
                  )}
                >
                  {pr.label}
                </span>
              </div>

              {/* Coverage + Pressure */}
              <dl className="grid grid-cols-1 gap-1.5 text-[11px] sm:grid-cols-2">
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Coverage
                  </dt>
                  <dd className="text-foreground">{r.coverage}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Pressure
                  </dt>
                  <dd className="text-foreground">{r.pressure}</dd>
                </div>
              </dl>

              {/* Coaching point callout */}
              <div className="mt-2 rounded-md border border-accent/20 bg-accent/5 p-2">
                <div className="flex items-center gap-1.5">
                  <Target className="size-3 text-accent" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-accent">
                    Coaching Point
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-foreground/85">
                  {r.coachingPoint}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default DefensiveRecommendationPanel
