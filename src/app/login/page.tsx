'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Activity,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Shield,
  Users,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [email, setEmail] = useState('coach@rjbusinesssolutions.org')
  const [password, setPassword] = useState('gridiron2024')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid email or password. Try again.')
      setIsLoading(false)
    } else if (result?.ok) {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 turf-texture opacity-30" />
      <div className="absolute inset-0 field-grid-overlay opacity-40" />
      <div
        className="absolute top-1/4 left-1/4 size-96 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, oklch(0.62 0.16 152 / 0.3), transparent 70%)' }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 size-96 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, oklch(0.68 0.18 55 / 0.3), transparent 70%)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        <Card className="p-8 shadow-2xl glow-primary-soft">
          {/* Logo + Brand */}
          <div className="flex flex-col items-center mb-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 0.8 }}
              className="size-16 rounded-2xl helmet-gradient flex items-center justify-center shadow-lg helmet-shine mb-3"
            >
              <Activity className="size-8 text-primary-foreground" />
            </motion.div>
            <h1 className="text-2xl font-bold gradient-text-primary">
              GridironIQ
              <span className="text-primary">™</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-mono">
              Football Intelligence OS
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="coach@rjbusinesssolutions.org"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest font-mono text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-xs text-destructive border border-destructive/30 bg-destructive/5 rounded-md p-2.5"
              >
                <Shield className="size-3.5 shrink-0" />
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 text-sm font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 mr-1.5 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-5 pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <Users className="size-3 text-muted-foreground" />
              <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
                Demo Accounts
              </span>
            </div>
            <div className="space-y-1 text-[11px] text-muted-foreground font-mono">
              <button
                onClick={() => { setEmail('coach@rjbusinesssolutions.org'); setPassword('gridiron2024') }}
                className="block hover:text-primary transition-colors"
              >
                🏈 Head Coach — coach@rjbusinesssolutions.org
              </button>
              <button
                onClick={() => { setEmail('oc@rjbusinesssolutions.org'); setPassword('gridiron2024') }}
                className="block hover:text-primary transition-colors"
              >
                📋 Coordinator — oc@rjbusinesssolutions.org
              </button>
              <button
                onClick={() => { setEmail('analyst@rjbusinesssolutions.org'); setPassword('gridiron2024') }}
                className="block hover:text-primary transition-colors"
              >
                📊 Analyst — analyst@rjbusinesssolutions.org
              </button>
              <button
                onClick={() => { setEmail('player@rjbusinesssolutions.org'); setPassword('gridiron2024') }}
                className="block hover:text-primary transition-colors"
              >
                🎽 Player — player@rjbusinesssolutions.org
              </button>
              <p className="mt-1.5 text-muted-foreground/60">Password for all: gridiron2024</p>
            </div>
          </div>

          {/* Branding */}
          <div className="mt-5 pt-3 border-t border-border text-center text-[11px]">
            <span className="text-muted-foreground">Made by </span>
            <a
              href="https://rjbusinesssolutions.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:text-accent transition-colors"
            >
              RJ Business Solutions
            </a>
            <span className="text-muted-foreground"> & Rick Jefferson</span>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
