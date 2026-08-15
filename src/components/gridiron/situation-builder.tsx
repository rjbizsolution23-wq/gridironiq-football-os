'use client'

/**
 * SituationBuilder — the situation input form for the Situation Rec tab.
 *
 * Reads the shared `situation` from the Zustand store (down / distance / hash /
 * yardLine / quarter / scoreMargin) and writes back via `setSituation` so the
 * rest of the app sees the same context. Personnel notes & coaching goal are
 * local-only state — they're contextual to this recommendation request, not
 * global app state.
 *
 * Layout:
 *   ┌───────────────────────────────────────────────────────┐
 *   │  Grid (2 cols mobile → 4 cols sm → 6 cols lg)         │
 *   │  Down · Distance · Hash · Quarter · Score Margin · Opp │
 *   ├───────────────────────────────────────────────────────┤
 *   │  Yard-line slider  |  Personnel notes textarea        │
 *   ├───────────────────────────────────────────────────────┤
 *   │  Coaching goal textarea (full width)                  │
 *   ├───────────────────────────────────────────────────────┤
 *   │                              [Get Recommendations →]  │
 *   └───────────────────────────────────────────────────────┘
 */

import * as React from 'react'
import { useState } from 'react'
import { Crosshair, Loader2, Send } from 'lucide-react'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ----------------------------------------------------------------------------
//  Types
// ----------------------------------------------------------------------------

export interface SituationSnapshot {
  down: number
  distance: number
  hash: 'L' | 'R' | 'M'
  yardLine: number
  quarter: number
  scoreMargin: number
}

export interface GenerateSituationParams {
  situation: SituationSnapshot
  personnelNotes: string
  coachingGoal: string
  opponentId: string | null
}

export interface OpponentOption {
  id: string
  name: string
  mascot?: string | null
}

interface SituationBuilderProps {
  opponentId: string | null
  opponents: OpponentOption[]
  isPending: boolean
  onGenerate: (params: GenerateSituationParams) => void
}

// ----------------------------------------------------------------------------
//  Component
// ----------------------------------------------------------------------------

