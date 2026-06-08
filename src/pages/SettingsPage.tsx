import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../contexts/LanguageContext'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export function SettingsPage() {
  const { t } = useLanguage()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (password.length < 6) {
      setError(t('auth.reset.validation.length'))
      return
    }

    if (password !== confirmPassword) {
      setError(t('auth.reset.validation.match'))
      return
    }

    setSaving(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setSaving(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setPassword('')
    setConfirmPassword('')
    setMessage(t('auth.reset.success'))
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="font-serif text-3xl font-bold mb-8">{t('settings.title')}</h1>

      <Card>
        <h2 className="font-serif text-xl font-semibold mb-1">{t('auth.reset.password')}</h2>
        <p className="text-sm text-ink-muted mb-6">
          {t('settings.securityTitle')}
        </p>

        <form onSubmit={handlePasswordChange} className="space-y-4">
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
          {message && <p className="text-sm text-sage">{message}</p>}
          <Button type="submit" loading={saving}>
            {t('settings.changePasswordBtn')}
          </Button>
        </form>
      </Card>
    </div>
  )
}
