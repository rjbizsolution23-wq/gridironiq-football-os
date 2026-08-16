'use client'

/**
 * PlaybookIQ™ — Play Card
 * Polished card used in the play list. Color-coded concept badge, mono play
 * code, formation/personnel/motion chips, and family lineage. Subtle hover
 * scale + glow-ring on the selected card.
 */

import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { SerializedPlay } from '@/lib/data'

// ----------------------------------------------------------------------------
//  Concept classification
// ----------------------------------------------------------------------------

export type ConceptKind =
  | 'run'
  | 'pass'
  | 'rpo'
  | 'play_action'
  | 'boot'
  | 'screen'
  | 'shot'
  | 'defense'

/**
 * Classify a play's raw concept string into a UI concept kind.
 * Defensive plays always resolve to `defense`. Offensive concepts are
 * classified by substring matches.
 */
export function classifyConcept(concept: string, side: string): ConceptKind {
  const c = (concept ?? '').toLowerCase()
  if (side === 'defense') return 'defense'
  if (c.includes('rpo')) return 'rpo'
  if (c.includes('screen') || c.includes('tunnel') || c.includes('bubble')) return 'screen'
  if (c.includes('boot')) return 'boot'
  if (c.includes('pa_') || c.includes('play_action') || c.startsWith('pa_')) return 'play_action'
  if (
    c.includes('shot') ||
    c.includes('post_wheel') ||
    c.includes('four_vert') ||
    c.includes('y_cross')
  ) {
    return 'shot'
  }
  if (
    ['mesh', 'stick', 'flood', 'spacing', 'snag', 'levels', 'sail', 'dagger', 'mills', 'smash', 'drive', 'shallow', 'scissors'].some(
      (k) => c.includes(k),
    )
  ) {
    return 'pass'
  }
  return 'run'
}

// ----------------------------------------------------------------------------
//  Visual styling
// ----------------------------------------------------------------------------

/** Tailwind classes for each concept badge — uses theme tokens, NO indigo/blue. */
export const CONCEPT_BADGE_CLASS: Record<ConceptKind, string> = {
  run: 'bg-primary/15 text-primary border-primary/30',
  pass: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  rpo: 'bg-accent/20 text-accent border-accent/40',
  play_action: 'bg-chart-5/15 text-chart-5 border-chart-5/30',
  boot: 'bg-chart-5/15 text-chart-5 border-chart-5/30',
  screen: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  shot: 'bg-destructive/15 text-destructive border-destructive/30',
  defense: 'bg-chart-5/15 text-chart-5 border-chart-5/30',
}

/** Human-readable label for each concept kind. */
export const CONCEPT_LABEL: Record<ConceptKind, string> = {
  run: 'Run',
  pass: 'Pass',
  rpo: 'RPO',
  play_action: 'Play Action',
  boot: 'Boot',
  screen: 'Screen',
  shot: 'Shot',
  defense: 'Defense',
}

// ----------------------------------------------------------------------------
//  Play card component
// ----------------------------------------------------------------------------

export interface PlayCardProps {
  play: SerializedPlay
  selected?: boolean
  onSelect?: (id: string) => void
}

export function PlayCard({ play, selected, onSelect }: PlayCardProps) {
  const conceptKind = classifyConcept(play.concept, play.side)
  const familyName = play.family?.name ?? 'Unassigned'
  const formationCode = play.formation?.code

  const handleSelect = React.useCallback(() => {
    onSelect?.(play.id)
  }, [onSelect, play.id])

  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSelect()
    }
  }

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={handleKey}
      aria-pressed={selected}
      className={cn(
        'group cursor-pointer gap-3 px-4 py-3 transition-all',
        'hover:scale-[1.01] hover:shadow-lg hover:border-primary/40',
        selected && 'border-primary/60 glow-ring',
      )}
    >
      {/* Top row: code + name (left), concept badge (right) */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="font-mono text-xs tracking-tight text-muted-foreground">
            {play.playId}
          </span>
          <div className="truncate text-sm font-semibold leading-tight">
            {play.name}
          </div>
          <div className="truncate text-xs text-muted-foreground">{familyName}</div>
        </div>
        <Badge
          variant="outline"
          className={cn('shrink-0 border', CONCEPT_BADGE_CLASS[conceptKind])}
        >
          {CONCEPT_LABEL[conceptKind]}
        </Badge>
      </div>

      {/* Chips row: formation code, personnel, motion */}
      <div className="flex flex-wrap items-center gap-1.5">
        {formationCode && (
          <Badge variant="secondary" className="font-mono text-[10px] tracking-tight">
            {formationCode.replace(/_/g, ' ')}
          </Badge>
        )}
        {play.personnel && (
          <Badge variant="outline" className="font-mono text-[10px]">
            {play.personnel} pers
          </Badge>
        )}
        {play.motion && (
          <Badge variant="outline" className="text-[10px]">
            {play.motion}
          </Badge>
        )}
      </div>

      {/* Coverage targets */}
      {play.coverageTargets.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {play.coverageTargets.slice(0, 5).map((c) => (
            <span
              key={c}
              className="text-[10px] uppercase tracking-wide text-muted-foreground/80"
            >
              {c.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}
    </Card>
  )
}

export default PlayCard
