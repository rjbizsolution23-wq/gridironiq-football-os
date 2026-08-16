'use client'

import * as React from 'react'
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CalendarDays, CheckCircle2, Clock, Dumbbell, GraduationCap } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface InstallData {
  team: {
    name: string
    players: Array<{
      id: string
      jersey: number
      name: string
      position: string
      group: string
      quizScore: number | null
      speedGrade: string | null
      height: string | null
      weight: number | null
      notes: string | null
    }>
  } | null
  installPlans: Array<{
    id: string
    day: number
    title: string
    focus: string | null
    sections: Array<{ period: string; items: Array<{ type: string; name: string }> }>
  }>
}

const PERIOD_META: Record<string, { icon: React.ReactNode; color: string }> = {
  formations: { icon: <Dumbbell className="size-3.5" />, color: 'text-primary' },
  runs: { icon: <Dumbbell className="size-3.5" />, color: 'text-primary' },
  run: { icon: <Dumbbell className="size-3.5" />, color: 'text-primary' },
  pass: { icon: <GraduationCap className="size-3.5" />, color: 'text-chart-3' },
  protection: { icon: <CheckCircle2 className="size-3.5" />, color: 'text-accent' },
  motion: { icon: <Clock className="size-3.5" />, color: 'text-chart-5' },
  rpo: { icon: <GraduationCap className="size-3.5" />, color: 'text-accent' },
  default: { icon: <CheckCircle2 className="size-3.5" />, color: 'text-muted-foreground' },
}

function periodMeta(period: string) {
  const key = period.toLowerCase()
  for (const k of Object.keys(PERIOD_META)) {
    if (k !== 'default' && key.includes(k)) return PERIOD_META[k]
  }
  return PERIOD_META.default
}

function InstallMain() {
  const { data } = useQuery({
    queryKey: ['gridiron'],
    queryFn: async () => {
      const r = await fetch('/api/gridiron')
      if (!r.ok) throw new Error('failed')
      return r.json() as Promise<InstallData>
    },
    staleTime: 60_000,
  })

  const team = data?.team ?? null
  const plans = data?.installPlans ?? []

  // Group players by position group
  const grouped = React.useMemo(() => {
    const map = new Map<string, typeof team extends null ? never : NonNullable<typeof team>['players']>()
    if (team) {
      for (const p of team.players) {
        const list = map.get(p.group) ?? []
        list.push(p)
        map.set(p.group, list)
      }
    }
    return map
  }, [team])

  if (!team) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <GraduationCap className="size-10 opacity-50 animate-pulse-soft" />
      </div>
    )
  }

  const teamAvg =
    team.players.filter((p) => p.quizScore != null).reduce((a, p) => a + (p.quizScore ?? 0), 0) /
    Math.max(1, team.players.filter((p) => p.quizScore != null).length)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-md helmet-gradient flex items-center justify-center">
            <GraduationCap className="size-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">InstallIQ™ — Installation & Player Development</h2>
            <p className="text-xs text-muted-foreground">
              {team.name} · {plans.length} install days · Team mastery{' '}
              <span className="font-mono text-primary">{Math.round(teamAvg * 100)}%</span>
            </p>
          </div>
        </div>
      </div>

      {/* Install schedule */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-muted-foreground" />
          <h3 className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
            Installation Schedule
          </h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] bg-primary/10 text-primary border-primary/30 uppercase"
                >
                  Day {plan.day}
                </Badge>
                <h4 className="font-semibold">{plan.title}</h4>
              </div>
              {plan.focus && (
                <p className="text-xs text-muted-foreground mb-3">{plan.focus}</p>
              )}
              <div className="space-y-3">
                {plan.sections.map((section, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={cn('flex items-center gap-1', periodMeta(section.period).color)}
                      >
                        {periodMeta(section.period).icon}
                      </span>
                      <span className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
                        {section.period}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pl-5">
                      {section.items.map((item, j) => (
                        <Badge
                          key={j}
                          variant="outline"
                          className="text-xs font-mono bg-muted/30"
                        >
                          {item.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Player development grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Dumbbell className="size-4 text-muted-foreground" />
          <h3 className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
            Player Development
          </h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {Array.from(grouped.entries()).map(([group, players]) => (
            <Card key={group} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold uppercase tracking-wide font-mono">
                  {group === 'offensive' ? 'Offense' : group === 'defensive' ? 'Defense' : 'Special Teams'}
                </h4>
                <Badge variant="outline" className="text-xs">
                  {players.length} players
                </Badge>
              </div>
              <ScrollArea className="max-h-[400px] scrollbar-thin -mx-1 px-1">
                <div className="space-y-2.5">
                  {players.map((p) => (
                    <div key={p.id} className="rounded-md border border-border bg-background/40 p-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground w-7">
                            #{p.jersey}
                          </span>
                          <span className="text-sm font-medium">{p.name}</span>
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1 py-0 h-4 font-mono"
                          >
                            {p.position}
                          </Badge>
                        </div>
                        {p.quizScore != null && (
                          <span
                            className={cn(
                              'font-mono text-xs',
                              p.quizScore >= 0.9
                                ? 'text-primary'
                                : p.quizScore >= 0.8
                                ? 'text-chart-3'
                                : 'text-accent'
                            )}
                          >
                            {Math.round(p.quizScore * 100)}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-1.5">
                        {p.height && <span>{p.height}</span>}
                        {p.weight && <span>{p.weight} lb</span>}
                        {p.speedGrade && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1 py-0 h-4 font-mono border-accent/30 text-accent"
                          >
                            SPD {p.speedGrade}
                          </Badge>
                        )}
                      </div>
                      {p.quizScore != null && (
                        <Progress value={p.quizScore * 100} className="h-1" />
                      )}
                      {p.notes && (
                        <p className="text-[10px] text-muted-foreground mt-1.5 italic">
                          {p.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function InstallIQ() {
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
      <InstallMain />
    </QueryClientProvider>
  )
}
