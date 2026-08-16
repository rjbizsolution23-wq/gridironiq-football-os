'use client'

import * as React from 'react'
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  CalendarClock,
  ClipboardList,
  Clock,
  Dumbbell,
  Flame,
  Plus,
  Search,
  Sparkles,
  Target,
  Timer,
  Users,
  Zap,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface PracticePlay {
  playId: string
  name: string
  concept: string
  side: string
  personnel: string | null
  motion: string | null
}

interface ConceptPerf {
  concept: string
  attempts: number
  successes: number
  yards: number
  explosive: number
  negative: number
  avgYards: number
  successRate: number
}

interface PracticeData {
  plays: PracticePlay[]
  conceptPerformance: ConceptPerf[]
  installPlans: Array<{
    id: string
    day: number
    title: string
    focus: string | null
    sections: Array<{ period: string; items: Array<{ type: string; name: string }> }>
  }>
}

interface PracticePeriod {
  time: string // "3:30"
  duration: number // minutes
  name: string // "Indy"
  icon: React.ReactNode
  color: string // tailwind text class
  group: 'team' | 'offense' | 'defense' | 'special'
  items: string[] // drill/concept names
  notes?: string
}

interface PracticeTemplate {
  id: string
  name: string
  theme: string
  duration: number // total minutes
  periods: PracticePeriod[]
}

const DEFAULT_TEMPLATES: PracticeTemplate[] = [
  {
    id: 'template-game-week',
    name: 'Game Week — Tuesday Install',
    theme: 'Install opponent game plan; emphasize run game + base passes',
    duration: 110,
    periods: [
      { time: '3:30', duration: 10, name: 'Stretch & Dynamic Warmup', icon: <Users className="size-3.5" />, color: 'text-muted-foreground', group: 'team', items: ['Dynamic stretch', 'Hip mobility', 'Sprint mechanic build-up'] },
      { time: '3:40', duration: 15, name: 'Indy', icon: <Dumbbell className="size-3.5" />, color: 'text-primary', group: 'team', items: ['QB — footwork & reads', 'RB — Press & vision', 'WR — stem & top of route', 'OL — set & punch', 'DL — get-off & escape'] },
      { time: '3:55', duration: 10, name: 'Routes on Air', icon: <Target className="size-3.5" />, color: 'text-chart-3', group: 'offense', items: ['Stick concept', 'Mesh concept', 'Four Verts timing'] },
      { time: '4:05', duration: 15, name: 'Inside Run', icon: <Dumbbell className="size-3.5" />, color: 'text-primary', group: 'offense', items: ['Inside Zone vs 4-2-5', 'Split Zone — backside flow', 'Duo — double-team climb'] },
      { time: '4:20', duration: 15, name: 'Skelly (7-on-7)', icon: <Target className="size-3.5" />, color: 'text-chart-5', group: 'team', items: ['Glance RPO read', 'Mesh vs Cover 1', 'Stick vs Cover 3', 'Y-Cross — read middle safety'] },
      { time: '4:35', duration: 20, name: 'Team', icon: <Users className="size-3.5" />, color: 'text-accent', group: 'team', items: ['1st & 10 script — first 8', '3rd & medium situations', 'Red zone 7-on-7', 'PA Flood install'] },
      { time: '4:55', duration: 10, name: 'Red Zone', icon: <Flame className="size-3.5" />, color: 'text-destructive', group: 'team', items: ['High-red 7-on-7', 'Low-red team', '2-point plays'] },
      { time: '5:05', duration: 5, name: 'Special Teams', icon: <Zap className="size-3.5" />, color: 'text-chart-3', group: 'special', items: ['Punt team — protection', 'PAT/FG operation'] },
    ],
  },
  {
    id: 'template-padless',
    name: 'Padless Monday — Walkthrough & Corrections',
    theme: 'Correct mistakes from Saturday; teach, don\'t beat them up',
    duration: 75,
    periods: [
      { time: '3:30', duration: 10, name: 'Stretch & Walkthrough', icon: <Users className="size-3.5" />, color: 'text-muted-foreground', group: 'team', items: ['Full-team stretch', 'Last week corrections walkthrough'] },
      { time: '3:40', duration: 20, name: 'Film Corrections', icon: <ClipboardList className="size-3.5" />, color: 'text-primary', group: 'team', items: ['O-line film cutup', 'Skill film cutup', 'D-line & LB film cutup', 'Secondary film cutup'] },
      { time: '4:00', duration: 15, name: 'Indy Walkthrough', icon: <Dumbbell className="size-3.5" />, color: 'text-primary', group: 'team', items: ['QB reads walkthrough', 'WR route stems', 'LB run fits'] },
      { time: '4:15', duration: 15, name: 'Team Walkthrough', icon: <Users className="size-3.5" />, color: 'text-accent', group: 'team', items: ['First 5 scripted plays vs look squad', 'Red zone situational walkthrough'] },
      { time: '4:30', duration: 15, name: 'Lift & Conditioning', icon: <Dumbbell className="size-3.5" />, color: 'text-chart-3', group: 'team', items: ['Upper body lift', 'Conditioning — 10x40s'] },
    ],
  },
  {
    id: 'template-thursday',
    name: 'Thursday — Final Polish',
    theme: 'Short, fast, sharp. Lock in openings, 2-min, and red zone',
    duration: 80,
    periods: [
      { time: '3:30', duration: 10, name: 'Stretch', icon: <Users className="size-3.5" />, color: 'text-muted-foreground', group: 'team', items: ['Dynamic stretch', 'Form run'] },
      { time: '3:40', duration: 10, name: 'Indy', icon: <Dumbbell className="size-3.5" />, color: 'text-primary', group: 'team', items: ['QB — first 15 script mental reps', 'WR — vs air at game speed', 'OL — short sets'] },
      { time: '3:50', duration: 10, name: 'Team — Openers', icon: <Users className="size-3.5" />, color: 'text-accent', group: 'team', items: ['Scripted first 8 plays', 'Fast tempo', 'Substitution patterns'] },
      { time: '4:00', duration: 15, name: 'Red Zone 7-on-7', icon: <Flame className="size-3.5" />, color: 'text-destructive', group: 'team', items: ['High red', 'Low red', '2-point plays'] },
      { time: '4:15', duration: 15, name: 'Two-Minute', icon: <Clock className="size-3.5" />, color: 'text-chart-5', group: 'team', items: ['2-min offense vs scout D', 'Clock management', 'Spike scenarios'] },
      { time: '4:30', duration: 10, name: 'Special Teams', icon: <Zap className="size-3.5" />, color: 'text-chart-3', group: 'special', items: ['Punt return', 'Hands team'] },
    ],
  },
]

