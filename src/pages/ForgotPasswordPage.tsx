import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../contexts/LanguageContext'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export function ForgotPasswordPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)
    if (resetError) {
      setError(resetError.message)
      return
    }
    setSent(true)
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <Card>
        <h1 className="font-serif text-2xl font-bold text-center mb-2">{t('auth.forgot.title')}</h1>
        <p className="text-sm text-ink-muted text-center mb-6">
          {t('auth.forgot.subtitle')}
        </p>

        {sent ? (
          <div className="text-center">
            <p className="text-sm text-ink-muted">
              {t('auth.forgot.successDesc', { email })}
            </p>
            <Link to="/login" className="inline-block mt-6">
              <Button variant="secondary">{t('auth.forgot.successBtn')}</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('auth.forgot.email')}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">
              {t('auth.forgot.button')}
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
