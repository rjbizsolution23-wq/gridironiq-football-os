'use client'

import * as React from 'react'
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Filter,
  FlaskConical,
  Hash,
  Layers,
  PieChart,
  Play,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface TendencySnap {
  id: string
  down: number
  distance: number
  hash: string | null
  yardLine: number
  formation: string | null
  personnel: string | null
  motion: string | null
  concept: string | null
  front: string | null
  coverage: string | null
  pressure: string | null
  playType: string | null
  yardsGained: number
  success: boolean
  explosive: boolean
  turnover: boolean
}

interface TendencyOpponent {
  id: string
  name: string
  mascot: string | null
  tendencies: Array<{
    id: string
    situation: string
    formationKey: string | null
    personnel: string | null
    hash: string | null
    result: string
    value: string
    probability: number
    sampleSize: number
    confidence: string
  }>
}

interface TendencyData {
  snapResults: TendencySnap[]
  opponents: TendencyOpponent[]
}

type FilterKey =
  | 'opponent'
  | 'down'
  | 'distance'
  | 'hash'
  | 'formation'
  | 'coverage'
  | 'pressure'
  | 'personnel'

interface FilterState {
  opponent: string | null
  down: number | null
  distance: 'all' | 'short' | 'medium' | 'long'
  hash: 'all' | 'L' | 'M' | 'R'
  formation: string | null
  coverage: string | null
  pressure: string | null
  personnel: string | null
}

const CHART_BAR_COLOR = 'oklch(0.62 0.16 152)'
const CHART_BAR_ALT = 'oklch(0.78 0.16 90)'
const CHART_BAR_DESTRUCTIVE = 'oklch(0.62 0.22 25)'
const CHART_BAR_ACCENT = 'oklch(0.68 0.18 55)'

function FilterChip({
  active,
  label,
  value,
  onClick,
  onClear,
}: {
  active: boolean
  label: string
  value: string
  onClick: () => void
  onClear?: () => void
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-all',
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground hover:border-primary/40'
      )}
    >
      <button onClick={onClick} className="font-mono">
        <span className="opacity-70">{label}:</span> {value}
      </button>
      {active && onClear && (
        <button
          onClick={onClear}
          className="opacity-70 hover:opacity-100"
          aria-label="Clear filter"
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  )
}

