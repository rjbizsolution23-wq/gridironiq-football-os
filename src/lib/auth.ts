import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

// ---------- Policy-Based RBAC ----------

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  DISTRICT_ADMIN: 'district_admin',
  SCHOOL_ADMIN: 'school_admin',
  ATHLETIC_DIRECTOR: 'athletic_director',
  HEAD_COACH: 'head_coach',
  OFFENSIVE_COORDINATOR: 'offensive_coordinator',
  DEFENSIVE_COORDINATOR: 'defensive_coordinator',
  SPECIAL_TEAMS_COORDINATOR: 'special_teams_coordinator',
  POSITION_COACH: 'position_coach',
  ANALYST: 'analyst',
  PLAYER: 'player',
  PARENT_GUARDIAN: 'parent_guardian',
  READ_ONLY: 'read_only',
} as const

export const PERMISSIONS = {
  can_view_player_progress: ['super_admin', 'district_admin', 'school_admin', 'athletic_director', 'head_coach', 'offensive_coordinator', 'defensive_coordinator', 'special_teams_coordinator', 'position_coach', 'analyst'],
  can_assign_content: ['super_admin', 'district_admin', 'school_admin', 'athletic_director', 'head_coach', 'offensive_coordinator', 'defensive_coordinator', 'special_teams_coordinator', 'position_coach'],
  can_edit_playbook: ['super_admin', 'district_admin', 'head_coach', 'offensive_coordinator', 'defensive_coordinator', 'special_teams_coordinator', 'position_coach'],
  can_view_private_notes: ['super_admin', 'district_admin', 'school_admin', 'head_coach', 'offensive_coordinator', 'defensive_coordinator', 'special_teams_coordinator'],
  can_view_opponent_scout: ['super_admin', 'district_admin', 'school_admin', 'athletic_director', 'head_coach', 'offensive_coordinator', 'defensive_coordinator', 'special_teams_coordinator', 'position_coach', 'analyst'],
  can_manage_users: ['super_admin', 'district_admin', 'school_admin'],
  can_export_data: ['super_admin', 'district_admin', 'school_admin', 'athletic_director', 'head_coach'],
  can_manage_security: ['super_admin', 'district_admin'],
  can_view_depth_chart: ['super_admin', 'district_admin', 'school_admin', 'athletic_director', 'head_coach', 'offensive_coordinator', 'defensive_coordinator', 'special_teams_coordinator', 'position_coach'],
  can_view_analytics: ['super_admin', 'district_admin', 'school_admin', 'athletic_director', 'head_coach', 'offensive_coordinator', 'defensive_coordinator', 'special_teams_coordinator', 'position_coach', 'analyst'],
  can_view_game_plan: ['super_admin', 'district_admin', 'school_admin', 'athletic_director', 'head_coach', 'offensive_coordinator', 'defensive_coordinator', 'special_teams_coordinator', 'position_coach'],
  can_view_film: ['super_admin', 'district_admin', 'school_admin', 'athletic_director', 'head_coach', 'offensive_coordinator', 'defensive_coordinator', 'special_teams_coordinator', 'position_coach', 'analyst'],
  can_take_quizzes: ['player'],
  can_view_child_progress: ['parent_guardian'],
  can_view_all: ['super_admin', 'district_admin'],
} as const

export type Permission = keyof typeof PERMISSIONS

export function hasPermission(role: string, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission] as readonly string[]
  return allowedRoles.includes(role)
}

export function getUserPermissions(role: string): Permission[] {
  return (Object.keys(PERMISSIONS) as Permission[]).filter((perm) => hasPermission(role, perm))
}

// ---------- Auth Options ----------

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: { team: true, district: true },
        })

        if (!user) return null

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) return null

        // Check consent for players
        if (user.role === 'player' && !user.consentGiven) {
          return null
        }

        // Get policy-based permissions
        const permissions = getUserPermissions(user.role)

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          teamId: user.teamId,
          teamName: user.team?.name ?? null,
          districtId: user.districtId,
          districtName: user.district?.name ?? null,
          permissions,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as unknown as {
          role: string
          teamId: string | null
          teamName: string | null
          districtId: string | null
          districtName: string | null
          permissions: string[]
        }
        token.role = customUser.role
        token.teamId = customUser.teamId
        token.teamName = customUser.teamName
        token.districtId = customUser.districtId
        token.districtName = customUser.districtName
        token.permissions = customUser.permissions
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as { role?: string }).role = token.role as string
        ;(session.user as { teamId?: string | null }).teamId = (token.teamId as string | null) ?? null
        ;(session.user as { teamName?: string | null }).teamName = (token.teamName as string | null) ?? null
        ;(session.user as { districtId?: string | null }).districtId = (token.districtId as string | null) ?? null
        ;(session.user as { districtName?: string | null }).districtName = (token.districtName as string | null) ?? null
        ;(session.user as { permissions?: string[] }).permissions = (token.permissions as string[]) ?? []
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'gridironiq-dev-secret-change-in-production',
  events: {
    async signIn({ user }) {
      // Log audit event on sign-in
      try {
        await db.auditEvent.create({
          data: {
            userId: user.id,
            userEmail: user.email ?? undefined,
            action: 'LOGIN',
            resourceType: 'user',
            resourceId: user.id,
            metadata: JSON.stringify({ timestamp: new Date().toISOString() }),
          },
        })
      } catch {
        // ignore audit log errors
      }
    },
  },
}
