'use client'

import * as React from 'react'
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Award,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Crosshair,
  Dumbbell,
  GraduationCap,
  Lightbulb,
  Loader2,
  RefreshCw,
  Target,
  Trophy,
  Users,
  XCircle,
  Zap,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface QuizAssignment {
  position: string
  alignment: string
  assignment: string
  landmark: string
  vsMan: string
  vsZone: string
}

interface SerializedPlay {
  id: string
  playId: string
  name: string
  side: string
  personnel: string | null
  motion: string | null
  concept: string
  readType: string | null
  readDefender: string | null
  protection: string | null
  qbFootwork: string | null
  constraints: string[]
  coverageTargets: string[]
  fieldZones: string[]
  coachingPoints: string | null
  assignments: QuizAssignment[]
  routes: Array<{ player: string; route: string; depth: string }>
  complementary: string[]
  formation: { id: string; code: string; name: string; personnel: string; side: string } | null
  family: { id: string; code: string; name: string; baseConcept: string } | null
}

interface QuizData {
  plays: SerializedPlay[]
  team: {
    name: string
    players: Array<{
      id: string
      jersey: number
      name: string
      position: string
      group: string
      quizScore: number | null
    }>
  } | null
}

type QuestionType = 'assignment' | 'concept_id' | 'vs_coverage' | 'complementary' | 'motion'

