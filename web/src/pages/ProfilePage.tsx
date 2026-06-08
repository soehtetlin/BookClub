import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { supabase, uploadAvatar } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'

export function ProfilePage() {
  const { user, profile, refreshProfile, signOut } = useAuth()
  const { t } = useLanguage()
  const fileRef = useRef<HTMLInputElement>(null)
  const [displayNameDraft, setDisplayNameDraft] = useState<string | null>(null)
  const [bioDraft, setBioDraft] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const displayName = displayNameDraft ?? profile?.display_name ?? ''
  const bio = bioDraft ?? profile?.bio ?? ''

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setError('')
    setMessage('')

    if (!displayName.trim()) {
      setSaving(false)
      setError(t('auth.login.validation.fields'))
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        display_name: displayName.trim(),
        bio: bio.trim() || null,
      })
      .eq('id', user.id)

    setSaving(false)
    if (updateError) {
      setError(updateError.message)
      return
    }
    await refreshProfile()
    setDisplayNameDraft(null)
    setBioDraft(null)
    setMessage(t('profile.updated'))
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    setError('')
    try {
      const url = await uploadAvatar(user.id, file)
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
      await refreshProfile()
      setMessage(t('profile.avatarUpdated'))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('profile.uploadFailed'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="font-serif text-3xl font-bold mb-8">{t('profile.title')}</h1>

      <Card className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar
            src={profile?.avatar_url}
            name={profile?.display_name ?? 'User'}
            size="lg"
          />
          <div>
            <Button
              variant="secondary"
              size="sm"
              loading={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {t('profile.changeAvatar')}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <p className="text-xs text-ink-muted mt-2">{user?.email}</p>
            <p className="text-xs text-ink-muted mt-1">{t('profile.avatarSizeLimit')}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label={t('auth.signup.displayName')}
            value={displayName}
            onChange={(e) => setDisplayNameDraft(e.target.value)}
            required
          />
          <Textarea
            label={t('auth.onboarding.bio')}
            value={bio}
            onChange={(e) => setBioDraft(e.target.value)}
            rows={3}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-sage">{message}</p>}
          <Button type="submit" loading={saving}>
            {t('profile.saveBtn')}
          </Button>
        </form>

        <div className="pt-4 border-t border-border">
          <div className="flex flex-wrap gap-2">
            <Link to="/settings">
              <Button variant="secondary">{t('profile.settingsBtn')}</Button>
            </Link>
            <Button variant="ghost" onClick={signOut} className="text-ink-muted cursor-pointer">
              {t('nav.signOut')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
