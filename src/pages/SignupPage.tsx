import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../contexts/LanguageContext'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export function SignupPage() {
  const { t } = useLanguage()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/home`,
        data: { display_name: displayName.trim() },
      },
    })

    setLoading(false)
    if (authError) {
      setError(authError.message)
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto py-8">
        <Card className="text-center">
          <span className="text-4xl">✉️</span>
          <h1 className="font-serif text-2xl font-bold mt-4">{t('auth.signup.successTitle')}</h1>
          <p className="text-ink-muted mt-2 text-sm leading-relaxed">
            {t('auth.signup.successDesc', { email })}
          </p>
          <Link to="/login" className="inline-block mt-6">
            <Button variant="secondary">{t('auth.signup.successBtn')}</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <Card>
        <h1 className="font-serif text-2xl font-bold text-center mb-2">{t('auth.signup.title')}</h1>
        <p className="text-sm text-ink-muted text-center mb-6">{t('auth.signup.subtitle')}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('auth.signup.displayName')}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            placeholder={t('auth.signup.displayNamePlaceholder')}
          />
          <Input
            label={t('auth.signup.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label={t('auth.signup.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">
            {t('auth.signup.button')}
          </Button>
        </form>

        <p className="text-sm text-center text-ink-muted mt-6">
          {t('auth.signup.hasAccount')}{' '}
          <Link to="/login" className="text-accent hover:underline font-medium">
            {t('auth.signup.signIn')}
          </Link>
        </p>
      </Card>
    </div>
  )
}
