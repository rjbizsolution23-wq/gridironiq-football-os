'use client'

/**
 * ScoutIQ™ — Conditional Probability Matrix (heatmap).
 *
 * Renders an HTML <table> (not SVG) of P(top play | situation × formation).
 * Rows = situations (in canonical order), columns = formation keys.
 * Each cell shows the highest-probability tendency value (e.g. "Mesh 34%")
 * with a background alpha that scales with probability
 *   bg = oklch(0.62 0.16 152 / (0.15 + prob × 0.7))
 * Cells without data render "—" on a muted background.
 */

import * as React from 'react'
import { Activity } from 'lucide-react'

import { Card } from '@/components/ui/card'

import {
  COMMON_FORMATIONS,
  SITUATION_LABELS,
  SITUATION_ORDER,
  type OpponentSnapshot,
  type TendencyRow,
} from './scout-utils'

interface TendencyHeatmapProps {
  opponent: OpponentSnapshot
}

export function TendencyHeatmap({ opponent }: TendencyHeatmapProps) {
  const tendencies = opponent.tendencies ?? []

  // ---- Columns: known formations first (in canonical order), then any
  //      extras found in the data, sorted alphabetically.
  const formationKeys = React.useMemo<string[]>(() => {
    const known: string[] = [...COMMON_FORMATIONS]
    const extras = new Set<string>()
    for (const t of tendencies) {
      if (t.formationKey && !known.includes(t.formationKey)) {
        extras.add(t.formationKey)
      }
    }
    return [...known, ...Array.from(extras).sort()]
  }, [tendencies])

  // ---- Rows: situations actually present in the data, in canonical order.
  const situations = React.useMemo(() => {
    const present = new Set(tendencies.map((t) => t.situation))
    const ordered = SITUATION_ORDER.filter((s) => present.has(s))
    // Append any unknown situation ids at the end (defensive — shouldn't
    // happen with the seed data, but keeps the UI from silently dropping rows).
    for (const s of present) {
      if (!ordered.includes(s)) ordered.push(s)
    }
    return ordered
  }, [tendencies])

  // ---- Matrix: cell[situation][formationKey] = top-probability tendency.
  const matrix = React.useMemo(() => {
    const m = new Map<string, Map<string, TendencyRow>>()
    for (const t of tendencies) {
      if (!t.formationKey) continue
      const inner = m.get(t.situation) ?? new Map<string, TendencyRow>()
      const cur = inner.get(t.formationKey)
      if (!cur || t.probability > cur.probability) {
        inner.set(t.formationKey, t)
      }
      m.set(t.situation, inner)
    }
    return m
  }, [tendencies])

  return (
    <Card className="rounded-lg border border-border bg-card p-4">
      <header className="mb-3 flex items-center gap-2">
        <Activity className="size-3.5 text-muted-foreground" />
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Conditional Probability Matrix
        </span>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">
          P(play | situation × formation)
        </span>
      </header>

      {tendencies.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          No tendency data available for this opponent.
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-card p-2 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Situation
                </th>
                {formationKeys.map((f) => (
                  <th
                    key={f}
                    className="p-2 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                  >
                    {f}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {situations.map((sit) => {
                const inner = matrix.get(sit)
                return (
                  <tr key={sit} className="border-t border-border/50">
                    <td className="sticky left-0 z-10 bg-card p-2 text-left font-mono text-[11px] text-foreground">
                      {SITUATION_LABELS[sit] ?? sit}
                    </td>
                    {formationKeys.map((f) => {
                      const cell = inner?.get(f)
                      if (!cell) {
                        return (
                          <td key={f} className="p-1.5">
                            <div className="flex h-12 items-center justify-center rounded-md bg-muted/30 text-muted-foreground/40">
                              —
                            </div>
                          </td>
                        )
                      }
                      const pct = Math.round(cell.probability * 100)
                      // Heat scale: 0% → muted/30, 100% → primary green.
                      // Use inline style as specified by the design rules.
                      const alpha = 0.15 + cell.probability * 0.7
                      return (
                        <td key={f} className="p-1.5">
                          <div
                            className="flex h-12 flex-col items-center justify-center rounded-md border border-border/30 px-1.5 py-1 text-center"
                            style={{
                              backgroundColor: `oklch(0.62 0.16 152 / ${alpha})`,
                            }}
                            title={`${cell.value} — ${pct}% (n=${cell.sampleSize}, ${cell.confidence})`}
                          >
                            <span className="text-[10px] font-semibold leading-tight text-foreground">
                              {cell.value}
                            </span>
                            <span className="font-mono text-[10px] text-foreground/70">
                              {pct}%
                            </span>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <footer className="mt-3 flex flex-wrap items-center gap-3 font-mono text-[10px] text-muted-foreground">
        <span>Heat scale:</span>
        <div className="flex items-center gap-1">
          {[0.1, 0.3, 0.5, 0.7, 0.9].map((p) => (
            <span
              key={p}
              className="inline-block size-3 rounded-sm border border-border/30"
              style={{
                backgroundColor: `oklch(0.62 0.16 152 / ${0.15 + p * 0.7})`,
              }}
            />
          ))}
          <span className="ml-1">low → high probability</span>
        </div>
        <span className="hidden sm:inline">·</span>
        <span>Cell shows top tendency value + probability</span>
      </footer>
    </Card>
  )
}

export default TendencyHeatmap
