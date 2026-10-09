'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Download,
  FileText,
  GraduationCap,
  Mail,
  Phone,
  School,
  Send,
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
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const PRICING_TIERS = [
  {
    name: 'Youth / 7-on-7',
    price: '$49-99',
    period: '/month',
    color: 'text-primary',
    border: 'border-primary/40',
    bg: 'bg-primary/5',
    features: [
      'PlaybookIQ (up to 50 plays)',
      'PlayerQuiz (unlimited)',
      'Basic analytics',
      '1 team account',
      'Mobile access',
      'Email support',
    ],
    limitations: ['No AI game planning', 'No film upload', 'No opponent scouting'],
  },
  {
    name: 'High School',
    price: '$199-499',
    period: '/month',
    color: 'text-chart-3',
    border: 'border-chart-3/40',
    bg: 'bg-chart-3/5',
    features: [
      'All 25 modules',
      'Up to 80 players',
      'AI Coach + GamePlan + Matchup',
      'Film upload + VLM tagging',
      'Opponent scouting',
      'Call sheet + wristband export',
      'Player accountability tracking',
      '5 staff accounts',
      'Priority email + chat support',
    ],
    limitations: ['No multi-team district access'],
    popular: true,
  },
  {
    name: 'Competitive HS',
    price: '$500-1,500',
    period: '/month',
    color: 'text-accent',
    border: 'border-accent/40',
    bg: 'bg-accent/5',
    features: [
      'Everything in High School',
      'Unlimited players + staff',
      'District-wide access (all teams)',
      'Advanced analytics + self-scout',
      'Practice recommendation engine',
      'PDF export (all formats)',
      'Weekly game-prep dashboard',
      'Parent/guardian portal',
      'Dedicated account manager',
      'Custom playbook packages',
      'Phone support',
    ],
    limitations: [],
  },
  {
    name: 'College / Institutional',
    price: 'Custom',
    period: '',
    color: 'text-destructive',
    border: 'border-destructive/40',
    bg: 'bg-destructive/5',
    features: [
      'Everything in Competitive HS',
      'Multi-program access',
      'API access + integrations',
      'Custom AI model training',
      'White-label option',
      'On-premise deployment option',
      'SLA guarantee (99.9% uptime)',
      '24/7 priority support',
      'Compliance + audit logging',
      'Custom development',
    ],
    limitations: [],
  },
]

const IMPLEMENTATION_TIMELINE = [
  { phase: 'Week 1', title: 'Onboarding & Setup', items: ['District/school/team creation', 'Staff account provisioning', 'Playbook import', 'Roster import', 'Philosophy configuration'] },
  { phase: 'Week 2', title: 'Installation & Training', items: ['Coach training sessions (2-3 hrs)', 'Player onboarding', 'First install package', 'Call sheet setup', 'Film upload walkthrough'] },
  { phase: 'Week 3', title: 'First Game Week', items: ['Opponent film upload', 'Scout report generation', 'Game plan creation', 'Practice script', 'Call sheet export', 'Postgame analytics'] },
  { phase: 'Week 4', title: 'Full Operation', items: ['Player accountability active', 'Weekly cadence established', 'Analytics review', 'Self-scout running', 'Optimization + feedback'] },
]

const CONTRACT_TERMS = [
  { label: 'Contract Length', value: 'Annual (12 months) with auto-renewal' },
  { label: 'Payment Terms', value: 'Net 30, quarterly or annual billing' },
  { label: 'Setup Fee', value: 'Waived for annual contracts' },
  { label: 'Data Ownership', value: 'District owns all data; exportable at any time' },
  { label: 'Data Retention', value: 'Configurable; default 7 years after season' },
  { label: 'Privacy Compliance', value: 'COPPA + FERPA compliant; no student data sold' },
  { label: 'Security', value: 'AES-256 at rest, TLS 1.3, MFA for staff' },
  { label: 'SLA', value: '99.5% uptime (99.9% for College tier)' },
  { label: 'Cancellation', value: '30-day written notice; pro-rated refund' },
  { label: 'Training', value: 'Included: 2 coach sessions + player onboarding' },
]

