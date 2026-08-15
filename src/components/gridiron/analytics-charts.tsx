'use client'

/**
 * AnalyticsIQ™ — Postgame Visual Breakdown.
 *
 * Three Recharts visualizations, laid out in two columns:
 *   Left  (lg:col-span-7): Horizontal bar chart of concept success rates —
 *                          bars color-coded by performance:
 *                            green  >= 60%
 *                            gold   45–59%
 *                            red    <  45%
 *   Right (lg:col-span-5):
 *     · Pass vs Run donut pie chart (pass = primary green, run = accent orange)
 *     · Explosive vs Negative vertical bar chart (explosive = green, negative = red)
 *
 * Uses Recharts BarChart / PieChart / Cell + ResponsiveContainer directly
 * (transparent backgrounds, muted-foreground axes, popover-styled tooltip).
 * NO indigo / blue — chart-5 teal is left untouched.
 */

import * as React from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react'

import { Card } from '@/components/ui/card'
import type { ConceptPerformance, GameSummary } from '@/lib/data'

interface AnalyticsChartsProps {
  rows: ConceptPerformance[]
  summary: GameSummary
}

// ---- Theme colors (dark-mode tokens; matches existing charts) ----
const GREEN = 'oklch(0.62 0.16 152)' // --primary
const GOLD = 'oklch(0.78 0.16 90)' // --chart-3
const RED = 'oklch(0.62 0.22 25)' // --destructive
const ORANGE = 'oklch(0.68 0.18 55)' // --accent
const AXIS = 'oklch(0.71 0.012 150)' // --muted-foreground
const GRID = 'oklch(0.31 0.012 150 / 0.4)' // --border @ 40%

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  color: 'var(--popover-foreground)',
  fontSize: '12px',
  boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
} as const

function successColor(sr: number): string {
  if (sr >= 60) return GREEN
  if (sr >= 45) return GOLD
  return RED
}

export function AnalyticsCharts({ rows, summary }: AnalyticsChartsProps) {
  const conceptData = React.useMemo(
    () =>
      [...rows]
        .sort((a, b) => b.attempts - a.attempts)
        .slice(0, 10)
        .map((r) => ({
          name: r.concept,
          successRate: r.successRate,
          attempts: r.attempts,
        })),
    [rows],
  )

  const passRunData = React.useMemo(() => {
    const { pass, run } = summary.passRunRatio
    return [
      { name: 'Pass', value: pass, color: GREEN },
      { name: 'Run', value: run, color: ORANGE },
    ].filter((d) => d.value > 0)
  }, [summary])

  const expNegData = React.useMemo(
    () => [
      { name: 'Explosive', value: summary.explosives, color: GREEN },
      { name: 'Negative', value: summary.negatives, color: RED },
    ],
    [summary],
  )

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      {/* -------- Left: concept success rate bar chart -------- */}
      <section className="lg:col-span-7">
        <header className="mb-2 flex items-center gap-2">
          <BarChart3 className="size-3.5 text-muted-foreground" />
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Concept Success Rate
          </span>
        </header>
        <Card className="rounded-lg border border-border bg-card p-4">
          {conceptData.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
              No concept data to chart.
            </div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={conceptData}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke={GRID}
                  />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: AXIS, fontSize: 11 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    width={120}
                    tick={{ fill: AXIS, fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ fill: 'oklch(0.5 0.12 152 / 0.12)' }}
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value: number) => [
                      `${value.toFixed(1)}%`,
                      'Success Rate',
                    ]}
                  />
                  <Bar
                    dataKey="successRate"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={20}
                  >
                    {conceptData.map((d) => (
                      <Cell key={d.name} fill={successColor(d.successRate)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <footer className="mt-3 flex flex-wrap items-center gap-3 font-mono text-[10px] text-muted-foreground">
            <Legend color={GREEN} label="≥60% success" />
            <Legend color={GOLD} label="45–59%" />
            <Legend color={RED} label="<45%" />
            <span className="ml-auto">
              top {conceptData.length} by attempts
            </span>
          </footer>
        </Card>
      </section>

      {/* -------- Right column: pie + exp/neg bar -------- */}
      <section className="flex flex-col gap-4 lg:col-span-5">
        {/* Pass / Run donut */}
        <div>
          <header className="mb-2 flex items-center gap-2">
            <PieChartIcon className="size-3.5 text-muted-foreground" />
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Pass vs Run
            </span>
          </header>
          <Card className="rounded-lg border border-border bg-card p-4">
            {passRunData.length === 0 ? (
              <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                No pass/run data.
              </div>
            ) : (
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={passRunData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                      cx="50%"
                      cy="50%"
                      isAnimationActive={false}
                    >
                      {passRunData.map((d) => (
                        <Cell
                          key={d.name}
                          fill={d.color}
                          stroke="var(--card)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(value: number, name: string) => [
                        `${value} snap${value === 1 ? '' : 's'}`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <footer className="mt-2 flex flex-wrap items-center justify-center gap-4 font-mono text-[10px] text-muted-foreground">
              {passRunData.map((d) => (
                <Legend
                  key={d.name}
                  color={d.color}
                  label={`${d.name} (${d.value})`}
                />
              ))}
            </footer>
          </Card>
        </div>

        {/* Explosive vs Negative bar chart */}
        <div>
          <header className="mb-2 flex items-center gap-2">
            <BarChart3 className="size-3.5 text-muted-foreground" />
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Explosive vs Negative
            </span>
          </header>
          <Card className="rounded-lg border border-border bg-card p-4">
            <div className="h-[160px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={expNegData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={GRID}
                  />
                  <XAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: AXIS, fontSize: 11 }}
                  />
                  <YAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    tick={{ fill: AXIS, fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ fill: 'oklch(0.5 0.12 152 / 0.12)' }}
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value: number) => [
                      `${value} play${value === 1 ? '' : 's'}`,
                      'Count',
                    ]}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    {expNegData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="inline-block size-2.5 rounded-sm"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  )
}

export default AnalyticsCharts
