'use client'

/**
 * RecommendationCard — single play recommendation rendered inside the
 * Situation Rec view. Always wrapped by the parent in a grid; the card
 * itself is a self-contained surface.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────┐
 *   │ ① rank badge  |  #rank · playId           ▶  │
 *   │                  Play Name                  │
 *   │                  concept                     │
 *   │   Rationale: …                              │
 *   │   Exp. Defensive Reaction: …               │
 *   │   Complementary: …                          │
 *   │   ╭──────────────────────────────────────╮  │
 *   │   │ EXPLAINABILITY: …                     │  │
 *   │   ╰──────────────────────────────────────╯  │
 *   └──────────────────────────────────────────────┘
 */

import * as React from 'react'
import { Crosshair, Play } from 'lucide-react'

export interface Recommendation {
  rank: number
  playId: string
  name: string
  concept: string
  rationale: string
  expectedDefensiveReaction: string
  complementaryPlay: string
  explanation: string
}

interface RecommendationCardProps {
  recommendation: Recommendation
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/40 transition-colors">
      {/* Headline */}
      <div className="flex items-start gap-3">
        <div className="size-8 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
          {recommendation.rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-mono text-[11px] text-muted-foreground">
              #{recommendation.rank}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              · {recommendation.playId}
            </span>
          </div>
          <h4 className="text-base font-semibold tracking-tight leading-tight">
            {recommendation.name || 'Untitled play'}
          </h4>
          {recommendation.concept && (
            <div className="mt-0.5 text-xs text-muted-foreground">
              {recommendation.concept}
            </div>
          )}
        </div>
        <Play className="size-4 text-primary/60 shrink-0 mt-1" />
      </div>

      {/* Detail fields */}
      <dl className="mt-3 flex flex-col gap-2 text-sm">
        <Field label="Rationale" value={recommendation.rationale} />
        <Field
          label="Exp. Defensive Reaction"
          value={recommendation.expectedDefensiveReaction}
          icon={<Crosshair className="size-3" />}
        />
        <Field label="Complementary" value={recommendation.complementaryPlay} />
      </dl>

      {/* Explainability callout */}
      {recommendation.explanation && (
        <div className="mt-3 rounded-md border border-primary/30 bg-primary/5 p-2.5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
            Explainability
          </div>
          <p className="mt-1 text-xs leading-relaxed text-foreground/90">
            {recommendation.explanation}
          </p>
        </div>
      )}
    </div>
  )
}

// ----------------------------------------------------------------------------
//  Field — label / value row used inside the <dl>.
//  Label column is fixed width on sm+ so values align across cards.
// ----------------------------------------------------------------------------

function Field({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[150px_1fr] gap-2 items-baseline sm:grid-cols-[170px_1fr]">
      <dt className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="text-sm leading-relaxed text-foreground/90">
        {value || '—'}
      </dd>
    </div>
  )
}
