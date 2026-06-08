import { useLanguage } from '../contexts/LanguageContext'
import type { ProgressStats } from '../types'
import { Card } from './ui/Card'

export function ProgressStatsPanel({ stats }: { stats: ProgressStats }) {
  const { t } = useLanguage()
  const maxCount = Math.max(...stats.chapter_buckets.map((b) => b.count), 1)

  return (
    <Card>
      <h2 className="font-serif text-lg font-semibold mb-4">{t('session.detail.tabs.stats')}</h2>
      <p className="text-sm text-ink-muted mb-4">
        {t('statsPanel.privateDesc')}
      </p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat label={t('statsPanel.members')} value={stats.member_count} />
        <Stat label={t('statsPanel.finished')} value={stats.finished_count} />
        <Stat label={t('statsPanel.avgChapter')} value={stats.avg_chapter} />
      </div>

      {stats.chapter_buckets.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-ink-muted uppercase tracking-wide">
            {t('statsPanel.distributionTitle')}
          </p>
          <div className="space-y-1.5">
            {stats.chapter_buckets.map((bucket) => (
              <div key={bucket.chapter} className="flex items-center gap-3 text-sm">
                <span className="w-8 text-ink-muted shrink-0">
                  {bucket.chapter === 0 ? '—' : t('statsPanel.chapterLabel', { num: bucket.chapter })}
                </span>
                <div className="flex-1 h-2 rounded-full bg-paper-dark overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sage transition-all"
                    style={{ width: `${(bucket.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right text-ink-muted">{bucket.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-paper-dark px-3 py-3 text-center">
      <p className="text-xl font-semibold text-ink">{value}</p>
      <p className="text-xs text-ink-muted mt-0.5">{label}</p>
    </div>
  )
}
