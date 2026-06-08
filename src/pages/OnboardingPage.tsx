import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { supabase, uploadAvatar } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'

export function OnboardingPage() {
  const { user, profile, refreshProfile } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile?.avatar_url ?? null,
  )
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!displayName.trim()) {
      setError(t('auth.login.validation.fields'))
      return
    }

    setSaving(true)
    setError('')

    try {
      let avatarUrl = profile?.avatar_url ?? null

      if (avatarFile) {
        avatarUrl = await uploadAvatar(user.id, avatarFile)
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          bio: bio.trim() || null,
          avatar_url: avatarUrl,
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      await refreshProfile()
      navigate('/home')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-8 animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sage-light text-3xl mb-4 animate-float">
          👋
        </div>
        <h1 className="font-serif text-3xl font-bold">{t('auth.onboarding.title')}</h1>
        <p className="text-ink-muted mt-2">
          {t('auth.onboarding.subtitle')}
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group relative"
            >
              <Avatar
                src={avatarPreview}
                name={displayName || 'You'}
                size="lg"
                className="ring-4 ring-paper-dark group-hover:ring-accent/20 transition-all"
              />
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/30 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                {t('discussion.editBtn')}
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarSelect}
            />
            <p className="text-xs text-ink-muted">
              {t('auth.onboarding.selectPhoto')}
            </p>
          </div>

          <Input
            label={t('auth.signup.displayName')}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            placeholder={t('auth.signup.displayNamePlaceholder')}
            autoFocus
          />

          <Textarea
            label={t('auth.onboarding.bio')}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={t('auth.onboarding.bioPlaceholder')}
            rows={2}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" loading={saving} className="w-full">
            {t('auth.onboarding.button')}
          </Button>
        </form>
      </Card>
    </div>
  )
}
