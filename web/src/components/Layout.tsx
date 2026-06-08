import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { Avatar } from './ui/Avatar'
import { cn } from '../lib/utils'

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, profile, signOut } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // Close mobile menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-paper/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to={user ? '/home' : '/'} className="flex items-center gap-2 group">
            <span className="text-2xl transition-transform group-hover:scale-110" aria-hidden>📚</span>
            <span className="font-serif text-xl font-semibold text-ink group-hover:text-accent transition-colors">
              {t('nav.logo')}
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            {/* Language Switcher */}
            <div className="flex items-center border border-border/60 rounded-full p-0.5 bg-paper-dark mr-1 sm:mr-2 shadow-inner">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={cn(
                  'text-[10px] sm:text-xs px-2 py-1 rounded-full font-medium transition-all duration-150 cursor-pointer',
                  language === 'en'
                    ? 'bg-card text-accent shadow-sm'
                    : 'text-ink-muted hover:text-ink'
                )}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('my')}
                className={cn(
                  'text-[10px] sm:text-xs px-2 py-1 rounded-full font-medium transition-all duration-150 cursor-pointer',
                  language === 'my'
                    ? 'bg-card text-accent shadow-sm'
                    : 'text-ink-muted hover:text-ink'
                )}
              >
                မြန်မာ
              </button>
            </div>

            {user ? (
              <>
                {/* Desktop nav */}
                <NavLink
                  to="/home"
                  className={({ isActive }) =>
                    cn(
                      'hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-full transition-all',
                      isActive
                        ? 'text-accent bg-accent-light'
                        : 'text-ink-muted hover:text-ink hover:bg-paper-dark',
                    )
                  }
                >
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  {t('nav.mySessions')}
                </NavLink>
                <NavLink
                  to="/sessions/new"
                  className={({ isActive }) =>
                    cn(
                      'hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-full transition-all',
                      isActive
                        ? 'text-white bg-accent'
                        : 'text-accent bg-accent-light hover:bg-accent hover:text-white',
                    )
                  }
                >
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  {t('nav.new')}
                </NavLink>

                {/* Desktop profile & settings */}
                <div className="hidden sm:flex items-center gap-1 ml-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 rounded-full p-1.5 hover:bg-paper-dark transition-all"
                  >
                    <Avatar
                      src={profile?.avatar_url}
                      name={profile?.display_name ?? 'User'}
                      size="sm"
                    />
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="text-sm text-ink-muted hover:text-ink px-2 py-1.5 rounded-full hover:bg-paper-dark transition-colors cursor-pointer"
                  >
                    {t('nav.signOut')}
                  </button>
                </div>

                {/* Mobile hamburger */}
                <div className="sm:hidden relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-2 rounded-full hover:bg-paper-dark transition-colors"
                    aria-label="Open menu"
                    aria-expanded={menuOpen}
                  >
                    <div className="w-5 h-5 flex flex-col justify-center gap-1">
                      <span
                        className={cn(
                          'block h-0.5 w-5 bg-ink rounded-full transition-all origin-center',
                          menuOpen && 'rotate-45 translate-y-[3px]',
                        )}
                      />
                      <span
                        className={cn(
                          'block h-0.5 w-5 bg-ink rounded-full transition-all',
                          menuOpen && 'opacity-0',
                        )}
                      />
                      <span
                        className={cn(
                          'block h-0.5 w-5 bg-ink rounded-full transition-all origin-center',
                          menuOpen && '-rotate-45 -translate-y-[3px]',
                        )}
                      />
                    </div>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border bg-card shadow-xl py-2 animate-scale-in origin-top-right">
                      <div className="px-4 py-3 border-b border-border">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={profile?.avatar_url}
                            name={profile?.display_name ?? 'User'}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {profile?.display_name ?? 'User'}
                            </p>
                            <p className="text-xs text-ink-muted truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="py-1">
                        <MobileNavLink to="/home" icon="🏠">{t('nav.mySessions')}</MobileNavLink>
                        <MobileNavLink to="/sessions/new" icon="✨">{t('nav.newSession')}</MobileNavLink>
                        <MobileNavLink to="/profile" icon="👤">{t('nav.profile')}</MobileNavLink>
                        <MobileNavLink to="/settings" icon="⚙️">{t('nav.settings')}</MobileNavLink>
                      </div>

                      <div className="border-t border-border pt-1">
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2.5 text-sm text-ink-muted hover:bg-paper-dark hover:text-ink transition-colors flex items-center gap-3 cursor-pointer"
                        >
                          <span className="text-base">👋</span>
                          {t('nav.signOut')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm font-medium text-ink-muted hover:text-ink transition-colors rounded-full"
                >
                  {t('nav.signIn')}
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-all hover:shadow-md active:scale-95"
                >
                  {t('nav.getStarted')}
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-8">
        {children}
      </main>

      <footer className="border-t border-border/50 py-8 text-center">
        <p className="text-sm text-ink-muted">
          <span className="font-serif font-medium text-ink">{t('nav.logo')}</span>
          {' · '}{t('nav.tagline')}
        </p>
      </footer>
    </div>
  )
}

function MobileNavLink({
  to,
  icon,
  children,
}: {
  to: string
  icon: string
  children: React.ReactNode
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
          isActive
            ? 'text-accent bg-accent-light font-medium'
            : 'text-ink hover:bg-paper-dark',
        )
      }
    >
      <span className="text-base">{icon}</span>
      {children}
    </NavLink>
  )
}
