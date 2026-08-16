'use client'

/**
 * ScoutIQ™ — Coverage / Pressure Intelligence.
 *
 * Recharts horizontal bar chart of the opponent's most-used coverages
 * and pressures (aggregated from snap_results for this opponent).
 *
 * Bars are primary field green for coverage and end-zone orange for
 * pressure — both theme tokens, NO indigo/blue. ChartContainer provides
 * muted-foreground axis text via its built-in CSS selectors.
 */

import * as React from 'react'
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts'
import { BarChart3 } from 'lucide-react'

import { Card } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

import type { SnapResultRow } from './scout-utils'

interface CoveragePressureChartProps {
  snapResults: SnapResultRow[]
}

const chartConfig = {
  coverage: { label: 'Coverage', color: 'oklch(0.62 0.16 152)' },
  pressure: { label: 'Pressure', color: 'oklch(0.68 0.18 55)' },
} satisfies ChartConfig

interface BarDatum {
  key: string
  name: string
  snaps: number
  kind: 'coverage' | 'pressure'
}

export function CoveragePressureChart({
  snapResults,
}: CoveragePressureChartProps) {
  // Aggregate coverage + pressure usage from snap_results.
  const data = React.useMemo<BarDatum[]>(() => {
    const counts = new Map<string, BarDatum>()
    for (const s of snapResults) {
      if (s.coverage) {
        const key = `cov:${s.coverage}`
        const entry =
          counts.get(key) ?? {
            key,
            name: s.coverage,
            snaps: 0,
            kind: 'coverage' as const,
          }
        entry.snaps += 1
        counts.set(key, entry)
      }
      if (s.pressure) {
        const key = `prs:${s.pressure}`
        const entry =
          counts.get(key) ?? {
            key,
            name: s.pressure,
            snaps: 0,
            kind: 'pressure' as const,
          }
        entry.snaps += 1
        counts.set(key, entry)
      }
    }
    return Array.from(counts.values())
      .sort((a, b) => b.snaps - a.snaps)
      .slice(0, 8)
  }, [snapResults])

  const coverageCount = data.filter((d) => d.kind === 'coverage').length
  const pressureCount = data.filter((d) => d.kind === 'pressure').length

  return (
    <Card className="h-full rounded-lg border border-border bg-card p-4">
      <header className="mb-3 flex items-center gap-2">
        <BarChart3 className="size-3.5 text-muted-foreground" />
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Coverage / Pressure Usage
        </span>
      </header>

      {data.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          No coverage/pressure data charted for this opponent.
        </div>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[280px] w-full"
        >
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="oklch(0.31 0.012 150 / 0.4)"
            />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              width={110}
            />
            <ChartTooltip
              cursor={{ fill: 'oklch(0.5 0.12 152 / 0.12)' }}
              content={
                <ChartTooltipContent
                  className="border border-border bg-popover text-popover-foreground shadow-lg"
                  formatter={(value, _name, item) => {
                    const d = item?.payload as BarDatum | undefined
                    const kindLabel = d?.kind === 'pressure' ? 'Pressure' : 'Coverage'
                    return (
                      <div className="flex w-full items-center justify-between gap-3">
                        <span className="text-muted-foreground">{kindLabel}</span>
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {String(value)} snap{Number(value) === 1 ? '' : 's'}
                        </span>
                      </div>
                    )
                  }}
                />
              }
            />
            <Bar
              dataKey="snaps"
              radius={[0, 4, 4, 0]}
            >
              {data.map((d) => (
                <Cell
                  key={d.key}
                  fill={
                    d.kind === 'pressure'
                      ? 'oklch(0.68 0.18 55)'
                      : 'oklch(0.62 0.16 152)'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      )}

      <footer className="mt-3 flex flex-wrap items-center gap-3 font-mono text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block size-2.5 rounded-sm"
            style={{ backgroundColor: 'oklch(0.62 0.16 152)' }}
          />
          Coverage{coverageCount > 0 ? ` (${coverageCount})` : ''}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block size-2.5 rounded-sm"
            style={{ backgroundColor: 'oklch(0.68 0.18 55)' }}
          />
          Pressure{pressureCount > 0 ? ` (${pressureCount})` : ''}
        </span>
        <span className="ml-auto">n = {snapResults.length} charted snaps</span>
      </footer>
    </Card>
  )
}

export default CoveragePressureChart