function PracticeSchedule({ template }: { template: PracticeTemplate }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarClock className="size-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
            Schedule
          </h3>
        </div>
        <Badge variant="outline" className="font-mono text-xs">
          <Timer className="size-3 mr-1" />
          {template.duration} min total
        </Badge>
      </div>
      <Separator className="mb-3" />
      <div className="space-y-1">
        {template.periods.map((p, i) => {
          const next = template.periods[i + 1]
          return (
            <div
              key={`${p.time}-${p.name}`}
              className="flex items-stretch gap-3 group"
            >
              {/* Time column */}
              <div className="w-14 shrink-0 text-right pt-2">
                <div className="font-mono text-sm font-semibold">{p.time}</div>
                <div className="font-mono text-[10px] text-muted-foreground">
                  {p.duration}m
                </div>
              </div>
              {/* Vertical connector */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'size-2.5 rounded-full mt-2.5 shrink-0',
                    p.group === 'team'
                      ? 'bg-primary'
                      : p.group === 'offense'
                      ? 'bg-chart-3'
                      : p.group === 'defense'
                      ? 'bg-chart-5'
                      : 'bg-accent'
                  )}
                />
                {i < template.periods.length - 1 && next && (
                  <div className="flex-1 w-px bg-border my-1" />
                )}
              </div>
              {/* Content */}
              <div className="flex-1 pb-2 group-hover:bg-muted/20 -mx-2 px-2 rounded-md transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={p.color}>{p.icon}</span>
                    <span className="text-sm font-semibold">{p.name}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[9px] uppercase tracking-wider font-mono px-1 py-0 h-4',
                        p.group === 'team'
                          ? 'bg-primary/10 text-primary border-primary/30'
                          : p.group === 'offense'
                          ? 'bg-chart-3/10 text-chart-3 border-chart-3/30'
                          : p.group === 'defense'
                          ? 'bg-chart-5/10 text-chart-5 border-chart-5/30'
                          : 'bg-accent/10 text-accent border-accent/30'
                      )}
                    >
                      {p.group === 'special' ? 'ST' : p.group}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5 pl-1">
                  {p.items.map((item, j) => (
                    <Badge
                      key={j}
                      variant="outline"
                      className="text-[10px] font-mono bg-muted/30"
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
                {p.notes && (
                  <div className="text-[11px] text-muted-foreground italic mt-1.5 pl-1">
                    {p.notes}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function PracticeGaps({ perf }: { perf: ConceptPerf[] }) {
  // Identify problem concepts that should be practiced
  const gaps = React.useMemo(() => {
    return perf
      .filter((c) => c.attempts >= 2 && c.successRate < 50)
      .sort((a, b) => a.successRate - b.successRate)
      .slice(0, 5)
  }, [perf])

  if (gaps.length === 0) return null

  return (
    <Card className="p-4 border-l-4 border-l-accent">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="size-4 text-accent" />
        <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
          Practice Recommendations — Based on Performance Gaps
        </h3>
      </div>
      <div className="space-y-2">
        {gaps.map((g) => (
          <div
            key={g.concept}
            className="rounded-md border border-border bg-background/40 p-2.5"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium capitalize">
                {g.concept.replace(/_/g, ' ')}
              </span>
              <Badge
                variant="outline"
                className="bg-accent/10 text-accent border-accent/30 font-mono text-xs"
              >
                {g.successRate}% SR · {g.attempts} att
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              Recommended: add 10–15 minutes of{' '}
              <span className="font-mono text-foreground">
                {g.concept.replace(/_/g, ' ')}
              </span>{' '}
              reps during{' '}
              <span className="font-mono text-foreground">
                {g.concept.includes('rpo') || g.concept.includes('glance')
                  ? 'Skelly'
                  : g.concept.includes('mesh') || g.concept.includes('stick') || g.concept.includes('vert')
                  ? 'Routes on Air'
                  : 'Inside Run'}
              </span>{' '}
              period.
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// Inline mini drill catalog (mirrors DrillBuilder seed drills)
const QUICK_DRILLS = [
  { name: 'Routes on Air — Concept Reps', category: 'Passing', duration: 10, intensity: 'Low' },
  { name: 'Inside Run Period', category: 'Run Game', duration: 15, intensity: 'High' },
  { name: 'Skelly 7-on-7', category: 'Team', duration: 15, intensity: 'Medium' },
  { name: 'Team Period — Scripted', category: 'Team', duration: 20, intensity: 'High' },
  { name: 'Punt Team Operation', category: 'Special Teams', duration: 10, intensity: 'Low' },
  { name: 'PAT / Field Goal Operation', category: 'Special Teams', duration: 5, intensity: 'Low' },
  { name: 'Indy — QB Footwork', category: 'Individual', duration: 12, intensity: 'Low' },
  { name: 'Indy — RB Press & Vision', category: 'Individual', duration: 10, intensity: 'Medium' },
  { name: 'Indy — WR Stem & Top of Route', category: 'Individual', duration: 10, intensity: 'Medium' },
  { name: 'Indy — OL Pass Set', category: 'Individual', duration: 10, intensity: 'Medium' },
  { name: 'Indy — DL Get-Off & Escape', category: 'Individual', duration: 10, intensity: 'High' },
  { name: 'Indy — LB Run Fits', category: 'Individual', duration: 12, intensity: 'Medium' },
  { name: 'Indy — DB Backpedal & Break', category: 'Individual', duration: 10, intensity: 'Medium' },
  { name: 'Red Zone 7-on-7', category: 'Team', duration: 10, intensity: 'Medium' },
]

const CATEGORY_COLOR: Record<string, string> = {
  Passing: 'text-chart-3',
  'Run Game': 'text-primary',
  Team: 'text-accent',
  'Special Teams': 'text-chart-5',
  Individual: 'text-muted-foreground',
}

const INTENSITY_COLOR: Record<string, string> = {
  Low: 'text-primary',
  Medium: 'text-chart-3',
  High: 'text-destructive',
}

function QuickDrillsPanel() {
  const [search, setSearch] = React.useState('')
  const [categoryFilter, setCategoryFilter] = React.useState<string>('All')

  const categories = React.useMemo(
    () => ['All', ...Array.from(new Set(QUICK_DRILLS.map((d) => d.category)))],
    []
  )

  const filtered = React.useMemo(() => {
    return QUICK_DRILLS.filter((d) => {
      if (categoryFilter !== 'All' && d.category !== categoryFilter) return false
      if (search) {
        const s = search.toLowerCase()
        return d.name.toLowerCase().includes(s) || d.category.toLowerCase().includes(s)
      }
      return true
    })
  }, [search, categoryFilter])

  return (
    <Card className="p-4 border-l-4 border-l-chart-3">
      <div className="flex items-center gap-2 mb-3">
        <Dumbbell className="size-4 text-chart-3" />
        <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
          Quick Drills
        </h3>
      </div>
      <p className="text-[11px] text-muted-foreground mb-2">
        Browse drills to drop into your practice script. Open DrillBuilder for full details.
      </p>

      {/* Search */}
      <div className="relative mb-2">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search drills…"
          className="w-full bg-background border border-border rounded-md pl-8 pr-2 py-1.5 text-xs"
        />
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-1 mb-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategoryFilter(c)}
            className={cn(
              'text-[10px] px-1.5 py-0.5 rounded border font-mono transition-all',
              categoryFilter === c
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground'
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Drill list */}
      <ScrollArea className="max-h-[200px] scrollbar-thin -mx-1 px-1">
        <div className="space-y-1">
          {filtered.length === 0 ? (
            <div className="py-4 text-center text-[11px] text-muted-foreground">
              No drills match.
            </div>
          ) : (
            filtered.map((d, i) => (
              <div
                key={i}
                className="rounded-md border border-border bg-background/40 p-1.5 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[11px] font-semibold truncate flex-1">
                    {d.name}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                    {d.duration}m
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[9px] font-mono">
                  <span className={cn('uppercase tracking-wider', CATEGORY_COLOR[d.category])}>
                    {d.category}
                  </span>
                  <span className="opacity-30">·</span>
                  <span className={cn('uppercase tracking-wider', INTENSITY_COLOR[d.intensity])}>
                    {d.intensity}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}

function PracticeMain() {
  const { data, isLoading } = useQuery({
    queryKey: ['gridiron'],
    queryFn: async () => {
      const r = await fetch('/api/gridiron')
      if (!r.ok) throw new Error('failed')
      return r.json() as Promise<PracticeData>
    },
    staleTime: 60_000,
  })

  const [templateId, setTemplateId] = React.useState<string>(DEFAULT_TEMPLATES[0].id)
  const template =
    DEFAULT_TEMPLATES.find((t) => t.id === templateId) ?? DEFAULT_TEMPLATES[0]

  const perf = data?.conceptPerformance ?? []

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="h-24 rounded-lg border border-border bg-card animate-pulse-soft" />
        <div className="h-96 rounded-lg border border-border bg-card animate-pulse-soft" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-start gap-3 justify-between">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-md helmet-gradient flex items-center justify-center">
              <CalendarClock className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-base font-semibold">PracticeIQ™</h2>
              <p className="text-xs text-muted-foreground">
                Auto-generate practice scripts with periods, drills, and performance tie-ins.
              </p>
            </div>
          </div>
          <Select value={templateId} onValueChange={setTemplateId}>
            <SelectTrigger className="w-64 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEFAULT_TEMPLATES.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {template && (
          <p className="mt-3 text-sm text-muted-foreground border-l-2 border-primary pl-3">
            <span className="text-foreground font-semibold">Theme:</span>{' '}
            {template.theme}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
              Total Duration
            </span>
            <Clock className="size-3.5 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1">
            {template.duration}
            <span className="text-sm font-normal text-muted-foreground ml-1">min</span>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
              Periods
            </span>
            <Users className="size-3.5 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1">
            {template.periods.length}
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
              Drills
            </span>
            <Dumbbell className="size-3.5 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1">
            {template.periods.reduce((a, p) => a + p.items.length, 0)}
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
              Performance gaps
            </span>
            <Sparkles className="size-3.5 text-accent" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-accent">
            {perf.filter((c) => c.attempts >= 2 && c.successRate < 50).length}
          </div>
        </Card>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Schedule */}
        <div className="lg:col-span-2">
          <PracticeSchedule template={template} />
        </div>

        {/* Right rail */}
        <div className="space-y-4">
          <PracticeGaps perf={perf} />

          {/* Quick Drills search */}
          <QuickDrillsPanel />

          {/* Install plan reference */}
          {data.installPlans.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="size-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
                  Installation Day
                </h3>
              </div>
              <ScrollArea className="max-h-[260px] scrollbar-thin -mx-1 px-1">
                <div className="space-y-3">
                  {data.installPlans.map((plan) => (
                    <div key={plan.id} className="rounded-md border border-border bg-background/40 p-2.5">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] bg-primary/10 text-primary border-primary/30"
                        >
                          DAY {plan.day}
                        </Badge>
                        <span className="text-xs font-semibold">{plan.title}</span>
                      </div>
                      {plan.focus && (
                        <p className="text-[11px] text-muted-foreground mb-2">
                          {plan.focus}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {plan.sections.flatMap((s) => s.items).slice(0, 6).map((item, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-[10px] font-mono bg-muted/30"
                          >
                            {item.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PracticeIQ() {
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
      <PracticeMain />
    </QueryClientProvider>
  )
}
