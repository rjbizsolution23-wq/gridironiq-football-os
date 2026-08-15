'use client'

import * as React from 'react'
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  Crosshair,
  Dumbbell,
  Eye,
  Flame,
  Gamepad2,
  Layers,
  Lightbulb,
  ListChecks,
  MapPin,
  Play,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Wind,
  Zap,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
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
import { useAppStore } from '@/lib/store'

interface WeekOpponent {
  id: string
  name: string
  mascot: string | null
  league: string | null
  tendencies: Array<{
    situation: string
    formationKey: string | null
    result: string
    value: string
    probability: number
    sampleSize: number
    confidence: string
  }>
}

interface WeekGame {
  id: string
  week: number
  date: string
  location: string
  ourScore: number | null
  oppScore: number | null
  result: string | null
  opponent?: { name: string; mascot: string | null } | null
}

interface WeekData {
  opponents: WeekOpponent[]
  games: WeekGame[]
  team: { name: string; philosophy: string } | null
  installPlans: Array<{
    id: string
    day: number
    title: string
    focus: string | null
    sections: Array<{ period: string; items: Array<{ type: string; name: string }> }>
  }>
  gameSummary: {
    totalPlays: number
    successRate: number
    yardsPerPlay: number
    explosives: number
    negatives: number
    passRunRatio: { pass: number; run: number }
  }
  conceptPerformance: Array<{
    concept: string
    attempts: number
    successRate: number
    avgYards: number
    explosive: number
    negative: number
  }>
}

interface DayPlan {
  day: string
  short: string
  focus: string
  icon: React.ReactNode
  color: string
  items: Array<{ id: string; label: string; done: boolean }>
}

