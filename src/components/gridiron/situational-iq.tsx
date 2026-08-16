'use client'

import * as React from 'react'
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  BarChart3,
  ChevronRight,
  Crosshair,
  Filter,
  Grid3x3,
  Hash,
  Layers,
  Lightbulb,
  MapPin,
  PieChart,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface SitSnap {
  id: string
  gameId: string | null
  playId: string | null
  opponentId: string | null
  quarter: number
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
  negative: boolean
  turnover: boolean
  opponent?: { name: string; mascot: string | null } | null
}

interface SitData {
  snapResults: SitSnap[]
  games: Array<{ id: string; week: number; opponent?: { name: string } | null }>
}

type DownBucket = 'all' | '1st' | '2nd' | '3rd' | '4th'
type DistanceBucket = 'all' | 'short' | 'medium' | 'long' | 'goalline' | 'redzone'
type HashBucket = 'all' | 'L' | 'M' | 'R'
type FieldZoneBucket = 'all' | 'backed_up' | 'coming_out' | 'open_field' | 'high_red' | 'low_red' | 'goal_line'

const DISTANCE_META: Record<DistanceBucket, { label: string; test: (d: number) => boolean }> = {
  all: { label: 'All', test: () => true },
  short: { label: 'Short (≤3)', test: (d) => d >= 1 && d <= 3 },
  medium: { label: 'Medium (4-6)', test: (d) => d >= 4 && d <= 6 },
  long: { label: 'Long (7+)', test: (d) => d >= 7 },
  goalline: { label: 'Goal Line', test: (d) => d <= 2 },
  redzone: { label: 'Red Zone', test: () => false }, // handled via yardLine
}

function yardLineToZone(yardLine: number): FieldZoneBucket {
  // yardLine 0 = own goal, 100 = opp goal
  if (yardLine <= 10) return 'backed_up'
  if (yardLine <= 25) return 'coming_out'
  if (yardLine < 75) return 'open_field'
  if (yardLine < 85) return 'high_red'
  if (yardLine < 95) return 'low_red'
  return 'goal_line'
}

const FIELD_ZONE_META: Record<FieldZoneBucket, { label: string; color: string }> = {
  all: { label: 'All', color: 'text-muted-foreground' },
  backed_up: { label: 'Backed Up (own 1-10)', color: 'text-chart-5' },
  coming_out: { label: 'Coming Out (own 11-25)', color: 'text-chart-5' },
  open_field: { label: 'Open Field (own 26 - opp 25)', color: 'text-primary' },
  high_red: { label: 'High Red (opp 25-15)', color: 'text-chart-3' },
  low_red: { label: 'Low Red (opp 15-5)', color: 'text-accent' },
  goal_line: { label: 'Goal Line (opp 5-in)', color: 'text-destructive' },
}

const DOWN_OPTIONS: Array<{ id: DownBucket; label: string }> = [
  { id: 'all', label: 'All' },
  { id: '1st', label: '1st' },
  { id: '2nd', label: '2nd' },
  { id: '3rd', label: '3rd' },
  { id: '4th', label: '4th' },
]

const DISTANCE_OPTIONS: Array<{ id: DistanceBucket; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'short', label: 'Short (≤3)' },
  { id: 'medium', label: 'Medium (4-6)' },
  { id: 'long', label: 'Long (7+)' },
]

const HASH_OPTIONS: Array<{ id: HashBucket; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'L', label: 'Left' },
  { id: 'M', label: 'Middle' },
  { id: 'R', label: 'Right' },
]

const FIELD_ZONE_OPTIONS: Array<{ id: FieldZoneBucket; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'backed_up', label: 'Backed Up' },
  { id: 'coming_out', label: 'Coming Out' },
  { id: 'open_field', label: 'Open Field' },
  { id: 'high_red', label: 'High Red' },
  { id: 'low_red', label: 'Low Red' },
  { id: 'goal_line', label: 'Goal Line' },
]

function filterSnaps(
  snaps: SitSnap[],
  filters: {
    down: DownBucket
    distance: DistanceBucket
    hash: HashBucket
    fieldZone: FieldZoneBucket
  }
): SitSnap[] {
  return snaps.filter((s) => {
    if (filters.down !== 'all') {
      const downNum = filters.down === '1st' ? 1 : filters.down === '2nd' ? 2 : filters.down === '3rd' ? 3 : 4
      if (s.down !== downNum) return false
    }
    if (filters.distance !== 'all') {
      if (filters.distance === 'redzone') {
        // distance is red zone — handled by field zone instead
      } else if (!DISTANCE_META[filters.distance].test(s.distance)) {
        return false
      }
    }
    if (filters.hash !== 'all') {
      const snapHash = s.hash?.toUpperCase().startsWith('L')
        ? 'L'
        : s.hash?.toUpperCase().startsWith('R')
        ? 'R'
        : 'M'
      if (snapHash !== filters.hash) return false
    }
    if (filters.fieldZone !== 'all') {
      if (yardLineToZone(s.yardLine) !== filters.fieldZone) return false
    }
    return true
  })
}

