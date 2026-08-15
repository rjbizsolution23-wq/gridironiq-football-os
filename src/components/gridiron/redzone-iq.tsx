'use client'

import * as React from 'react'
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  AlertTriangle,
  Crosshair,
  Flame,
  Grid3x3,
  Lightbulb,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'

interface RzPlay {
  id: string
  playId: string
  name: string
  side: string
  concept: string
  personnel: string | null
  motion: string | null
  coverageTargets: string[]
  fieldZones: string[]
  coachingPoints: string | null
  readType: string | null
  readDefender: string | null
  assignments: Array<{ position: string; assignment: string; landmark: string; vsMan: string; vsZone: string }>
}

interface RzSnap {
  id: string
  yardLine: number
  playType: string | null
  concept: string | null
  yardsGained: number
  success: boolean
  explosive: boolean
  turnover: boolean
  down: number
  distance: number
}

interface RzData {
  plays: RzPlay[]
  snapResults: RzSnap[]
}

// Red zone = yard line 50-100 (i.e., inside opponent's 50-yard line)
// For our seed data, snaps are recorded with yardLine 0-100 (50 = midfield, 100 = opp goal line)
// We treat any snap with yardLine >= 50 as a red-zone snap.
function isInRedZone(yardLine: number) {
  return yardLine >= 50
}

// Heat map zones (5-yard chunks from 50 to goal line)
const RZ_ZONES = [
  { label: '50-46', range: [50, 54], color: 'from-primary/20 to-primary/30' },
  { label: '45-41', range: [55, 59], color: 'from-primary/25 to-primary/40' },
  { label: '40-36', range: [60, 64], color: 'from-chart-3/25 to-chart-3/40' },
  { label: '35-31', range: [65, 69], color: 'from-chart-3/30 to-chart-3/50' },
  { label: '30-26', range: [70, 74], color: 'from-accent/30 to-accent/50' },
  { label: '25-21', range: [75, 79], color: 'from-accent/40 to-accent/60' },
  { label: '20-16', range: [80, 84], color: 'from-accent/50 to-accent/70' },
  { label: '15-11', range: [85, 89], color: 'from-destructive/40 to-destructive/60' },
  { label: '10-6', range: [90, 94], color: 'from-destructive/50 to-destructive/70' },
  { label: '5-1', range: [95, 100], color: 'from-destructive/60 to-destructive/80' },
]

function zoneForYardLine(yard: number): typeof RZ_ZONES[number] | null {
  return RZ_ZONES.find((z) => yard >= z.range[0] && yard <= z.range[1]) ?? null
}

