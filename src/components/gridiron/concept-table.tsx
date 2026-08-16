'use client'

/**
 * AnalyticsIQ™ — Concept Performance table.
 *
 * Sortable by concept / attempts / success rate / avg yards / explosive /
 * negative. Click any header to toggle asc/desc. Success Rate column has an
 * inline visual bar (bg-primary) sized via inline width %.
 *
 * shadcn Table primitives. Header uses font-mono uppercase tracking-widest.
 * Row hover via hover:bg-muted/30.
 */

import * as React from 'react'
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ConceptPerformance } from '@/lib/data'

type SortKey =
  | 'concept'
  | 'attempts'
  | 'successRate'
  | 'avgYards'
  | 'explosive'
  | 'negative'
type SortDir = 'asc' | 'desc'

interface ConceptTableProps {
  rows: ConceptPerformance[]
}

interface ColumnDef {
  key: SortKey
  label: string
  align?: 'left' | 'right'
  className?: string
}

const COLUMNS: ColumnDef[] = [
  { key: 'concept', label: 'Concept', className: 'min-w-[160px]' },
  { key: 'attempts', label: 'Att', align: 'right' },
  { key: 'successRate', label: 'Success %' },
  { key: 'avgYards', label: 'Avg Yds', align: 'right' },
  { key: 'explosive', label: 'Exp', align: 'right' },
  { key: 'negative', label: 'Neg', align: 'right' },
]

export function ConceptTable({ rows }: ConceptTableProps) {
  const [sortKey, setSortKey] = React.useState<SortKey>('attempts')
  const [sortDir, setSortDir] = React.useState<SortDir>('desc')

  const sorted = React.useMemo(() => {
    const arr = [...rows]
    arr.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      let cmp: number
      if (typeof av === 'string' && typeof bv === 'string') {
        cmp = av.localeCompare(bv)
      } else {
        cmp = (av as number) - (bv as number)
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return arr
  }, [rows, sortKey, sortDir])

  const onSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      // Default direction: asc for text, desc for numeric.
      setSortDir(key === 'concept' ? 'asc' : 'desc')
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <header className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-2.5">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Concept Performance
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {sorted.length} concept{sorted.length === 1 ? '' : 's'} · click header to sort
        </span>
      </header>
      <Table>
        <TableHeader>
          <TableRow className="border-border/60 hover:bg-transparent">
            {COLUMNS.map((c) => {
              const isActive = sortKey === c.key
              return (
                <TableHead
                  key={c.key}
                  className={cn(
                    'font-mono text-xs uppercase tracking-widest text-muted-foreground',
                    c.align === 'right' && 'text-right',
                    c.className,
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSort(c.key)}
                    className={cn(
                      'inline-flex items-center gap-1 transition-colors hover:text-foreground',
                      c.align === 'right' && 'flex-row-reverse',
                      isActive && 'text-foreground',
                    )}
                  >
                    {c.label}
                    <SortIcon active={isActive} dir={sortDir} />
                  </button>
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={COLUMNS.length}
                className="py-8 text-center text-sm text-muted-foreground"
              >
                No concept data for this view.
              </TableCell>
            </TableRow>
          ) : (
            sorted.map((r) => (
              <TableRow key={r.concept} className="hover:bg-muted/30">
                <TableCell className="font-medium text-foreground">
                  {r.concept}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {r.attempts}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="relative h-2 w-24 overflow-hidden rounded-sm bg-muted/60">
                      <div
                        className="absolute inset-y-0 left-0 bg-primary"
                        style={{
                          width: `${Math.min(100, Math.max(0, r.successRate))}%`,
                        }}
                      />
                    </div>
                    <span className="font-mono text-xs tabular-nums text-foreground">
                      {r.successRate.toFixed(1)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {r.avgYards.toFixed(1)}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums text-primary">
                  {r.explosive}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums text-destructive">
                  {r.negative}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown className="size-3 opacity-40" />
  return dir === 'asc' ? (
    <ChevronUp className="size-3" />
  ) : (
    <ChevronDown className="size-3" />
  )
}

export default ConceptTable
