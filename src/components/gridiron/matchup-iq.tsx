'use client'

import * as React from 'react'
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  CloudRain,
  Crosshair,
  Dumbbell,
  Flame,
  Gamepad2,
  Home,
  Loader2,
  MapPin,
  RefreshCw,
  Shield,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
  Wind,
  Zap,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'

interface Opponent {
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

interface MatchupData {
  opponents: Opponent[]
  team: { name: string; philosophy: string } | null
  games: Array<{ id: string; week: number; result: string | null; opponent?: { name: string } | null }>
}

interface KeyMatchup {
  title: string
  advantage: 'us' | 'them' | 'even'
  rationale: string
  stat: string
}

interface CriticalFactor {
  factor: string
  why: string
  ifWin: string
  ifLose: string
}

interface Prediction {
  winProbability: number
  predictedScore: { ours: number; theirs: number }
  spread: string
  totalPoints: number
  gameScript: string
  keyMatchups: KeyMatchup[]
  criticalFactors: CriticalFactor[]
  openingScriptSuggestions: string[]
  defensiveGamePlan: string
  offensiveGamePlan: string
  xFactor: string
  redFlag: string
}

function WinProbabilityBar({ prob }: { prob: number }) {
  const favored = prob >= 50
  const color = favored ? 'bg-primary' : 'bg-destructive'
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
            Win Probability
          </span>
          {favored ? (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[10px] font-mono">
              FAVORED
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-[10px] font-mono">
              UNDERDOG
            </Badge>
          )}
        </div>
        <span
          className={cn(
            'text-3xl font-bold font-mono',
            favored ? 'text-primary' : 'text-destructive'
          )}
        >
          {prob}%
        </span>
      </div>
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${prob}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn('h-full rounded-full', color)}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-foreground/80">
          50% line
        </div>
        <div className="absolute top-0 bottom-0 w-px bg-foreground/30" style={{ left: '50%' }} />
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  )
}

function ScorePrediction({ score }: { score: { ours: number; theirs: number } }) {
  const weWin = score.ours > score.theirs
  const tie = score.ours === score.theirs
  return (
    <div className="grid grid-cols-3 gap-2 items-center">
      <div className="text-center">
        <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
          Us
        </div>
        <div className={cn('text-4xl font-bold font-mono mt-1', weWin ? 'text-primary' : 'text-foreground')}>
          {score.ours}
        </div>
      </div>
      <div className="text-center">
        <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
          {tie ? 'TIE' : weWin ? 'WIN' : 'LOSS'}
        </div>
        <div className="text-2xl font-mono text-muted-foreground">–</div>
      </div>
      <div className="text-center">
        <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
          Them
        </div>
        <div className={cn('text-4xl font-bold font-mono mt-1', !weWin && !tie ? 'text-destructive' : 'text-foreground')}>
          {score.theirs}
        </div>
      </div>
    </div>
  )
}

