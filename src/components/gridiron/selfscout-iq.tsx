'use client'

import * as React from 'react'
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  BarChart3,
  Crosshair,
  Eye,
  Flame,
  Lightbulb,
  PieChart,
  RefreshCw,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
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
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface SelfScoutSnap {
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
  negative: boolean
  turnover: boolean
}

interface SelfScoutData {
  snapResults: SelfScoutSnap[]
  plays: Array<{ playId: string; name: string; concept: string; constraints: string[]; complementary: string[] }>
}

type FilterKey = 'down' | 'formation' | 'personnel' | 'hash' | 'coverage'
type FilterValue = string

interface TendencyWarning {
  id: string
  severity: 'high' | 'medium' | 'low'
  title: string
  description: string
  sample: number
  probability: number
  recommendation: string
  complementaryConcept?: string
}

function buildWarnings(snaps: SelfScoutSnap[], plays: SelfScoutData['plays']): TendencyWarning[] {
  const warnings: TendencyWarning[] = []

  // Group by formation
  const byFormation = new Map<string, SelfScoutSnap[]>()
  for (const s of snaps) {
    const f = s.formation ?? 'Unknown'
    const list = byFormation.get(f) ?? []
    list.push(s)
    byFormation.set(f, list)
  }

  // Rule 1: Formation heavy — same formation > 60% of snaps
  for (const [formation, formationSnaps] of byFormation.entries()) {
    const pct = formationSnaps.length / Math.max(snaps.length, 1)
    if (pct >= 0.6 && formationSnaps.length >= 8) {
      warnings.push({
        id: `formation-heavy-${formation}`,
        severity: pct >= 0.75 ? 'high' : 'medium',
        title: `${formation} formation over-used`,
        description: `${formation} appears in ${Math.round(pct * 100)}% of snaps (${formationSnaps.length} of ${snaps.length}). Opponents will game-plan for this look.`,
        sample: formationSnaps.length,
        probability: pct,
        recommendation: 'Add complementary formations with different backfield action to keep defenses honest.',
      })
    }
  }

  // Rule 2: Concept predictability — single concept > 50% within a formation
  for (const [formation, formationSnaps] of byFormation.entries()) {
    const byConcept = new Map<string, number>()
    for (const s of formationSnaps) {
      const c = s.concept ?? 'unknown'
      byConcept.set(c, (byConcept.get(c) ?? 0) + 1)
    }
    for (const [concept, count] of byConcept.entries()) {
      const pct = count / formationSnaps.length
      if (pct >= 0.5 && formationSnaps.length >= 6) {
        // Find complementary concept
        const matchingPlay = plays.find((p) => p.concept === concept)
        const complementary = matchingPlay?.complementary?.[0]?.replace(/_/g, ' ')
        warnings.push({
          id: `concept-pred-${formation}-${concept}`,
          severity: pct >= 0.7 ? 'high' : 'medium',
          title: `Predictable: ${concept.replace(/_/g, ' ')} from ${formation}`,
          description: `${concept.replace(/_/g, ' ')} called ${Math.round(pct * 100)}% of the time from ${formation} (${count} of ${formationSnaps.length}). Defense can sit on this.`,
          sample: count,
          probability: pct,
          recommendation: `Install complementary concept to keep defenses honest.`,
          complementaryConcept: complementary,
        })
      }
    }
  }

  // Rule 3: Pass-heavy on 1st down — > 70% pass
  const firstDownSnaps = snaps.filter((s) => s.down === 1)
  if (firstDownSnaps.length >= 8) {
    const passPct = firstDownSnaps.filter((s) => s.playType === 'pass').length / firstDownSnaps.length
    if (passPct >= 0.7) {
      warnings.push({
        id: 'pass-heavy-1st',
        severity: passPct >= 0.8 ? 'high' : 'medium',
        title: 'Pass-heavy on 1st down',
        description: `${Math.round(passPct * 100)}% of 1st down plays are passes (${firstDownSnaps.filter((s) => s.playType === 'pass').length} of ${firstDownSnaps.length}). Defense will pin ears back and rush.`,
        sample: firstDownSnaps.length,
        probability: passPct,
        recommendation: 'Mix in early-down runs to keep the defense honest and avoid predictable pass situations.',
      })
    }
  }

  // Rule 4: Run-heavy on 3rd & long — > 50% run when 7+ yards
  const thirdLongSnaps = snaps.filter((s) => s.down === 3 && s.distance >= 7)
  if (thirdLongSnaps.length >= 5) {
    const runPct = thirdLongSnaps.filter((s) => s.playType === 'run').length / thirdLongSnaps.length
    if (runPct >= 0.5) {
      warnings.push({
        id: 'run-heavy-3rd-long',
        severity: 'medium',
        title: 'Run-heavy on 3rd & long',
        description: `${Math.round(runPct * 100)}% of 3rd & 7+ are runs (${thirdLongSnaps.filter((s) => s.playType === 'run').length} of ${thirdLongSnaps.length}). Defense will play run first.`,
        sample: thirdLongSnaps.length,
        probability: runPct,
        recommendation: 'Attack vertically on 3rd & long — defense is expecting run, take your shots.',
      })
    }
  }

  // Rule 5: Underperforming concept — high usage + low success
  const byConcept = new Map<string, { attempts: number; success: number; yards: number }>()
  for (const s of snaps) {
    const c = s.concept ?? 'unknown'
    const e = byConcept.get(c) ?? { attempts: 0, success: 0, yards: 0 }
    e.attempts++
    if (s.success) e.success++
    e.yards += s.yardsGained
    byConcept.set(c, e)
  }
  for (const [concept, v] of byConcept.entries()) {
    if (v.attempts >= 4) {
      const sr = v.success / v.attempts
      if (sr < 0.4) {
        warnings.push({
          id: `underperforming-${concept}`,
          severity: 'medium',
          title: `Underperforming: ${concept.replace(/_/g, ' ')}`,
          description: `${concept.replace(/_/g, ' ')} has ${Math.round(sr * 100)}% success rate across ${v.attempts} attempts. Opponents may have figured this out.`,
          sample: v.attempts,
          probability: sr,
          recommendation: 'Evaluate why this concept is failing. Consider installing a complementary concept or shelving it temporarily.',
        })
      }
    }
  }

  // Rule 6: Hash tendency — heavy left or right > 70%
  const byHash = new Map<string, number>()
  for (const s of snaps) {
    const h = s.hash?.toUpperCase().startsWith('L') ? 'L' : s.hash?.toUpperCase().startsWith('R') ? 'R' : 'M'
    byHash.set(h, (byHash.get(h) ?? 0) + 1)
  }
  for (const [hash, count] of byHash.entries()) {
    const pct = count / Math.max(snaps.length, 1)
    if (pct >= 0.7 && snaps.length >= 10) {
      warnings.push({
        id: `hash-heavy-${hash}`,
        severity: 'low',
        title: `Hash tendency: ${hash === 'L' ? 'Left' : hash === 'R' ? 'Right' : 'Middle'} ${Math.round(pct * 100)}%`,
        description: `${Math.round(pct * 100)}% of snaps come from the ${hash === 'L' ? 'left' : hash === 'R' ? 'right' : 'middle'} hash. Defenses will shade their alignment.`,
        sample: count,
        probability: pct,
        recommendation: 'Vary your hash alignment — don\'t make it easy for defenses to pre-align.',
      })
    }
  }

  // Sort by severity
  const severityOrder = { high: 0, medium: 1, low: 2 }
  return warnings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
}

