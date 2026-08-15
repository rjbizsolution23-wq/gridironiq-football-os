'use client'

/**
 * AnalyticsIQ™ — Self-Scout Warnings.
 *
 * Deterministic rule engine that scans a GameSummary + the per-concept
 * ConceptPerformance[] and surfaces exploitable tendencies.
 *
 * Rules implemented (per spec):
 *   1. Concept >10 attempts AND >70% success → no warning (it's working).
 *   2. Concept >5 attempts AND <35% success → HIGH 'Underperforming'.
 *   3. Pass/run ratio > 65/35 → MEDIUM 'Pass-heavy tendency detected'.
 *   4. Concept >5 attempts AND 0 explosive → LOW 'no explosive outcomes'.
 *   5. best.avgYards > 2x worst.avgYards (both ≥2 attempts) →
 *      MEDIUM 'Concept gap detected'.
 *
 * Each warning is a card with Title, Body, Severity badge, Recommendation,
 * and Sample Size note. Severity drives the left border color + icon:
 *   HIGH   → border-destructive, AlertTriangle
 *   MEDIUM → border-accent,      Info
 *   LOW    → border-muted-foreground, Lightbulb
 */

import * as React from 'react'
import { AlertTriangle, Info, Lightbulb } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import type { ConceptPerformance, GameSummary } from '@/lib/data'

type Severity = 'HIGH' | 'MEDIUM' | 'LOW'

interface SelfScoutWarning {
  id: string
  title: string
  body: string
  sampleSize: string
  recommendation: string
  severity: Severity
}

interface SelfScoutWarningsProps {
  rows: ConceptPerformance[]
  summary: GameSummary
}

export function SelfScoutWarnings({ rows, summary }: SelfScoutWarningsProps) {
  const warnings = React.useMemo(
    () => buildWarnings(rows, summary),
    [rows, summary],
  )

  return (
    <div>
      <header className="mb-2 flex items-center gap-2">
        <AlertTriangle className="size-3.5 text-muted-foreground" />
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Self-Scout Warnings
        </span>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">
          {warnings.length} warning{warnings.length === 1 ? '' : 's'} · auto-generated
        </span>
      </header>

      {warnings.length === 0 ? (
        <Card className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          No self-scout warnings — tendencies look balanced for this view.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {warnings.map((w) => (
            <WarningCard key={w.id} warning={w} />
          ))}
        </div>
      )}
    </div>
  )
}

function WarningCard({ warning }: { warning: SelfScoutWarning }) {
  const sev = warning.severity
  const Icon = sev === 'HIGH' ? AlertTriangle : sev === 'MEDIUM' ? Info : Lightbulb

  const sevClass =
    sev === 'HIGH'
      ? 'border-l-4 border-destructive bg-destructive/5'
      : sev === 'MEDIUM'
        ? 'border-l-4 border-accent bg-accent/5'
        : 'border-l-4 border-muted-foreground bg-muted/10'
  const badgeClass =
    sev === 'HIGH'
      ? 'border-destructive/30 bg-destructive/15 text-destructive'
      : sev === 'MEDIUM'
        ? 'border-accent/40 bg-accent/20 text-accent'
        : 'border-border bg-muted text-muted-foreground'
  const iconClass =
    sev === 'HIGH'
      ? 'text-destructive'
      : sev === 'MEDIUM'
        ? 'text-accent'
        : 'text-muted-foreground'

  return (
    <div className={cn('rounded-lg border border-border p-4', sevClass)}>
      <header className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <Icon className={cn('mt-0.5 size-4 shrink-0', iconClass)} />
          <div>
            <div className="text-sm font-semibold text-foreground">
              {warning.title}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {warning.body}
            </p>
          </div>
        </div>
        <span
          className={cn(
            'inline-flex shrink-0 items-center rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-semibold',
            badgeClass,
          )}
        >
          {sev}
        </span>
      </header>
      <div className="mt-3 border-t border-border/60 pt-2">
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Recommendation
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-foreground/90">
          {warning.recommendation}
        </p>
      </div>
      <div className="mt-2 font-mono text-[10px] text-muted-foreground/80">
        Sample: {warning.sampleSize}
      </div>
    </div>
  )
}

// ---- rule engine ---------------------------------------------------------

