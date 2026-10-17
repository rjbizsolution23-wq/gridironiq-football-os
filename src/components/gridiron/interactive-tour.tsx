'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clapperboard,
  Crosshair,
  Flame,
  Layers,
  LayoutDashboard,
  PlayCircle,
  Shield,
  Sparkles,
  Target,
  Watch,
  X,
  Compass,
  Rocket,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useAppStore, type ModuleId } from '@/lib/store'

export interface TourStep {
  title: string
  subtitle: string
  moduleId: ModuleId
  icon: React.ReactNode
  tag: string
  description: string
  highlights: string[]
  proTip: string
}

export const TOUR_STEPS: TourStep[] = [
  {
    title: 'Command Center',
    subtitle: 'High-Level Operational Awareness',
    moduleId: 'dashboard',
    icon: <LayoutDashboard className="size-6 text-primary" />,
    tag: 'INTELLIGENCE',
    description:
      'Your centralized coaching HUD. Live overview of season record, offensive efficiency metrics, success rates by concept family, quick-launch tools, and game-week milestones.',
    highlights: [
      'Real-time team success rate & explosive play counters',
      'Concept performance matrix (Inside Zone, Mesh, RPO, Stick)',
      'Direct shortcuts into scouting reports and practice plans',
    ],
    proTip: 'Use Command Center on Monday mornings to set game week priorities and track execution KPIs.',
  },
  {
    title: 'PlaybookIQ™',
    subtitle: 'DNA-Level Play Catalog & Search',
    moduleId: 'playbook',
    icon: <PlayCircle className="size-6 text-primary" />,
    tag: 'SYSTEM CORE',
    description:
      'Search, filter, and inspect your full offensive playbook. Browse plays by concept family, personnel grouping (10, 11, 12, 21), defensive target fronts, and pass/run tendencies.',
    highlights: [
      'Filter by Concept Family (Glance RPO, Mesh, Flood, Counter)',
      'Detailed playbook cards with tags, personnel, and diagrams',
      'Direct one-click export into call sheets and wristbands',
    ],
    proTip: 'Tag plays with defensive front vulnerabilities (Over, Under, Tite) for instant situational sorting on game night.',
  },
  {
    title: 'Formation Lab & Play Designer',
    subtitle: 'Interactive Tactical Board',
    moduleId: 'designer',
    icon: <Crosshair className="size-6 text-primary" />,
    tag: 'TACTICS',
    description:
      'Design plays and route stems with precision. Set offensive formations, shift defensive coverages (Cover 1, Cover 2, Cover 3, Quarters), adjust line splits, and test concept matchups.',
    highlights: [
      'Interactive vector field with offensive skill positions & offensive line',
      'Defensive front overlay with safety shells and box counts',
      'Save custom designs directly into the team playbook library',
    ],
    proTip: 'Test how Cover 3 Cloud vs Cover 2 changes receiver route depths before installing in practice.',
  },
  {
    title: 'ScoutIQ™',
    subtitle: 'Opponent Tendency Exploitation',
    moduleId: 'scout',
    icon: <Shield className="size-6 text-primary" />,
    tag: 'SCOUTING',
    description:
      'Deep opponent scouting breakdown. View defensive alignments, down-and-distance blitz rates, coverage tendencies by hash mark, and key personnel matchups.',
    highlights: [
      'Down & distance tendency probabilities (e.g., 3rd & Med 62% Cover 1)',
      'Personnel alerts for dangerous edge rushers and weak coverage spots',
      'Visual situational tendencies with sample sizes and confidence ratings',
    ],
    proTip: 'Check hash-mark blitz tendencies to call plays designed away from the boundary pressure.',
  },
  {
    title: 'Coach AI™ & Free Model Switcher',
    subtitle: 'Autonomous Coordinator Intelligence',
    moduleId: 'coach-ai',
    icon: <Brain className="size-6 text-primary" />,
    tag: 'AI POWERED',
    description:
      'Coordinator-level intelligence routed through Rick Jefferson’s Sovereign Cloudflare router. Switch between 19 verified 100% free models in real-time with zero token cost.',
    highlights: [
      'Live model switcher: Auto Free Router, Gemma 4 31B, Nemotron 3.5 VL, Laguna S, and more',
      'Context-aware responses referencing your actual team playbook & opponent data',
      'Play recommendations with WHY / WHAT / HOW / EXPLAINABILITY structure',
    ],
    proTip: 'Use the model dropdown in the header to switch to Nemotron 3.5 Super VL for multimodal diagram reasoning.',
  },
  {
    title: 'GamePlanIQ™',
    subtitle: 'Weekly Scripting & Situational Matrix',
    moduleId: 'gameplan',
    icon: <Target className="size-6 text-primary" />,
    tag: 'STRATEGY',
    description:
      'Generate and customize your opening 15-script, red-zone attack plan, 3rd-down calls, and two-minute drill. Generates cohesive gameplans linked to opponent defensive weaknesses.',
    highlights: [
      'Automated 1st-and-10 opening script tailored to opponent tendencies',
      'Goal-line, backed-up, 2-minute, and 4-minute situational scripts',
      'One-click PDF export for sideline distribution',
    ],
    proTip: 'Script your first 15 plays to test opponent coverage rules against empty and bunch formations.',
  },
  {
    title: 'CallSheetIQ™ & WristbandIQ™',
    subtitle: 'Sideline & Field-Level Execution',
    moduleId: 'callsheet',
    icon: <Watch className="size-6 text-primary" />,
    tag: 'EXECUTION',
    description:
      'Turn weekly game plans into printable, color-coded sideline call sheets and QB/WR wristband inserts with numbered code matrices for lightning-fast tempo communication.',
    highlights: [
      'High-contrast laminated sheet layout categorized by down, distance, and field zone',
      'Wristband generator with 3x4 grid code numbering and position filtering',
      'Instant print optimization with clean black & gold team branding',
    ],
    proTip: 'Keep your wristband number-to-play mapping randomized week-to-week to eliminate signal theft.',
  },
  {
    title: 'FilmIQ™ & AI Video Frame Tagging',
    subtitle: 'Film Breakdown & Formation Vision',
    moduleId: 'film',
    icon: <Clapperboard className="size-6 text-primary" />,
    tag: 'VISION AI',
    description:
      'Upload game film clips, auto-tag formations, down-and-distance, and run/pass outcomes. Utilize vision models to detect defensive alignments straight from video frames.',
    highlights: [
      'Frame-by-frame scrubbing with tactical overlay',
      'Multimodal AI frame inspection for defensive box count & safety depth',
      'Integrated drill clip tagging and player grading breakdown',
    ],
    proTip: 'Tag red-zone clips to quickly isolate third-down conversions inside the 10-yard line.',
  },
  {
    title: 'RedZoneIQ™ & SituationalIQ™',
    subtitle: 'High-Leverage Field Zone Mastery',
    moduleId: 'redzone',
    icon: <Flame className="size-6 text-primary" />,
    tag: 'HIGH LEVERAGE',
    description:
      'Dedicated focus on where games are won and lost. Optimize red-zone touchdown conversion rates (Gold Zone vs Green Zone) and master sudden-change, backed-up, and end-of-half scenarios.',
    highlights: [
      'Field zone breakdown: High Red (20-11), Low Red (10-4), Goal Line (3-1)',
      'Touchdown vs Field Goal efficiency analytics',
      'Clutch clock management protocols and two-minute time saving algorithms',
    ],
    proTip: 'Inside the 5-yard line, favor compressed formations to force safeties into run fit conflicts.',
  },
  {
    title: 'Installation & Player Accountability',
    subtitle: 'InstallIQ™, Quiz Lab & Depth Charts',
    moduleId: 'install',
    icon: <Layers className="size-6 text-primary" />,
    tag: 'OPERATIONS',
    description:
      'Manage day-by-day practice installations, test player playbook retention with interactive quizzes, evaluate depth charts, and oversee parent and staff communications.',
    highlights: [
      'Weekly installation schedules (Install 1: Base Zone, Install 2: Third Down)',
      'Automated player quizzes testing coverage reads and pass protections',
      'Depth chart availability tracking and accountability logging',
    ],
    proTip: 'Review PlayerQuiz scores before Thursday walk-through to review any concept confusion.',
  },
]

