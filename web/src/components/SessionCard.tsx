import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import type { ReadingSession } from '../types'
import { Card } from './ui/Card'
import { formatDate } from '../lib/utils'

type SessionCardProps = {
  session: ReadingSession
  isHost?: boolean
}

export function SessionCard({ session, isHost }: SessionCardProps) {
  const { t } = useLanguage()

  return (
    <Link to={`/sessions/${session.id}`} className="block group">
      <Card className="transition-all hover:shadow-md hover:border-accent/30 group-hover:-translate-y-0.5">
        <div className="flex gap-4">
          {session.cover_url ? (
            <img
              src={session.cover_url}
              alt=""
              className="h-24 w-16 shrink-0 rounded-lg object-cover bg-paper-dark"
            />
          ) : (
            <div className="h-24 w-16 shrink-0 rounded-lg bg-paper-dark flex items-center justify-center text-2xl">
              📖
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-serif text-lg font-semibold text-ink truncate group-hover:text-accent transition-colors">
                {session.title}
              </h3>
              {isHost && (
                <span className="shrink-0 rounded-full bg-sage-light px-2 py-0.5 text-xs font-medium text-sage">
                  {t('session.card.host')}
                </span>
              )}
            </div>
            <p className="text-sm text-ink-muted mt-0.5">{session.author}</p>
            <p className="text-xs text-ink-muted mt-2">
              {t('session.card.chapters', { count: session.total_chapters })} · {t('session.card.started', { date: formatDate(session.created_at) })}
            </p>
            {(session.start_date || session.end_date) && (
              <p className="text-xs text-ink-muted mt-1">
                {session.start_date ? formatDate(session.start_date) : t('session.card.noStart')} -{' '}
                {session.end_date ? formatDate(session.end_date) : t('session.card.noEnd')}
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}
