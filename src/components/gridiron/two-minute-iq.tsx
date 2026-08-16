'use client'

import * as React from 'react'
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  Clock,
  Flag,
  Hand,
  Pause,
  Play,
  RotateCcw,
  Send,
  Timer,
  TriangleAlert,
  Trophy,
  Zap,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface SimPlay {
  playId: string
  name: string
  concept: string
  personnel: string | null
  motion: string | null
  side: string
}

interface SimData {
  plays: SimPlay[]
}

interface GameState {
  quarter: number
  gameClockSeconds: number // total seconds remaining in the quarter
  playClockSeconds: number
  down: number
  distance: number
  yardLine: number // 1-100, 1 = own goal line, 100 = opponent goal line
  hash: 'L' | 'M' | 'R'
  ourScore: number
  oppScore: number
  timeouts: number // our timeouts remaining
  oppTimeouts: number
  possession: 'us' | 'them'
  driveHistory: Array<DrivePlay>
  status: 'setup' | 'running' | 'game-over'
  result?: 'win' | 'loss' | 'tie' | 'half'
}

interface DrivePlay {
  down: number
  distance: number
  yardLine: number
  playId: string
  playName: string
  concept: string
  yardsGained: number
  resultType: 'completion' | 'incompletion' | 'run' | 'touchdown' | 'turnover' | 'sack' | 'penalty' | 'spike'
  clockDeltaSeconds: number
  newDown: number
  newDistance: number
  newYardLine: number
  timestamp: number
}

const INITIAL_STATE: GameState = {
  quarter: 4,
  gameClockSeconds: 120, // 2:00
  playClockSeconds: 40,
  down: 1,
  distance: 10,
  yardLine: 25, // own 25
  hash: 'M',
  ourScore: 14,
  oppScore: 17,
  timeouts: 3,
  oppTimeouts: 2,
  possession: 'us',
  driveHistory: [],
  status: 'setup',
}