interface InteractiveTourProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InteractiveTour({ open, onOpenChange }: InteractiveTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0)
  const setActiveModule = useAppStore((s) => s.setActiveModule)

  const step = TOUR_STEPS[currentStepIndex]
  const isFirst = currentStepIndex === 0
  const isLast = currentStepIndex === TOUR_STEPS.length - 1

  function handleNavigate(index: number) {
    if (index >= 0 && index < TOUR_STEPS.length) {
      setCurrentStepIndex(index)
      setActiveModule(TOUR_STEPS[index].moduleId)
    }
  }

  function handleNext() {
    if (isLast) {
      onOpenChange(false)
    } else {
      handleNavigate(currentStepIndex + 1)
    }
  }

  function handlePrev() {
    if (!isFirst) {
      handleNavigate(currentStepIndex - 1)
    }
  }

  function handleJumpToModule(moduleId: ModuleId) {
    setActiveModule(moduleId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-border bg-card shadow-2xl">
        {/* Header with gradient & branding */}
        <div className="relative bg-gradient-to-r from-slate-900 via-primary/90 to-slate-900 p-6 text-primary-foreground border-b border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-background/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                <Activity className="size-5 text-accent" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-lg font-bold tracking-tight text-white m-0">
                    GridironIQ™ Guided Tour
                  </DialogTitle>
                  <Badge variant="secondary" className="bg-white/10 text-white border-white/20 text-[10px] font-mono">
                    {step.tag}
                  </Badge>
                </div>
                <DialogDescription className="text-xs text-white/80 mt-0.5">
                  Interactive walkthrough of the complete Football Intelligence OS
                </DialogDescription>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono font-bold text-accent">
                STEP {currentStepIndex + 1} OF {TOUR_STEPS.length}
              </div>
              <div className="text-[10px] text-white/70">
                {Math.round(((currentStepIndex + 1) / TOUR_STEPS.length) * 100)}% Complete
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-sm">
              {step.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                {step.title}
              </h3>
              <p className="text-sm font-medium text-muted-foreground mt-0.5">
                {step.subtitle}
              </p>
              <p className="text-sm text-foreground/90 mt-2.5 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>

          {/* Key capabilities list */}
          <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-1.5">
              <Zap className="size-3.5 text-primary" />
              Core Capabilities & Highlights
            </div>
            <div className="grid gap-2 sm:grid-cols-1">
              {step.highlights.map((highlight, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-foreground/80">
                  <CheckCircle2 className="size-3.5 text-primary mt-0.5 shrink-0" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro tip box */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-start gap-3">
            <Sparkles className="size-4 text-primary mt-0.5 shrink-0" />
            <div className="text-xs text-foreground/90 leading-relaxed">
              <strong className="text-primary font-semibold">Coach Pro Tip: </strong>
              {step.proTip}
            </div>
          </div>

          {/* Step dots navigation */}
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {TOUR_STEPS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleNavigate(idx)}
                className={`transition-all rounded-full ${
                  idx === currentStepIndex
                    ? 'w-6 h-2 bg-primary'
                    : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                title={s.title}
                aria-label={`Go to step ${idx + 1}: ${s.title}`}
              />
            ))}
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between border-t border-border bg-muted/20 px-6 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={isFirst}
            className="gap-1.5 text-xs"
          >
            <ArrowLeft className="size-3.5" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleJumpToModule(step.moduleId)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Explore this module
            </Button>

            <Button
              size="sm"
              onClick={handleNext}
              className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4"
            >
              {isLast ? (
                <>
                  <CheckCircle2 className="size-3.5" />
                  Finish Tour
                </>
              ) : (
                <>
                  Next Module
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
