'use client'

/**
 * PlaybookIQ™ — Play DNA™ Panel
 * Renders the full structured DNA of a single play:
 *   • Stat tile grid (read type, read defender, protection, QB footwork)
 *   • Constraint / preferred fronts / coverage targets / field zones chip lists
 *   • Assignments table (position / alignment / assignment / landmark / vsMan / vsZone)
 *   • Routes table (player / route / depth) — only for pass-like concepts
 *   • Coaching points callout with accent border
 *   • Complementary plays as clickable chips that switch the selected play
 */

import * as React from 'react'
import {
  Compass,
  Crosshair,
  Footprints,
  Layers,
  Lightbulb,
  Link2,
  Shield,
  Target,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { SerializedPlay } from '@/lib/data'

import {
  classifyConcept,
  type ConceptKind,
  CONCEPT_BADGE_CLASS,
  CONCEPT_LABEL,
} from './play-card'

// ----------------------------------------------------------------------------
//  Small presentational helpers
// ----------------------------------------------------------------------------

function StatTile({
  label,
  value,
  mono = true,
}: {
  label: string
  value: string | null | undefined
  mono?: boolean
}) {
  const isEmpty = !value || value.trim() === ''
  return (
    <div className="rounded-md border bg-muted/30 p-2.5">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          'mt-1 text-sm leading-tight',
          mono && 'font-mono',
          isEmpty && 'text-muted-foreground/50',
        )}
      >
        {isEmpty ? '—' : value!.replace(/_/g, ' ')}
      </div>
    </div>
  )
}

