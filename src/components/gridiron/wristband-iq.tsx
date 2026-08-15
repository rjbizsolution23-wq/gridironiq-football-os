'use client'

import * as React from 'react'
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  Download,
  Layers,
  Maximize2,
  Minimize2,
  Printer,
  Radio,
  Smartphone,
  Watch,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface WristbandPlay {
  playId: string
  name: string
  concept: string
  personnel: string | null
  motion: string | null
  side: string
}

interface WristbandData {
  plays: WristbandPlay[]
}

// QB wristband codes are typically 2-3 chars. We generate from concept abbreviation.
function codeFromPlay(play: WristbandPlay): string {
  const concept = play.concept.replace(/_/g, ' ')
  const words = concept.split(' ').filter(Boolean)
  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase()
  }
  return words
    .slice(0, 3)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

const ROW_COLORS = [
  'bg-primary/15 text-primary border-primary/40',
  'bg-chart-3/15 text-chart-3 border-chart-3/40',
  'bg-accent/15 text-accent border-accent/40',
  'bg-chart-5/15 text-chart-5 border-chart-5/40',
  'bg-primary/10 text-primary/80 border-primary/25',
]

const PERSONNEL_GROUPS = ['10', '11', '12', '21', '22', '23']

function WristbandGrid({
  plays,
  density,
}: {
  plays: WristbandPlay[]
  density: 'compact' | 'standard' | 'large'
}) {
  // Group by personnel
  const byPersonnel = React.useMemo(() => {
    const map = new Map<string, WristbandPlay[]>()
    for (const p of plays) {
      const key = p.personnel ?? '11'
      const list = map.get(key) ?? []
      list.push(p)
      map.set(key, list)
    }
    // Ensure all 6 personnel groups exist (fill with placeholder if empty)
    for (const g of PERSONNEL_GROUPS) {
      if (!map.has(g)) map.set(g, [])
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [plays])

  const cellPad = density === 'compact' ? 'p-1' : density === 'standard' ? 'p-1.5' : 'p-2'
  const cellText = density === 'compact' ? 'text-[9px]' : density === 'standard' ? 'text-[10px]' : 'text-xs'
  const nameText = density === 'compact' ? 'text-[10px]' : density === 'standard' ? 'text-xs' : 'text-sm'

  return (
    <div className="wristband-print bg-white text-black rounded-lg shadow-2xl p-3">
      {/* Wristband header */}
      <div className="border-b-2 border-black pb-2 mb-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-black text-base uppercase tracking-tight">
              GridironIQ™ Wristband
            </div>
            <div className="text-[10px] text-gray-700 uppercase tracking-widest">
              Situational Play Call Sheet
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-gray-700">REV 1.0</div>
            <div className="text-[9px] text-gray-600">{plays.length} plays</div>
          </div>
        </div>
      </div>

      {/* Situational rows: personnel × situation */}
      <div className="space-y-2">
        {byPersonnel.map(([personnel, groupPlays], rowIdx) => {
          const rowColor = ROW_COLORS[rowIdx % ROW_COLORS.length]
          // Take up to 4 plays per personnel (Top 4 by playId)
          const top4 = groupPlays.slice(0, 4)
          return (
            <div
              key={personnel}
              className={cn('rounded-md border-l-4', cellPad, ROW_COLORS[rowIdx % 5].replace('bg-', 'border-l-').replace('/15', '').replace('/40', ''))}
              style={{
                borderLeftColor:
                  rowIdx % 5 === 0
                    ? 'oklch(0.62 0.16 152)'
                    : rowIdx % 5 === 1
                    ? 'oklch(0.78 0.16 90)'
                    : rowIdx % 5 === 2
                    ? 'oklch(0.68 0.18 55)'
                    : rowIdx % 5 === 3
                    ? 'oklch(0.5 0.1 195)'
                    : 'oklch(0.4 0.1 152)',
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex items-center justify-center font-black font-mono shrink-0',
                    density === 'compact' ? 'size-7 text-xs' : density === 'standard' ? 'size-8 text-sm' : 'size-9 text-base'
                  )}
                  style={{
                    backgroundColor: 'black',
                    color: 'white',
                    borderRadius: '4px',
                  }}
                >
                  {personnel}
                </div>
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-1">
                  {top4.length > 0 ? (
                    top4.map((play) => {
                      const code = codeFromPlay(play)
                      return (
                        <div
                          key={play.playId}
                          className={cn(
                            'rounded border border-gray-400',
                            cellPad,
                            density === 'compact' ? 'min-h-[36px]' : density === 'standard' ? 'min-h-[44px]' : 'min-h-[52px]'
                          )}
                          style={{ backgroundColor: '#fafafa' }}
                        >
                          <div className="flex items-center gap-1 mb-0.5">
                            <span
                              className={cn('font-mono font-black', nameText)}
                              style={{ color: 'black' }}
                            >
                              {code}
                            </span>
                            <span className={cn(cellText, 'text-gray-600 truncate')}>
                              · {play.motion ?? 'no motion'}
                            </span>
                          </div>
                          <div
                            className={cn(cellText, 'font-medium leading-tight truncate')}
                            style={{ color: '#222' }}
                            title={play.name}
                          >
                            {play.name}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div
                      className={cn(
                        'rounded border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-[10px] italic col-span-2 sm:col-span-4',
                        cellPad
                      )}
                    >
                      No {personnel} personnel plays
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Wristband footer */}
      <div className="border-t border-gray-300 mt-3 pt-2 flex items-center justify-between text-[9px] text-gray-600">
        <span className="font-mono">
          GridironIQ™ · {plays.length} plays · {byPersonnel.length} personnel groups
        </span>
        <span className="font-mono">v1.0 · {new Date().toLocaleDateString()}</span>
      </div>
    </div>
  )
}

function WristbandMain() {
  const { toast } = useToast()
  const { data } = useQuery({
    queryKey: ['gridiron'],
    queryFn: async () => {
      const r = await fetch('/api/gridiron')
      if (!r.ok) throw new Error('failed')
      return r.json() as Promise<WristbandData>
    },
    staleTime: 60_000,
  })

  const offensivePlays = (data?.plays ?? []).filter((p) => p.side === 'offense')
  const [density, setDensity] = React.useState<'compact' | 'standard' | 'large'>('standard')
  const [filter, setFilter] = React.useState<'all' | 'rpo' | 'pass' | 'run'>('all')

  const filtered = React.useMemo(() => {
    if (filter === 'all') return offensivePlays
    return offensivePlays.filter((p) => {
      const c = p.concept.toLowerCase()
      if (filter === 'rpo') return c.includes('rpo')
      if (filter === 'pass') return !c.includes('rpo') && (c.includes('mesh') || c.includes('stick') || c.includes('flood') || c.includes('vert') || c.includes('cross') || c.includes('smash') || c.includes('screen') || c.includes('tunnel'))
      if (filter === 'run') return !c.includes('rpo') && !c.includes('mesh') && !c.includes('stick') && !c.includes('flood') && !c.includes('vert') && !c.includes('cross') && !c.includes('smash') && !c.includes('screen') && !c.includes('tunnel')
      return true
    })
  }, [offensivePlays, filter])

  function handlePrint() {
    window.print()
  }

  function handleExport() {
    const exportData = filtered.map((p) => ({
      code: codeFromPlay(p),
      ...p,
    }))
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gridironiq-wristband-${filter}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast({
      title: 'Wristband exported',
      description: `${filtered.length} plays exported with codes.`,
    })
  }

  if (offensivePlays.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <Watch className="size-10 opacity-50" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="print:hidden rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-start gap-3 justify-between">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-md helmet-gradient flex items-center justify-center">
              <Watch className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-base font-semibold">WristbandIQ™</h2>
              <p className="text-xs text-muted-foreground">
                Generate a compact QB-wristband call sheet — personnel × play, color-coded rows.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All plays</SelectItem>
                <SelectItem value="rpo">RPO only</SelectItem>
                <SelectItem value="pass">Pass only</SelectItem>
                <SelectItem value="run">Run only</SelectItem>
              </SelectContent>
            </Select>
            <Tabs value={density} onValueChange={(v) => setDensity(v as typeof density)}>
              <TabsList className="h-8">
                <TabsTrigger value="compact" className="text-xs px-2.5">
                  <Minimize2 className="size-3 mr-1" />
                  Compact
                </TabsTrigger>
                <TabsTrigger value="standard" className="text-xs px-2.5">
                  <Smartphone className="size-3 mr-1" />
                  Standard
                </TabsTrigger>
                <TabsTrigger value="large" className="text-xs px-2.5">
                  <Maximize2 className="size-3 mr-1" />
                  Large
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="sm" onClick={handleExport} className="h-8">
              <Download className="size-3.5 mr-1.5" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} className="h-8">
              <Printer className="size-3.5 mr-1.5" />
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="print:hidden grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Card className="p-3">
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
            Plays on wristband
          </div>
          <div className="text-2xl font-bold font-mono mt-1">{filtered.length}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
            Personnel groups
          </div>
          <div className="text-2xl font-bold font-mono mt-1">
            {new Set(filtered.map((p) => p.personnel ?? '11')).size}
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
            Filter
          </div>
          <div className="text-sm font-bold mt-1 capitalize">{filter}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
            Density
          </div>
          <div className="text-sm font-bold mt-1 capitalize">{density}</div>
        </Card>
      </div>

      {/* Wristband preview */}
      <div className="max-w-3xl mx-auto">
        <WristbandGrid plays={filtered} density={density} />
      </div>

      {/* Usage notes */}
      <Card className="p-4 print:hidden">
        <div className="flex items-center gap-2 mb-2">
          <Radio className="size-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-widest font-mono text-muted-foreground">
            How to use this wristband
          </h3>
        </div>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary font-mono text-xs mt-0.5">1.</span>
            Each row is a personnel group (11, 12, 21, etc.). Look at the backfield to identify the group.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-mono text-xs mt-0.5">2.</span>
            Each cell shows a 3-letter code (e.g. IZG for Inside Zone Glance RPO) + the play name.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-mono text-xs mt-0.5">3.</span>
            Color-coded rows help the QB scan fast under pressure. Print & laminate to fit a wristband sleeve.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-mono text-xs mt-0.5">4.</span>
            Use the density toggle to fit a youth (large), high school (standard), or college (compact) wristband.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-mono text-xs mt-0.5">5.</span>
            Export JSON to feed your own wristband-printing pipeline.
          </li>
        </ul>
      </Card>
    </div>
  )
}

export default function WristbandIQ() {
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
      <WristbandMain />
    </QueryClientProvider>
  )
}
