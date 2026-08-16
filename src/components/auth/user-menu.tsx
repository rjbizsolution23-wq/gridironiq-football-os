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

const ROLE_COLORS: Record<string, string> = {
  head_coach: 'bg-accent/15 text-accent border-accent/30',
  coach: 'bg-primary/15 text-primary border-primary/30',
  analyst: 'bg-chart-5/15 text-chart-5 border-chart-5/30',
  player: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  admin: 'bg-destructive/15 text-destructive border-destructive/30',
}

const ROLE_LABELS: Record<string, string> = {
  head_coach: 'Head Coach',
  coach: 'Coordinator',
  analyst: 'Analyst',
  player: 'Player',
  admin: 'Admin',
}

export function UserMenu() {
  const { data: session } = useSession()

  if (!session?.user) return null

  const user = session.user as { name?: string; email?: string; role?: string; teamName?: string | null }
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