function buildWeekPlan(opponentName: string | null): DayPlan[] {
  const mk = (day: string, label: string) =>
    `${day}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`
  return [
    {
      day: 'Sunday',
      short: 'SUN',
      focus: 'Film + corrections from Saturday',
      icon: <Eye className="size-4" />,
      color: 'text-chart-5',
      items: [
        { id: mk('Sunday', 'Watch full game film'), label: 'Watch full game film', done: false },
        { id: mk('Sunday', 'Cut up explosive plays'), label: 'Cut up explosive plays', done: false },
        { id: mk('Sunday', 'Cut up negative plays'), label: 'Cut up negative plays', done: false },
        { id: mk('Sunday', 'Position group film sessions'), label: 'Position group film sessions', done: false },
        { id: mk('Sunday', 'Update FilmIQ clips'), label: 'Update FilmIQ clips', done: false },
      ],
    },
    {
      day: 'Monday',
      short: 'MON',
      focus: 'Corrections walkthrough + lift',
      icon: <Dumbbell className="size-4" />,
      color: 'text-primary',
      items: [
        { id: mk('Monday', 'Team corrections walkthrough'), label: 'Team corrections walkthrough', done: false },
        { id: mk('Monday', 'Indy drill corrections'), label: 'Indy drill corrections', done: false },
        { id: mk('Monday', 'Upper body lift'), label: 'Upper body lift', done: false },
        { id: mk('Monday', 'Conditioning 10x40s'), label: 'Conditioning: 10x40s', done: false },
      ],
    },
    {
      day: 'Tuesday',
      short: 'TUE',
      focus: `${opponentName ?? 'Opponent'} install — 1st & 2nd down`,
      icon: <Target className="size-4" />,
      color: 'text-accent',
      items: [
        { id: mk('Tuesday', 'Opponent film cutup review'), label: 'Opponent film cutup review', done: false },
        { id: mk('Tuesday', 'Install base runs'), label: 'Install base runs (IZ, Split Zone, Counter)', done: false },
        { id: mk('Tuesday', 'Install base passes'), label: 'Install base passes (Stick, Mesh)', done: false },
        { id: mk('Tuesday', 'Install protections'), label: 'Install protections (half-slide, full-slide)', done: false },
        { id: mk('Tuesday', 'Team period 1st 2nd down script'), label: 'Team period: 1st & 2nd down script', done: false },
        { id: mk('Tuesday', 'Update GamePlanIQ opening script'), label: 'Update GamePlanIQ opening script', done: false },
      ],
    },
    {
      day: 'Wednesday',
      short: 'WED',
      focus: '3rd down + red zone install',
      icon: <Flame className="size-4" />,
      color: 'text-destructive',
      items: [
        { id: mk('Wednesday', 'Install 3rd down package'), label: 'Install 3rd down package', done: false },
        { id: mk('Wednesday', 'Install red zone concepts'), label: 'Install red zone concepts', done: false },
        { id: mk('Wednesday', 'Skelly 7-on-7 3rd medium'), label: 'Skelly 7-on-7: 3rd & medium', done: false },
        { id: mk('Wednesday', 'Team red zone 7-on-7'), label: 'Team: red zone 7-on-7', done: false },
        { id: mk('Wednesday', 'Update CallSheetIQ 3rd Red sections'), label: 'Update CallSheetIQ 3rd & Red sections', done: false },
      ],
    },
    {
      day: 'Thursday',
      short: 'THU',
      focus: 'Two-minute + openers polish',
      icon: <Clock className="size-4" />,
      color: 'text-chart-3',
      items: [
        { id: mk('Thursday', 'Install 2-minute package'), label: 'Install 2-minute package', done: false },
        { id: mk('Thursday', 'Team first 8 plays openers'), label: 'Team: first 8 plays (openers)', done: false },
        { id: mk('Thursday', 'Two-minute drill offense'), label: 'Two-minute drill (offense)', done: false },
        { id: mk('Thursday', 'PAT FG operation'), label: 'PAT/FG operation', done: false },
        { id: mk('Thursday', 'Update WristbandIQ'), label: 'Update WristbandIQ', done: false },
      ],
    },
    {
      day: 'Friday',
      short: 'FRI',
      focus: 'Walkthrough + travel',
      icon: <MapPin className="size-4" />,
      color: 'text-chart-5',
      items: [
        { id: mk('Friday', 'Walkthrough openers situational'), label: 'Walkthrough: openers + situational', done: false },
        { id: mk('Friday', 'Special teams walkthrough'), label: 'Special teams walkthrough', done: false },
        { id: mk('Friday', 'Pre-game meal travel'), label: 'Pre-game meal + travel', done: false },
        { id: mk('Friday', 'Hotel film session away'), label: 'Hotel film session (away)', done: false },
      ],
    },
    {
      day: 'Saturday',
      short: 'SAT',
      focus: 'GAME DAY',
      icon: <Trophy className="size-4" />,
      color: 'text-accent',
      items: [
        { id: mk('Saturday', 'Pre-game warmup 90 min before KO'), label: 'Pre-game warmup (90 min before KO)', done: false },
        { id: mk('Saturday', 'Final script review'), label: 'Final script review', done: false },
        { id: mk('Saturday', 'Game!'), label: 'Game!', done: false },
        { id: mk('Saturday', 'Post-game film upload'), label: 'Post-game film upload', done: false },
      ],
    },
  ]
}

