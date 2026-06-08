import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import type { ReadingStatus, SessionMember } from '../types'
import { Card } from './ui/Card'
import { Button } from './ui/Button'

type MyProgressPanelProps = {
  membership: SessionMember
  totalChapters: number
  onUpdate: (chapter: number, status: ReadingStatus) => Promise<void>
}

export function MyProgressPanel({ membership, totalChapters, onUpdate }: MyProgressPanelProps) {
  const { t } = useLanguage()
  const [chapter, setChapter] = useState(membership.current_chapter)
  const [status, setStatus] = useState<ReadingStatus>(membership.reading_status)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await onUpdate(chapter, status)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <h2 className="font-serif text-lg font-semibold mb-1">{t('progressPanel.title')}</h2>

      <div className="space-y-4 mt-4">
        <div>
          <label htmlFor="chapter" className="block text-sm font-medium mb-1.5">
            {t('progressPanel.currentChapter')}
          </label>
          <input
            id="chapter"
            type="range"
            min={0}
            max={totalChapters}
            value={chapter}
            onChange={(e) => {
              const val = Number(e.target.value)
              setChapter(val)
              if (val === 0) setStatus('not_started')
              else if (val >= totalChapters) setStatus('finished')
              else setStatus('reading')
            }}
            className="w-full accent-accent"
          />
          <div className="flex justify-between text-sm text-ink-muted mt-1">
            <span>{t('progressPanel.statuses.not_started')}</span>
            <span className="font-medium text-ink">
              {chapter === 0
                ? t('progressPanel.statuses.not_started')
                : `${t('progressPanel.currentChapter')} ${chapter} ${t('progressPanel.outOfChapters', { total: totalChapters })}`}
            </span>
            <span>{t('progressPanel.statuses.finished')}</span>
          </div>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1.5">
            {t('progressPanel.statusLabel')}
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ReadingStatus)}
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value="not_started">{t('progressPanel.statuses.not_started')}</option>
            <option value="reading">{t('progressPanel.statuses.reading')}</option>
            <option value="finished">{t('progressPanel.statuses.finished')}</option>
          </select>
        </div>

        <Button onClick={handleSave} loading={saving} className="w-full sm:w-auto">
          {saved ? t('session.detail.progressSaved') : t('progressPanel.saveBtn')}
        </Button>
      </div>
    </Card>
  )
}