function ProposalMain() {
  const { toast } = useToast()
  const [districtName, setDistrictName] = React.useState('')
  const [schoolName, setSchoolName] = React.useState('')
  const [contactName, setContactName] = React.useState('')
  const [contactEmail, setContactEmail] = React.useState('')
  const [contactPhone, setContactPhone] = React.useState('')
  const [selectedTier, setSelectedTier] = React.useState(1) // High School default
  const [notes, setNotes] = React.useState('')

  function generateProposal() {
    const tier = PRICING_TIERS[selectedTier]
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    const proposal = `GRIDIRONIQ™ — FOOTBALL INTELLIGENCE OS
PROPOSAL FOR ${districtName.toUpperCase() || '[DISTRICT NAME]'}
${schoolName ? `School: ${schoolName}` : ''}
Date: ${date}

═══════════════════════════════════════════════════════════

PREPARED BY:
RJ Business Solutions
Rick Jefferson
rjbusinesssolutions.org
support@rjbusinesssolutions.org

PREPARED FOR:
${contactName || '[CONTACT NAME]'}
${districtName || '[DISTRICT NAME]'}
${contactEmail || '[EMAIL]'}
${contactPhone || '[PHONE]'}

═══════════════════════════════════════════════════════════

1. EXECUTIVE SUMMARY

GridironIQ™ is a comprehensive football intelligence platform that
combines play design, opponent scouting, AI game planning, practice
scripting, film analysis, and player development into one system.

This proposal outlines a ${tier.name} tier deployment for ${districtName || 'your district'}
with implementation beginning immediately upon contract execution.

═══════════════════════════════════════════════════════════

2. SELECTED TIER: ${tier.name.toUpperCase()}

Pricing: ${tier.price}${tier.period}
Contract: Annual (12 months)
Setup Fee: Waived

INCLUDES:
${tier.features.map((f) => `  ✅ ${f}`).join('\n')}

${tier.limitations.length > 0 ? `NOT INCLUDED:\n${tier.limitations.map((l) => `  ❌ ${l}`).join('\n')}` : 'All features included.'}

═══════════════════════════════════════════════════════════

3. IMPLEMENTATION TIMELINE

${IMPLEMENTATION_TIMELINE.map((p) => `${p.phase}: ${p.title}\n${p.items.map((i) => `  • ${i}`).join('\n')}`).join('\n\n')}

═══════════════════════════════════════════════════════════

4. CONTRACT TERMS

${CONTRACT_TERMS.map((t) => `${t.label}: ${t.value}`).join('\n')}

═══════════════════════════════════════════════════════════

5. MODULES INCLUDED (25 total)

Coach OS:
  • Command Center (Dashboard)
  • PlaybookIQ (Play DNA + browse)
  • Formation Lab (SVG drag-and-drop designer)
  • ScoutIQ (Opponent tendencies)
  • Coach AI (LLM assistant)
  • TendencyLab (Interactive tendency explorer)
  • SituationalIQ (Down/distance × hash × zone)
  • SelfScoutIQ (Team predictability warnings)
  • DepthChartIQ (Visual depth chart)
  • GamePlanIQ (AI opening script)
  • CallSheetIQ (Situational call sheet + PDF)
  • WristbandIQ (QB wristband generator)
  • PracticeIQ (Auto-generated practice scripts)
  • AnalyticsIQ (Postgame + self-scout)
  • RedZoneIQ (Red zone heat map)
  • FilmIQ (AI film tagging + VLM)
  • MatchupIQ (AI game prediction)
  • WeekPlanIQ (Weekly game-prep dashboard)
  • DrillBuilder (Practice drill library)

Player Development:
  • InstallIQ (Installation schedule + mastery)
  • PersonnelIQ (Roster + availability)
  • PlayerQuiz (Interactive playbook recall)
  • TwoMinuteIQ (2-min drill simulator + defense mode)
  • AccountabilityIQ (Player progress + intervention)
  • SettingsIQ (Preferences + data management)

═══════════════════════════════════════════════════════════

6. AI-POWERED INTELLIGENCE (4 engines)

  • Coach AI — Coordinator-level LLM assistant grounded in your playbook
  • GamePlanIQ — AI opening script + situational recommendations
  • FilmIQ — VLM-powered film frame analysis + auto-tagging
  • MatchupIQ — AI head-to-head game prediction with key matchups

═══════════════════════════════════════════════════════════

7. COMPLIANCE & PRIVACY

  • COPPA compliant (under-13 protections)
  • FERPA compliant (education records)
  • No student data sold or used for advertising
  • No cross-school data sharing
  • Configurable data retention
  • Parent/guardian access workflows
  • Staff access audit logging
  • Data export + deletion capabilities

═══════════════════════════════════════════════════════════

8. SECURITY

  • TLS 1.3 encryption in transit
  • AES-256 encryption at rest
  • Multi-factor authentication for staff
  • Role-based access control (12 roles)
  • Tenant isolation per district/school/team
  • Signed media URLs
  • Rate limiting + WAF
  • Automated daily backups
  • Disaster recovery plan

═══════════════════════════════════════════════════════════

${notes ? `ADDITIONAL NOTES:\n${notes}\n\n═══════════════════════════════════════════════════════════\n\n` : ''}ACCEPTANCE:

By signing below, the district agrees to the terms outlined
in this proposal and authorizes RJ Business Solutions to
begin implementation immediately.

District Representative: _______________________________
Title: _________________________________________________
Date: __________________________________________________

RJ Business Solutions: _________________________________
Title: _________________________________________________
Date: __________________________________________________

═══════════════════════════════════════════════════════════

This proposal is valid for 30 days from the date above.

GridironIQ™ — Football Intelligence OS
Made by RJ Business Solutions & Rick Jefferson
rjbusinesssolutions.org
`

    const blob = new Blob([proposal], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `GridironIQ-Proposal-${districtName || 'District'}-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: 'Proposal generated',
      description: `Contract proposal for ${districtName || 'District'} (${tier.name} tier) downloaded.`,
    })
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 stadium-sweep glow-primary-soft">
        <div className="absolute inset-0 turf-texture opacity-40" />
        <div className="absolute inset-0 field-grid-overlay opacity-60" />
        <div className="relative flex items-start gap-3">
          <div className="size-12 rounded-xl helmet-gradient flex items-center justify-center shadow-lg helmet-shine shrink-0">
            <FileText className="size-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
              ContractIQ™ · District Proposal Generator
            </div>
            <h2 className="text-xl font-bold leading-tight gradient-text-primary">
              Generate a District Proposal
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Create a professional contract proposal for school districts. Includes pricing, implementation timeline, compliance details, and full feature list.
            </p>
          </div>
        </div>
      </div>

      {/* Proposal form */}
      <Card className="p-4 border-l-4 border-l-primary">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="size-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
            District Information
          </h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider block mb-1">District Name</label>
            <Input value={districtName} onChange={(e) => setDistrictName(e.target.value)} placeholder="e.g. Royse City ISD" className="text-sm" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider block mb-1">School Name</label>
            <Input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="e.g. Royse City High School" className="text-sm" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider block mb-1">Contact Name</label>
            <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="e.g. Athletic Director name" className="text-sm" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider block mb-1">Contact Email</label>
            <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="e.g. ad@district.org" className="text-sm" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider block mb-1">Contact Phone</label>
            <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="e.g. (555) 123-4567" className="text-sm" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider block mb-1">Additional Notes</label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Special requirements, timeline, etc." className="text-sm" />
          </div>
        </div>
      </Card>

      {/* Pricing tiers */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="size-4 text-accent" />
          <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
            Select Pricing Tier
          </h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRICING_TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className={cn(
                  'p-4 cursor-pointer transition-all hover:shadow-md',
                  selectedTier === i ? cn(tier.border, tier.bg, 'ring-2') : 'border-border hover:border-primary/30'
                )}
                onClick={() => setSelectedTier(i)}
              >
                {tier.popular && (
                  <Badge variant="outline" className="bg-accent/15 text-accent border-accent/30 text-[9px] font-mono uppercase tracking-wider mb-2">
                    <Sparkles className="size-2.5 mr-1" />
                    Most Popular
                  </Badge>
                )}
                <div className={cn('text-sm font-bold', tier.color)}>{tier.name}</div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={cn('text-xl font-bold font-mono', tier.color)}>{tier.price}</span>
                  <span className="text-xs text-muted-foreground">{tier.period}</span>
                </div>
                <Separator className="my-2" />
                <ul className="space-y-1">
                  {tier.features.slice(0, 5).map((f, j) => (
                    <li key={j} className="flex items-start gap-1 text-[11px]">
                      <CheckCircle2 className="size-3 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                  {tier.features.length > 5 && (
                    <li className="text-[10px] text-muted-foreground/60 italic">+ {tier.features.length - 5} more features</li>
                  )}
                </ul>
                {selectedTier === i && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-mono text-primary uppercase tracking-wider">
                    <CheckCircle2 className="size-3" />
                    Selected
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Implementation timeline */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="size-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
            Implementation Timeline (4 Weeks)
          </h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {IMPLEMENTATION_TIMELINE.map((phase, i) => (
            <div key={i} className="rounded-md border border-border bg-background/40 p-3">
              <Badge variant="outline" className="font-mono text-[10px] bg-primary/10 text-primary border-primary/30 mb-2">
                {phase.phase}
              </Badge>
              <div className="text-sm font-semibold mb-1.5">{phase.title}</div>
              <ul className="space-y-0.5">
                {phase.items.map((item, j) => (
                  <li key={j} className="text-[11px] text-muted-foreground flex items-start gap-1">
                    <span className="text-primary text-[10px] mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      {/* Contract terms */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="size-4 text-chart-5" />
          <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
            Contract Terms
          </h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
          {CONTRACT_TERMS.map((term, i) => (
            <div key={i} className="flex items-start justify-between gap-2 py-1 border-b border-border/40 last:border-0">
              <span className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider shrink-0">{term.label}</span>
              <span className="text-[11px] text-foreground text-right">{term.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Generate button */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={generateProposal} size="lg" className="flex-1">
          <Download className="size-4 mr-2" />
          Generate Proposal Document
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            window.open('https://rjbusinesssolutions.org', '_blank')
          }}
        >
          <Send className="size-4 mr-2" />
          Contact RJ Business Solutions
        </Button>
      </div>

      {/* Compliance badges */}
      <Card className="p-4 border-l-4 border-l-chart-5 bg-chart-5/5">
        <div className="flex items-center gap-2 mb-3">
          <School className="size-4 text-chart-5" />
          <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
            Compliance & Privacy
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {['COPPA Compliant', 'FERPA Compliant', 'No Student Data Sold', 'Parent Access Workflows', 'Configurable Retention', 'Data Export Ready', 'Audit Logging', 'Tenant Isolation'].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px]">
              <CheckCircle2 className="size-3 text-chart-5 shrink-0" />
              <span className="text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Branding */}
      <div className="text-center text-[11px] pt-2">
        <span className="text-muted-foreground">Made by </span>
        <a href="https://rjbusinesssolutions.org" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:text-accent transition-colors">
          RJ Business Solutions
        </a>
        <span className="text-muted-foreground"> & Rick Jefferson · rjbusinesssolutions.org</span>
      </div>
    </div>
  )
}

export default function ContractIQ() {
  return <ProposalMain />
}
