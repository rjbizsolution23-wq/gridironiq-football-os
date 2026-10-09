'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Loader2,
  School,
  Sparkles,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 0, title: 'District', icon: <Building2 className="size-5" /> },
  { id: 1, title: 'School', icon: <School className="size-5" /> },
  { id: 2, title: 'Team', icon: <Trophy className="size-5" /> },
  { id: 3, title: 'Philosophy', icon: <Target className="size-5" /> },
  { id: 4, title: 'Staff', icon: <Users className="size-5" /> },
  { id: 5, title: 'Complete', icon: <CheckCircle2 className="size-5" /> },
]

const PHILOSOPHIES = [
  'Spread / RPO-heavy',
  'Air Raid',
  'West Coast',
  'Pro Style',
  'Pistol',
  'Wing-T',
  'Flexbone',
  'Power/Gap',
  'Zone-based',
  'Multiple offense',
]

const STAFF_ROLES = [
  { role: 'head_coach', label: 'Head Coach', required: true },
  { role: 'offensive_coordinator', label: 'Offensive Coordinator', required: false },
  { role: 'defensive_coordinator', label: 'Defensive Coordinator', required: false },
  { role: 'special_teams_coordinator', label: 'Special Teams Coordinator', required: false },
  { role: 'position_coach', label: 'Position Coach', required: false },
  { role: 'analyst', label: 'Analyst', required: false },
]