function ChipList({
  title,
  items,
  icon,
}: {
  title: string
  items: string[]
  icon: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground/50">—</div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((i) => (
            <Badge
              key={i}
              variant="outline"
              className="font-mono text-[10px] tracking-tight"
            >
              {i.replace(/_/g, ' ')}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

// ----------------------------------------------------------------------------
//  Section header
// ----------------------------------------------------------------------------

function SectionLabel({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="mb-2 flex items-center gap-1.5">
      {icon}
      <span className="text-sm font-semibold">{children}</span>
    </div>
  )
}

// ----------------------------------------------------------------------------
//  Main panel
// ----------------------------------------------------------------------------

export interface PlayDnaPanelProps {
  play: SerializedPlay
  allPlays: SerializedPlay[]
  onSelectComplementary?: (id: string) => void
}

export function PlayDnaPanel({
  play,
  allPlays,
  onSelectComplementary,
}: PlayDnaPanelProps) {
  const conceptKind = classifyConcept(play.concept, play.side)

  // Routes table shows for pass-like concepts only
  const passLike: ConceptKind[] = [
    'pass',
    'rpo',
    'play_action',
    'screen',
    'shot',
    'boot',
  ]
  const hasRoutes = passLike.includes(conceptKind) && play.routes.length > 0

  // Resolve complementary plays from the all-plays list (complementary is array of playId strings)
  const complementaryPlays = play.complementary
    .map((pid) => allPlays.find((p) => p.playId === pid))
    .filter((p): p is SerializedPlay => Boolean(p))

  return (
    <Card className="gap-0 overflow-hidden">
      {/* Header */}
      <CardHeader className="px-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-mono text-xs tracking-tight text-muted-foreground">
              {play.playId}
            </div>
            <CardTitle className="mt-1 leading-tight">{play.name}</CardTitle>
            <CardDescription className="mt-1 truncate">
              {play.family?.name ?? 'Unassigned'}
              {play.formation ? ` · ${play.formation.name}` : ''}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={cn('shrink-0 border', CONCEPT_BADGE_CLASS[conceptKind])}
          >
            {CONCEPT_LABEL[conceptKind]}
          </Badge>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="space-y-5 px-4 py-4">
        {/* DNA stat tile grid */}
        <div className="grid grid-cols-2 gap-2">
          <StatTile label="Read Type" value={play.readType} />
          <StatTile label="Read Defender" value={play.readDefender} />
          <StatTile label="Protection" value={play.protection} />
          <StatTile label="QB Footwork" value={play.qbFootwork} />
        </div>

        {/* Constraint chips */}
        <div className="space-y-3">
          <ChipList
            title="Constraints"
            items={play.constraints}
            icon={<Compass className="size-3.5 text-accent" />}
          />
          <ChipList
            title="Preferred Fronts"
            items={play.preferredFronts}
            icon={<Layers className="size-3.5 text-primary" />}
          />
          <ChipList
            title="Coverage Targets"
            items={play.coverageTargets}
            icon={<Shield className="size-3.5 text-chart-5" />}
          />
          <ChipList
            title="Field Zones"
            items={play.fieldZones}
            icon={<Target className="size-3.5 text-chart-3" />}
          />
        </div>

        {/* Assignments table */}
        {play.assignments.length > 0 && (
          <div>
            <SectionLabel icon={<Crosshair className="size-4 text-primary" />}>
              Assignments
            </SectionLabel>
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="h-8 font-mono text-[10px] uppercase tracking-wide">
                      Pos
                    </TableHead>
                    <TableHead className="h-8 text-[10px] uppercase tracking-wide">
                      Align
                    </TableHead>
                    <TableHead className="h-8 text-[10px] uppercase tracking-wide">
                      Assignment
                    </TableHead>
                    <TableHead className="h-8 text-[10px] uppercase tracking-wide">
                      Landmark
                    </TableHead>
                    <TableHead className="h-8 text-[10px] uppercase tracking-wide">
                      vs Man
                    </TableHead>
                    <TableHead className="h-8 text-[10px] uppercase tracking-wide">
                      vs Zone
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {play.assignments.map((a, i) => (
                    <TableRow
                      key={`${a.position}-${i}`}
                      className={cn(i % 2 === 1 && 'bg-muted/30')}
                    >
                      <TableCell className="whitespace-nowrap font-mono text-xs font-semibold">
                        {a.position}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {a.alignment || '—'}
                      </TableCell>
                      <TableCell className="whitespace-normal break-words text-xs">
                        {a.assignment || '—'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-xs">
                        {a.landmark || '—'}
                      </TableCell>
                      <TableCell className="whitespace-normal break-words text-xs">
                        {a.vsMan || '—'}
                      </TableCell>
                      <TableCell className="whitespace-normal break-words text-xs">
                        {a.vsZone || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Routes table */}
        {hasRoutes && (
          <div>
            <SectionLabel icon={<Footprints className="size-4 text-chart-3" />}>
              Routes
            </SectionLabel>
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="h-8 font-mono text-[10px] uppercase tracking-wide">
                      Player
                    </TableHead>
                    <TableHead className="h-8 text-[10px] uppercase tracking-wide">
                      Route
                    </TableHead>
                    <TableHead className="h-8 text-[10px] uppercase tracking-wide">
                      Depth
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {play.routes.map((r, i) => (
                    <TableRow
                      key={`${r.player}-${i}`}
                      className={cn(i % 2 === 1 && 'bg-muted/30')}
                    >
                      <TableCell className="font-mono text-xs font-semibold">
                        {r.player}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {r.route || '—'}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {r.depth || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Coaching points callout */}
        {play.coachingPoints && (
          <div className="rounded-md border border-accent/40 bg-accent/10 p-3">
            <div className="mb-1.5 flex items-center gap-1.5">
              <Lightbulb className="size-3.5 text-accent" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                Coaching Points
              </span>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">
              {play.coachingPoints}
            </p>
          </div>
        )}

        {/* Complementary plays */}
        {complementaryPlays.length > 0 && (
          <div>
            <SectionLabel icon={<Link2 className="size-4 text-chart-5" />}>
              Complementary Plays
            </SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {complementaryPlays.map((cp) => {
                const kind = classifyConcept(cp.concept, cp.side)
                return (
                  <button
                    key={cp.id}
                    type="button"
                    onClick={() => onSelectComplementary?.(cp.id)}
                    title={cp.name}
                    className={cn(
                      'group inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1 transition-all',
                      'hover:scale-[1.02] hover:shadow-md',
                      CONCEPT_BADGE_CLASS[kind],
                    )}
                  >
                    <span className="font-mono text-[10px] tracking-tight">
                      {cp.playId}
                    </span>
                    <span className="truncate text-xs">{cp.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PlayDnaPanel
