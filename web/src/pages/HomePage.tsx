import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { supabase } from '../lib/supabase'
import type { ReadingSession } from '../types'
import { SessionCard } from '../components/SessionCard'
import { Button } from '../components/ui/Button'
import { SessionCardSkeleton } from '../components/ui/Skeleton'

export function HomePage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [sessions, setSessions] = useState<(ReadingSession & { is_host: boolean })[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return

    const { data: memberships, error: memberError } = await supabase
      .from('session_members')
      .select('session_id, is_host')
      .eq('user_id', user.id)

    if (memberError || !memberships?.length) {
      setSessions([])
      setLoading(false)
      return
    }

    const sessionIds = memberships.map((m) => m.session_id)
    const hostMap = Object.fromEntries(memberships.map((m) => [m.session_id, m.is_host]))

    const { data: sessionData, error: sessionError } = await supabase
      .from('reading_sessions')
      .select('*')
      .in('id', sessionIds)
      .order('created_at', { ascending: false })

    if (sessionError) {
      console.error(sessionError)
      setLoading(false)
      return
    }

    setSessions(
      (sessionData ?? []).map((s) => ({
        ...s,
        visibility: s.visibility as ReadingSession['visibility'],
        is_host: hostMap[s.id] ?? false,
      })),
    )
    setLoading(false)
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  // Refetch on tab focus
  useEffect(() => {
    const handleFocus = () => {
      if (!loading) load()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [load, loading])

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="skeleton h-9 w-48 rounded-lg" />
            <div className="skeleton h-4 w-64 rounded-lg mt-3" />
          </div>
          <div className="skeleton h-10 w-32 rounded-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SessionCardSkeleton />
          <SessionCardSkeleton />
          <SessionCardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold">{t('home.title')}</h1>
          <p className="text-ink-muted mt-1">{t('home.subtitle')}</p>
        </div>
        <Link to="/sessions/new">
          <Button className="shadow-sm hover:shadow-md transition-shadow">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {t('home.newBtn')}
          </Button>
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-20 rounded-3xl border border-dashed border-border bg-gradient-to-b from-card to-paper animate-fade-in-up">
          <div className="text-5xl mb-4 animate-float">📖</div>
          <h2 className="font-serif text-xl font-semibold">{t('home.noSessionsTitle')}</h2>
          <p className="text-ink-muted text-sm mt-2 max-w-sm mx-auto leading-relaxed">
            {t('home.noSessionsDesc')}
          </p>
          <Link to="/sessions/new" className="inline-block mt-6">
            <Button className="shadow-sm">{t('home.createFirstBtn')}</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sessions.map((session, i) => (
            <div key={session.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 5)}`}>
              <SessionCard session={session} isHost={session.is_host} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