interface Question {
  id: string
  type: QuestionType
  prompt: string
  context?: string
  options: string[]
  correctIndex: number
  explanation: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function buildQuiz(plays: SerializedPlay[], questionCount = 10): Question[] {
  const offensivePlays = plays.filter((p) => p.side === 'offense' && p.assignments.length > 0)
  if (offensivePlays.length === 0) return []
  const pool: Question[] = []

  // Assignment-recall questions: pull a play + a position, ask for the assignment
  for (const play of offensivePlays) {
    for (const a of play.assignments) {
      const correct = a.assignment
      // Distractors: assignments from other plays/positions
      const distractors = offensivePlays
        .flatMap((p) => p.assignments.map((x) => x.assignment))
        .filter((x) => x !== correct)
      if (distractors.length < 3) continue
      const options = shuffle([correct, ...shuffle(distractors).slice(0, 3)])
      pool.push({
        id: `assign-${play.playId}-${a.position}`,
        type: 'assignment',
        prompt: `On ${play.name} (${play.playId}), what is the assignment of the ${a.position}?`,
        context: `Formation: ${play.formation?.name ?? '—'} · Concept: ${play.concept.replace(/_/g, ' ')}`,
        options,
        correctIndex: options.indexOf(correct),
        explanation: `Correct: ${a.assignment}. Landmark: ${a.landmark}.`,
        difficulty: 'Medium',
      })
    }
  }

  // Concept ID questions: given play name, what's the concept?
  for (const play of offensivePlays) {
    const correct = play.concept.replace(/_/g, ' ')
    const distractors = offensivePlays
      .map((p) => p.concept.replace(/_/g, ' '))
      .filter((c) => c !== correct)
    if (distractors.length < 3) continue
    const options = shuffle([correct, ...shuffle(distractors).slice(0, 3)])
    pool.push({
      id: `concept-${play.playId}`,
      type: 'concept_id',
      prompt: `What is the run/pass concept of "${play.name}"?`,
      context: `Formation: ${play.formation?.name ?? '—'} · Personnel: ${play.personnel ?? '11'}`,
      options,
      correctIndex: options.indexOf(correct),
      explanation: `"${play.name}" is a ${correct} concept.${play.coachingPoints ? ' Coaching point: ' + play.coachingPoints.slice(0, 140) : ''}`,
      difficulty: 'Easy',
    })
  }

  // vs Coverage questions
  for (const play of offensivePlays) {
    if (play.coverageTargets.length === 0) continue
    const correct = play.coverageTargets[0].replace(/_/g, ' ')
    const allCoverages = ['cover 3', 'quarters', 'cover 2', 'cover 1', 'man', 'palms', 'cover 6']
    const distractors = allCoverages.filter((c) => c !== correct)
    if (distractors.length < 3) continue
    const options = shuffle([correct, ...shuffle(distractors).slice(0, 3)])
    pool.push({
      id: `cov-${play.playId}`,
      type: 'vs_coverage',
      prompt: `"${play.name}" is designed to attack which coverage?`,
      context: `Concept: ${play.concept.replace(/_/g, ' ')} · Targets: ${play.coverageTargets.join(', ')}`,
      options,
      correctIndex: options.indexOf(correct),
      explanation: `This play targets ${correct}. Coverage targets listed: ${play.coverageTargets.join(', ')}.`,
      difficulty: 'Hard',
    })
  }

  // Motion questions
  for (const play of offensivePlays) {
    if (!play.motion) continue
    const correct = play.motion
    const distractors = ['jet', 'orbit', 'shift', 'rocket', 'none', 'trade', 'motion']
      .filter((m) => m !== correct.toLowerCase())
    if (distractors.length < 3) continue
    const options = shuffle([correct, ...shuffle(distractors).slice(0, 3)])
    pool.push({
      id: `motion-${play.playId}`,
      type: 'motion',
      prompt: `What motion does "${play.name}" use?`,
      context: `Concept: ${play.concept.replace(/_/g, ' ')}`,
      options,
      correctIndex: options.indexOf(correct),
      explanation: `${play.name} uses "${correct}" motion.`,
      difficulty: 'Easy',
    })
  }

  // Complementary play questions
  for (const play of offensivePlays) {
    if (play.complementary.length === 0) continue
    const correct = play.complementary[0]
    const distractors = offensivePlays
      .map((p) => p.playId)
      .filter((id) => id !== correct && !play.complementary.includes(id))
    if (distractors.length < 3) continue
    const options = shuffle([correct, ...shuffle(distractors).slice(0, 3)])
    pool.push({
      id: `comp-${play.playId}`,
      type: 'complementary',
      prompt: `"${play.name}" (${play.playId}) is complemented by which play?`,
      context: `Concept: ${play.concept.replace(/_/g, ' ')} · Constraints: ${play.constraints.join(', ') || '—'}`,
      options,
      correctIndex: options.indexOf(correct),
      explanation: `${correct} is a complementary call to ${play.playId} — same family, different attack.`,
      difficulty: 'Hard',
    })
  }

  return shuffle(pool).slice(0, questionCount)
}

const TYPE_META: Record<QuestionType, { label: string; icon: React.ReactNode; color: string }> = {
  assignment: { label: 'Assignment', icon: <Users className="size-3.5" />, color: 'text-primary' },
  concept_id: { label: 'Concept ID', icon: <Target className="size-3.5" />, color: 'text-chart-3' },
  vs_coverage: { label: 'Coverage', icon: <Crosshair className="size-3.5" />, color: 'text-accent' },
  motion: { label: 'Motion', icon: <ChevronRight className="size-3.5" />, color: 'text-chart-5' },
  complementary: { label: 'Complement', icon: <Dumbbell className="size-3.5" />, color: 'text-primary' },
}

const DIFFICULTY_COLORS: Record<Question['difficulty'], string> = {
  Easy: 'bg-primary/15 text-primary border-primary/30',
  Medium: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  Hard: 'bg-accent/15 text-accent border-accent/30',
}

function QuizRunner({ plays }: { plays: SerializedPlay[] }) {
  const [questions, setQuestions] = React.useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [selected, setSelected] = React.useState<number | null>(null)
  const [answers, setAnswers] = React.useState<Array<{ questionId: string; correct: boolean }>>([])
  const [quizState, setQuizState] = React.useState<'idle' | 'running' | 'finished'>('idle')

  function startQuiz() {
    const qs = buildQuiz(plays, 10)
    setQuestions(qs)
    setCurrentIndex(0)
    setSelected(null)
    setAnswers([])
    setQuizState('running')
  }

  function submit() {
    if (selected === null || !questions[currentIndex]) return
    const q = questions[currentIndex]
    const correct = selected === q.correctIndex
    setAnswers((prev) => [...prev, { questionId: q.id, correct }])
    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((i) => i + 1)
        setSelected(null)
      } else {
        setQuizState('finished')
      }
    }, 1400)
  }

  function restart() {
    setQuizState('idle')
    setSelected(null)
    setAnswers([])
    setCurrentIndex(0)
  }

  if (quizState === 'idle' || questions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto size-14 rounded-full helmet-gradient flex items-center justify-center mb-4 shadow-lg">
          <GraduationCap className="size-7 text-primary-foreground" />
        </div>
        <h3 className="text-lg font-semibold">Player Quiz — Assignment Mastery</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Auto-generated 10-question quiz drawn from your installed playbook.
          Tests assignment recall, concept ID, coverage targeting, motion recognition,
          and complementary play knowledge.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {(['Easy', 'Medium', 'Hard'] as const).map((d) => (
            <Badge key={d} variant="outline" className={DIFFICULTY_COLORS[d]}>
              {d}
            </Badge>
          ))}
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            5 question types
          </Badge>
        </div>
        <Button onClick={startQuiz} className="mt-6" size="lg">
          <Zap className="size-4 mr-2" />
          Start Quiz
        </Button>
        {questions.length === 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            Click start to generate a fresh 10-question quiz from the playbook.
          </p>
        )}
      </Card>
    )
  }

  if (quizState === 'finished') {
    const correctCount = answers.filter((a) => a.correct).length
    const pct = Math.round((correctCount / answers.length) * 100)
    const grade = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F'
    const gradeColor =
      pct >= 90
        ? 'text-primary'
        : pct >= 80
        ? 'text-chart-3'
        : pct >= 70
        ? 'text-accent'
        : 'text-destructive'

    return (
      <Card className="p-8 text-center">
        <div
          className={cn(
            'mx-auto size-20 rounded-full flex items-center justify-center mb-4 shadow-xl',
            pct >= 80 ? 'helmet-gradient' : 'bg-muted'
          )}
        >
          <Trophy
            className={cn(
              'size-10',
              pct >= 80 ? 'text-primary-foreground' : 'text-muted-foreground'
            )}
          />
        </div>
        <div className="text-xs uppercase tracking-widest font-mono text-muted-foreground mb-1">
          Quiz Complete
        </div>
        <div className={cn('text-6xl font-bold font-mono', gradeColor)}>
          {pct}%
        </div>
        <div className={cn('text-lg font-semibold mt-1', gradeColor)}>
          Grade: {grade}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {correctCount} of {answers.length} correct
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 max-w-md mx-auto text-left">
          <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
            <div className="flex items-center gap-1.5 text-xs text-primary font-mono uppercase tracking-widest">
              <CheckCircle2 className="size-3.5" />
              Correct
            </div>
            <div className="text-2xl font-bold font-mono text-primary mt-1">
              {correctCount}
            </div>
          </div>
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
            <div className="flex items-center gap-1.5 text-xs text-destructive font-mono uppercase tracking-widest">
              <XCircle className="size-3.5" />
              Missed
            </div>
            <div className="text-2xl font-bold font-mono text-destructive mt-1">
              {answers.length - correctCount}
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <Button onClick={startQuiz} variant="default">
            <RefreshCw className="size-4 mr-1.5" />
            New Quiz
          </Button>
          <Button onClick={restart} variant="outline">
            Back to start
          </Button>
        </div>

        {/* Per-question review */}
        <div className="mt-8 text-left max-w-2xl mx-auto">
          <h4 className="text-xs uppercase tracking-widest font-mono text-muted-foreground mb-3">
            Question Review
          </h4>
          <div className="space-y-2">
            {questions.map((q, i) => {
              const a = answers[i]
              return (
                <div
                  key={q.id}
                  className={cn(
                    'rounded-md border p-3 text-sm',
                    a?.correct
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-destructive/30 bg-destructive/5'
                  )}
                >
                  <div className="flex items-start gap-2">
                    {a?.correct ? (
                      <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="size-4 text-destructive mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">
                        Q{i + 1}. {q.prompt}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {q.explanation}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>
    )
  }

  // Running state
  const q = questions[currentIndex]
  const answered = selected !== null
  const isCorrect = answered && selected === q.correctIndex

  return (
    <Card className="p-6">
      {/* Progress header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn('font-mono text-xs', TYPE_META[q.type].color)}>
            {TYPE_META[q.type].icon}
            {TYPE_META[q.type].label}
          </Badge>
          <Badge variant="outline" className={cn('text-xs', DIFFICULTY_COLORS[q.difficulty])}>
            {q.difficulty}
          </Badge>
        </div>
        <div className="text-xs font-mono text-muted-foreground">
          Q {currentIndex + 1} / {questions.length}
        </div>
      </div>
      <Progress value={(currentIndex / questions.length) * 100} className="h-1.5 mb-4" />

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.22 }}
        >
          <h3 className="text-lg font-semibold leading-tight">{q.prompt}</h3>
          {q.context && (
            <p className="text-xs text-muted-foreground mt-2 font-mono">{q.context}</p>
          )}

          <div className="mt-4 grid gap-2">
            {q.options.map((opt, i) => {
              const isThis = selected === i
              const isCorrectOption = i === q.correctIndex
              return (
                <button
                  key={i}
                  disabled={answered}
                  onClick={() => setSelected(i)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all',
                    !answered &&
                      'border-border hover:border-primary/40 hover:bg-primary/5 cursor-pointer',
                    answered && isCorrectOption && 'border-primary bg-primary/10',
                    answered &&
                      isThis &&
                      !isCorrectOption &&
                      'border-destructive bg-destructive/10',
                    answered &&
                      !isThis &&
                      !isCorrectOption &&
                      'border-border opacity-50'
                  )}
                >
                  <span
                    className={cn(
                      'size-7 rounded-full border flex items-center justify-center text-xs font-bold font-mono shrink-0',
                      !answered && 'border-border text-muted-foreground',
                      answered && isCorrectOption && 'bg-primary text-primary-foreground border-primary',
                      answered &&
                        isThis &&
                        !isCorrectOption &&
                        'bg-destructive text-destructive-foreground border-destructive'
                    )}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {answered && isCorrectOption && (
                    <CheckCircle2 className="size-4 text-primary" />
                  )}
                  {answered && isThis && !isCorrectOption && (
                    <XCircle className="size-4 text-destructive" />
                  )}
                </button>
              )
            })}
          </div>

          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'mt-4 rounded-lg border p-3 text-sm',
                isCorrect
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-accent/40 bg-accent/5'
              )}
            >
              <div className="flex items-start gap-2">
                {isCorrect ? (
                  <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                ) : (
                  <Lightbulb className="size-4 text-accent mt-0.5 shrink-0" />
                )}
                <div className="flex-1">
                  <div className={cn('font-semibold', isCorrect ? 'text-primary' : 'text-accent')}>
                    {isCorrect ? 'Correct!' : 'Review this one'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {q.explanation}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-5 flex items-center justify-between">
        <div className="text-xs text-muted-foreground font-mono">
          Score: {answers.filter((a) => a.correct).length} / {answers.length} (
          {answers.length > 0
            ? Math.round(
                (answers.filter((a) => a.correct).length / answers.length) * 100
              )
            : 0}
          %)
        </div>
        <Button onClick={submit} disabled={selected === null}>
          {currentIndex + 1 < questions.length ? 'Next' : 'Finish'}
          <ChevronRight className="size-4 ml-1.5" />
        </Button>
      </div>
    </Card>
  )
}

function RoomMastery({ team }: { team: QuizData['team'] }) {
  const players = team?.players ?? []
  const grouped = React.useMemo(() => {
    const map = new Map<string, typeof players>()
    for (const p of players) {
      if (p.quizScore == null) continue
      const room = positionToRoom(p.position)
      const list = map.get(room) ?? []
      list.push(p)
      map.set(room, list)
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [players])

  if (grouped.length === 0) return null

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Award className="size-4 text-accent" />
          <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
            Room Mastery Leaderboard
          </h3>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {grouped.map(([room, roomPlayers]) => {
          const avg =
            roomPlayers.reduce((a, p) => a + (p.quizScore ?? 0), 0) / roomPlayers.length
          const pct = Math.round(avg * 100)
          return (
            <div
              key={room}
              className="rounded-lg border border-border bg-background/40 p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Users className="size-3.5 text-primary" />
                  <span className="text-sm font-semibold">{room} Room</span>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'font-mono text-xs',
                    pct >= 90
                      ? 'bg-primary/15 text-primary border-primary/30'
                      : pct >= 80
                      ? 'bg-chart-3/15 text-chart-3 border-chart-3/30'
                      : 'bg-accent/15 text-accent border-accent/30'
                  )}
                >
                  {pct}%
                </Badge>
              </div>
              <Progress value={pct} className="h-1.5 mb-2" />
              <div className="space-y-1">
                {roomPlayers
                  .sort((a, b) => (b.quizScore ?? 0) - (a.quizScore ?? 0))
                  .map((p, i) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="flex items-center gap-1.5">
                        {i === 0 && <Trophy className="size-3 text-accent" />}
                        <span className="font-mono text-muted-foreground">
                          #{p.jersey}
                        </span>
                        <span>{p.name}</span>
                      </span>
                      <span className="font-mono">
                        {Math.round((p.quizScore ?? 0) * 100)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function positionToRoom(position: string): string {
  const p = position.toUpperCase()
  if (p === 'QB') return 'QB'
  if (['RB', 'FB', 'HB'].includes(p)) return 'RB'
  if (['WR', 'X', 'Z', 'H', 'F'].includes(p)) return 'WR'
  if (['TE', 'Y'].includes(p)) return 'TE'
  if (['LT', 'LG', 'C', 'RG', 'RT', 'OL'].includes(p)) return 'OL'
  if (['DE', 'DT', 'DL'].includes(p)) return 'DL'
  if (['MIKE', 'WILL', 'SAM', 'LB'].includes(p)) return 'LB'
  if (['CB', 'S', 'FS', 'SS', 'DB'].includes(p)) return 'DB'
  return p
}

function QuizMain() {
  const { data, isLoading } = useQuery({
    queryKey: ['gridiron'],
    queryFn: async () => {
      const r = await fetch('/api/gridiron')
      if (!r.ok) throw new Error('failed')
      return r.json() as Promise<QuizData>
    },
    staleTime: 60_000,
  })

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="h-24 rounded-lg border border-border bg-card animate-pulse-soft" />
        <div className="h-64 rounded-lg border border-border bg-card animate-pulse-soft" />
      </div>
    )
  }

  const plays = data.plays
  const team = data.team

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-5 relative overflow-hidden">
        <div className="absolute inset-0 turf-texture opacity-30" />
        <div className="relative flex items-start gap-4">
          <div className="size-12 rounded-md helmet-gradient flex items-center justify-center shadow-lg shrink-0">
            <Brain className="size-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
              PlayerQuiz™ · Assignment Mastery
            </div>
            <h2 className="text-xl font-bold leading-tight">Test Your Playbook Knowledge</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Auto-generated quizzes from your installed playbook. Players must score
              90%+ before game day. Tracks per-room mastery across the team.
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1">
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/30 font-mono"
            >
              {plays.length} plays in pool
            </Badge>
            <Badge variant="outline" className="bg-muted text-muted-foreground font-mono">
              5 question types
            </Badge>
          </div>
        </div>
      </div>

      {/* Quiz runner */}
      <QuizRunner plays={plays} />

      {/* Room mastery */}
      <RoomMastery team={team} />

      {/* Question types reference */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
            Question Types
          </h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {(Object.keys(TYPE_META) as QuestionType[]).map((t) => (
            <div
              key={t}
              className="rounded-md border border-border bg-background/40 p-3 flex items-start gap-2.5"
            >
              <span className={TYPE_META[t].color}>{TYPE_META[t].icon}</span>
              <div>
                <div className="text-sm font-semibold">{TYPE_META[t].label}</div>
                <div className="text-xs text-muted-foreground">
                  {t === 'assignment' && 'Recall your position assignment on a given play'}
                  {t === 'concept_id' && 'Identify the run/pass concept from a play name'}
                  {t === 'vs_coverage' && 'Which coverage is this play designed to attack?'}
                  {t === 'motion' && 'Recognize the pre-snap motion used by a play'}
                  {t === 'complementary' && 'Know which play complements a given call'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default function PlayerQuiz() {
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
      <QuizMain />
    </QueryClientProvider>
  )
}