function AdvantageBadge({ advantage }: { advantage: KeyMatchup['advantage'] }) {
  if (advantage === 'us') {
    return (
      <Badge variant="outline" className="bg-primary/15 text-primary border-primary/30 text-[10px] font-mono uppercase tracking-wider">
        <CheckCircle2 className="size-2.5 mr-1" />
        Us
      </Badge>
    )
  }
  if (advantage === 'them') {
    return (
      <Badge variant="outline" className="bg-destructive/15 text-destructive border-destructive/30 text-[10px] font-mono uppercase tracking-wider">
        <AlertTriangle className="size-2.5 mr-1" />
        Them
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[10px] font-mono uppercase tracking-wider">
      Even
    </Badge>
  )
}

function MatchupMain() {
  const { data } = useQuery({
    queryKey: ['gridiron'],
    queryFn: async () => {
      const r = await fetch('/api/gridiron')
      if (!r.ok) throw new Error('failed')
      return r.json() as Promise<MatchupData>
    },
    staleTime: 60_000,
  })

  const opponents = data?.opponents ?? []
  const team = data?.team
  const selectedOpponentId = useAppStore((s) => s.selectedOpponentId)
  const setSelectedOpponentId = useAppStore((s) => s.setSelectedOpponentId)
  const setActiveModule = useAppStore((s) => s.setActiveModule)

  const [opponentId, setOpponentId] = React.useState<string>('')
  const [location, setLocation] = React.useState<'home' | 'away' | 'neutral'>('home')
  const [weather, setWeather] = React.useState('')
  const [injuries, setInjuries] = React.useState('')
  const [prediction, setPrediction] = React.useState<Prediction | null>(null)
  const [isPending, setIsPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [generatedOpponentName, setGeneratedOpponentName] = React.useState<string | null>(null)

  // Sync with global store
  React.useEffect(() => {
    if (selectedOpponentId && !opponentId) {
      setOpponentId(selectedOpponentId)
    }
  }, [selectedOpponentId, opponentId])

  // Load last prediction from localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('gridironiq:matchup:last')
      if (raw) {
        const obj = JSON.parse(raw) as { prediction: Prediction; opponentName: string }
        setPrediction(obj.prediction)
        setGeneratedOpponentName(obj.opponentName)
      }
    } catch {
      // ignore
    }
  }, [])

  async function generate() {
    if (!opponentId) {
      setError('Pick an opponent first.')
      return
    }
    setIsPending(true)
    setError(null)
    try {
      const r = await fetch('/api/matchup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          opponentId,
          location,
          weather: weather.trim() || undefined,
          injuries: injuries.trim() || undefined,
        }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const json = await r.json()
      if (json.error) throw new Error(json.error)
      setPrediction(json.prediction as Prediction)
      setGeneratedOpponentName(json.opponent?.name ?? null)
      setSelectedOpponentId(opponentId)
      try {
        localStorage.setItem(
          'gridironiq:matchup:last',
          JSON.stringify({
            prediction: json.prediction,
            opponentName: json.opponent?.name ?? null,
          })
        )
      } catch {
        // ignore
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to generate prediction'
      setError(msg)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 stadium-sweep glow-primary-soft">
        <div className="absolute inset-0 turf-texture opacity-40" />
        <div className="absolute inset-0 field-grid-overlay opacity-60" />
        <div className="relative flex items-start gap-3">
          <div className="size-12 rounded-xl helmet-gradient flex items-center justify-center shadow-lg helmet-shine shrink-0">
            <Gamepad2 className="size-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
              MatchupIQ™ · AI Game Prediction Engine
            </div>
            <h2 className="text-xl font-bold leading-tight gradient-text-primary">
              Head-to-Head Matchup
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {team?.name ?? 'Your Team'} vs{' '}
              <span className="font-semibold text-foreground">
                {generatedOpponentName ?? 'selected opponent'}
              </span>
              {prediction && (
                <>
                  {' · '}
                  <span
                    className={cn(
                      'font-mono font-bold',
                      prediction.winProbability >= 50 ? 'text-primary' : 'text-destructive'
                    )}
                  >
                    {prediction.winProbability}% win prob
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Matchup setup form */}
      <Card className="p-4 border-l-4 border-l-primary">
        <div className="flex items-center gap-2 mb-3">
          <Target className="size-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
            Matchup Setup
          </h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider block mb-1">
              Opponent
            </label>
            <Select value={opponentId} onValueChange={(v) => v && setOpponentId(v)}>
              <SelectTrigger className="w-full">
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
          <div>
            <label className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider block mb-1">
              Location
            </label>
            <Tabs value={location} onValueChange={(v) => setLocation(v as typeof location)}>
              <TabsList className="w-full">
                <TabsTrigger value="home" className="text-xs flex-1">
                  <Home className="size-3 mr-1" />
                  Home
                </TabsTrigger>
                <TabsTrigger value="away" className="text-xs flex-1">
                  <MapPin className="size-3 mr-1" />
                  Away
                </TabsTrigger>
                <TabsTrigger value="neutral" className="text-xs flex-1">
                  Neutral
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider block mb-1">
              Weather (optional)
            </label>
            <Input
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              placeholder="e.g. 30°F, wind 15mph"
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider block mb-1">
              Injuries (optional)
            </label>
            <Input
              value={injuries}
              onChange={(e) => setInjuries(e.target.value)}
              placeholder="e.g. #22 RB questionable"
              className="text-sm"
            />
          </div>
        </div>
        {error && (
          <div className="flex items-center gap-2 text-xs text-destructive border border-destructive/30 bg-destructive/5 rounded-md p-2 mb-3">
            <AlertTriangle className="size-3.5 shrink-0" />
            {error}
          </div>
        )}
        <Button onClick={generate} disabled={isPending || !opponentId} className="w-full">
          {isPending ? (
            <>
              <Loader2 className="size-3.5 mr-1.5 animate-spin" />
              Generating prediction…
            </>
          ) : (
            <>
              <Brain className="size-3.5 mr-1.5" />
              Predict Matchup
            </>
          )}
        </Button>
      </Card>

      {/* Prediction results */}
      <AnimatePresence mode="wait">
        {prediction && (
          <motion.div
            key="prediction"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Win probability + score */}
            <div className="grid lg:grid-cols-2 gap-4">
              <Card className="p-4 slide-up-fade">
                <WinProbabilityBar prob={prediction.winProbability} />
                <Separator className="my-3" />
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
                      Spread
                    </div>
                    <div className="text-base font-bold font-mono mt-0.5">
                      {prediction.spread}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
                      O/U
                    </div>
                    <div className="text-base font-bold font-mono mt-0.5">
                      {prediction.totalPoints}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
                      Win Prob
                    </div>
                    <div
                      className={cn(
                        'text-base font-bold font-mono mt-0.5',
                        prediction.winProbability >= 50 ? 'text-primary' : 'text-destructive'
                      )}
                    >
                      {prediction.winProbability}%
                    </div>
                  </div>
                </div>
              </Card>
              <Card className="p-4 slide-up-fade stagger-1">
                <div className="text-xs uppercase tracking-widest font-mono text-muted-foreground mb-3 flex items-center gap-2">
                  <Trophy className="size-3.5 text-accent" />
                  Predicted Final
                </div>
                <ScorePrediction score={prediction.predictedScore} />
              </Card>
            </div>

            {/* Game script */}
            <Card className="p-4 border-l-4 border-l-chart-5 bg-chart-5/5 slide-up-fade stagger-2">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="size-4 text-chart-5" />
                <h3 className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
                  Game Script
                </h3>
              </div>
              <p className="text-sm leading-relaxed">{prediction.gameScript}</p>
            </Card>

            {/* Game plans */}
            <div className="grid lg:grid-cols-2 gap-4">
              <Card className="p-4 border-l-4 border-l-primary bg-primary/5 slide-up-fade stagger-3">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="size-4 text-primary" />
                  <h3 className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
                    Offensive Game Plan
                  </h3>
                </div>
                <p className="text-sm leading-relaxed">{prediction.offensiveGamePlan}</p>
              </Card>
              <Card className="p-4 border-l-4 border-l-chart-5 bg-chart-5/5 slide-up-fade stagger-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="size-4 text-chart-5" />
                  <h3 className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
                    Defensive Game Plan
                  </h3>
                </div>
                <p className="text-sm leading-relaxed">{prediction.defensiveGamePlan}</p>
              </Card>
            </div>

            {/* Key matchups */}
            <Card className="p-4 slide-up-fade stagger-5">
              <div className="flex items-center gap-2 mb-3">
                <Crosshair className="size-4 text-accent" />
                <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
                  Key Matchups
                </h3>
              </div>
              <div className="space-y-2">
                {prediction.keyMatchups.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-md border border-border bg-background/40 p-3"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold">{m.title}</h4>
                      <AdvantageBadge advantage={m.advantage} />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1.5">{m.rationale}</p>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-foreground/80 bg-muted/30 border border-border/40 rounded px-2 py-1">
                      <Activity className="size-3 text-chart-3" />
                      {m.stat}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Critical factors */}
            <Card className="p-4 slide-up-fade stagger-6">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="size-4 text-accent" />
                <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
                  Critical Factors
                </h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {prediction.criticalFactors.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-md border border-border bg-background/40 p-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="size-5 rounded-full bg-accent/15 text-accent flex items-center justify-center text-[10px] font-mono font-bold">
                        {i + 1}
                      </span>
                      <h4 className="text-sm font-semibold">{f.factor}</h4>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2">{f.why}</p>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-start gap-1.5 text-primary">
                        <CheckCircle2 className="size-3 mt-0.5 shrink-0" />
                        <span><strong className="font-semibold">If win:</strong> {f.ifWin}</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-destructive">
                        <AlertTriangle className="size-3 mt-0.5 shrink-0" />
                        <span><strong className="font-semibold">If lose:</strong> {f.ifLose}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Opening script + X-factor + Red flag */}
            <div className="grid lg:grid-cols-3 gap-4">
              <Card className="p-4 slide-up-fade stagger-7">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="size-4 text-primary" />
                  <h3 className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
                    Opening Script Suggestions
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {prediction.openingScriptSuggestions.map((s, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="text-xs font-mono bg-primary/10 text-primary border-primary/30"
                    >
                      {s.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3 text-xs"
                  onClick={() => setActiveModule('gameplan')}
                >
                  Open GamePlanIQ
                  <ArrowRight className="size-3 ml-1" />
                </Button>
              </Card>
              <Card className="p-4 border-l-4 border-l-accent bg-accent/5 slide-up-fade stagger-8">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="size-4 text-accent" />
                  <h3 className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
                    X-Factor
                  </h3>
                </div>
                <p className="text-sm leading-relaxed">{prediction.xFactor}</p>
              </Card>
              <Card className="p-4 border-l-4 border-l-destructive bg-destructive/5 slide-up-fade stagger-9">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="size-4 text-destructive" />
                  <h3 className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
                    Red Flag
                  </h3>
                </div>
                <p className="text-sm leading-relaxed">{prediction.redFlag}</p>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!prediction && !isPending && (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
            <div className="size-14 rounded-full helmet-gradient flex items-center justify-center shadow-lg">
              <Brain className="size-7 text-primary-foreground" />
            </div>
            <h3 className="text-base font-semibold">Generate a matchup prediction</h3>
            <p className="text-sm text-muted-foreground">
              Pick an opponent and click Predict. MatchupIQ uses LLM to predict win probability,
              final score, key matchups, critical factors, and game plans — all grounded in your
              playbook + opponent tendency data.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

export default function MatchupIQ() {
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
      <MatchupMain />
    </QueryClientProvider>
  )
}
