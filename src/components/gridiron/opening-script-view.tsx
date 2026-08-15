'use client'

/**
 * OpeningScriptView — renders the generated 15-play opening script.
 *
 * Sub-regions:
 *   1. Rationale callout (border-l-4 primary) — strategic narrative.
 *   2. Script table — desktop (md+) shadcn Table; mobile collapses to cards.
 *   3. Complementary plan chips (3-5 follow-up concepts).
 *   4. Self-scout warning (border-l-4 accent) with AlertTriangle icon.
 *
 * The component is purely presentational — it receives the script, the
 * opponent name, the timestamp, and a loading flag. State management and
 * API calls live in <GamePlanIQ />.
 */

import * as React from 'react'
import {
  AlertTriangle,
  ClipboardList,
  ListOrdered,
  Sparkles,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ----------------------------------------------------------------------------
//  Types — match the LLM JSON shape defined by /api/gameplan
// ----------------------------------------------------------------------------

export interface ScriptPlay {
  order: number
  playId: string
  name: string
  concept: string
  personnel: string
  testTag: string
  expectedDefensiveReaction: string
  complementNote: string
  coachingPoint: string
}

export interface OpeningScript {
  title: string
  rationale: string
  plays: ScriptPlay[]
  complementaryPlan: string[]
  selfScoutWarning: string
}

interface OpeningScriptViewProps {
  script: OpeningScript | null
  opponentName: string | null
  generatedAt: string | null
  isLoading: boolean
}

// ----------------------------------------------------------------------------
//  Test tag → color mapping (matches spec)
// ----------------------------------------------------------------------------

const TEST_TAG_STYLES: Record<string, string> = {
  'TEST BOX': 'bg-primary/15 text-primary border-primary/30',
  'TEST EDGE': 'bg-chart-5/15 text-chart-5 border-chart-5/30',
  'TEST COVERAGE': 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  'MAN/Z0 CHECK': 'bg-accent/20 text-accent border-accent/40',
  'TEST SAFETY': 'bg-destructive/15 text-destructive border-destructive/30',
}

/**
 * Normalize the raw LLM test tag (which may be "Test Box", "test box",
 * "TEST BOX (heavy") into the closest known canonical tag + its color class.
 * Falls back to a neutral muted chip for unknown tags.
 */
function classifyTestTag(
  raw: string | undefined | null,
): { label: string; className: string } {
  const t = (raw ?? '').toUpperCase().trim()
  if (!t) return { label: 'TEST', className: 'bg-muted text-muted-foreground border-border' }
  if (t.includes('SAFETY')) {
    return { label: 'TEST SAFETY', className: TEST_TAG_STYLES['TEST SAFETY'] }
  }
  if (t.includes('MAN') || t.includes('Z0')) {
    return { label: 'MAN/Z0 CHECK', className: TEST_TAG_STYLES['MAN/Z0 CHECK'] }
  }
  if (t.includes('COVER')) {
    return { label: 'TEST COVERAGE', className: TEST_TAG_STYLES['TEST COVERAGE'] }
  }
  if (t.includes('EDGE')) {
    return { label: 'TEST EDGE', className: TEST_TAG_STYLES['TEST EDGE'] }
  }
  if (t.includes('BOX')) {
    return { label: 'TEST BOX', className: TEST_TAG_STYLES['TEST BOX'] }
  }
  return { label: t, className: 'bg-muted text-muted-foreground border-border' }
}

// ----------------------------------------------------------------------------
//  Main component
// ----------------------------------------------------------------------------

export function OpeningScriptView({
  script,
  opponentName,
  generatedAt,
  isLoading,
}: OpeningScriptViewProps) {
  if (isLoading) return <ScriptSkeleton />

  if (!script) return <EmptyState opponentName={opponentName} />

  const plays: ScriptPlay[] = Array.isArray(script.plays)
    ? script.plays.filter(Boolean)
    : []
  const complementary: string[] = Array.isArray(script.complementaryPlan)
    ? script.complementaryPlan.filter(Boolean)
    : []

  return (
    <div className="flex flex-col gap-4">
      {/* ============================================================
          1. Rationale callout
         ============================================================ */}
      <div className="border-l-4 border-primary bg-primary/5 p-4 rounded-r-lg">
        <div className="mb-1 flex items-center gap-2">
          <Sparkles className="size-3.5 text-primary" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
            Strategic Rationale
          </span>
          {script.title && (
            <span className="ml-auto text-xs text-muted-foreground">
              Script:{' '}
              <span className="font-medium text-foreground">{script.title}</span>
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">
          {script.rationale}
        </p>
        {generatedAt && (
          <div className="mt-2 font-mono text-[10px] text-muted-foreground">
            Generated {formatTimestamp(generatedAt)}
            {opponentName ? ` · vs ${opponentName}` : ''}
          </div>
        )}
      </div>

      {/* ============================================================
          2. Script table (desktop) / cards (mobile)
         ============================================================ */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-[60px]">#</TableHead>
              <TableHead className="min-w-[160px]">Play</TableHead>
              <TableHead className="min-w-[120px]">Concept</TableHead>
              <TableHead className="w-[80px]">Personnel</TableHead>
              <TableHead className="min-w-[140px]">Test Tag</TableHead>
              <TableHead className="min-w-[200px]">Exp. D Reaction</TableHead>
              <TableHead className="min-w-[200px]">Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plays.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No plays in script.
                </TableCell>
              </TableRow>
            ) : (
              plays.map((p, i) => {
                const tag = classifyTestTag(p.testTag)
                const idx = p.order ?? i + 1
                return (
                  <TableRow key={`${p.playId ?? ''}-${i}`}>
                    <TableCell className="font-mono text-sm font-bold text-primary">
                      {String(idx).padStart(2, '0')}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {p.name || 'Untitled play'}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {p.playId || '—'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-foreground/90">
                      {p.concept || '—'}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {p.personnel || '—'}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium ${tag.className}`}
                      >
                        {tag.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-foreground/80">
                      {p.expectedDefensiveReaction || '—'}
                    </TableCell>
                    <TableCell className="text-xs text-foreground/80">
                      {p.complementNote || '—'}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {plays.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No plays in script.
          </div>
        ) : (
          plays.map((p, i) => {
            const tag = classifyTestTag(p.testTag)
            const idx = p.order ?? i + 1
            return (
              <div
                key={`${p.playId ?? ''}-${i}`}
                className="rounded-lg border border-border bg-card p-3"
              >
                <div className="flex items-start gap-2">
                  <span className="font-mono text-sm font-bold text-primary">
                    {String(idx).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">
                      {p.name || 'Untitled play'}
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      {p.playId || '—'} · {p.concept || '—'}
                    </div>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-[10px] font-medium ${tag.className}`}
                  >
                    {tag.label}
                  </span>
                </div>
                <dl className="mt-2 grid grid-cols-1 gap-1.5 text-xs">
                  <Row label="Personnel" value={p.personnel} />
                  <Row label="Exp. D Reaction" value={p.expectedDefensiveReaction} />
                  <Row label="Note" value={p.complementNote} />
                </dl>
              </div>
            )
          })
        )}
      </div>

      {/* ============================================================
          3. Complementary plan chips
         ============================================================ */}
      {complementary.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <ClipboardList className="size-3.5 text-muted-foreground" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Complementary Plan
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {complementary.map((c, i) => (
              <Badge
                key={`${c.slice(0, 24)}-${i}`}
                variant="outline"
                className="bg-card text-foreground"
              >
                {c}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          4. Self-scout warning
         ============================================================ */}
      {script.selfScoutWarning && (
        <div className="border-l-4 border-accent bg-accent/10 p-4 rounded-r-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="size-4 shrink-0 mt-0.5 text-accent" />
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-widest text-accent">
                Self-Scout Warning
              </div>
              <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                {script.selfScoutWarning}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ----------------------------------------------------------------------------
//  Small helpers
// ----------------------------------------------------------------------------

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2 items-baseline">
      <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </dt>
      <dd className="text-foreground/90">{value || '—'}</dd>
    </div>
  )
}

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

// ----------------------------------------------------------------------------
//  Empty + loading states
// ----------------------------------------------------------------------------

function EmptyState({ opponentName }: { opponentName: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
      <ListOrdered className="size-10 opacity-40" />
      <p className="text-sm font-medium">No opening script generated yet.</p>
      <p className="max-w-sm text-center text-xs">
        {opponentName
          ? `Select an opponent and click "Generate Opening Script" to build a 15-play opener for ${opponentName}.`
          : 'Pick an opponent and click "Generate Opening Script" to build a 15-play opener.'}
      </p>
    </div>
  )
}

function ScriptSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* Rationale skeleton */}
      <div className="border-l-4 border-primary/40 bg-primary/5 p-4 rounded-r-lg">
        <Skeleton className="h-3 w-32 mb-2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4 mt-1" />
      </div>
      {/* Table skeleton (desktop) */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex flex-col">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-border/60 px-3 py-2.5 last:border-b-0"
            >
              <Skeleton className="h-4 w-7" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
      {/* Mobile cards skeleton */}
      <div className="md:hidden flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
      {/* Complementary chips skeleton */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-24 rounded-md" />
        ))}
      </div>
      {/* Self-scout warning skeleton */}
      <Skeleton className="h-16 w-full rounded-r-lg" />
    </div>
  )
}