function RedZoneHeatMap({ snaps }: { snaps: RzSnap[] }) {
  const rzSnaps = snaps.filter((s) => isInRedZone(s.yardLine))

  const zoneStats = RZ_ZONES.map((zone) => {
    const inZone = rzSnaps.filter((s) => s.yardLine >= zone.range[0] && s.yardLine <= zone.range[1])
    const success = inZone.filter((s) => s.success).length
    const explosive = inZone.filter((s) => s.explosive).length
    const turnover = inZone.filter((s) => s.turnover).length
    const avgYards = inZone.length > 0 ? Math.round((inZone.reduce((a, s) => a + s.yardsGained, 0) / inZone.length) * 10) / 10 : 0
    const successRate = inZone.length > 0 ? Math.round((success / inZone.length) * 100) : 0
    return {
      ...zone,
      snaps: inZone.length,
      success,
      explosive,
      turnover,
      avgYards,
      successRate,
    }
  })

  const maxSnaps = Math.max(1, ...zoneStats.map((z) => z.snaps))

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Grid3x3 className="size-4 text-accent" />
          <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
            Red Zone Efficiency Heat Map
          </h3>
        </div>
        <Badge variant="outline" className="font-mono text-xs">
          {rzSnaps.length} snaps in RZ
        </Badge>
      </div>
      <Separator className="mb-3" />

      {/* Heat map visualization */}
      <div className="grid grid-cols-10 gap-1 mb-4">
        {zoneStats.map((zone, i) => {
          const intensity = zone.snaps / maxSnaps
          return (
            <div
              key={zone.label}
              className={cn(
                'rounded-md p-2 bg-gradient-to-b border border-border/40 text-center hover:scale-105 transition-transform cursor-default',
                zone.color
              )}
              style={{ opacity: 0.4 + intensity * 0.6 }}
              title={`${zone.label} yards · ${zone.snaps} snaps · ${zone.successRate}% SR · ${zone.avgYards} yds/play`}
            >
              <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
                {zone.label.split('-')[0]}
              </div>
              <div className="text-lg font-bold font-mono text-foreground mt-0.5">
                {zone.snaps}
              </div>
              <div className="text-[9px] font-mono text-muted-foreground mt-0.5">
                {zone.successRate}%
              </div>
            </div>
          )
        })}
      </div>

      {/* Heat legend */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-3">
        <span className="flex items-center gap-1.5">
          <Crosshair className="size-3" />
          Field Position
        </span>
        <span className="flex items-center gap-1.5">
          Midfield
          <span className="opacity-40">→</span>
          Goal Line
        </span>
      </div>

      {/* Zone breakdown table */}
      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted/40">
            <tr className="text-left">
              <th className="px-2.5 py-1.5 text-[10px] uppercase tracking-widest font-mono text-muted-foreground">Zone</th>
              <th className="px-2.5 py-1.5 text-[10px] uppercase tracking-widest font-mono text-muted-foreground text-right">Snaps</th>
              <th className="px-2.5 py-1.5 text-[10px] uppercase tracking-widest font-mono text-muted-foreground text-right">SR%</th>
              <th className="px-2.5 py-1.5 text-[10px] uppercase tracking-widest font-mono text-muted-foreground text-right">Avg Yds</th>
              <th className="px-2.5 py-1.5 text-[10px] uppercase tracking-widest font-mono text-muted-foreground text-right">Exp</th>
              <th className="px-2.5 py-1.5 text-[10px] uppercase tracking-widest font-mono text-muted-foreground text-right">TO</th>
            </tr>
          </thead>
          <tbody>
            {zoneStats
              .filter((z) => z.snaps > 0)
              .map((zone, i) => (
                <tr key={zone.label} className={cn('border-t border-border', i % 2 === 0 ? 'bg-background/40' : 'bg-muted/10')}>
                  <td className="px-2.5 py-1.5 font-mono">
                    <div className="flex items-center gap-1.5">
                      <div className={cn('size-2 rounded-full bg-gradient-to-b', zone.color)} />
                      {zone.label}
                    </div>
                  </td>
                  <td className="px-2.5 py-1.5 text-right font-mono">{zone.snaps}</td>
                  <td className={cn('px-2.5 py-1.5 text-right font-mono font-bold',
                    zone.successRate >= 60 ? 'text-primary' : zone.successRate >= 40 ? 'text-chart-3' : 'text-destructive')}>
                    {zone.successRate}%
                  </td>
                  <td className="px-2.5 py-1.5 text-right font-mono">{zone.avgYards}</td>
                  <td className="px-2.5 py-1.5 text-right font-mono text-accent">{zone.explosive || '—'}</td>
                  <td className="px-2.5 py-1.5 text-right font-mono text-destructive">{zone.turnover || '—'}</td>
                </tr>
              ))}
            {zoneStats.filter((z) => z.snaps > 0).length === 0 && (
              <tr>
                <td colSpan={6} className="px-2.5 py-6 text-center text-muted-foreground">
                  No red-zone snaps recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function TopRzConcepts({ snaps }: { snaps: RzSnap[] }) {
  const rzSnaps = snaps.filter((s) => isInRedZone(s.yardLine))
  const byConcept = new Map<string, { attempts: number; success: number; yards: number; explosive: number }>()
  for (const s of rzSnaps) {
    const c = s.concept ?? 'unknown'
    const entry = byConcept.get(c) ?? { attempts: 0, success: 0, yards: 0, explosive: 0 }
    entry.attempts++
    if (s.success) entry.success++
    entry.yards += s.yardsGained
    if (s.explosive) entry.explosive++
    byConcept.set(c, entry)
  }
  const ranked = Array.from(byConcept.entries())
    .map(([concept, v]) => ({
      concept,
      ...v,
      successRate: v.attempts > 0 ? Math.round((v.success / v.attempts) * 100) : 0,
      avgYards: v.attempts > 0 ? Math.round((v.yards / v.attempts) * 10) / 10 : 0,
    }))
    .sort((a, b) => b.attempts - a.attempts)
    .slice(0, 8)

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="size-4 text-accent" />
        <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
          Top Red-Zone Concepts
        </h3>
      </div>
      {ranked.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No red-zone concept data available.
        </div>
      ) : (
        <div className="space-y-2">
          {ranked.map((row, i) => (
            <div
              key={row.concept}
              className="rounded-md border border-border bg-background/40 p-2.5"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground w-4">{i + 1}</span>
                  <span className="text-sm font-semibold capitalize">
                    {row.concept.replace(/_/g, ' ')}
                  </span>
                  {i === 0 && <Trophy className="size-3 text-accent" />}
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'font-mono text-[10px]',
                    row.successRate >= 60
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : row.successRate >= 40
                      ? 'bg-chart-3/10 text-chart-3 border-chart-3/30'
                      : 'bg-destructive/10 text-destructive border-destructive/30'
                  )}
                >
                  {row.successRate}% SR
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono pl-6">
                <span>{row.attempts} att</span>
                <span className="text-primary">{row.avgYards} yds/play</span>
                {row.explosive > 0 && (
                  <span className="text-accent flex items-center gap-0.5">
                    <Zap className="size-2.5" />
                    {row.explosive} exp
                  </span>
                )}
              </div>
              {/* Visual bar */}
              <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden ml-6">
                <div
                  className={cn(
                    'h-full transition-all',
                    row.successRate >= 60 ? 'bg-primary' : row.successRate >= 40 ? 'bg-chart-3' : 'bg-destructive'
                  )}
                  style={{ width: `${row.successRate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function RzPlayPicker({ plays }: { plays: RzPlay[] }) {
  const setSelectedPlayId = useAppStore((s) => s.setSelectedPlayId)
  const setActiveModule = useAppStore((s) => s.setActiveModule)
  const [zoneFilter, setZoneFilter] = React.useState<'high' | 'low' | 'gl'>('high')

  // Filter plays that have red-zone field zones
  const rzPlays = plays.filter((p) =>
    p.side === 'offense' &&
    (p.fieldZones.some((z) => z.includes('red')) || p.fieldZones.length > 0)
  )

  const filtered = rzPlays.filter((p) => {
    if (zoneFilter === 'high') return p.fieldZones.some((z) => z.includes('high_red'))
    if (zoneFilter === 'low') return p.fieldZones.some((z) => z.includes('low_red'))
    if (zoneFilter === 'gl') return p.fieldZones.some((z) => z.includes('goal'))
    return true
  })

  function openPlay(id: string) {
    setSelectedPlayId(id)
    setActiveModule('playbook')
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="size-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
            Red-Zone Play Selector
          </h3>
        </div>
      </div>
      <Tabs value={zoneFilter} onValueChange={(v) => setZoneFilter(v as typeof zoneFilter)}>
        <TabsList className="w-full">
          <TabsTrigger value="high" className="text-xs flex-1">
            High Red (25-15)
          </TabsTrigger>
          <TabsTrigger value="low" className="text-xs flex-1">
            Low Red (15-5)
          </TabsTrigger>
          <TabsTrigger value="gl" className="text-xs flex-1">
            Goal Line (5-in)
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <ScrollArea className="max-h-[360px] scrollbar-thin mt-3 -mx-1 px-1">
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No plays tagged for this zone yet.
            </div>
          ) : (
            filtered.map((play) => (
              <button
                key={play.id}
                onClick={() => openPlay(play.id)}
                className="w-full group flex items-center gap-2.5 rounded-lg border border-border bg-background/40 hover:bg-primary/5 hover:border-primary/40 hover:shadow-md p-2.5 transition-all text-left"
              >
                <div className="size-9 rounded-md bg-accent/15 text-accent flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Crosshair className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{play.name}</div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                    <span>{play.playId}</span>
                    <span className="opacity-40">·</span>
                    <span className="capitalize">{play.concept.replace(/_/g, ' ')}</span>
                    {play.personnel && (
                      <>
                        <span className="opacity-40">·</span>
                        <span>Pers {play.personnel}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 justify-end max-w-[120px]">
                  {play.coverageTargets.slice(0, 2).map((c) => (
                    <Badge key={c} variant="outline" className="text-[9px] font-mono bg-muted/30">
                      {c.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}

function RedZoneMain() {
  const { data } = useQuery({
    queryKey: ['gridiron'],
    queryFn: async () => {
      const r = await fetch('/api/gridiron')
      if (!r.ok) throw new Error('failed')
      return r.json() as Promise<RzData>
    },
    staleTime: 60_000,
  })

  const plays = data?.plays ?? []
  const snaps = data?.snapResults ?? []

  const rzSnaps = snaps.filter((s) => isInRedZone(s.yardLine))
  const rzSuccess = rzSnaps.filter((s) => s.success).length
  const rzExplosive = rzSnaps.filter((s) => s.explosive).length
  const rzTurnover = rzSnaps.filter((s) => s.turnover).length
  const rzAvgYards =
    rzSnaps.length > 0
      ? Math.round((rzSnaps.reduce((a, s) => a + s.yardsGained, 0) / rzSnaps.length) * 10) / 10
      : 0
  const rzSuccessRate = rzSnaps.length > 0 ? Math.round((rzSuccess / rzSnaps.length) * 100) : 0

  const tdPlays = rzSnaps.filter((s) => s.yardsGained + s.yardLine >= 100).length
  const tdRate = rzSnaps.length > 0 ? Math.round((tdPlays / rzSnaps.length) * 100) : 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 stadium-sweep glow-primary-soft">
        <div className="absolute inset-0 turf-texture opacity-40" />
        <div className="absolute inset-0 field-grid-overlay opacity-60" />
        <div className="relative flex items-start gap-3">
          <div className="size-12 rounded-xl helmet-gradient flex items-center justify-center shadow-lg helmet-shine shrink-0">
            <Flame className="size-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
              RedZoneIQ™ · Red Zone Intelligence
            </div>
            <h2 className="text-xl font-bold leading-tight gradient-text-primary">
              Red Zone Performance
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {rzSnaps.length} RZ snaps · {rzSuccessRate}% success rate ·{' '}
              <span className="text-accent font-mono">{tdRate}% TD rate</span> ·{' '}
              {rzAvgYards} yds/play · {rzTurnover} turnovers
            </p>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <Card className="p-3 slide-up-fade stagger-1 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">RZ Snaps</span>
            <Target className="size-3.5 text-muted-foreground" />
          </div>
          <div className="text-xl font-bold font-mono mt-1">{rzSnaps.length}</div>
        </Card>
        <Card className="p-3 slide-up-fade stagger-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Success Rate</span>
            <TrendingUp className="size-3.5 text-primary" />
          </div>
          <div className={cn('text-xl font-bold font-mono mt-1', rzSuccessRate >= 50 ? 'text-primary' : 'text-accent')}>
            {rzSuccessRate}%
          </div>
        </Card>
        <Card className="p-3 slide-up-fade stagger-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">TD Rate</span>
            <Trophy className="size-3.5 text-accent" />
          </div>
          <div className="text-xl font-bold font-mono mt-1 text-accent">{tdRate}%</div>
        </Card>
        <Card className="p-3 slide-up-fade stagger-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Explosives</span>
            <Zap className="size-3.5 text-accent" />
          </div>
          <div className="text-xl font-bold font-mono mt-1 text-accent">{rzExplosive}</div>
        </Card>
        <Card className="p-3 slide-up-fade stagger-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Turnovers</span>
            <TrendingDown className="size-3.5 text-destructive" />
          </div>
          <div className="text-xl font-bold font-mono mt-1 text-destructive">{rzTurnover}</div>
        </Card>
      </div>

      {/* Coaching insight callout */}
      <Card className={cn(
        'p-4 border-l-4',
        rzSuccessRate >= 50
          ? 'border-l-primary bg-primary/5'
          : 'border-l-accent bg-accent/5'
      )}>
        <div className="flex items-start gap-3">
          {rzSuccessRate >= 50 ? (
            <Lightbulb className="size-4 text-primary mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle className="size-4 text-accent mt-0.5 shrink-0" />
          )}
          <div className="flex-1">
            <div className={cn('text-xs uppercase tracking-widest font-mono mb-1',
              rzSuccessRate >= 50 ? 'text-primary' : 'text-accent'
            )}>
              Coaching Insight
            </div>
            <p className="text-sm leading-relaxed">
              {rzSnaps.length === 0
                ? 'No red-zone snaps in the data set yet. Install red-zone specific plays and tag game film to populate this view.'
                : rzSuccessRate >= 50
                ? `Red zone efficiency is strong at ${rzSuccessRate}%. TD rate of ${tdRate}% is above the 30% NCAA average. Continue prioritizing high-percentage concepts.`
                : `Red zone efficiency is ${rzSuccessRate}% — below the 50% target. TD rate is ${tdRate}%. Consider installing more compact formations (Bunch, Trey) and high-percentage concepts like Stick, Mesh, and QB run.`
              }
            </p>
          </div>
        </div>
      </Card>

      {/* Main grid: heat map + concept list / play selector */}
      <div className="grid lg:grid-cols-2 gap-4">
        <RedZoneHeatMap snaps={snaps} />
        <div className="space-y-4">
          <TopRzConcepts snaps={snaps} />
        </div>
      </div>

      <RzPlayPicker plays={plays} />
    </div>
  )
}

export default function RedZoneIQ() {
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
      <RedZoneMain />
    </QueryClientProvider>
  )
}
