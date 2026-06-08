import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { supabase, uploadCover } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Button } from '../components/ui/Button'

export function CreateSessionPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [totalChapters, setTotalChapters] = useState('12')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const chapters = parseInt(totalChapters, 10)
    if (isNaN(chapters) || chapters < 1) {
      setError(t('session.new.validation.chapters'))
      return
    }

    if (startDate && endDate && endDate < startDate) {
      setError(t('session.new.validation.dates'))
      return
    }

    setLoading(true)
    setError('')

    const { data: session, error: insertError } = await supabase
      .from('reading_sessions')
      .insert({
        host_id: user.id,
        title: title.trim(),
        author: author.trim(),
        total_chapters: chapters,
        description: description.trim() || null,
        visibility,
        start_date: startDate || null,
        end_date: endDate || null,
      })
      .select()
      .single()

    if (insertError || !session) {
      setError(insertError?.message ?? 'Failed to create session')
      setLoading(false)
      return
    }

    if (coverFile) {
      try {
        const coverUrl = await uploadCover(session.id, coverFile)
        const { error: coverError } = await supabase
          .from('reading_sessions')
          .update({ cover_url: coverUrl })
          .eq('id', session.id)
        if (coverError) throw coverError
      } catch (uploadErr) {
        console.error(uploadErr)
        setError(uploadErr instanceof Error ? uploadErr.message : 'Cover upload failed')
        setLoading(false)
        return
      }
    }

    setLoading(false)
    navigate(`/sessions/${session.id}`)
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="font-serif text-3xl font-bold mb-2">{t('session.new.title')}</h1>
      <p className="text-ink-muted mb-8">{t('session.new.subtitle')}</p>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label={t('session.new.bookTitle')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder={t('session.new.bookTitlePlaceholder')}
          />
          <Input
            label={t('session.new.author')}
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
            placeholder={t('session.new.authorPlaceholder')}
          />
          <Input
            label={t('session.new.chapters')}
            type="number"
            min={1}
            value={totalChapters}
            onChange={(e) => setTotalChapters(e.target.value)}
            required
          />
          <Textarea
            label={t('session.new.description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('session.new.descriptionPlaceholder')}
            rows={3}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t('session.new.startDate')}
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label={t('session.new.endDate')}
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t('session.new.visibility')}</label>
            <p className="text-xs text-ink-muted mb-2">
              {t('session.new.visibilityDesc')}
            </p>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="public">{t('session.new.visibilityPublic')}</option>
              <option value="private">{t('session.new.visibilityPrivate')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">{t('session.new.cover')}</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
              className="text-sm text-ink-muted file:mr-4 file:rounded-full file:border-0 file:bg-paper-dark file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:bg-border"
            />
            <p className="text-xs text-ink-muted mt-2">{t('session.new.coverDesc')}</p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" loading={loading} className="w-full">
            {t('session.new.button')}
          </Button>
        </form>
      </Card>
    </div>
  )
}