function TendencyMain() {
  const { data } = useQuery({
    queryKey: ['gridiron'],
    queryFn: async () => {
      const r = await fetch('/api/gridiron')
      if (!r.ok) throw new Error('failed')
      return r.json() as Promise<TendencyData>
    },
    staleTime: 60_000,
  })

  const snaps = data?.snapResults ?? []
  const opponents = data?.opponents ?? []

  const [filter, setFilter] = React.useState<FilterState>({
    opponent: null,
    down: null,
    distance: 'all',
    hash: 'all',
    formation: null,
    coverage: null,
    pressure: null,
    personnel: null,
  })

  // Available filter values derived from snaps
  const availableFormations = React.useMemo(
    () => Array.from(new Set(snaps.map((s) => s.formation).filter(Boolean))).sort() as string[],
    [snaps]
  )
  const availableCoverages = React.useMemo(
    () => Array.from(new Set(snaps.map((s) => s.coverage).filter(Boolean))).sort() as string[],
    [snaps]
  )
  const availablePressures = React.useMemo(
    () => Array.from(new Set(snaps.map((s) => s.pressure).filter(Boolean))).sort() as string[],
    [snaps]
  )
  const availablePersonnel = React.useMemo(
    () => Array.from(new Set(snaps.map((s) => s.personnel).filter(Boolean))).sort() as string[],
    [snaps]
  )

  // Apply filters to snaps
  const filtered = React.useMemo(() => {
    return snaps.filter((s) => {
      if (filter.down !== null && s.down !== filter.down) return false
      if (filter.distance !== 'all') {
        if (filter.distance === 'short' && (s.distance < 1 || s.distance > 3)) return false
        if (filter.distance === 'medium' && (s.distance < 4 || s.distance > 6)) return false
        if (filter.distance === 'long' && s.distance < 7) return false
      }
      if (filter.hash !== 'all') {
        const sh = s.hash?.toUpperCase().startsWith('L')
          ? 'L'
          : s.hash?.toUpperCase().startsWith('R')
          ? 'R'
          : 'M'
        if (sh !== filter.hash) return false
      }
      if (filter.formation && s.formation !== filter.formation) return false
      if (filter.coverage && s.coverage !== filter.coverage) return false
      if (filter.pressure && s.pressure !== filter.pressure) return false
      if (filter.personnel && s.personnel !== filter.personnel) return false
      return true
    })
  }, [snaps, filter])

  // Aggregations
  const passRunData = React.useMemo(() => {
    const pass = filtered.filter((s) => s.playType === 'pass').length
    const run = filtered.filter((s) => s.playType === 'run').length
    return [
      { name: 'Pass', value: pass, color: CHART_BAR_ALT },
      { name: 'Run', value: run, color: CHART_BAR_COLOR },
    ]
  }, [filtered])

  const conceptData = React.useMemo(() => {
    const map = new Map<string, number>()
    for (const s of filtered) {
      const c = s.concept ?? 'unknown'
      map.set(c, (map.get(c) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [filtered])

  const coverageData = React.useMemo(() => {
    const map = new Map<string, number>()
    for (const s of filtered) {
      const c = s.coverage
      if (!c) continue
      map.set(c, (map.get(c) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))
      .sort((a, b) => b.value - a.value)
  }, [filtered])

  const formationData = React.useMemo(() => {
    const map = new Map<string, number>()
    for (const s of filtered) {
      const f = s.formation
      if (!f) continue
      map.set(f, (map.get(f) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filtered])

  const downData = React.useMemo(() => {
    const buckets = [1, 2, 3, 4].map((d) => {
      const inDown = filtered.filter((s) => s.down === d)
      const pass = inDown.filter((s) => s.playType === 'pass').length
      const run = inDown.filter((s) => s.playType === 'run').length
      return {
        name: `${d}${d === 1 ? 'st' : d === 2 ? 'nd' : d === 3 ? 'rd' : 'th'}`,
        pass,
        run,
        total: inDown.length,
      }
    })
    return buckets
  }, [filtered])

  // Opponent tendency data (when an opponent is selected)
  const opponentTendencies = React.useMemo(() => {
    if (!filter.opponent) return null
    const opp = opponents.find((o) => o.id === filter.opponent)
    if (!opp) return null
    // Group by situation
    const bySituation = new Map<string, typeof opp.tendencies>()
    for (const t of opp.tendencies) {
      const list = bySituation.get(t.situation) ?? []
      list.push(t)
      bySituation.set(t.situation, list)
    }
    return {
      opponent: opp,
      groups: Array.from(bySituation.entries()).sort((a, b) => a[0].localeCompare(b[0])),
    }
  }, [filter.opponent, opponents])

  function resetAll() {
    setFilter({
      opponent: null,
      down: null,
      distance: 'all',
      hash: 'all',
      formation: null,
      coverage: null,
      pressure: null,
      personnel: null,
    })
  }

  const activeFilterCount = [
    filter.opponent,
    filter.down,
    filter.distance !== 'all' ? filter.distance : null,
    filter.hash !== 'all' ? filter.hash : null,
    filter.formation,
    filter.coverage,
    filter.pressure,
    filter.personnel,
  ].filter(Boolean).length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 stadium-sweep glow-primary-soft">
        <div className="absolute inset-0 turf-texture opacity-40" />
        <div className="absolute inset-0 field-grid-overlay opacity-60" />
        <div className="relative flex items-start gap-3">
          <div className="size-12 rounded-xl helmet-gradient flex items-center justify-center shadow-lg helmet-shine shrink-0">
            <FlaskConical className="size-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
              TendencyLab™ · Interactive Tendency Explorer
            </div>
            <h2 className="text-xl font-bold leading-tight gradient-text-primary">
              Tendency Lab
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {snaps.length} total snaps · {filtered.length} match filters ·{' '}
              {activeFilterCount > 0 ? `${activeFilterCount} active filter${activeFilterCount > 1 ? 's' : ''}` : 'no filters applied'}
            </p>
          </div>
          {activeFilterCount > 0 && (
            <Button variant="outline" size="sm" onClick={resetAll} className="h-8">
              <RefreshCw className="size-3.5 mr-1.5" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Filter chips */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="size-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
            Filter Chips
          </h3>
          <Badge variant="outline" className="ml-auto text-[10px] font-mono">
            {filtered.length} / {snaps.length} snaps
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Opponent filter */}
          <select
            value={filter.opponent ?? ''}
            onChange={(e) => setFilter((f) => ({ ...f, opponent: e.target.value || null }))}
            className="text-xs bg-background border border-border rounded-md px-2 py-1 h-7 font-mono"
          >
            <option value="">All opponents</option>
            {opponents.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>

          {/* Down filter */}
          <FilterChip
            active={filter.down !== null}
            label="Down"
            value={filter.down !== null ? `${filter.down}${filter.down === 1 ? 'st' : filter.down === 2 ? 'nd' : filter.down === 3 ? 'rd' : 'th'}` : 'All'}
            onClick={() => {
              const next = filter.down === null ? 1 : filter.down === 1 ? 2 : filter.down === 2 ? 3 : filter.down === 3 ? 4 : null
              setFilter((f) => ({ ...f, down: next }))
            }}
            onClear={() => setFilter((f) => ({ ...f, down: null }))}
          />

          {/* Distance filter */}
          <FilterChip
            active={filter.distance !== 'all'}
            label="Dist"
            value={filter.distance === 'all' ? 'All' : filter.distance === 'short' ? 'Short' : filter.distance === 'medium' ? 'Med' : 'Long'}
            onClick={() => {
              const next = filter.distance === 'all' ? 'short' : filter.distance === 'short' ? 'medium' : filter.distance === 'medium' ? 'long' : 'all'
              setFilter((f) => ({ ...f, distance: next }))
            }}
            onClear={() => setFilter((f) => ({ ...f, distance: 'all' }))}
          />

          {/* Hash filter */}
          <FilterChip
            active={filter.hash !== 'all'}
            label="Hash"
            value={filter.hash === 'all' ? 'All' : filter.hash}
            onClick={() => {
              const next = filter.hash === 'all' ? 'L' : filter.hash === 'L' ? 'M' : filter.hash === 'M' ? 'R' : 'all'
              setFilter((f) => ({ ...f, hash: next }))
            }}
            onClear={() => setFilter((f) => ({ ...f, hash: 'all' }))}
          />

          {/* Formation filter */}
          {availableFormations.length > 0 && (
            <select
              value={filter.formation ?? ''}
              onChange={(e) => setFilter((f) => ({ ...f, formation: e.target.value || null }))}
              className="text-xs bg-background border border-border rounded-md px-2 py-1 h-7 font-mono"
            >
              <option value="">All formations</option>
              {availableFormations.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          )}

          {/* Coverage filter */}
          {availableCoverages.length > 0 && (
            <select
              value={filter.coverage ?? ''}
              onChange={(e) => setFilter((f) => ({ ...f, coverage: e.target.value || null }))}
              className="text-xs bg-background border border-border rounded-md px-2 py-1 h-7 font-mono"
            >
              <option value="">All coverages</option>
              {availableCoverages.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          )}

          {/* Pressure filter */}
          {availablePressures.length > 0 && (
            <select
              value={filter.pressure ?? ''}
              onChange={(e) => setFilter((f) => ({ ...f, pressure: e.target.value || null }))}
              className="text-xs bg-background border border-border rounded-md px-2 py-1 h-7 font-mono"
            >
              <option value="">All pressures</option>
              {availablePressures.map((p) => (
                <option key={p} value={p}>
                  {p.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          )}

          {/* Personnel filter */}
          {availablePersonnel.length > 0 && (
            <select
              value={filter.personnel ?? ''}
              onChange={(e) => setFilter((f) => ({ ...f, personnel: e.target.value || null }))}
              className="text-xs bg-background border border-border rounded-md px-2 py-1 h-7 font-mono"
            >
              <option value="">All personnel</option>
              {availablePersonnel.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          )}
        </div>
      </Card>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
        <Card className="p-3 slide-up-fade stagger-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Snaps</span>
            <Play className="size-3.5 text-muted-foreground" />
          </div>
          <div className="text-xl font-bold font-mono mt-1">{filtered.length}</div>
        </Card>
        <Card className="p-3 slide-up-fade stagger-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Pass</span>
            <TrendingUp className="size-3.5 text-chart-3" />
          </div>
          <div className="text-xl font-bold font-mono mt-1 text-chart-3">
            {passRunData[0].value}
            <span className="text-xs text-muted-foreground ml-1">
              ({filtered.length > 0 ? Math.round((passRunData[0].value / filtered.length) * 100) : 0}%)
            </span>
          </div>
        </Card>
        <Card className="p-3 slide-up-fade stagger-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Run</span>
            <Target className="size-3.5 text-primary" />
          </div>
          <div className="text-xl font-bold font-mono mt-1 text-primary">
            {passRunData[1].value}
            <span className="text-xs text-muted-foreground ml-1">
              ({filtered.length > 0 ? Math.round((passRunData[1].value / filtered.length) * 100) : 0}%)
            </span>
          </div>
        </Card>
        <Card className="p-3 slide-up-fade stagger-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Success</span>
            <Zap className="size-3.5 text-accent" />
          </div>
          <div className="text-xl font-bold font-mono mt-1 text-accent">
            {filtered.length > 0
              ? Math.round((filtered.filter((s) => s.success).length / filtered.length) * 100)
              : 0}
            <span className="text-xs text-muted-foreground ml-1">%</span>
          </div>
        </Card>
        <Card className="p-3 slide-up-fade stagger-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Explosive</span>
            <Zap className="size-3.5 text-accent" />
          </div>
          <div className="text-xl font-bold font-mono mt-1 text-accent">
            {filtered.filter((s) => s.explosive).length}
          </div>
        </Card>
        <Card className="p-3 slide-up-fade stagger-6">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Turnover</span>
            <Target className="size-3.5 text-destructive" />
          </div>
          <div className="text-xl font-bold font-mono mt-1 text-destructive">
            {filtered.filter((s) => s.turnover).length}
          </div>
        </Card>
      </div>

      {/* Opponent tendency card (when opponent selected) */}
      {opponentTendencies && (
        <Card className="p-4 border-l-4 border-l-chart-5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="size-4 text-chart-5" />
            <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
              {opponentTendencies.opponent.name} Tendencies
            </h3>
            <Badge variant="outline" className="ml-auto text-[10px] font-mono">
              {opponentTendencies.opponent.tendencies.length} tagged
            </Badge>
          </div>
          <ScrollArea className="max-h-[280px] scrollbar-thin -mx-1 px-1">
            <div className="space-y-3">
              {opponentTendencies.groups.map(([situation, tendencies]) => (
                <div key={situation} className="rounded-md border border-border bg-background/40 p-2.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] uppercase tracking-widest font-mono text-chart-5">
                      {situation.replace(/_/g, ' ')}
                    </span>
                    <Badge variant="outline" className="text-[9px] font-mono">
                      {tendencies.length} entries
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {tendencies
                      .sort((a, b) => b.probability - a.probability)
                      .map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span className="font-mono text-muted-foreground w-14">
                            {t.result}
                          </span>
                          <span className="font-semibold flex-1 truncate">
                            {t.value}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-chart-5"
                                style={{ width: `${t.probability * 100}%` }}
                              />
                            </div>
                            <span className="font-mono text-xs font-bold w-8 text-right">
                              {Math.round(t.probability * 100)}%
                            </span>
                          </div>
                          <span
                            className={cn(
                              'text-[9px] font-mono uppercase tracking-wider px-1 py-0 rounded',
                              t.confidence === 'HIGH'
                                ? 'bg-primary/15 text-primary'
                                : t.confidence === 'MEDIUM'
                                ? 'bg-chart-3/15 text-chart-3'
                                : 'bg-destructive/15 text-destructive'
                            )}
                          >
                            {t.confidence}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">
                            n={t.sampleSize}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}

      {/* Charts grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Pass vs Run pie */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="size-4 text-chart-3" />
            <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
              Pass vs Run Distribution
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RechartsPieChart>
              <Pie
                data={passRunData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={75}
                innerRadius={45}
                isAnimationActive={false}
              >
                {passRunData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="var(--card)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--popover-foreground)',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </Card>

        {/* Concept bar chart */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="size-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
              Top Concepts Used
            </h3>
          </div>
          {conceptData.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
              No concepts match current filters.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={conceptData} layout="vertical" margin={{ left: 10, right: 20, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.31 0.012 150 / 0.4)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: 'oklch(0.71 0.012 150)', fontSize: 10 }}
                  axisLine={{ stroke: 'oklch(0.31 0.012 150)' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fill: 'oklch(0.71 0.012 150)', fontSize: 10 }}
                  axisLine={{ stroke: 'oklch(0.31 0.012 150)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--popover)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--popover-foreground)',
                    fontSize: '12px',
                  }}
                  cursor={{ fill: 'oklch(0.62 0.16 152 / 0.1)' }}
                />
                <Bar dataKey="value" fill={CHART_BAR_COLOR} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Down-by-down stacked */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="size-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
              Pass/Run by Down
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={downData} margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.31 0.012 150 / 0.4)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'oklch(0.71 0.012 150)', fontSize: 11 }}
                axisLine={{ stroke: 'oklch(0.31 0.012 150)' }}
              />
              <YAxis
                tick={{ fill: 'oklch(0.71 0.012 150)', fontSize: 10 }}
                axisLine={{ stroke: 'oklch(0.31 0.012 150)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--popover-foreground)',
                  fontSize: '12px',
                }}
                cursor={{ fill: 'oklch(0.62 0.16 152 / 0.1)' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="pass" stackId="a" fill={CHART_BAR_ALT} name="Pass" radius={[0, 0, 0, 0]} />
              <Bar dataKey="run" stackId="a" fill={CHART_BAR_COLOR} name="Run" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Coverage / Formation combined */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Hash className="size-4 text-chart-5" />
            <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
              Coverage Distribution
            </h3>
          </div>
          {coverageData.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
              No coverage data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={coverageData} layout="vertical" margin={{ left: 10, right: 20, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.31 0.012 150 / 0.4)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: 'oklch(0.71 0.012 150)', fontSize: 10 }}
                  axisLine={{ stroke: 'oklch(0.31 0.012 150)' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{ fill: 'oklch(0.71 0.012 150)', fontSize: 10 }}
                  axisLine={{ stroke: 'oklch(0.31 0.012 150)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--popover)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--popover-foreground)',
                    fontSize: '12px',
                  }}
                  cursor={{ fill: 'oklch(0.62 0.16 152 / 0.1)' }}
                />
                <Bar dataKey="value" fill={CHART_BAR_ACCENT} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Formation breakdown */}
      {formationData.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="size-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
              Formation Breakdown
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {formationData.map((f, i) => (
              <motion.div
                key={f.name}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-md border border-border bg-background/40 p-2.5"
              >
                <div className="text-xs font-mono text-muted-foreground truncate">{f.name}</div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-lg font-bold font-mono text-primary">{f.value}</span>
                  <span className="text-[10px] text-muted-foreground">
                    ({filtered.length > 0 ? Math.round((f.value / filtered.length) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden mt-1.5">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${filtered.length > 0 ? (f.value / filtered.length) * 100 : 0}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default function TendencyLab() {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, refetchOnWindowFocus: false },
        },
      })
  )
  return (
    <QueryClientProvider client={queryClient}>
      <TendencyMain />
    </QueryClientProvider>
  )
}
