import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../contexts/LanguageContext'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export function LoginPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)
    if (authError) {
      setError(authError.message)
      return
    }
    navigate('/home')
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <Card>
        <h1 className="font-serif text-2xl font-bold text-center mb-2">{t('auth.login.title')}</h1>
        <p className="text-sm text-ink-muted text-center mb-6">{t('auth.login.subtitle')}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('auth.login.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label={t('auth.login.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">
            {t('auth.login.button')}
          </Button>
        </form>

        <p className="text-sm text-center text-ink-muted mt-4">
          <Link to="/forgot-password" className="text-accent hover:underline font-medium">
            {t('auth.login.forgot')}
          </Link>
        </p>

        <p className="text-sm text-center text-ink-muted mt-6">
          {t('auth.login.noAccount')}{' '}
          <Link to="/signup" className="text-accent hover:underline font-medium">
            {t('auth.login.signUp')}
          </Link>
        </p>
      </Card>
    </div>
  )
}