export function SituationBuilder({
  opponentId,
  opponents,
  isPending,
  onGenerate,
}: SituationBuilderProps) {
  const situation = useAppStore((s) => s.situation)
  const setSituation = useAppStore((s) => s.setSituation)
  const setSelectedOpponentId = useAppStore((s) => s.setSelectedOpponentId)

  const [personnelNotes, setPersonnelNotes] = useState('')
  const [coachingGoal, setCoachingGoal] = useState(
    'Move the chains / win the down',
  )

  // Bound helpers ----------------------------------------------------------
  const setDown = (d: number) => setSituation({ down: Math.min(4, Math.max(1, d)) })
  const setQuarter = (q: number) => setSituation({ quarter: Math.min(4, Math.max(1, q)) })
  const setDistance = (n: number) => setSituation({ distance: Math.min(50, Math.max(1, n)) })
  const setScoreMargin = (n: number) => setSituation({ scoreMargin: n })
  const setHash = (h: 'L' | 'M' | 'R') => setSituation({ hash: h })
  const setYardLine = (y: number) => setSituation({ yardLine: Math.min(99, Math.max(1, y)) })

  const canGenerate = !isPending && Boolean(opponentId)

  const handleGenerate = () => {
    if (!canGenerate) return
    onGenerate({
      situation: { ...situation },
      personnelNotes,
      coachingGoal,
      opponentId,
    })
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <header className="mb-3 flex items-center gap-2">
        <Crosshair className="size-4 text-primary" />
        <h3 className="text-sm font-semibold tracking-tight">Situation Builder</h3>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {situation.down}&amp;{situation.distance} · {situation.hash} hash · Q{situation.quarter}
        </span>
      </header>

      {/* Compact 6-col grid of inputs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {/* Down */}
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Down</Label>
          <ToggleGroup
            type="single"
            value={String(situation.down)}
            onValueChange={(v) => v && setDown(Number(v))}
            variant="outline"
            className="w-full"
          >
            {[1, 2, 3, 4].map((d) => (
              <ToggleGroupItem
                key={d}
                value={String(d)}
                className="flex-1 px-1 text-xs"
                aria-label={`Down ${d}`}
              >
                {d}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Distance */}
        <div className="space-y-1">
          <Label htmlFor="gpiq-distance" className="text-[11px] text-muted-foreground">
            Distance
          </Label>
          <Input
            id="gpiq-distance"
            type="number"
            min={1}
            max={50}
            value={situation.distance}
            onChange={(e) => setDistance(Number(e.target.value) || 1)}
            className="h-9 text-sm"
          />
        </div>

        {/* Hash */}
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Hash</Label>
          <ToggleGroup
            type="single"
            value={situation.hash}
            onValueChange={(v) => v && setHash(v as 'L' | 'M' | 'R')}
            variant="outline"
            className="w-full"
          >
            <ToggleGroupItem value="L" className="flex-1 px-1 text-xs" aria-label="Left hash">L</ToggleGroupItem>
            <ToggleGroupItem value="M" className="flex-1 px-1 text-xs" aria-label="Middle hash">M</ToggleGroupItem>
            <ToggleGroupItem value="R" className="flex-1 px-1 text-xs" aria-label="Right hash">R</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Quarter */}
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Quarter</Label>
          <ToggleGroup
            type="single"
            value={String(situation.quarter)}
            onValueChange={(v) => v && setQuarter(Number(v))}
            variant="outline"
            className="w-full"
          >
            {[1, 2, 3, 4].map((q) => (
              <ToggleGroupItem
                key={q}
                value={String(q)}
                className="flex-1 px-1 text-xs"
                aria-label={`Quarter ${q}`}
              >
                {q}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Score margin */}
        <div className="space-y-1">
          <Label htmlFor="gpiq-score" className="text-[11px] text-muted-foreground">
            Score Margin
          </Label>
          <Input
            id="gpiq-score"
            type="number"
            value={situation.scoreMargin}
            onChange={(e) => setScoreMargin(Number(e.target.value) || 0)}
            className="h-9 text-sm"
          />
        </div>

        {/* Opponent */}
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Opponent</Label>
          <Select
            value={opponentId ?? ''}
            onValueChange={(v) => v && setSelectedOpponentId(v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              {opponents.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name}
                  {o.mascot ? ` ${o.mascot}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Yard-line slider + Personnel notes row */}
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] text-muted-foreground">Yard Line</Label>
            <span className="font-mono text-[11px] text-primary">
              {formatYardLine(situation.yardLine)}
            </span>
          </div>
          <Slider
            min={1}
            max={99}
            step={1}
            value={[situation.yardLine]}
            onValueChange={(v) => setYardLine(v[0] ?? situation.yardLine)}
            aria-label="Yard line"
          />
          <div className="flex justify-between font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            <span>Own 1</span>
            <span>50 (midfield)</span>
            <span>Opp 1</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="gpiq-personnel" className="text-[11px] text-muted-foreground">
            Personnel Notes
          </Label>
          <Textarea
            id="gpiq-personnel"
            rows={2}
            value={personnelNotes}
            onChange={(e) => setPersonnelNotes(e.target.value)}
            placeholder="e.g. RB2 in for RB1, slot WR nursing shoulder…"
            className="min-h-[2.5rem] text-xs"
          />
        </div>
      </div>

      {/* Coaching goal */}
      <div className="mt-3 space-y-1.5">
        <Label htmlFor="gpiq-goal" className="text-[11px] text-muted-foreground">
          Coaching Goal
        </Label>
        <Textarea
          id="gpiq-goal"
          rows={2}
          value={coachingGoal}
          onChange={(e) => setCoachingGoal(e.target.value)}
          placeholder="e.g. pick up 4+ yards, stay ahead of chains, burn their Cover-3 rotations…"
          className="min-h-[2.5rem] text-xs"
        />
      </div>

      {/* Action */}
      <div className="mt-3 flex justify-end">
        <Button onClick={handleGenerate} disabled={!canGenerate}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {isPending ? 'Generating…' : 'Get Recommendations'}
        </Button>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------
//  Helpers
// ----------------------------------------------------------------------------

/** Formats a 1–99 yard-line number as "Own 35" / "Opp 25" / "50 (midfield)". */
function formatYardLine(y: number): string {
  if (y === 50) return '50 (midfield)'
  if (y < 50) return `Own ${y}`
  return `Opp ${100 - y}`
}