function computeStats(snaps: SitSnap[]) {
  if (snaps.length === 0) {
    return {
      total: 0,
      successRate: 0,
      avgYards: 0,
      explosiveRate: 0,
      negativeRate: 0,
      turnoverRate: 0,
      passShare: 0,
      runShare: 0,
    }
  }
  const total = snaps.length
  const success = snaps.filter((s) => s.success).length
  const explosive = snaps.filter((s) => s.explosive).length
  const negative = snaps.filter((s) => s.negative).length
  const turnover = snaps.filter((s) => s.turnover).length
  const yards = snaps.reduce((a, s) => a + s.yardsGained, 0)
  const pass = snaps.filter((s) => s.playType === 'pass').length
  const run = snaps.filter((s) => s.playType === 'run').length
  return {
    total,
    successRate: Math.round((success / total) * 100),
    avgYards: Math.round((yards / total) * 10) / 10,
    explosiveRate: Math.round((explosive / total) * 100),
    negativeRate: Math.round((negative / total) * 100),
    turnoverRate: Math.round((turnover / total) * 100),
    passShare: Math.round((pass / total) * 100),
    runShare: Math.round((run / total) * 100),
  }
}

function computeConceptDistribution(snaps: SitSnap[]) {
  const map = new Map<string, { attempts: number; success: number; yards: number }>()
  for (const s of snaps) {
    const c = s.concept ?? 'unknown'
    const entry = map.get(c) ?? { attempts: 0, success: 0, yards: 0 }
    entry.attempts++
    if (s.success) entry.success++
    entry.yards += s.yardsGained
    map.set(c, entry)
  }
  return Array.from(map.entries())
    .map(([concept, v]) => ({
      concept,
      ...v,
      successRate: v.attempts > 0 ? Math.round((v.success / v.attempts) * 100) : 0,
      avgYards: v.attempts > 0 ? Math.round((v.yards / v.attempts) * 10) / 10 : 0,
    }))
    .sort((a, b) => b.attempts - a.attempts)
}