function buildWarnings(
  rows: ConceptPerformance[],
  summary: GameSummary,
): SelfScoutWarning[] {
  const out: SelfScoutWarning[] = []

  // Rule 2: underperforming concept (>5 attempts, <35% success).
  // Rule 1 (working concept) is the absence-of-warning case — we
  // explicitly skip concepts that match its criteria.
  for (const r of rows) {
    if (r.attempts > 10 && r.successRate > 70) continue // rule 1 — it's working
    if (r.attempts > 5 && r.successRate < 35) {
      out.push({
        id: `underperforming:${r.concept}`,
        title: `Underperforming: ${r.concept}`,
        body: `${r.concept} converts only ${r.successRate.toFixed(
          1,
        )}% of ${r.attempts} snaps — well below the 50% baseline. Avg gain ${r.avgYards.toFixed(
          1,
        )} yds/play.`,
        sampleSize: `${r.attempts} attempts · ${r.successes} successes`,
        recommendation:
          'Reduce volume or pair with a complementary constraint (PA / RPO tag). Script it only vs light boxes and off play-action to restore efficiency.',
        severity: 'HIGH',
      })
    }
  }

  // Rule 3: pass-heavy tendency (pass share > 65% of pass+run).
  const pr = summary.passRunRatio
  const prTotal = pr.pass + pr.run
  if (prTotal > 0) {
    const passPct = (pr.pass / prTotal) * 100
    if (passPct > 65) {
      out.push({
        id: 'pass-heavy',
        title: 'Pass-heavy tendency detected',
        body: `Offense is passing ${Math.round(
          passPct,
        )}% of the time (${pr.pass}p / ${pr.run}r). Defenses will drop safeties into coverage and tee off on the QB.`,
        sampleSize: `${prTotal} pass/run snaps`,
        recommendation:
          'Re-establish the run with inside zone / duo to force base personnel back into the box. Add Glance / Stick RPOs to keep the apex honest.',
        severity: 'MEDIUM',
      })
    }
  }

  // Rule 4: concept >5 attempts, 0 explosive.
  for (const r of rows) {
    if (r.attempts > 5 && r.explosive === 0) {
      out.push({
        id: `no-explosive:${r.concept}`,
        title: `${r.concept}: no explosive outcomes`,
        body: `${r.concept} has 0 explosive plays across ${r.attempts} snaps. Avg gain ${r.avgYards.toFixed(
          1,
        )} yds — the concept moves the sticks but doesn't tilt the field.`,
        sampleSize: `${r.attempts} attempts · 0 explosive`,
        recommendation:
          'Add a complementary shot play off this concept (PA boot, verticals off run-action) to threaten the deep third when defenses clamp on the base concept.',
        severity: 'LOW',
      })
    }
  }

  // Rule 5: concept gap (best.avgYards > 2x worst.avgYards, both >=2 attempts).
  const ranked = rows
    .filter((r) => r.attempts >= 2)
    .sort((a, b) => b.avgYards - a.avgYards)
  if (ranked.length >= 2) {
    const best = ranked[0]
    const worst = ranked[ranked.length - 1]
    const worstAbs = Math.max(0.1, Math.abs(worst.avgYards))
    if (worst.avgYards >= 0 && best.avgYards > 2 * worst.avgYards) {
      out.push({
        id: 'concept-gap',
        title: 'Concept gap detected',
        body: `Best concept (${best.concept}, ${best.avgYards.toFixed(
          1,
        )} yds/play) out-produces worst (${worst.concept}, ${worst.avgYards.toFixed(
          1,
        )} yds/play) by ${(best.avgYards / worstAbs).toFixed(1)}x. Heavy reliance on a single concept is a scoutable tell.`,
        sampleSize: `${best.attempts}+${worst.attempts} attempts`,
        recommendation:
          'Diversify the game plan — pair the top concept with its mirror / complement so defenses cannot pin their ears back on the favorite. Build the worst concept back in off PA or motion.',
        severity: 'MEDIUM',
      })
    }
  }

  // Sort: HIGH → MEDIUM → LOW (stable within tier by insertion order).
  const weight: Record<Severity, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }
  out.sort((a, b) => weight[a.severity] - weight[b.severity])
  return out
}

export default SelfScoutWarnings
