/**
 * GridironIQ™ — global client state.
 * Tracks the active module, selected entity IDs, opponent/game context, and
 * light/dark theme preference mirrored to next-themes.
 */

import { create } from 'zustand'

export type ModuleId =
  | 'dashboard'
  | 'playbook'
  | 'designer'
  | 'scout'
  | 'gameplan'
  | 'callsheet'
  | 'analytics'
  | 'coach-ai'
  | 'install'
  | 'personnel'
  | 'quiz'
  | 'wristband'
  | 'practice'

export interface UINotice {
  id: string
  kind: 'info' | 'success' | 'warning' | 'error'
  title: string
  body?: string
  ts: number
}

interface AppState {
  activeModule: ModuleId
  setActiveModule: (m: ModuleId) => void

  // Selected context
  selectedPlayId: string | null
  setSelectedPlayId: (id: string | null) => void

  selectedOpponentId: string | null
  setSelectedOpponentId: (id: string | null) => void

  selectedGameId: string | null
  setSelectedGameId: (id: string | null) => void

  selectedFamilyId: string | null
  setSelectedFamilyId: (id: string | null) => void

  // Game situation the coach is currently planning for
  situation: {
    down: number
    distance: number
    hash: 'L' | 'R' | 'M'
    yardLine: number // 1-100, 50 = midfield
    quarter: number
    scoreMargin: number
  }
  setSituation: (patch: Partial<AppState['situation']>) => void

  // Sidebar collapse (mobile)
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void

  notices: UINotice[]
  pushNotice: (n: Omit<UINotice, 'id' | 'ts'>) => void
  dismissNotice: (id: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  activeModule: 'dashboard',
  setActiveModule: (m) => set({ activeModule: m }),

  selectedPlayId: null,
  setSelectedPlayId: (id) => set({ selectedPlayId: id }),

  selectedOpponentId: null,
  setSelectedOpponentId: (id) => set({ selectedOpponentId: id }),

  selectedGameId: null,
  setSelectedGameId: (id) => set({ selectedGameId: id }),

  selectedFamilyId: null,
  setSelectedFamilyId: (id) => set({ selectedFamilyId: id }),

  situation: {
    down: 1,
    distance: 10,
    hash: 'M',
    yardLine: 35,
    quarter: 1,
    scoreMargin: 0,
  },
  setSituation: (patch) =>
    set((s) => ({ situation: { ...s.situation, ...patch } })),

  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  notices: [],
  pushNotice: (n) =>
    set((s) => ({
      notices: [
        ...s.notices,
        { ...n, id: Math.random().toString(36).slice(2), ts: Date.now() },
      ].slice(-4),
    })),
  dismissNotice: (id) =>
    set((s) => ({ notices: s.notices.filter((n) => n.id !== id) })),
}))
