'use client'

import { useSession, signOut } from 'next-auth/react'
import { LogOut, User as UserIcon, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  district_admin: 'District Admin',
  school_admin: 'School Admin',
  athletic_director: 'Athletic Director',
  head_coach: 'Head Coach',
  offensive_coordinator: 'OC',
  defensive_coordinator: 'DC',
  special_teams_coordinator: 'ST Coordinator',
  position_coach: 'Position Coach',
  analyst: 'Analyst',
  player: 'Player',
  parent_guardian: 'Parent/Guardian',
  read_only: 'Read Only',
  coach: 'Coach',
  admin: 'Admin',
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-destructive/15 text-destructive border-destructive/30',
  district_admin: 'bg-destructive/15 text-destructive border-destructive/30',
  school_admin: 'bg-accent/15 text-accent border-accent/30',
  athletic_director: 'bg-accent/15 text-accent border-accent/30',
  head_coach: 'bg-accent/15 text-accent border-accent/30',
  offensive_coordinator: 'bg-primary/15 text-primary border-primary/30',
  defensive_coordinator: 'bg-primary/15 text-primary border-primary/30',
  special_teams_coordinator: 'bg-primary/15 text-primary border-primary/30',
  position_coach: 'bg-primary/15 text-primary border-primary/30',
  analyst: 'bg-chart-5/15 text-chart-5 border-chart-5/30',
  player: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  parent_guardian: 'bg-muted text-muted-foreground border-border',
  read_only: 'bg-muted text-muted-foreground border-border',
  coach: 'bg-primary/15 text-primary border-primary/30',
  admin: 'bg-destructive/15 text-destructive border-destructive/30',
}

export function UserMenu() {
  const { data: session } = useSession()

  if (!session?.user) return null

  const user = session.user as {
    name?: string
    email?: string
    role?: string
    teamName?: string | null
    districtName?: string | null
    permissions?: string[]
  }
  const initials = (user.name ?? '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted transition-colors">
          <div className="size-7 rounded-full helmet-gradient flex items-center justify-center text-[10px] font-bold text-primary-foreground">
            {initials}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold leading-none">{user.name}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5 leading-none">
              {ROLE_LABELS[user.role ?? 'coach'] ?? user.role}
            </div>
          </div>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="font-semibold">{user.name}</span>
            <span className="text-xs text-muted-foreground font-normal">{user.email}</span>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                className={cn('text-[10px] font-mono', ROLE_COLORS[user.role ?? 'coach'])}
              >
                {ROLE_LABELS[user.role ?? 'coach'] ?? user.role}
              </Badge>
              {user.teamName && (
                <span className="text-[10px] text-muted-foreground">{user.teamName}</span>
              )}
            </div>
            {user.districtName && (
              <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                District: {user.districtName}
              </div>
            )}
            {user.permissions && (user as { permissions?: string[] }).permissions && (
              <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                Permissions: {((user as { permissions?: string[] }).permissions ?? []).length} policies
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="size-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