function WeekPlanMain() {
  const { data } = useQuery({
    queryKey: ['gridiron'],
    queryFn: async () => {
      const r = await fetch('/api/gridiron')
      if (!r.ok) throw new Error('failed')
      return r.json() as Promise<WeekData>
    },
    staleTime: 60_000,
  })

  const opponents = data?.opponents ?? []
  const games = data?.games ?? []
  const team = data?.team
  const summary = data?.gameSummary
  const conceptPerf = data?.conceptPerformance ?? []
  const installPlans = data?.installPlans ?? []

  const selectedOpponentId = useAppStore((s) => s.selectedOpponentId)
  const setSelectedOpponentId = useAppStore((s) => s.setSelectedOpponentId)
  const setActiveModule = useAppStore((s) => s.setActiveModule)

  const [opponentId, setOpponentId] = React.useState<string>('')

  React.useEffect(() => {
    if (selectedOpponentId && !opponentId) {
      setOpponentId(selectedOpponentId)
    }
  }, [selectedOpponentId, opponentId])

  const opponent = React.useMemo(
    () => opponents.find((o) => o.id === opponentId) ?? opponents[0] ?? null,
    [opponents, opponentId]
  )

  const weekPlanBase = React.useMemo(() => buildWeekPlan(opponent?.name ?? null), [opponent])

  // Task persistence: load completed task IDs from localStorage
  const STORAGE_KEY = 'gridironiq:weekplan:tasks'
  const [completedTasks, setCompletedTasks] = React.useState<Set<string>>(new Set())

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const arr = JSON.parse(raw) as string[]
        setCompletedTasks(new Set(arr))
      }
    } catch {
      // ignore
    }
  }, [])

  function toggleTask(taskId: string) {
    setCompletedTasks((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) next.delete(taskId)
      else next.add(taskId)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)))
      } catch {
        // ignore
      }
      return next
    })
  }

  function resetWeek() {
    setCompletedTasks(new Set())
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  // Apply persisted completion state to the week plan
  const weekPlan = React.useMemo(() => {
    return weekPlanBase.map((day) => ({
      ...day,
      items: day.items.map((item) => ({
        ...item,
        done: completedTasks.has(item.id),
      })),
    }))
  }, [weekPlanBase, completedTasks])

  // Progress: count completed items across the week
  const totalItems = weekPlan.reduce((a, d) => a + d.items.length, 0)
  const completedItems = weekPlan.reduce(
    (a, d) => a + d.items.filter((i) => i.done).length,
    0
  )
  const weekProgress = Math.round((completedItems / Math.max(totalItems, 1)) * 100)

  // Top tendencies (top 5 by probability × sample)
  const topTendencies = React.useMemo(() => {
    if (!opponent) return []
    return [...opponent.tendencies]
      .sort((a, b) => b.probability * b.sampleSize - a.probability * a.sampleSize)
      .slice(0, 5)
  }, [opponent])

  // Top concepts (top 5 by attempts)
  const topConcepts = React.useMemo(() => {
    return [...conceptPerf].sort((a, b) => b.attempts - a.attempts).slice(0, 5)
  }, [conceptPerf])

  // Game info
  const nextGame = games.find((g) => !g.result) ?? games[games.length - 1] ?? null
  const lastGame = games.find((g) => g.result === 'W' || g.result === 'L') ?? null

  if (!data) {
    return (
      <div className="space-y-4">
        <div className="h-24 rounded-lg border border-border bg-card animate-pulse-soft" />
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-64 rounded-lg border border-border bg-card animate-pulse-soft" />
          <div className="h-64 rounded-lg border border-border bg-card animate-pulse-soft" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Hero header with countdown */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 stadium-sweep glow-primary-soft">
        <div className="absolute inset-0 turf-texture opacity-40" />
        <div className="absolute inset-0 field-grid-overlay opacity-60" />
        <div className="relative">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <div className="size-14 rounded-xl helmet-gradient flex items-center justify-center shadow-lg helmet-shine shrink-0">
                <CalendarClock className="size-7 text-primary-foreground" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
                  WeekPlanIQ™ · Weekly Game-Prep Dashboard
                </div>
                <h1 className="text-2xl font-bold leading-tight gradient-text-primary">
                  Week At-A-Glance
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {team?.name ?? 'Your Team'} vs{' '}
                  <span className="font-semibold text-foreground">
                    {opponent?.name ?? 'TBD'}
                  </span>
                  {nextGame && (
                    <>
                      {' · '}
                      <span className="font-mono">
                        {nextGame.location === 'home' ? 'Home' : nextGame.location === 'away' ? 'Away' : 'Neutral'}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={opponentId}
                onValueChange={(v) => {
                  setOpponentId(v)
                  setSelectedOpponentId(v)
                }}
              >
                <SelectTrigger className="w-48 h-9">
                  <SelectValue placeholder="Pick opponent…" />
                </SelectTrigger>
                <SelectContent>
                  {opponents.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Countdown + week progress strip */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg border border-accent/40 bg-accent/5 p-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-1">
                Game Day
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="size-5 text-accent" />
                <span className="text-2xl font-bold font-mono text-accent">SAT</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-1 font-mono">
                {nextGame ? `Week ${nextGame.week}` : 'No game scheduled'}
              </div>
            </div>
            <div className="rounded-lg border border-primary/40 bg-primary/5 p-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-1">
                Week Progress
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold font-mono text-primary">{weekProgress}%</span>
              </div>
              <Progress value={weekProgress} className="h-1.5 mt-1.5" />
            </div>
            <div className="rounded-lg border border-chart-5/40 bg-chart-5/5 p-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-1">
                Tendencies Tagged
              </div>
              <div className="flex items-center gap-2">
                <Eye className="size-5 text-chart-5" />
                <span className="text-2xl font-bold font-mono text-chart-5">
                  {opponent?.tendencies.length ?? 0}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-1 font-mono">
                {opponent?.name ?? 'No opponent'}
              </div>
            </div>
            <div className="rounded-lg border border-chart-3/40 bg-chart-3/5 p-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-1">
                Season Record
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="size-5 text-chart-3" />
                <span className="text-2xl font-bold font-mono text-chart-3">
                  {games.filter((g) => g.result === 'W').length}-
                  {games.filter((g) => g.result === 'L').length}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-1 font-mono">
                {games.length} games played
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Button
          variant="outline"
          onClick={() => setActiveModule('matchup')}
          className="h-auto py-3 flex flex-col items-start gap-1 border-accent/40 hover:border-accent hover:bg-accent/5"
        >
          <div className="flex items-center gap-2 text-accent">
            <Gamepad2 className="size-4" />
            <span className="text-xs uppercase tracking-widest font-mono">Predict</span>
          </div>
          <span className="text-sm font-semibold text-foreground">MatchupIQ</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => setActiveModule('gameplan')}
          className="h-auto py-3 flex flex-col items-start gap-1 border-primary/40 hover:border-primary hover:bg-primary/5"
        >
          <div className="flex items-center gap-2 text-primary">
            <Target className="size-4" />
            <span className="text-xs uppercase tracking-widest font-mono">Plan</span>
          </div>
          <span className="text-sm font-semibold text-foreground">GamePlanIQ</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => setActiveModule('practice')}
          className="h-auto py-3 flex flex-col items-start gap-1 border-chart-5/40 hover:border-chart-5 hover:bg-chart-5/5"
        >
          <div className="flex items-center gap-2 text-chart-5">
            <CalendarClock className="size-4" />
            <span className="text-xs uppercase tracking-widest font-mono">Practice</span>
          </div>
          <span className="text-sm font-semibold text-foreground">PracticeIQ</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => setActiveModule('scout')}
          className="h-auto py-3 flex flex-col items-start gap-1 border-chart-3/40 hover:border-chart-3 hover:bg-chart-3/5"
        >
          <div className="flex items-center gap-2 text-chart-3">
            <Shield className="size-4" />
            <span className="text-xs uppercase tracking-widest font-mono">Scout</span>
          </div>
          <span className="text-sm font-semibold text-foreground">ScoutIQ</span>
        </Button>
      </div>

      {/* Main grid: week timeline + opponent intel */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Week timeline */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
              Week Timeline
            </h3>
            <Separator className="flex-1" />
            <Badge variant="outline" className="text-[10px] font-mono">
              {completedItems} / {totalItems} tasks done
            </Badge>
            {completedItems > 0 && (
              <button
                onClick={resetWeek}
                className="text-[10px] text-muted-foreground hover:text-destructive font-mono uppercase tracking-wider transition-colors"
                title="Reset all weekly tasks"
              >
                Reset
              </button>
            )}
          </div>

          <div className="space-y-2">
            {weekPlan.map((day, i) => {
              const dayDone = day.items.filter((it) => it.done).length
              const dayTotal = day.items.length
              const dayProgress = Math.round((dayDone / Math.max(dayTotal, 1)) * 100)
              return (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card
                    className={cn(
                      'p-3 hover:shadow-md transition-all',
                      day.short === 'SAT' && 'border-accent/40 bg-accent/5'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Day badge */}
                      <div className="flex flex-col items-center shrink-0 w-12">
                        <div
                          className={cn(
                            'size-10 rounded-md flex items-center justify-center font-bold font-mono text-xs',
                            day.short === 'SAT'
                              ? 'helmet-gradient text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {day.short}
                        </div>
                        {dayProgress === 100 && (
                          <CheckCircle2 className="size-3 text-primary mt-1" />
                        )}
                      </div>

                      {/* Day content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={cn('shrink-0', day.color)}>{day.icon}</span>
                            <span className="text-sm font-semibold truncate">{day.day}</span>
                            <span className="text-xs text-muted-foreground truncate">
                              · {day.focus}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[9px] font-mono shrink-0',
                              dayProgress === 100
                                ? 'bg-primary/10 text-primary border-primary/30'
                                : dayProgress > 0
                                ? 'bg-chart-3/10 text-chart-3 border-chart-3/30'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {dayDone}/{dayTotal}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1.5">
                          {day.items.map((item, j) => (
                            <button
                              key={item.id}
                              onClick={() => toggleTask(item.id)}
                              className={cn(
                                'flex items-center gap-1.5 text-[11px] rounded px-1 py-0.5 -mx-1 transition-colors text-left hover:bg-muted/30',
                                item.done && 'opacity-70'
                              )}
                            >
                              {item.done ? (
                                <CheckCircle2 className="size-3 text-primary shrink-0" />
                              ) : (
                                <div className="size-3 rounded-full border border-muted-foreground/40 shrink-0 hover:border-primary transition-colors" />
                              )}
                              <span
                                className={cn(
                                  'truncate',
                                  item.done ? 'text-muted-foreground line-through' : 'text-foreground'
                                )}
                              >
                                {item.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Right rail: opponent intel + season summary */}
        <div className="space-y-4">
          {/* Opponent top tendencies */}
          <Card className="p-4 border-l-4 border-l-chart-5">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="size-4 text-chart-5" />
              <h3 className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
                {opponent?.name ?? 'Opponent'} — Top Tendencies
              </h3>
            </div>
            {topTendencies.length === 0 ? (
              <div className="py-4 text-center text-xs text-muted-foreground">
                No tendencies tagged.
              </div>
            ) : (
              <div className="space-y-2">
                {topTendencies.map((t, i) => (
                  <div key={i} className="rounded-md border border-border bg-background/40 p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                        {t.situation.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs font-mono font-bold text-chart-5">
                        {Math.round(t.probability * 100)}%
                      </span>
                    </div>
                    <div className="text-xs font-semibold capitalize">
                      {t.result}: {t.value}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-chart-5"
                          style={{ width: `${t.probability * 100}%` }}
                        />
                      </div>
                      <span
                        className={cn(
                          'text-[9px] font-mono uppercase px-1 rounded',
                          t.confidence === 'HIGH'
                            ? 'bg-primary/15 text-primary'
                            : t.confidence === 'MEDIUM'
                            ? 'bg-chart-3/15 text-chart-3'
                            : 'bg-destructive/15 text-destructive'
                        )}
                      >
                        {t.confidence}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-3 text-xs"
              onClick={() => setActiveModule('scout')}
            >
              Open ScoutIQ
              <ArrowRight className="size-3 ml-1" />
            </Button>
          </Card>

          {/* Our top concepts */}
          <Card className="p-4 border-l-4 border-l-primary">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="size-4 text-primary" />
              <h3 className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
                Our Top Concepts
              </h3>
            </div>
            {topConcepts.length === 0 ? (
              <div className="py-4 text-center text-xs text-muted-foreground">
                No concept data available.
              </div>
            ) : (
              <div className="space-y-1.5">
                {topConcepts.map((c, i) => (
                  <div
                    key={c.concept}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-mono text-muted-foreground w-3">
                        {i + 1}
                      </span>
                      <span className="font-semibold capitalize truncate">
                        {c.concept.replace(/_/g, ' ')}
                      </span>
                      {i === 0 && <Trophy className="size-3 text-accent shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {c.attempts} att
                      </span>
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
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Season summary */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="size-4 text-accent" />
              <h3 className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
                Season Summary
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                  Plays
                </div>
                <div className="text-lg font-bold font-mono">{summary?.totalPlays ?? 0}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                  Yds/Play
                </div>
                <div className="text-lg font-bold font-mono text-primary">
                  {summary?.yardsPerPlay ?? 0}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                  Success
                </div>
                <div className="text-lg font-bold font-mono text-chart-3">
                  {summary?.successRate ?? 0}%
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                  Explosive
                </div>
                <div className="text-lg font-bold font-mono text-accent">
                  {summary?.explosives ?? 0}
                </div>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-mono">Pass / Run</span>
              <span className="font-mono font-bold">
                <span className="text-chart-3">{summary?.passRunRatio.pass ?? 0}</span>
                <span className="text-muted-foreground/40 mx-1">/</span>
                <span className="text-primary">{summary?.passRunRatio.run ?? 0}</span>
              </span>
            </div>
          </Card>

          {/* Install plan quick view */}
          {installPlans.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="size-4 text-primary" />
                <h3 className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
                  Install Schedule
                </h3>
              </div>
              <div className="space-y-2">
                {installPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="rounded-md border border-border bg-background/40 p-2"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] bg-primary/10 text-primary border-primary/30"
                      >
                        DAY {plan.day}
                      </Badge>
                      <span className="text-xs font-semibold truncate">{plan.title}</span>
                    </div>
                    {plan.focus && (
                      <p className="text-[10px] text-muted-foreground line-clamp-2">
                        {plan.focus}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Bottom row: coaching insight + critical focus */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-4 border-l-4 border-l-primary bg-primary/5">
          <div className="flex items-start gap-3">
            <Lightbulb className="size-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="text-xs uppercase tracking-widest font-mono text-primary mb-1">
                Weekly Coaching Focus
              </div>
              <p className="text-sm leading-relaxed">
                {opponent
                  ? `This week's priority is attacking ${opponent.name}'s top tendencies. Focus your Tuesday install on concepts that exploit their ${topTendencies[0]?.result ?? 'primary'} tendency (${topTendencies[0]?.value ?? 'n/a'}, ${Math.round((topTendencies[0]?.probability ?? 0) * 100)}%). Make sure to install complementary concepts so the defense can't sit on your top calls.`
                  : 'Select an opponent to receive a tailored weekly coaching focus.'}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-accent bg-accent/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-4 text-accent mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="text-xs uppercase tracking-widest font-mono text-accent mb-1">
                Critical Watch
              </div>
              <p className="text-sm leading-relaxed">
                {summary && summary.negatives > 5
                  ? `Negative play count is high (${summary.negatives}). Review protections and run fits in Wednesday's practice.`
                  : 'No critical watch items. Tendencies look balanced and performance is on track.'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function WeekPlanIQ() {
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
      <WeekPlanMain />
    </QueryClientProvider>
  )
}