function FilterChip<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Array<{ id: T; label: string }>
  value: T
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1.5">
        {label}
      </div>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={cn(
              'text-[11px] px-2 py-1 rounded-md border font-mono transition-all',
              value === o.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground hover:border-primary/40'
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function StatTile({
  label,
  value,
  suffix,
  icon,
  color = 'text-foreground',
  hint,
}: {
  label: string
  value: string | number
  suffix?: string
  icon: React.ReactNode
  color?: string
  hint?: string
}) {
  return (
    <Card className="p-3 slide-up-fade hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
          {label}
        </span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <div className={cn('text-xl font-bold font-mono mt-1', color)}>
        {value}
        {suffix && <span className="text-xs ml-0.5 text-muted-foreground">{suffix}</span>}
      </div>
      {hint && <div className="text-[10px] text-muted-foreground mt-0.5">{hint}</div>}
    </Card>
  )
}

function SituationalMain() {
  const { data } = useQuery({
    queryKey: ['gridiron'],
    queryFn: async () => {
      const r = await fetch('/api/gridiron')
      if (!r.ok) throw new Error('failed')
      return r.json() as Promise<SitData>
    },
    staleTime: 60_000,
  })

  const snaps = data?.snapResults ?? []

  const [down, setDown] = React.useState<DownBucket>('all')
  const [distance, setDistance] = React.useState<DistanceBucket>('all')
  const [hash, setHash] = React.useState<HashBucket>('all')
  const [fieldZone, setFieldZone] = React.useState<FieldZoneBucket>('all')

  const filtered = React.useMemo(
    () => filterSnaps(snaps, { down, distance, hash, fieldZone }),
    [snaps, down, distance, hash, fieldZone]
  )

  const stats = React.useMemo(() => computeStats(filtered), [filtered])
  const conceptDist = React.useMemo(() => computeConceptDistribution(filtered), [filtered])

  // Build a 2D matrix: down × distance for the "all filters" view
  const matrix = React.useMemo(() => {
    const rows: DownBucket[] = ['1st', '2nd', '3rd', '4th']
    const cols: DistanceBucket[] = ['short', 'medium', 'long']
    return rows.map((d) =>
      cols.map((dist) => {
        const cellSnaps = filterSnaps(snaps, { down: d, distance: dist, hash, fieldZone })
        const cellStats = computeStats(cellSnaps)
        return { down: d, distance: dist, ...cellStats }
      })
    )
  }, [snaps, hash, fieldZone])

  const maxCellSnaps = Math.max(1, ...matrix.flat().map((c) => c.total))

  const activeFilterCount =
    (down !== 'all' ? 1 : 0) +
    (distance !== 'all' ? 1 : 0) +
    (hash !== 'all' ? 1 : 0) +
    (fieldZone !== 'all' ? 1 : 0)

  function resetFilters() {
    setDown('all')
    setDistance('all')
    setHash('all')
    setFieldZone('all')
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 stadium-sweep glow-primary-soft">
        <div className="absolute inset-0 turf-texture opacity-40" />
        <div className="absolute inset-0 field-grid-overlay opacity-60" />
        <div className="relative flex items-start gap-3">
          <div className="size-12 rounded-xl helmet-gradient flex items-center justify-center shadow-lg helmet-shine shrink-0">
            <Crosshair className="size-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
              SituationalIQ™ · Unified Situational Deep-Dive
            </div>
            <h2 className="text-xl font-bold leading-tight gradient-text-primary">
              Situation Explorer
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {snaps.length} total snaps · {filtered.length} match current filters ·{' '}
              {stats.successRate}% success rate · {stats.avgYards} yds/play
            </p>
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-xs text-muted-foreground hover:text-foreground border border-border hover:border-primary/40 rounded-md px-2 py-1 transition-colors"
            >
              Reset ({activeFilterCount})
            </button>
          )}
        </div>
      </div>

      {/* Filter panel */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="size-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
            Situation Filters
          </h3>
          <Badge variant="outline" className="ml-auto text-[10px] font-mono">
            {filtered.length} / {snaps.length} snaps
          </Badge>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FilterChip
            label="Down"
            options={DOWN_OPTIONS}
            value={down}
            onChange={setDown}
          />
          <FilterChip
            label="Distance"
            options={DISTANCE_OPTIONS}
            value={distance}
            onChange={setDistance}
          />
          <FilterChip
            label="Hash"
            options={HASH_OPTIONS}
            value={hash}
            onChange={setHash}
          />
          <FilterChip
            label="Field Zone"
            options={FIELD_ZONE_OPTIONS}
            value={fieldZone}
            onChange={setFieldZone}
          />
        </div>
      </Card>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        <StatTile
          label="Snaps"
          value={stats.total}
          icon={<Activity className="size-3.5" />}
        />
        <StatTile
          label="Success"
          value={stats.successRate}
          suffix="%"
          icon={<Target className="size-3.5" />}
          color={stats.successRate >= 60 ? 'text-primary' : stats.successRate >= 40 ? 'text-chart-3' : 'text-destructive'}
        />
        <StatTile
          label="Avg Yds"
          value={stats.avgYards}
          icon={<TrendingUp className="size-3.5" />}
          color="text-primary"
        />
        <StatTile
          label="Explosive"
          value={stats.explosiveRate}
          suffix="%"
          icon={<Zap className="size-3.5" />}
          color="text-accent"
        />
        <StatTile
          label="Negative"
          value={stats.negativeRate}
          suffix="%"
          icon={<TrendingUp className="size-3.5 rotate-180" />}
          color="text-destructive"
        />
        <StatTile
          label="Turnover"
          value={stats.turnoverRate}
          suffix="%"
          icon={<Crosshair className="size-3.5" />}
          color="text-destructive"
        />
        <StatTile
          label="Pass/Run"
          value={`${stats.passShare}/${stats.runShare}`}
          icon={<PieChart className="size-3.5" />}
          hint="split %"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Down × Distance matrix */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Grid3x3 className="size-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
              Down × Distance Matrix
            </h3>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">
            Cell color intensity = sample size. Number = success rate. Sub = avg yards.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left p-1.5 text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
                    Down
                  </th>
                  {['Short (≤3)', 'Medium (4-6)', 'Long (7+)'].map((c) => (
                    <th
                      key={c}
                      className="text-center p-1.5 text-[10px] uppercase tracking-widest font-mono text-muted-foreground"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, i) => (
                  <tr key={i}>
                    <td className="p-1.5 text-xs font-mono font-semibold">
                      {i + 1}
                      <sup>{i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'}</sup>
                    </td>
                    {row.map((cell, j) => {
                      const intensity = cell.total / maxCellSnaps
                      return (
                        <td key={j} className="p-1">
                          <div
                            className={cn(
                              'rounded-md p-2 text-center transition-all hover:scale-105 cursor-default',
                              cell.total === 0
                                ? 'bg-muted/20 border border-border/40'
                                : 'border border-primary/20'
                            )}
                            style={{
                              backgroundColor:
                                cell.total > 0
                                  ? `oklch(0.62 0.16 152 / ${0.1 + intensity * 0.45})`
                                  : undefined,
                            }}
                            title={`${cell.total} snaps · ${cell.successRate}% SR · ${cell.avgYards} yds/play`}
                          >
                            <div className="text-base font-bold font-mono text-foreground">
                              {cell.total > 0 ? `${cell.successRate}%` : '—'}
                            </div>
                            <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                              {cell.total > 0 ? `${cell.avgYards} yds · n=${cell.total}` : 'no data'}
                            </div>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Concept distribution */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="size-4 text-chart-3" />
            <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
              Concept Distribution (filtered)
            </h3>
          </div>
          {conceptDist.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No concepts match the current filters.
            </div>
          ) : (
            <ScrollArea className="max-h-[260px] scrollbar-thin -mx-1 px-1">
              <div className="space-y-2">
                {conceptDist.map((c, i) => (
                  <motion.div
                    key={c.concept}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15, delay: i * 0.02 }}
                    className="rounded-md border border-border bg-background/40 p-2"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-mono text-muted-foreground w-4">
                          {i + 1}
                        </span>
                        <span className="text-sm font-semibold capitalize truncate">
                          {c.concept.replace(/_/g, ' ')}
                        </span>
                        {i === 0 && <Trophy className="size-3 text-accent shrink-0" />}
                      </div>
                      <span
                        className={cn(
                          'font-mono text-xs font-bold',
                          c.successRate >= 60
                            ? 'text-primary'
                            : c.successRate >= 40
                            ? 'text-chart-3'
                            : 'text-destructive'
                        )}
                      >
                        {c.successRate}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono mb-1 pl-6">
                      <span>{c.attempts} att</span>
                      <span className="text-primary">{c.avgYards} yds</span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden ml-6">
                      <div
                        className={cn(
                          'h-full transition-all',
                          c.successRate >= 60
                            ? 'bg-primary'
                            : c.successRate >= 40
                            ? 'bg-chart-3'
                            : 'bg-destructive'
                        )}
                        style={{ width: `${c.successRate}%` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </Card>
      </div>

      {/* Coaching insight */}
      <Card
        className={cn(
          'p-4 border-l-4',
          stats.successRate >= 60
            ? 'border-l-primary bg-primary/5'
            : stats.successRate >= 40
            ? 'border-l-chart-3 bg-chart-3/5'
            : 'border-l-destructive bg-destructive/5'
        )}
      >
        <div className="flex items-start gap-3">
          {stats.successRate >= 60 ? (
            <Lightbulb className="size-4 text-primary mt-0.5 shrink-0" />
          ) : (
            <Crosshair className={cn('size-4 mt-0.5 shrink-0', stats.successRate >= 40 ? 'text-chart-3' : 'text-destructive')} />
          )}
          <div className="flex-1">
            <div
              className={cn(
                'text-xs uppercase tracking-widest font-mono mb-1',
                stats.successRate >= 60
                  ? 'text-primary'
                  : stats.successRate >= 40
                  ? 'text-chart-3'
                  : 'text-destructive'
              )}
            >
              Coaching Insight
            </div>
            <p className="text-sm leading-relaxed">
              {filtered.length === 0 ? (
                'No snaps match the current filter combination. Try widening your filters.'
              ) : stats.successRate >= 60 ? (
                <>
                  This situation is performing well at <strong className="font-mono">{stats.successRate}%</strong> success
                  rate across <strong className="font-mono">{stats.total}</strong> snaps. Continue leaning on
                  {' '}<strong className="font-mono">{conceptDist[0]?.concept.replace(/_/g, ' ') ?? 'your top concept'}</strong>{' '}
                  as the primary call. Watch for over-use — consider mixing in{' '}
                  <strong className="font-mono">{conceptDist[1]?.concept.replace(/_/g, ' ') ?? 'a complementary concept'}</strong>{' '}
                  to keep the defense honest.
                </>
              ) : stats.successRate >= 40 ? (
                <>
                  This situation is marginal at <strong className="font-mono">{stats.successRate}%</strong> success
                  rate. The top concept{' '}
                  <strong className="font-mono">{conceptDist[0]?.concept.replace(/_/g, ' ') ?? 'unknown'}</strong>{' '}
                  is hitting <strong className="font-mono">{conceptDist[0]?.avgYards ?? 0}</strong> yds/play. Consider
                  installing a constraint or complementary concept to attack how defenses are playing this look.
                </>
              ) : (
                <>
                  This situation is underperforming at <strong className="font-mono">{stats.successRate}%</strong> success
                  rate. Sample size: <strong className="font-mono">{stats.total}</strong> snaps. Re-evaluate the
                  game plan for this situation — consider a schematic change or new concept installation.
                </>
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* Hash × Field Zone grid */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Hash className="size-4 text-chart-5" />
          <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
            Hash × Field Zone Performance
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left p-1.5 text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
                  Hash
                </th>
                {(['backed_up', 'coming_out', 'open_field', 'high_red', 'low_red', 'goal_line'] as FieldZoneBucket[]).map((z) => (
                  <th
                    key={z}
                    className="text-center p-1.5 text-[10px] uppercase tracking-widest font-mono text-muted-foreground"
                  >
                    {FIELD_ZONE_META[z].label.split(' (')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(['L', 'M', 'R'] as HashBucket[]).map((h) => (
                <tr key={h}>
                  <td className="p-1.5 text-xs font-mono font-semibold">
                    {h === 'L' ? 'Left' : h === 'M' ? 'Middle' : 'Right'}
                  </td>
                  {(['backed_up', 'coming_out', 'open_field', 'high_red', 'low_red', 'goal_line'] as FieldZoneBucket[]).map((z) => {
                    const cellSnaps = filterSnaps(snaps, {
                      down,
                      distance,
                      hash: h,
                      fieldZone: z,
                    })
                    const c = computeStats(cellSnaps)
                    return (
                      <td key={z} className="p-1">
                        <div
                          className="rounded-md p-1.5 text-center bg-muted/20 border border-border/40 hover:border-primary/40 transition-colors"
                          title={`${c.total} snaps · ${c.successRate}% SR · ${c.avgYards} yds`}
                        >
                          <div className="text-xs font-bold font-mono text-foreground">
                            {c.total > 0 ? `${c.successRate}%` : '—'}
                          </div>
                          <div className="text-[9px] font-mono text-muted-foreground mt-0.5">
                            {c.total > 0 ? `n=${c.total}` : ''}
                          </div>
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent snaps list */}
      {filtered.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="size-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
              Matching Snaps
            </h3>
            <Badge variant="outline" className="ml-auto text-[10px] font-mono">
              {filtered.length} snaps
            </Badge>
          </div>
          <ScrollArea className="max-h-[280px] scrollbar-thin -mx-1 px-1">
            <div className="space-y-1">
              {filtered.slice(0, 20).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 rounded-md border border-border bg-background/40 p-2 text-xs hover:bg-muted/20 transition-colors"
                >
                  <Badge variant="outline" className="font-mono text-[10px] w-12 justify-center">
                    {s.down === 1 ? '1st' : s.down === 2 ? '2nd' : s.down === 3 ? '3rd' : '4th'}&{s.distance}
                  </Badge>
                  <span className="font-mono text-muted-foreground text-[10px] w-16">
                    {s.hash ?? 'M'} · {s.yardLine}
                  </span>
                  <span className="flex-1 font-semibold capitalize truncate">
                    {s.concept?.replace(/_/g, ' ') ?? 'unknown'}
                  </span>
                  {s.playType && (
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[9px] uppercase font-mono',
                        s.playType === 'pass'
                          ? 'bg-chart-3/10 text-chart-3 border-chart-3/30'
                          : 'bg-primary/10 text-primary border-primary/30'
                      )}
                    >
                      {s.playType}
                    </Badge>
                  )}
                  <span
                    className={cn(
                      'font-mono text-xs font-bold w-12 text-right',
                      s.yardsGained >= 0 ? 'text-primary' : 'text-destructive'
                    )}
                  >
                    {s.yardsGained >= 0 ? '+' : ''}{s.yardsGained}
                  </span>
                  {s.explosive && <Zap className="size-3 text-accent" />}
                  {s.turnover && <Crosshair className="size-3 text-destructive" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  )
}

export default function SituationalIQ() {
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
      <SituationalMain />
    </QueryClientProvider>
  )
}
