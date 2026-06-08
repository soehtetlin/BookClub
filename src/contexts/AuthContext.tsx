/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isEmailVerified } from '../lib/supabase'
import type { Profile } from '../types'

type AuthContextValue = {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  emailVerified: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const applySession = useCallback(async (nextSession: Session | null) => {
    const nextUser = nextSession?.user ?? null
    setSession(nextSession)
    setUser(nextUser)

    if (nextUser) {
      try {
        setProfile(await fetchProfile(nextUser.id))
      } catch (err) {
        console.error(err)
        setProfile(null)
      }
    } else {
      setProfile(null)
    }

    setLoading(false)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      return
    }
    const data = await fetchProfile(user.id)
    setProfile(data)
  }, [user])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      applySession(s)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      applySession(s)
    })

    return () => subscription.unsubscribe()
  }, [applySession])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      loading,
      emailVerified: isEmailVerified(user?.email_confirmed_at),
      refreshProfile,
      signOut,
    }),
    [user, session, profile, loading, refreshProfile, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
