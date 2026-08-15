'use client'

import * as React from 'react'
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  Activity,
  ArrowRight,
  Brain,
  CalendarClock,
  Clapperboard,
  ClipboardList,
  Clock,
  Crosshair,
  Dumbbell,
  FlaskConical,
  Flame,
  Gamepad2,
  GraduationCap,
  ListChecks,
  PlayCircle,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Watch,
  Zap,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useAppStore, type ModuleId } from '@/lib/store'

interface DashboardData {
  team: {
    name: string
    philosophy: string
    players: Array<{
      id: string
      jersey: number
      name: string
      position: string
      group: string
      quizScore: number | null
      speedGrade: string | null
    }>
  } | null
  plays: Array<{ id: string; playId: string; name: string; side: string; concept: string }>
  opponents: Array<{ id: string; name: string; mascot: string | null; league: string | null; tendencies: unknown[] }>
  games: Array<{
    id: string
    week: number
    opponent?: { name: string; mascot: string | null } | null
    result: string | null
    ourScore: number | null
    oppScore: number | null
    location: string
  }>
  installPlans: Array<{
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
    bestConcept: { concept: string; avgYards: number; successRate: number } | null
    worstConcept: { concept: string; avgYards: number; successRate: number } | null
  }
}

const MODULE_CARDS: Array<{
  id: ModuleId
  label: string
  description: string
  icon: React.ReactNode
  accent: string
}> = [
  {
    id: 'playbook',
    label: 'PlaybookIQ',
    description: 'Browse installed plays & Play DNA',
    icon: <PlayCircle className="size-5" />,
    accent: 'text-primary',
  },
  {
    id: 'designer',
    label: 'Formation Lab',
    description: 'Diagram plays on the virtual field',
    icon: <Crosshair className="size-5" />,
    accent: 'text-chart-3',
  },
  {
    id: 'scout',
    label: 'ScoutIQ',
    description: 'Opponent tendency intelligence',
    icon: <Shield className="size-5" />,
    accent: 'text-chart-5',
  },
  {
    id: 'gameplan',
    label: 'GamePlanIQ',
    description: 'AI opening script & recommendations',
    icon: <Target className="size-5" />,
    accent: 'text-accent',
  },
  {
    id: 'callsheet',
    label: 'CallSheetIQ',
    description: 'Situational game-day call sheet',
    icon: <ListChecks className="size-5" />,
    accent: 'text-primary',
  },
  {
    id: 'wristband',
    label: 'WristbandIQ',
    description: 'Compact QB wristband call sheet',
    icon: <Watch className="size-5" />,
    accent: 'text-accent',
  },
  {
    id: 'practice',
    label: 'PracticeIQ',
    description: 'Auto-generated practice scripts',
    icon: <CalendarClock className="size-5" />,
    accent: 'text-chart-5',
  },
  {
    id: 'analytics',
    label: 'AnalyticsIQ',
    description: 'Postgame intelligence & self-scout',
    icon: <TrendingUp className="size-5" />,
    accent: 'text-chart-3',
  },
  {
    id: 'redzone',
    label: 'RedZoneIQ',
    description: 'Red zone efficiency heat map',
    icon: <Flame className="size-5" />,
    accent: 'text-accent',
  },
  {
    id: 'film',
    label: 'FilmIQ',
    description: 'AI-powered film tagging library',
    icon: <Clapperboard className="size-5" />,
    accent: 'text-primary',
  },
  {
    id: 'matchup',
    label: 'MatchupIQ',
    description: 'AI game prediction & key matchups',
    icon: <Gamepad2 className="size-5" />,
    accent: 'text-accent',
  },
  {
    id: 'coach-ai',
    label: 'Coach AI',
    description: 'Coordinator-level AI assistant',
    icon: <Brain className="size-5" />,
    accent: 'text-accent',
  },
  {
    id: 'tendencylab',
    label: 'TendencyLab',
    description: 'Interactive tendency explorer with charts',
    icon: <FlaskConical className="size-5" />,
    accent: 'text-chart-5',
  },
  {
    id: 'situational',
    label: 'SituationalIQ',
    description: 'Down/distance × hash × zone deep-dive',
    icon: <Crosshair className="size-5" />,
    accent: 'text-chart-3',
  },
  {
    id: 'install',
    label: 'InstallIQ',
    description: 'Installation schedule & player mastery',
    icon: <GraduationCap className="size-5" />,
    accent: 'text-primary',
  },
  {
    id: 'personnel',
    label: 'PersonnelIQ',
    description: 'Depth chart & availability matrix',
    icon: <Users className="size-5" />,
    accent: 'text-chart-5',
  },
  {
    id: 'quiz',
    label: 'PlayerQuiz',
    description: 'Interactive playbook recall quizzes',
    icon: <Sparkles className="size-5" />,
    accent: 'text-accent',
  },
  {
    id: 'twominute',
    label: 'TwoMinuteIQ',
    description: 'End-of-half drill simulator',
    icon: <Clock className="size-5" />,
    accent: 'text-destructive',
  },
  {
    id: 'drills',
    label: 'DrillBuilder',
    description: 'Practice drill library & builder',
    icon: <Dumbbell className="size-5" />,
    accent: 'text-chart-5',
  },
]

