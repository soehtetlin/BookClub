import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../contexts/LanguageContext'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (password.length < 6) {
      setError(t('auth.reset.validation.length'))
      return
    }

    if (password !== confirmPassword) {
      setError(t('auth.reset.validation.match'))
      return
    }

    loadingTrue()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    loadingFalse()

    if (updateError) {
      setError(updateError.message)
      return
    }

    setSaved(true)
    setTimeout(() => navigate('/home'), 1200)
  }

  const loadingTrue = () => setLoading(true)
  const loadingFalse = () => setLoading(false)

  return (
    <div className="max-w-md mx-auto py-8">
      <Card>
        <h1 className="font-serif text-2xl font-bold text-center mb-2">{t('auth.reset.title')}</h1>
        <p className="text-sm text-ink-muted text-center mb-6">
          {t('auth.reset.subtitle')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('auth.reset.password')}
            type="password"
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="new-password"
          />
          <Input
            label={t('auth.reset.confirmPassword')}
            type="password"
            minLength={6}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            autoComplete="new-password"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {saved && <p className="text-sm text-sage">{t('auth.reset.success')}</p>}
          <Button type="submit" loading={loading} className="w-full">
            {t('auth.reset.button')}
          </Button>
        </form>

        <p className="text-sm text-center text-ink-muted mt-6">
          <Link to="/forgot-password" className="text-accent hover:underline font-medium">
            {t('auth.forgot.title')}
          </Link>
        </p>
      </Card>
    </div>
  )
}