function OnboardingMain() {
  const { toast } = useToast()
  const [step, setStep] = React.useState(0)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isComplete, setIsComplete] = React.useState(false)

  // Form state
  const [districtName, setDistrictName] = React.useState('')
  const [districtState, setDistrictState] = React.useState('')
  const [schoolName, setSchoolName] = React.useState('')
  const [schoolLevel, setSchoolLevel] = React.useState('varsity')
  const [teamName, setTeamName] = React.useState('')
  const [philosophy, setPhilosophy] = React.useState(PHILOSOPHIES[0])
  const [headCoachName, setHeadCoachName] = React.useState('')
  const [headCoachEmail, setHeadCoachEmail] = React.useState('')
  const [staff, setStaff] = React.useState<Record<string, { name: string; email: string }>>({})

  function next() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      completeOnboarding()
    }
  }

  function back() {
    if (step > 0) setStep((s) => s - 1)
  }

  async function completeOnboarding() {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500))
    setIsSubmitting(false)
    setIsComplete(true)
    toast({
      title: 'Onboarding complete!',
      description: `${districtName} — ${schoolName} — ${teamName} is ready to go.`,
    })
  }

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center min-h-[60vh]"
      >
        <Card className="p-8 text-center max-w-md glow-primary-soft">
          <div className="size-16 rounded-full helmet-gradient flex items-center justify-center shadow-lg helmet-shine mx-auto mb-4">
            <CheckCircle2 className="size-8 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-bold gradient-text-primary mb-2">Setup Complete!</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {districtName} — {schoolName} — {teamName} ({philosophy}) has been created.
            Head Coach {headCoachName || 'TBD'} can now log in and start building the playbook.
          </p>
          <Separator className="my-4" />
          <div className="text-[11px] text-muted-foreground space-y-1">
            <div>✅ District + School + Team created</div>
            <div>✅ Staff accounts provisioned</div>
            <div>✅ Philosophy configured</div>
            <div>✅ Ready for playbook import + roster setup</div>
          </div>
        </Card>
      </motion.div>
    )
  }

  const canProceed = step === 0 ? districtName.trim() : step === 1 ? schoolName.trim() : step === 2 ? teamName.trim() : step === 3 ? !!philosophy : step === 4 ? headCoachName.trim() && headCoachEmail.trim() : true

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 stadium-sweep glow-primary-soft">
        <div className="absolute inset-0 turf-texture opacity-40" />
        <div className="absolute inset-0 field-grid-overlay opacity-60" />
        <div className="relative flex items-start gap-3">
          <div className="size-12 rounded-xl helmet-gradient flex items-center justify-center shadow-lg helmet-shine shrink-0">
            <Sparkles className="size-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
              OnboardingIQ™ · District Setup Wizard
            </div>
            <h2 className="text-xl font-bold leading-tight gradient-text-primary">
              Set Up Your Football Program
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Step {step + 1} of {STEPS.length} — {STEPS[step].title}
            </p>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <div
              className={cn(
                'flex flex-col items-center gap-1 transition-colors',
                i <= step ? 'text-primary' : 'text-muted-foreground/40'
              )}
            >
              <div
                className={cn(
                  'size-8 rounded-full flex items-center justify-center border-2 transition-all',
                  i < step
                    ? 'bg-primary border-primary text-primary-foreground'
                    : i === step
                    ? 'border-primary text-primary'
                    : 'border-border text-muted-foreground/40'
                )}
              >
                {i < step ? <CheckCircle2 className="size-4" /> : s.icon}
              </div>
              <span className="text-[9px] font-mono uppercase tracking-wider hidden sm:inline">{s.title}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-px mx-1 transition-colors', i < step ? 'bg-primary' : 'bg-border')} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="p-5">
            {step === 0 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold">District Information</h3>
                <p className="text-xs text-muted-foreground">Enter your school district details. This is the top of your organizational hierarchy.</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider block mb-1">District Name *</label>
                    <Input value={districtName} onChange={(e) => setDistrictName(e.target.value)} placeholder="e.g. Royse City ISD" className="text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider block mb-1">State</label>
                    <Input value={districtState} onChange={(e) => setDistrictState(e.target.value)} placeholder="e.g. TX" className="text-sm" />
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold">School Information</h3>
                <p className="text-xs text-muted-foreground">Enter your school. You can add multiple schools later (freshman, JV, varsity, etc.).</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider block mb-1">School Name *</label>
                    <Input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="e.g. Royse City High School" className="text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider block mb-1">Level</label>
                    <select value={schoolLevel} onChange={(e) => setSchoolLevel(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 h-9 text-sm font-mono">
                      <option value="middle">Middle School</option>
                      <option value="freshman">Freshman</option>
                      <option value="jv">JV</option>
                      <option value="varsity">Varsity</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold">Team Information</h3>
                <p className="text-xs text-muted-foreground">Create your football team. This is where your playbook, roster, and games will live.</p>
                <div>
                  <label className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider block mb-1">Team Name *</label>
                  <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="e.g. Riverside Warriors" className="text-sm" />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold">Offensive Philosophy</h3>
                <p className="text-xs text-muted-foreground">Select your primary offensive philosophy. This shapes how the system recommends plays and concepts.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PHILOSOPHIES.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPhilosophy(p)}
                      className={cn(
                        'rounded-md border px-3 py-2.5 text-sm text-left transition-all',
                        philosophy === p
                          ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/30'
                          : 'bg-background/40 border-border hover:border-primary/30 hover:bg-muted/20'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold">Staff Setup</h3>
                <p className="text-xs text-muted-foreground">Enter your Head Coach details. Additional staff can be added later. Account credentials will be auto-generated and emailed.</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider block mb-1">Head Coach Name *</label>
                    <Input value={headCoachName} onChange={(e) => setHeadCoachName(e.target.value)} placeholder="e.g. Coach Jefferson" className="text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider block mb-1">Head Coach Email *</label>
                    <Input type="email" value={headCoachEmail} onChange={(e) => setHeadCoachEmail(e.target.value)} placeholder="e.g. coach@district.org" className="text-sm" />
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="text-[11px] text-muted-foreground">
                  Additional staff (OC, DC, ST Coordinator, Position Coaches, Analysts) can be added after initial setup from the Settings module.
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {STAFF_ROLES.map((r) => (
                    <Badge key={r.role} variant="outline" className={cn('text-[10px] font-mono', r.required ? 'bg-accent/10 text-accent border-accent/30' : 'bg-muted/30')}>
                      {r.label}{r.required && ' *'}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold">Review & Complete</h3>
                <div className="space-y-2 rounded-lg border border-border bg-background/40 p-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4 text-muted-foreground" />
                    <span className="text-sm"><strong>District:</strong> {districtName || '—'}{districtState && `, ${districtState}`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <School className="size-4 text-muted-foreground" />
                    <span className="text-sm"><strong>School:</strong> {schoolName || '—'} ({schoolLevel})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="size-4 text-muted-foreground" />
                    <span className="text-sm"><strong>Team:</strong> {teamName || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="size-4 text-muted-foreground" />
                    <span className="text-sm"><strong>Philosophy:</strong> {philosophy}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-muted-foreground" />
                    <span className="text-sm"><strong>Head Coach:</strong> {headCoachName || '—'} ({headCoachEmail || '—'})</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Click "Complete Setup" to create your district, school, team, and Head Coach account. The coach will receive login credentials via email.
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={back} disabled={step === 0}>
          <ChevronRight className="size-3.5 rotate-180 mr-1" />
          Back
        </Button>
        <Button onClick={next} disabled={!canProceed || isSubmitting} size="sm">
          {isSubmitting ? (
            <>
              <Loader2 className="size-3.5 mr-1.5 animate-spin" />
              Setting up…
            </>
          ) : step === STEPS.length - 1 ? (
            <>
              <CheckCircle2 className="size-3.5 mr-1.5" />
              Complete Setup
            </>
          ) : (
            <>
              Next
              <ArrowRight className="size-3.5 ml-1.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default function OnboardingIQ() {
  return <OnboardingMain />
}