function DashboardMain() {
  const setActiveModule = useAppStore((s) => s.setActiveModule)
  const setSelectedOpponentId = useAppStore((s) => s.setSelectedOpponentId)

  const { data, isLoading } = useQuery({
    queryKey: ['gridiron'],
    queryFn: async () => {
      const r = await fetch('/api/gridiron')
      if (!r.ok) throw new Error('failed')
      return r.json() as Promise<DashboardData>
    },
    staleTime: 60_000,
  })

  const team = data?.team
  const summary = data?.gameSummary

  const offensePlays = data?.plays.filter((p) => p.side === 'offense') ?? []
  const defensePlays = data?.plays.filter((p) => p.side === 'defense') ?? []

  const upcomingOpponent = data?.opponents?.[0] ?? null
  const lastGame = data?.games?.[data.games.length - 1] ?? null

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-lg border border-border bg-card animate-pulse-soft"
            />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-64 rounded-lg border border-border bg-card animate-pulse-soft" />
          <div className="h-64 rounded-lg border border-border bg-card animate-pulse-soft" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 stadium-sweep glow-primary-soft">
        <div className="absolute inset-0 turf-texture opacity-50" />
        <div className="absolute inset-0 field-grid-overlay opacity-60" />
        {/* Decorative yard-line accent */}
        <div className="absolute top-0 left-0 right-0 h-1 yard-marker opacity-60" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {/* Animated helmet icon */}
            <div className="relative">
              <div className="size-14 rounded-xl helmet-gradient flex items-center justify-center shadow-lg helmet-shine">
                <Activity className="size-7 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-accent border-2 border-card animate-pulse-soft" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground font-mono mb-1.5">
                <Activity className="size-3.5 text-primary" />
                Football Intelligence Operating System
              </div>
              <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                <span className="gradient-text-primary">{team?.name ?? 'Your Team'}</span>
                <span className="text-primary">™</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Philosophy:{' '}
                <Badge variant="outline" className="font-mono text-[10px] border-primary/30 text-primary bg-primary/5">
                  {team?.philosophy ?? 'n/a'}
                </Badge>{' '}
                · {offensePlays.length} offensive plays ·{' '}
                {defensePlays.length} defensive calls installed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setActiveModule('coach-ai')}
              className="bg-accent text-accent-foreground hover:bg-accent/90 glow-accent"
            >
              <Brain className="size-4 mr-1.5" />
              Ask Coach AI
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveModule('gameplan')}
              className="border-primary/40 hover:border-primary hover:bg-primary/5"
            >
              <Target className="size-4 mr-1.5" />
              Build Game Plan
            </Button>
          </div>
        </div>
      </div>

      {/* KPI summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 slide-up-fade stagger-1 hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
              Total Plays
            </span>
            <Activity className="size-3.5 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1">
            {summary.totalPlays}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {summary.passRunRatio.pass}P / {summary.passRunRatio.run}R
          </div>
        </Card>
        <Card className="p-4 slide-up-fade stagger-2 hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
              Yards / Play
            </span>
            <TrendingUp className="size-3.5 text-primary" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-primary">
            {summary.yardsPerPlay}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            season average
          </div>
        </Card>
        <Card className="p-4 slide-up-fade stagger-3 hover:border-chart-3/30 hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
              Success Rate
            </span>
            <Target className="size-3.5 text-chart-3" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-chart-3">
            {summary.successRate}%
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            season average
          </div>
        </Card>
        <Card className="p-4 slide-up-fade stagger-4 hover:border-accent/30 hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
              Explosives
            </span>
            <Zap className="size-3.5 text-accent" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-accent">
            {summary.explosives}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {summary.negatives} negative plays
          </div>
        </Card>
      </div>

      {/* Main grid: left = module cards + recent activity; right = next opponent + player mastery */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Module launchpad */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
                Modules
              </h2>
              <span className="text-[11px] text-muted-foreground">
                {MODULE_CARDS.length} modules available
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {MODULE_CARDS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveModule(m.id)}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg border border-border bg-background/40 hover:bg-primary/5 hover:border-primary/40 hover:shadow-md p-3 transition-all text-left slide-up-fade',
                    `stagger-${(MODULE_CARDS.indexOf(m) % 6) + 1}`
                  )}
                >
                  <div
                    className={cn(
                      'size-9 rounded-md bg-muted flex items-center justify-center transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110',
                      m.accent
                    )}
                  >
                    {m.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{m.label}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {m.description}
                    </div>
                  </div>
                  <ArrowRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Best / worst concept callout */}
          <div className="grid sm:grid-cols-2 gap-3">
            <Card className="p-4 border-l-4 border-l-primary">
              <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-1">
                Best Concept
              </div>
              <div className="text-lg font-semibold capitalize">
                {summary.bestConcept?.concept.replace(/_/g, ' ') ?? '—'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {summary.bestConcept?.avgYards ?? 0} yds/play ·{' '}
                {summary.bestConcept?.successRate ?? 0}% success rate
              </div>
            </Card>
            <Card className="p-4 border-l-4 border-l-destructive">
              <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-1">
                Worst Concept
              </div>
              <div className="text-lg font-semibold capitalize">
                {summary.worstConcept?.concept.replace(/_/g, ' ') ?? '—'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {summary.worstConcept?.avgYards ?? 0} yds/play ·{' '}
                {summary.worstConcept?.successRate ?? 0}% success rate
              </div>
            </Card>
          </div>

          {/* Game log */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
                Game Log
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setActiveModule('analytics')}
              >
                View analytics
                <ArrowRight className="size-3 ml-1" />
              </Button>
            </div>
            <div className="divide-y divide-border">
              {data.games.map((g) => (
                <div
                  key={g.id}
                  className="px-4 py-2.5 flex items-center justify-between hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="font-mono text-xs w-12 justify-center"
                    >
                      WK {g.week}
                    </Badge>
                    <div>
                      <div className="text-sm font-medium">
                        vs {g.opponent?.name ?? 'TBD'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {g.location === 'home' ? 'Home' : g.location === 'away' ? 'Away' : 'Neutral'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm">
                      {g.ourScore ?? '—'} – {g.oppScore ?? '—'}
                    </span>
                    {g.result && (
                      <Badge
                        className={cn(
                          'font-mono',
                          g.result === 'W'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-destructive text-destructive-foreground'
                        )}
                      >
                        {g.result}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div className="space-y-4">
          {/* Next opponent */}
          {upcomingOpponent && (
            <Card className="p-4">
              <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-2">
                Next Opponent
              </div>
              <div className="text-lg font-semibold">{upcomingOpponent.name}</div>
              <div className="text-xs text-muted-foreground">
                {upcomingOpponent.mascot ?? ''} · {upcomingOpponent.league ?? ''}
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  {upcomingOpponent.tendencies.length} tendencies tagged
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setSelectedOpponentId(upcomingOpponent.id)
                    setActiveModule('scout')
                  }}
                >
                  <Shield className="size-3.5 mr-1.5" />
                  Open scout report
                </Button>
              </div>
            </Card>
          )}

          {/* Player mastery */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
                Player Mastery
              </h3>
              <Users className="size-3.5 text-muted-foreground" />
            </div>
            <ScrollArea className="max-h-[260px] scrollbar-thin -mx-1 px-1">
              <div className="space-y-2.5">
                {team?.players
                  .filter((p) => p.quizScore != null)
                  .map((p) => (
                    <div key={p.id}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-2">
                          <span className="font-mono text-muted-foreground">
                            #{p.jersey}
                          </span>
                          <span className="font-medium">{p.name}</span>
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1 py-0 h-4 font-mono"
                          >
                            {p.position}
                          </Badge>
                        </span>
                        <span
                          className={cn(
                            'font-mono text-xs',
                            (p.quizScore ?? 0) >= 0.9
                              ? 'text-primary'
                              : (p.quizScore ?? 0) >= 0.8
                              ? 'text-chart-3'
                              : 'text-accent'
                          )}
                        >
                          {Math.round((p.quizScore ?? 0) * 100)}%
                        </span>
                      </div>
                      <Progress
                        value={(p.quizScore ?? 0) * 100}
                        className="h-1.5"
                      />
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </Card>

          {/* InstallIQ mini */}
          {data.installPlans.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
                  Installation
                </h3>
                <GraduationCap className="size-3.5 text-muted-foreground" />
              </div>
              <div className="space-y-3">
                {data.installPlans.map((plan) => (
                  <div key={plan.day} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] bg-primary/10 text-primary border-primary/30"
                      >
                        DAY {plan.day}
                      </Badge>
                      <span className="text-sm font-medium">{plan.title}</span>
                    </div>
                    {plan.focus && (
                      <div className="text-xs text-muted-foreground pl-1">
                        {plan.focus}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1 pl-1">
                      {plan.sections.flatMap((s) => s.items).slice(0, 6).map((item, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-[10px] font-mono bg-muted/40"
                        >
                          {item.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
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
      <DashboardMain />
    </QueryClientProvider>
  )
}