const SEVERITY_META = {
  high: { label: 'HIGH', color: 'text-destructive', bg: 'bg-destructive/15 border-destructive/30', border: 'border-l-destructive', icon: <AlertTriangle className="size-4" /> },
  medium: { label: 'MEDIUM', color: 'text-accent', bg: 'bg-accent/15 border-accent/30', border: 'border-l-accent', icon: <Eye className="size-4" /> },
  low: { label: 'LOW', color: 'text-chart-3', bg: 'bg-chart-3/15 border-chart-3/30', border: 'border-l-chart-3', icon: <Lightbulb className="size-4" /> },
}

function SelfScoutMain() {
  const { data } = useQuery({
    queryKey: ['gridiron'],
    queryFn: async () => {
      const r = await fetch('/api/gridiron')
      if (!r.ok) throw new Error('failed')
      return r.json() as Promise<SelfScoutData>
    },
    staleTime: 60_000,
  })

  const snaps = data?.snapResults ?? []
  const plays = data?.plays ?? []

  const [downFilter, setDownFilter] = React.useState<'all' | '1' | '2' | '3' | '4'>('all')

  const filtered = React.useMemo(() => {
    return snaps.filter((s) => {
      if (downFilter !== 'all' && s.down !== parseInt(downFilter, 10)) return false
      return true
    })
  }, [snaps, downFilter])

  const warnings = React.useMemo(() => buildWarnings(filtered, plays), [filtered, plays])

  // Concept distribution chart
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

  // Formation distribution
  const formationData = React.useMemo(() => {
    const map = new Map<string, number>()
    for (const s of filtered) {
      const f = s.formation ?? 'Unknown'
      map.set(f, (map.get(f) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filtered])

  // Pass vs Run by down
  const downData = React.useMemo(() => {
    return [1, 2, 3, 4].map((d) => {
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
  }, [filtered])

  // Stats
  const stats = React.useMemo(() => {
    const total = filtered.length
    const pass = filtered.filter((s) => s.playType === 'pass').length
    const run = filtered.filter((s) => s.playType === 'run').length
    const passPct = total > 0 ? Math.round((pass / total) * 100) : 0
    const runPct = total > 0 ? Math.round((run / total) * 100) : 0
    const formations = new Set(filtered.map((s) => s.formation).filter(Boolean)).size
    const concepts = new Set(filtered.map((s) => s.concept).filter(Boolean)).size
    return { total, pass, run, passPct, runPct, formations, concepts }
  }, [filtered])

  const warningCounts = React.useMemo(() => {
    return {
      high: warnings.filter((w) => w.severity === 'high').length,
      medium: warnings.filter((w) => w.severity === 'medium').length,
      low: warnings.filter((w) => w.severity === 'low').length,
    }
  }, [warnings])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 stadium-sweep glow-primary-soft">
        <div className="absolute inset-0 turf-texture opacity-40" />
        <div className="absolute inset-0 field-grid-overlay opacity-60" />
        <div className="relative flex items-start gap-3">
          <div className="size-12 rounded-xl helmet-gradient flex items-center justify-center shadow-lg helmet-shine shrink-0">
            <Eye className="size-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
              SelfScoutIQ™ · Team Tendency Analysis & Predictability Warnings
            </div>
            <h2 className="text-xl font-bold leading-tight gradient-text-primary">
              Self-Scout Report
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.total} snaps analyzed · {stats.formations} formations · {stats.concepts} concepts ·{' '}
              {stats.passPct}% pass / {stats.runPct}% run ·{' '}
              <span className="text-destructive font-mono">{warningCounts.high} high</span>{' '}
              predictability warnings
            </p>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <Card className="p-3 slide-up-fade stagger-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Snaps</span>
            <Eye className="size-3.5 text-muted-foreground" />
          </div>
          <div className="text-xl font-bold font-mono mt-1">{stats.total}</div>
        </Card>
        <Card className="p-3 slide-up-fade stagger-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">High Severity</span>
            <AlertTriangle className="size-3.5 text-destructive" />
          </div>
          <div className="text-xl font-bold font-mono mt-1 text-destructive">{warningCounts.high}</div>
        </Card>
        <Card className="p-3 slide-up-fade stagger-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Medium</span>
            <Eye className="size-3.5 text-accent" />
          </div>
          <div className="text-xl font-bold font-mono mt-1 text-accent">{warningCounts.medium}</div>
        </Card>
        <Card className="p-3 slide-up-fade stagger-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Low</span>
            <Lightbulb className="size-3.5 text-chart-3" />
          </div>
          <div className="text-xl font-bold font-mono mt-1 text-chart-3">{warningCounts.low}</div>
        </Card>
        <Card className="p-3 slide-up-fade stagger-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Formations</span>
            <Shield className="size-3.5 text-chart-5" />
          </div>
          <div className="text-xl font-bold font-mono mt-1 text-chart-5">{stats.formations}</div>
        </Card>
      </div>

      {/* Down filter */}
      <div className="flex items-center gap-2">
        <Tabs value={downFilter} onValueChange={(v) => setDownFilter(v as typeof downFilter)}>
          <TabsList>
            <TabsTrigger value="all" className="text-xs">All Downs</TabsTrigger>
            <TabsTrigger value="1" className="text-xs">1st</TabsTrigger>
            <TabsTrigger value="2" className="text-xs">2nd</TabsTrigger>
            <TabsTrigger value="3" className="text-xs">3rd</TabsTrigger>
            <TabsTrigger value="4" className="text-xs">4th</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Warnings list */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="size-4 text-accent" />
          <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
            Predictability Warnings ({warnings.length})
          </h3>
        </div>
        {warnings.length === 0 ? (
          <Card className="p-8 text-center border-l-4 border-l-primary bg-primary/5">
            <Lightbulb className="size-10 mx-auto text-primary mb-2" />
            <h4 className="text-base font-semibold">No predictability warnings</h4>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Your tendencies look balanced for the current filter. Opponents won&apos;t find obvious tells.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {warnings.map((w, i) => {
              const meta = SEVERITY_META[w.severity]
              return (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className={cn('p-4 border-l-4', meta.border)}>
                    <div className="flex items-start gap-3">
                      <span className={meta.color}>{meta.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="text-sm font-semibold">{w.title}</h4>
                          <Badge variant="outline" className={cn('text-[10px] font-mono', meta.bg, meta.color)}>
                            {meta.label}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {Math.round(w.probability * 100)}%
                          </Badge>
                          <Badge variant="outline" className="text-[10px] font-mono bg-muted/30">
                            n={w.sample}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{w.description}</p>
                        <div className="flex items-start gap-1.5 text-xs">
                          <Crosshair className="size-3 text-primary mt-0.5 shrink-0" />
                          <span>
                            <strong className="font-semibold text-foreground">Recommendation:</strong>{' '}
                            <span className="text-muted-foreground">{w.recommendation}</span>
                          </span>
                        </div>
                        {w.complementaryConcept && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <Badge variant="outline" className="text-[10px] font-mono bg-primary/10 text-primary border-primary/30">
                              <Zap className="size-2.5 mr-1" />
                              Install: {w.complementaryConcept}
                            </Badge>
                          </div>
                        )}
                        {/* Probability bar */}
                        <div className="mt-2">
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full transition-all',
                                w.severity === 'high' ? 'bg-destructive' : w.severity === 'medium' ? 'bg-accent' : 'bg-chart-3'
                              )}
                              style={{ width: `${w.probability * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Charts grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Concept distribution */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="size-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
              Concept Distribution
            </h3>
          </div>
          {conceptData.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
              No concepts in current view.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={conceptData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.31 0.012 150 / 0.4)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'oklch(0.71 0.012 150)', fontSize: 10 }} axisLine={{ stroke: 'oklch(0.31 0.012 150)' }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fill: 'oklch(0.71 0.012 150)', fontSize: 10 }} axisLine={{ stroke: 'oklch(0.31 0.012 150)' }} />
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
                <Bar dataKey="value" fill="oklch(0.62 0.16 152)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Pass/Run by down */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="size-4 text-chart-3" />
            <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
              Pass / Run by Down
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={downData} margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.31 0.012 150 / 0.4)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'oklch(0.71 0.012 150)', fontSize: 11 }} axisLine={{ stroke: 'oklch(0.31 0.012 150)' }} />
              <YAxis tick={{ fill: 'oklch(0.71 0.012 150)', fontSize: 10 }} axisLine={{ stroke: 'oklch(0.31 0.012 150)' }} />
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
              <Bar dataKey="pass" stackId="a" fill="oklch(0.78 0.16 90)" name="Pass" />
              <Bar dataKey="run" stackId="a" fill="oklch(0.62 0.16 152)" name="Run" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Formation breakdown */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="size-4 text-chart-5" />
          <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
            Formation Breakdown
          </h3>
        </div>
        {formationData.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No formation data in current view.
          </div>
        ) : (
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
                  <span className="text-lg font-bold font-mono text-chart-5">{f.value}</span>
                  <span className="text-[10px] text-muted-foreground">
                    ({stats.total > 0 ? Math.round((f.value / stats.total) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden mt-1.5">
                  <div
                    className="h-full bg-chart-5"
                    style={{ width: `${stats.total > 0 ? (f.value / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

export default function SelfScoutIQ() {
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
      <SelfScoutMain />
    </QueryClientProvider>
  )
}
