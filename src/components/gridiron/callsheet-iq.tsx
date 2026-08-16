'use client'

import * as React from 'react'
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  ClipboardList,
  Download,
  ListChecks,
  Plus,
  Printer,
  Check,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface CallSheetPlay {
  playId: string
  name?: string
  note?: string
  priority?: number
}

interface CallSheetSection {
  situation: string
  plays: CallSheetPlay[]
}

interface CallSheetData {
  id: string
  name: string
  sections: CallSheetSection[]
  game?: { opponent?: { name?: string } | null } | null
}

function priorityBadge(p?: number) {
  if (p === 1)
    return (
      <Badge
        variant="outline"
        className="bg-primary/20 text-primary border-primary/40 text-[10px] px-1.5 py-0 h-5"
      >
        P1
      </Badge>
    )
  if (p === 2)
    return (
      <Badge
        variant="outline"
        className="bg-chart-3/20 text-chart-3 border-chart-3/40 text-[10px] px-1.5 py-0 h-5"
      >
        P2
      </Badge>
    )
  return (
    <Badge
      variant="outline"
      className="bg-muted text-muted-foreground border-border text-[10px] px-1.5 py-0 h-5"
    >
      P3
    </Badge>
  )
}

function CallSheetColumn({
  section,
  calledPlays,
  onToggle,
  onAdd,
}: {
  section: CallSheetSection
  calledPlays: Set<string>
  onToggle: (key: string) => void
  onAdd: (situation: string) => void
}) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card overflow-hidden">
      <div className="bg-card border-b border-border px-3 py-2 sticky top-0 z-10">
        <div className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
          {section.situation}
        </div>
        <div className="text-[10px] text-muted-foreground/70 mt-0.5">
          {section.plays.length} plays
        </div>
      </div>
      <ScrollArea className="max-h-[400px] scrollbar-thin">
        <div className="divide-y divide-border">
          {section.plays.map((play, idx) => {
            const key = `${section.situation}|${play.playId}|${idx}`
            const isCalled = calledPlays.has(key)
            return (
              <button
                key={key}
                onClick={() => onToggle(key)}
                className={cn(
                  'w-full text-left px-3 py-2 transition-colors border-l-2 border-l-transparent',
                  isCalled
                    ? 'opacity-40 line-through bg-muted/20 border-l-muted-foreground'
                    : 'hover:bg-primary/5 hover:border-l-primary'
                )}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">{priorityBadge(play.priority)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium leading-tight">
                      {play.name ?? play.playId}
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                      {play.playId}
                    </div>
                    {play.note && (
                      <div className="text-[11px] text-muted-foreground mt-1 leading-snug">
                        {play.note}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        <button
          onClick={() => onAdd(section.situation)}
          className="w-full text-center text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 border-t border-dashed border-border py-2 transition-colors"
        >
          <Plus className="size-3 inline mr-1" />
          Add play to {section.situation}
        </button>
      </ScrollArea>
    </div>
  )
}

function PrintView({
  sheet,
  teamName,
}: {
  sheet: CallSheetData
  teamName: string
}) {
  return (
    <div className="callsheet-print bg-white text-black p-8 rounded-lg shadow">
      <header className="border-b-2 border-black pb-4 mb-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">
              {teamName}
            </h1>
            <p className="text-sm uppercase tracking-widest mt-1 text-gray-700">
              Game Day Call Sheet
            </p>
          </div>
          <div className="text-right text-sm">
            <div className="font-bold">{sheet.name}</div>
            {sheet.game?.opponent?.name && (
              <div className="text-gray-700">
                vs {sheet.game.opponent.name}
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sheet.sections.map((section) => (
          <div
            key={section.situation}
            className="border border-black break-inside-avoid"
          >
            <div className="bg-black text-white px-2 py-1.5 text-xs uppercase tracking-widest font-bold">
              {section.situation}
            </div>
            <ol className="text-sm">
              {section.plays.map((play, idx) => (
                <li
                  key={idx}
                  className="px-2 py-1.5 border-b border-gray-300 last:border-0"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs text-gray-600">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold">
                        {play.name ?? play.playId}
                      </div>
                      {play.note && (
                        <div className="text-xs text-gray-700">{play.note}</div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  )
}

function CallSheetMain() {
  const { toast } = useToast()
  const { data } = useQuery({
    queryKey: ['gridiron'],
    queryFn: async () => {
      const r = await fetch('/api/gridiron')
      if (!r.ok) throw new Error('fetch failed')
      return r.json() as Promise<{
        callSheets: CallSheetData[]
        team: { name: string } | null
      }>
    },
    staleTime: 60_000,
  })

  const sheets = data?.callSheets ?? []
  const [selectedSheetId, setSelectedSheetId] = React.useState<string | null>(
    null
  )
  const sheet = sheets.find((s) => s.id === selectedSheetId) ?? sheets[0] ?? null
  const teamName = data?.team?.name ?? 'GridironIQ Team'

  const [mode, setMode] = React.useState<'tablet' | 'print'>('tablet')
  const [calledPlays, setCalledPlays] = React.useState<Set<string>>(new Set())

  function togglePlay(key: string) {
    setCalledPlays((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function handleAdd(situation: string) {
    toast({
      title: 'Add play',
      description: `Play picker for "${situation}" coming soon — this is a demo.`,
    })
  }

  function handleExport() {
    if (!sheet) return
    const blob = new Blob([JSON.stringify(sheet, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `callsheet-${sheet.name.toLowerCase().replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast({
      title: 'Exported',
      description: `${sheet.name} downloaded as JSON.`,
    })
  }

  function handlePrint() {
    if (mode !== 'print') {
      setMode('print')
      setTimeout(() => window.print(), 250)
    } else {
      window.print()
    }
  }

  if (!sheet) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <ClipboardList className="size-10 opacity-60" />
          <p className="text-sm">No call sheets available.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="print:hidden rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-md helmet-gradient flex items-center justify-center">
              <ListChecks className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-base font-semibold">{sheet.name}</h2>
              <p className="text-xs text-muted-foreground">
                {sheet.sections.length} situations ·{' '}
                {sheet.sections.reduce((a, s) => a + s.plays.length, 0)} plays
                {sheet.game?.opponent?.name
                  ? ` · vs ${sheet.game.opponent.name}`
                  : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {sheets.length > 1 && (
              <Select
                value={sheet?.id ?? ''}
                onValueChange={(v) => v && setSelectedSheetId(v)}
              >
                <SelectTrigger className="w-44 h-8">
                  <SelectValue placeholder="Select call sheet" />
                </SelectTrigger>
                <SelectContent>
                  {sheets.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Tabs value={mode} onValueChange={(v) => setMode(v as 'tablet' | 'print')}>
              <TabsList className="h-8">
                <TabsTrigger value="tablet" className="text-xs px-3">
                  Tablet
                </TabsTrigger>
                <TabsTrigger value="print" className="text-xs px-3">
                  Print
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

      {/* Active summary chip */}
      {calledPlays.size > 0 && (
        <div className="print:hidden flex items-center gap-2 text-xs text-muted-foreground">
          <Check className="size-3.5 text-primary" />
          <span>
            {calledPlays.size} play{calledPlays.size !== 1 ? 's' : ''} marked as
            called
          </span>
          <button
            onClick={() => setCalledPlays(new Set())}
            className="text-primary hover:underline ml-1"
          >
            clear
          </button>
        </div>
      )}

      {/* Body */}
      {mode === 'tablet' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {sheet.sections.map((section) => (
            <CallSheetColumn
              key={section.situation}
              section={section}
              calledPlays={calledPlays}
              onToggle={togglePlay}
              onAdd={handleAdd}
            />
          ))}
        </div>
      ) : (
        <PrintView sheet={sheet} teamName={teamName} />
      )}
    </div>
  )
}

export default function CallSheetIQ() {
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
      <CallSheetMain />
    </QueryClientProvider>
  )
}
