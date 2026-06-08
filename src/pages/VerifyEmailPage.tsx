import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export function VerifyEmailPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const resend = async () => {
    if (!user?.email) return
    setLoading(true)
    setError('')
    setMessage('')
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
      options: { emailRedirectTo: `${window.location.origin}/home` },
    })
    setLoading(false)

    if (resendError) {
      setError(resendError.message)
      return
    }
    setMessage(t('auth.verify.resendSuccess'))
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <Card className="text-center">
        <span className="text-4xl">✉️</span>
        <h1 className="font-serif text-2xl font-bold mt-4">{t('auth.verify.title')}</h1>
        <p className="text-ink-muted mt-2 text-sm leading-relaxed">
          {t('auth.verify.desc', { email: user?.email ?? '' })}
        </p>
        {message && <p className="text-sm text-sage mt-4">{message}</p>}
        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
        <div className="flex flex-col gap-2 mt-6">
          <Button variant="secondary" loading={loading} onClick={resend}>
            {t('auth.verify.resendBtn')}
          </Button>
          <Button variant="ghost" onClick={() => window.location.reload()}>
            {t('auth.verify.checkBtn')}
          </Button>
          <Link to="/home">
            <Button variant="ghost" className="w-full">
              {t('session.detail.back')}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
