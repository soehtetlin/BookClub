import { useLanguage } from '../contexts/LanguageContext'
import type { RosterMember } from '../types'
import { Card } from './ui/Card'
import { Avatar } from './ui/Avatar'

export function MemberRoster({ members }: { members: RosterMember[] }) {
  const { t } = useLanguage()

  return (
    <Card>
      <h2 className="font-serif text-lg font-semibold mb-4">
        {t('session.detail.tabs.roster')} ({members.length})
      </h2>
      <ul className="space-y-3 max-h-64 overflow-y-auto">
        {members.map((member) => (
          <li key={member.user_id} className="flex items-center gap-3">
            <Avatar src={member.avatar_url} name={member.display_name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{member.display_name}</p>
              {member.is_host && (
                <p className="text-xs text-sage">{t('rosterPanel.hostBadge')}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
