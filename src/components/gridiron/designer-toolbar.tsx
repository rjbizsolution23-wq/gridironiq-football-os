'use client'

/**
 * DesignerToolbar — sticky top toolbar for the Play Designer.
 *
 * Renders:
 *  • Layer toggle pills (Players / Routes / Blocking / Motion / Reads / Coverage)
 *  • Perspective switch (Offense only / Defense only / Both)
 *  • Formation preset picker (from FORMATION_LIBRARY)
 *  • Concept picker (from OFFENSIVE_CONCEPTS)
 *  • Animate button (▶ / ⏹)
 *  • Draw Route toggle
 *  • Reset positions button
 *
 * Active layer pills use `bg-primary text-primary-foreground`; inactive use
 * `bg-muted text-muted-foreground`. Toolbar is sticky with backdrop blur.
 */

import * as React from 'react'
import {
  Eye,
  Layers,
  PencilLine,
  Play,
  RotateCcw,
  Shield,
  Spline,
  Square,
  Swords,
  Users,
  Wind,
  Grid3x3,
} from 'lucide-react'

import {
  FORMATION_LIBRARY,
  OFFENSIVE_CONCEPTS,
} from '@/lib/football/knowledge'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

import type { LayerVisibility, Perspective } from './play-diagram'

// ----------------------------------------------------------------------------
//  Config
// ----------------------------------------------------------------------------

const LAYER_CONFIG: {
  key: keyof LayerVisibility
  label: string
  icon: React.ReactNode
}[] = [
  { key: 'players', label: 'Players', icon: <Users className="size-3.5" /> },
  { key: 'routes', label: 'Routes', icon: <Spline className="size-3.5" /> },
  { key: 'blocking', label: 'Blocking', icon: <Shield className="size-3.5" /> },
  { key: 'motion', label: 'Motion', icon: <Wind className="size-3.5" /> },
  { key: 'reads', label: 'Reads', icon: <Eye className="size-3.5" /> },
  { key: 'coverage', label: 'Coverage', icon: <Grid3x3 className="size-3.5" /> },
]

const PERSPECTIVES: {
  key: Perspective
  label: string
  title: string
  icon: React.ReactNode
}[] = [
  { key: 'offense', label: 'O', title: 'Offense only', icon: <Swords className="size-3.5" /> },
  { key: 'defense', label: 'D', title: 'Defense only', icon: <Shield className="size-3.5" /> },
  { key: 'both', label: 'Both', title: 'Both sides', icon: <Layers className="size-3.5" /> },
]

// ----------------------------------------------------------------------------
//  Props
// ----------------------------------------------------------------------------

export interface DesignerToolbarProps {
  layers: LayerVisibility
  onLayersChange: (next: LayerVisibility) => void
  perspective: Perspective
  onPerspectiveChange: (p: Perspective) => void
  selectedFormationCode: string | null
  onFormationChange: (code: string) => void
  selectedConceptId: string | null
  onConceptChange: (id: string) => void
  isAnimating: boolean
  onAnimateToggle: () => void
  drawRouteMode: boolean
  onDrawRouteToggle: () => void
  onResetPositions: () => void
}

// ----------------------------------------------------------------------------
//  Component
// ----------------------------------------------------------------------------

export function DesignerToolbar({
  layers,
  onLayersChange,
  perspective,
  onPerspectiveChange,
  selectedFormationCode,
  onFormationChange,
  selectedConceptId,
  onConceptChange,
  isAnimating,
  onAnimateToggle,
  drawRouteMode,
  onDrawRouteToggle,
  onResetPositions,
}: DesignerToolbarProps) {
  const toggleLayer = (key: keyof LayerVisibility) => {
    onLayersChange({ ...layers, [key]: !layers[key] })
  }

  const offenseFormations = React.useMemo(
    () => FORMATION_LIBRARY.filter((f) => f.side === 'offense'),
    [],
  )

  return (
    <div className="sticky top-0 z-30 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border bg-card/80 px-4 py-2.5 backdrop-blur">
      {/* Brand lockup */}
      <div className="hidden items-baseline gap-2 md:flex">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          GridironIQ™
        </span>
        <span className="text-sm font-semibold tracking-tight">Formation Lab</span>
      </div>

      <div className="hidden h-6 w-px bg-border md:block" />

      {/* Layer toggle pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {LAYER_CONFIG.map((l) => {
          const active = layers[l.key]
          return (
            <button
              key={l.key}
              type="button"
              onClick={() => toggleLayer(l.key)}
              aria-pressed={active}
              title={`Toggle ${l.label} layer`}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-transparent bg-muted text-muted-foreground hover:bg-muted/80',
              )}
            >
              {l.icon}
              <span>{l.label}</span>
            </button>
          )
        })}
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-border" />

      {/* Perspective switch */}
      <div className="inline-flex items-center gap-0.5 rounded-md border bg-muted/40 p-0.5">
        {PERSPECTIVES.map((p) => {
          const active = perspective === p.key
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => onPerspectiveChange(p.key)}
              aria-pressed={active}
              title={p.title}
              className={cn(
                'inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {p.icon}
              <span>{p.label}</span>
            </button>
          )
        })}
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-border" />

      {/* Formation picker */}
      <Select
        value={selectedFormationCode ?? ''}
        onValueChange={onFormationChange}
      >
        <SelectTrigger className="h-8 w-[170px] text-xs">
          <SelectValue placeholder="Formation" />
        </SelectTrigger>
        <SelectContent>
          {offenseFormations.map((f) => (
            <SelectItem key={f.code} value={f.code}>
              <span className="mr-2 font-mono text-[10px] tracking-tight text-muted-foreground">
                {f.code}
              </span>
              {f.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Concept picker */}
      <Select
        value={selectedConceptId ?? ''}
        onValueChange={onConceptChange}
      >
        <SelectTrigger className="h-8 w-[160px] text-xs">
          <SelectValue placeholder="Concept" />
        </SelectTrigger>
        <SelectContent>
          {OFFENSIVE_CONCEPTS.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Right-aligned action buttons */}
      <div className="ml-auto flex items-center gap-1.5">
        {/* Draw route */}
        <Button
          type="button"
          variant={drawRouteMode ? 'default' : 'outline'}
          size="sm"
          onClick={onDrawRouteToggle}
          className={cn('h-8 gap-1.5 text-xs', drawRouteMode && 'glow-ring')}
        >
          <PencilLine className="size-3.5" />
          <span className="hidden sm:inline">
            {drawRouteMode ? 'Drawing…' : 'Draw Route'}
          </span>
        </Button>

        {/* Reset positions */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onResetPositions}
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </Button>

        {/* Animate */}
        <Button
          type="button"
          variant={isAnimating ? 'destructive' : 'default'}
          size="sm"
          onClick={onAnimateToggle}
          className="h-8 gap-1.5 text-xs"
        >
          {isAnimating ? (
            <Square className="size-3.5" />
          ) : (
            <Play className="size-3.5" />
          )}
          <span className="hidden sm:inline">
            {isAnimating ? 'Stop' : 'Animate'}
          </span>
        </Button>
      </div>
    </div>
  )
}

export default DesignerToolbar