function formatClock(seconds: number): string {
  if (seconds < 0) seconds = 0
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function yardLineLabel(yard: number): string {
  if (yard <= 0) return 'Own Goal Line'
  if (yard >= 100) return 'Opp Goal Line'
  if (yard === 50) return '50'
  if (yard < 50) return `Own ${yard}`
  return `Opp ${100 - yard}`
}

function classifyPlay(concept: string): 'run' | 'pass' | 'rpo' {
  const c = concept.toLowerCase()
  if (c.includes('rpo')) return 'rpo'
  if (
    c.includes('mesh') ||
    c.includes('stick') ||
    c.includes('flood') ||
    c.includes('vert') ||
    c.includes('cross') ||
    c.includes('smash') ||
    c.includes('screen') ||
    c.includes('tunnel') ||
    c.includes('dagger') ||
    c.includes('mills') ||
    c.includes('snag') ||
    c.includes('spacing') ||
    c.includes('levels') ||
    c.includes('sail') ||
    c.includes('scissors') ||
    c.includes('post_wheel')
  )
    return 'pass'
  return 'run'
}

// Simulate a play outcome deterministically (no LLM, instant)
function simulatePlay(
  play: SimPlay,
  state: GameState
): {
  yardsGained: number
  resultType: DrivePlay['resultType']
  clockDeltaSeconds: number
  turnover: boolean
  touchdown: boolean
} {
  const type = classifyPlay(play.concept)
  // Seeded pseudo-random based on time + play + state for variety
  const seed =
    (Date.now() % 1000) +
    play.playId.length * 7 +
    state.down * 11 +
    state.distance * 13 +
    state.yardLine
  const rand = (n: number) => {
    const x = Math.sin(seed + n) * 10000
    return x - Math.floor(x)
  }

  // Probability of turnover
  const turnoverChance =
    type === 'run' ? 0.012 : type === 'rpo' ? 0.025 : 0.04
  if (rand(1) < turnoverChance) {
    return {
      yardsGained: 0,
      resultType: 'turnover',
      clockDeltaSeconds: 8 + Math.floor(rand(2) * 12),
      turnover: true,
      touchdown: false,
    }
  }

  // Probability of touchdown based on field position
  const distToGoal = 100 - state.yardLine
  const tdChance = Math.max(0.02, 0.18 - distToGoal * 0.002)
  if (rand(2) < tdChance) {
    return {
      yardsGained: distToGoal,
      resultType: 'touchdown',
      clockDeltaSeconds: 15 + Math.floor(rand(3) * 8), // pass TD usually goes OOB
      turnover: false,
      touchdown: true,
    }
  }

  // Yardage distribution by play type
  let yards = 0
  let resultType: DrivePlay['resultType'] = 'run'
  let clockDelta = 0
  const r = rand(4)

  if (type === 'run') {
    // Runs: short typically, occasionally explosive
    if (r < 0.05) {
      yards = -(2 + Math.floor(rand(5) * 3)) // TFL
      resultType = 'run'
    } else if (r < 0.85) {
      yards = 2 + Math.floor(rand(6) * 6) // 2-7 yards
      resultType = 'run'
    } else {
      yards = 12 + Math.floor(rand(7) * 18) // explosive 12-29
      resultType = 'run'
    }
    clockDelta = 28 + Math.floor(rand(8) * 6) // ~28-33s (clock runs)
  } else if (type === 'rpo') {
    if (r < 0.1) {
      // Sack
      yards = -(3 + Math.floor(rand(4) * 4))
      resultType = 'sack'
      clockDelta = 32 + Math.floor(rand(5) * 5)
    } else if (r < 0.4) {
      // Glance/bubble completion short
      yards = 4 + Math.floor(rand(5) * 6)
      resultType = 'completion'
      clockDelta = 18 + Math.floor(rand(5) * 6)
    } else if (r < 0.7) {
      // Run kept
      yards = 3 + Math.floor(rand(6) * 5)
      resultType = 'run'
      clockDelta = 28 + Math.floor(rand(6) * 6)
    } else if (r < 0.9) {
      // Incompletion
      yards = 0
      resultType = 'incompletion'
      clockDelta = 33 + Math.floor(rand(5) * 5)
    } else {
      // Explosive completion
      yards = 18 + Math.floor(rand(7) * 22)
      resultType = 'completion'
      clockDelta = 15 + Math.floor(rand(4) * 8) // OOB
    }
  } else {
    // Pass
    if (r < 0.08) {
      yards = -(4 + Math.floor(rand(4) * 4))
      resultType = 'sack'
      clockDelta = 33 + Math.floor(rand(5) * 5)
    } else if (r < 0.45) {
      // Completion short
      yards = 4 + Math.floor(rand(6) * 8)
      resultType = 'completion'
      clockDelta = 22 + Math.floor(rand(8) * 8) // tackle in bounds
    } else if (r < 0.7) {
      // Incompletion
      yards = 0
      resultType = 'incompletion'
      clockDelta = 33 + Math.floor(rand(5) * 5)
    } else if (r < 0.92) {
      // Completion medium, OOB
      yards = 8 + Math.floor(rand(7) * 12)
      resultType = 'completion'
      clockDelta = 12 + Math.floor(rand(5) * 8) // OOB stops clock
    } else {
      // Explosive completion
      yards = 20 + Math.floor(rand(7) * 25)
      resultType = 'completion'
      clockDelta = 14 + Math.floor(rand(4) * 8) // OOB
    }
  }

  return {
    yardsGained: yards,
    resultType,
    clockDeltaSeconds: clockDelta,
    turnover: false,
    touchdown: false,
  }
}

function computeNextDownAndDistance(
  state: GameState,
  yardsGained: number,
  resultType: DrivePlay['resultType']
): { newDown: number; newDistance: number; newYardLine: number; newHash: 'L' | 'M' | 'R'; firstDown: boolean } {
  if (resultType === 'touchdown') {
    return { newDown: 0, newDistance: 0, newYardLine: 100, newHash: state.hash, firstDown: true }
  }
  if (resultType === 'turnover') {
    return {
      newDown: 1,
      newDistance: 10,
      newYardLine: 100 - state.yardLine,
      newHash: state.hash,
      firstDown: true,
    }
  }

  const newYardLine = Math.max(0, Math.min(99, state.yardLine + yardsGained))
  const newDist = state.distance - yardsGained
  if (newDist <= 0) {
    // First down
    return {
      newDown: 1,
      newDistance: 10,
      newYardLine,
      newHash: ['L', 'M', 'R'][Math.floor(Math.random() * 3)] as 'L' | 'M' | 'R',
      firstDown: true,
    }
  }
  // Same drive, next down
  return {
    newDown: state.down + 1,
    newDistance: newDist,
    newYardLine,
    newHash: state.hash,
    firstDown: false,
  }
}

const RESULT_TYPE_META: Record<
  DrivePlay['resultType'],
  { label: string; color: string; icon: React.ReactNode }
> = {
  completion: { label: 'Completion', color: 'text-primary', icon: <Send className="size-3" /> },
  incompletion: { label: 'Incomplete', color: 'text-muted-foreground', icon: <Hand className="size-3" /> },
  run: { label: 'Run', color: 'text-chart-3', icon: <Zap className="size-3" /> },
  touchdown: { label: 'Touchdown!', color: 'text-accent', icon: <Trophy className="size-3" /> },
  turnover: { label: 'Turnover', color: 'text-destructive', icon: <AlertTriangle className="size-3" /> },
  sack: { label: 'Sack', color: 'text-destructive', icon: <TriangleAlert className="size-3" /> },
  penalty: { label: 'Penalty', color: 'text-chart-3', icon: <Flag className="size-3" /> },
  spike: { label: 'Spike', color: 'text-muted-foreground', icon: <Pause className="size-3" /> },
}

function TwoMinuteMain() {
  const { data } = useQuery({
    queryKey: ['gridiron'],
    queryFn: async () => {
      const r = await fetch('/api/gridiron')
      if (!r.ok) throw new Error('failed')
      return r.json() as Promise<SimData>
    },
    staleTime: 60_000,
  })

  const [state, setState] = React.useState<GameState>(INITIAL_STATE)
  const [autoPlay, setAutoPlay] = React.useState(false)
  const offensivePlays = (data?.plays ?? []).filter((p) => p.side === 'offense')

  function reset() {
    setState({ ...INITIAL_STATE })
    setAutoPlay(false)
  }

  function callPlay(play: SimPlay) {
    if (state.status === 'game-over') return

    setState((prev) => {
      if (prev.status === 'game-over') return prev

      const sim = simulatePlay(play, prev)
      const next = computeNextDownAndDistance(prev, sim.yardsGained, sim.resultType)

      const newClockSeconds = Math.max(
        0,
        prev.gameClockSeconds - sim.clockDeltaSeconds
      )

      const drivePlay: DrivePlay = {
        down: prev.down,
        distance: prev.distance,
        yardLine: prev.yardLine,
        playId: play.playId,
        playName: play.name,
        concept: play.concept,
        yardsGained: sim.yardsGained,
        resultType: sim.resultType,
        clockDeltaSeconds: sim.clockDeltaSeconds,
        newDown: next.newDown,
        newDistance: next.newDistance,
        newYardLine: next.newYardLine,
        timestamp: Date.now(),
      }

      let newOurScore = prev.ourScore
      let newStatus: GameState['status'] = 'running'
      let newResult: GameState['result'] | undefined = undefined
      let newPossession: 'us' | 'them' = prev.possession

      if (sim.resultType === 'touchdown') {
        newOurScore = prev.ourScore + 7
        newPossession = 'them'
        // If we score and we were down by less than 7, we win (assuming XP good)
      }

      if (sim.resultType === 'turnover') {
        newPossession = 'them'
        // Defense runs out the clock
      }

      // Check for turnover on downs (4th down and didn't convert)
      const isFourthDownFail =
        prev.down === 4 && !next.firstDown && sim.resultType !== 'turnover'
      if (isFourthDownFail) {
        newPossession = 'them'
      }

      // Game over conditions
      if (newClockSeconds <= 0) {
        if (newOurScore > prev.oppScore) {
          newStatus = 'game-over'
          newResult = 'win'
        } else if (newOurScore < prev.oppScore) {
          newStatus = 'game-over'
          newResult = 'loss'
        } else {
          newStatus = 'game-over'
          newResult = 'tie'
        }
      }

      // If turnover and clock is meaningful, opponent runs it out
      if (
        newPossession === 'them' &&
        newClockSeconds > 0 &&
        newStatus !== 'game-over'
      ) {
        // Simulate opponent running out the clock with kneel-downs (3 kneels = ~120s)
        const oppRunOut = Math.min(newClockSeconds, 90)
        const finalClock = newClockSeconds - oppRunOut
        if (finalClock <= 0) {
          if (newOurScore > prev.oppScore) {
            newStatus = 'game-over'
            newResult = 'win'
          } else if (newOurScore < prev.oppScore) {
            newStatus = 'game-over'
            newResult = 'loss'
          } else {
            newStatus = 'game-over'
            newResult = 'tie'
          }
        }
        return {
          ...prev,
          gameClockSeconds: finalClock,
          ourScore: newOurScore,
          possession: newPossession,
          driveHistory: [...prev.driveHistory, drivePlay],
          status: newStatus,
          result: newResult,
        }
      }

      return {
        ...prev,
        gameClockSeconds: newClockSeconds,
        down: next.newDown,
        distance: next.newDistance,
        yardLine: next.newYardLine,
        hash: next.newHash,
        ourScore: newOurScore,
        possession: newPossession,
        driveHistory: [...prev.driveHistory, drivePlay],
        status: newStatus,
        result: newResult,
      }
    })
  }

  function callTimeout() {
    setState((prev) => {
      if (prev.timeouts <= 0 || prev.status === 'game-over') return prev
      return {
        ...prev,
        timeouts: prev.timeouts - 1,
      }
    })
  }

  function spikeBall() {
    setState((prev) => {
      if (prev.status === 'game-over') return prev
      const drivePlay: DrivePlay = {
        down: prev.down,
        distance: prev.distance,
        yardLine: prev.yardLine,
        playId: 'SPIKE',
        playName: 'Spike',
        concept: 'spike',
        yardsGained: 0,
        resultType: 'spike',
        clockDeltaSeconds: 4,
        newDown: prev.down + 1,
        newDistance: prev.distance,
        newYardLine: prev.yardLine,
        timestamp: Date.now(),
      }
      const newClock = Math.max(0, prev.gameClockSeconds - 4)
      let newStatus = prev.status
      let newResult = prev.result
      if (newClock <= 0) {
        newStatus = 'game-over'
        if (prev.ourScore > prev.oppScore) newResult = 'win'
        else if (prev.ourScore < prev.oppScore) newResult = 'loss'
        else newResult = 'tie'
      }
      return {
        ...prev,
        down: prev.down + 1,
        gameClockSeconds: newClock,
        driveHistory: [...prev.driveHistory, drivePlay],
        status: newStatus,
        result: newResult,
      }
    })
  }

  function advanceClock10s() {
    setState((prev) => {
      if (prev.status === 'game-over') return prev
      const newClock = Math.max(0, prev.gameClockSeconds - 10)
      let newStatus = prev.status
      let newResult = prev.result
      if (newClock <= 0) {
        newStatus = 'game-over'
        if (prev.ourScore > prev.oppScore) newResult = 'win'
        else if (prev.ourScore < prev.oppScore) newResult = 'loss'
        else newResult = 'tie'
      }
      return {
        ...prev,
        gameClockSeconds: newClock,
        status: newStatus,
        result: newResult,
      }
    })
  }

  const clockUrgent = state.gameClockSeconds <= 30
  const clockCritical = state.gameClockSeconds <= 10
  const isFourthDown = state.down === 4
  const isGameOver = state.status === 'game-over'

  const resultMeta = state.result
    ? state.result === 'win'
      ? { label: 'WIN', color: 'text-primary', bg: 'bg-primary/15 border-primary/40', icon: <Trophy className="size-8" /> }
      : state.result === 'loss'
      ? { label: 'LOSS', color: 'text-destructive', bg: 'bg-destructive/15 border-destructive/40', icon: <AlertTriangle className="size-8" /> }
      : { label: 'TIE / END OF HALF', color: 'text-chart-3', bg: 'bg-chart-3/15 border-chart-3/40', icon: <Clock className="size-8" /> }
    : null

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 stadium-sweep glow-primary-soft">
        <div className="absolute inset-0 turf-texture opacity-40" />
        <div className="absolute inset-0 field-grid-overlay opacity-60" />
        <div className="relative flex items-start gap-3">
          <div className="size-12 rounded-xl helmet-gradient flex items-center justify-center shadow-lg helmet-shine shrink-0">
            <Clock className="size-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
              TwoMinuteIQ™ · End-of-Half Simulator
            </div>
            <h2 className="text-xl font-bold leading-tight gradient-text-primary">
              Two-Minute Drill
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Down {state.down} &amp; {state.distance} · {yardLineLabel(state.yardLine)} ·{' '}
              {state.hash} hash · {state.possession === 'us' ? 'our ball' : 'their ball'}
            </p>
          </div>
          {state.status === 'running' && (
            <Button
              variant="outline"
              size="sm"
              onClick={reset}
              className="border-primary/40 hover:border-primary hover:bg-primary/5"
            >
              <RotateCcw className="size-3.5 mr-1.5" />
              Reset
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Main scoreboard + play picker */}
        <div className="lg:col-span-2 space-y-4">
          {/* Game clock scoreboard */}
          <Card
            className={cn(
              'p-5 relative overflow-hidden transition-all',
              clockCritical
                ? 'border-destructive shadow-[0_0_30px_-5px_oklch(0.62_0.22_25)]'
                : clockUrgent
                ? 'border-accent shadow-[0_0_22px_-5px_oklch(0.68_0.18_55)]'
                : 'border-border'
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-muted-foreground">
                <Timer className="size-3.5" />
                Game Clock
                <Badge variant="outline" className="ml-2 text-[10px] font-mono">
                  Q{state.quarter}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    'font-mono text-xs',
                    isFourthDown && 'bg-accent/10 text-accent border-accent/30'
                  )}
                >
                  {state.down === 1 ? '1st' : state.down === 2 ? '2nd' : state.down === 3 ? '3rd' : '4th'}{' '}
                  &amp; {state.distance}
                </Badge>
                <Badge variant="outline" className="font-mono text-xs">
                  {state.hash} hash
                </Badge>
              </div>
            </div>
            <div className="text-center">
              <div
                className={cn(
                  'font-bold font-mono tabular-nums leading-none transition-colors',
                  clockCritical
                    ? 'text-6xl text-destructive animate-pulse'
                    : clockUrgent
                    ? 'text-6xl text-accent'
                    : 'text-7xl text-foreground'
                )}
              >
                {formatClock(state.gameClockSeconds)}
              </div>
            </div>
            {/* Score + timeouts */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-center">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                  Us
                </div>
                <div className="text-3xl font-bold font-mono text-primary">{state.ourScore}</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'size-2 rounded-full',
                        i < state.timeouts ? 'bg-primary' : 'bg-muted/30'
                      )}
                    />
                  ))}
                  <span className="text-[9px] font-mono text-muted-foreground ml-1">
                    TO
                  </span>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                  Possession
                </div>
                <div
                  className={cn(
                    'text-2xl font-bold font-mono mt-0.5',
                    state.possession === 'us' ? 'text-primary' : 'text-chart-5'
                  )}
                >
                  {state.possession === 'us' ? 'OURS' : 'THEIRS'}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  {yardLineLabel(state.yardLine)}
                </div>
              </div>
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-center">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                  Opp
                </div>
                <div className="text-3xl font-bold font-mono text-destructive">
                  {state.oppScore}
                </div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'size-2 rounded-full',
                        i < state.oppTimeouts ? 'bg-destructive' : 'bg-muted/30'
                      )}
                    />
                  ))}
                  <span className="text-[9px] font-mono text-muted-foreground ml-1">
                    TO
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Game over overlay */}
          <AnimatePresence>
            {isGameOver && resultMeta && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  'rounded-xl border-2 p-6 text-center',
                  resultMeta.bg
                )}
              >
                <div className={cn('flex justify-center mb-2', resultMeta.color)}>
                  {resultMeta.icon}
                </div>
                <div className={cn('text-3xl font-bold font-mono', resultMeta.color)}>
                  {resultMeta.label}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Final score: {state.ourScore} – {state.oppScore}
                </p>
                <Button onClick={reset} variant="outline" size="sm" className="mt-4">
                  <RotateCcw className="size-3.5 mr-1.5" />
                  Run it again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action bar */}
          {!isGameOver && state.possession === 'us' && (
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={callTimeout}
                disabled={state.timeouts <= 0}
                variant="outline"
                className="border-accent/40 hover:border-accent hover:bg-accent/5"
              >
                <Flag className="size-3.5 mr-1.5" />
                Timeout ({state.timeouts})
              </Button>
              <Button
                onClick={spikeBall}
                disabled={state.down >= 4}
                variant="outline"
              >
                <Pause className="size-3.5 mr-1.5" />
                Spike Ball
              </Button>
              <Button onClick={advanceClock10s} variant="outline">
                <Clock className="size-3.5 mr-1.5" />
                +10s (burn)
              </Button>
            </div>
          )}

          {/* Play picker */}
          {!isGameOver && state.possession === 'us' && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
                  Call a play
                </h3>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {offensivePlays.length} in playbook
                </Badge>
              </div>
              <ScrollArea className="max-h-[280px] scrollbar-thin -mx-1 px-1">
                <div className="grid sm:grid-cols-2 gap-2">
                  {offensivePlays.map((play) => {
                    const type = classifyPlay(play.concept)
                    return (
                      <button
                        key={play.playId}
                        onClick={() => callPlay(play)}
                        className="group flex items-center gap-2.5 rounded-lg border border-border bg-background/40 hover:bg-primary/5 hover:border-primary/40 hover:shadow-md p-2.5 transition-all text-left"
                      >
                        <div
                          className={cn(
                            'size-8 rounded-md flex items-center justify-center shrink-0 transition-all group-hover:scale-110',
                            type === 'run'
                              ? 'bg-primary/15 text-primary'
                              : type === 'pass'
                              ? 'bg-chart-3/15 text-chart-3'
                              : 'bg-accent/15 text-accent'
                          )}
                        >
                          {type === 'run' ? (
                            <Zap className="size-3.5" />
                          ) : type === 'pass' ? (
                            <Send className="size-3.5" />
                          ) : (
                            <Timer className="size-3.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">{play.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono truncate">
                            {play.playId} · {play.concept.replace(/_/g, ' ')}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            </Card>
          )}

          {/* Possession lost message */}
          {!isGameOver && state.possession === 'them' && (
            <Card className="p-6 text-center border-chart-5/40 bg-chart-5/5">
              <div className="flex justify-center mb-2 text-chart-5">
                <AlertTriangle className="size-8" />
              </div>
              <div className="text-base font-semibold">Possession lost</div>
              <p className="text-sm text-muted-foreground mt-1">
                Opponent will run out the clock. Reset to try again.
              </p>
              <Button onClick={reset} variant="outline" size="sm" className="mt-4">
                <RotateCcw className="size-3.5 mr-1.5" />
                Reset simulation
              </Button>
            </Card>
          )}
        </div>

        {/* Drive chart */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Play className="size-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
                  Drive Chart
                </h3>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                {state.driveHistory.length} plays
              </Badge>
            </div>
            {state.driveHistory.length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground">
                <Play className="size-6 mx-auto mb-2 opacity-40" />
                No plays called yet.
              </div>
            ) : (
              <ScrollArea className="max-h-[520px] scrollbar-thin -mx-1 px-1">
                <div className="space-y-2">
                  {[...state.driveHistory].reverse().map((play, i) => {
                    const meta = RESULT_TYPE_META[play.resultType]
                    return (
                      <motion.div
                        key={play.timestamp + '-' + i}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.18 }}
                        className="rounded-md border border-border bg-background/40 p-2.5"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn('flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider', meta.color)}
                            >
                              {meta.icon}
                              {meta.label}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {formatClock(state.gameClockSeconds + play.clockDeltaSeconds * (i + 1))}{' '}
                            →
                          </span>
                        </div>
                        <div className="font-semibold text-sm truncate">
                          {play.playName}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground font-mono">
                          <span>
                            {play.down === 1 ? '1st' : play.down === 2 ? '2nd' : play.down === 3 ? '3rd' : '4th'}{' '}
                            &amp; {play.distance}
                          </span>
                          <span className="opacity-40">·</span>
                          <span className={cn(play.yardsGained >= 0 ? 'text-primary' : 'text-destructive')}>
                            {play.yardsGained >= 0 ? '+' : ''}{play.yardsGained} yds
                          </span>
                          <span className="opacity-40">·</span>
                          <span>-{play.clockDeltaSeconds}s</span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </Card>

          {/* Quick rules card */}
          <Card className="mt-4 p-4 border-l-4 border-l-primary">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="size-3.5 text-primary" />
              <h3 className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
                Two-Minute Rules
              </h3>
            </div>
            <ul className="space-y-1.5 text-[11px] text-muted-foreground">
              <li>• Get out of bounds to stop the clock on completions.</li>
              <li>• Spike the ball to kill the clock (costs a down).</li>
              <li>• Use a timeout to save ~40 seconds.</li>
              <li>• Avoid sacks — they lose yards AND clock.</li>
              <li>• 4th down is do-or-die — pick wisely.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function TwoMinuteIQ() {
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
      <TwoMinuteMain />
    </QueryClientProvider>
  )
}
