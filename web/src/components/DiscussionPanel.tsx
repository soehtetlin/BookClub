import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import type { Comment, Reaction } from '../types'
import { REACTION_EMOJIS } from '../types'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Textarea } from './ui/Textarea'
import { Avatar } from './ui/Avatar'
import { formatRelative } from '../lib/utils'

type DiscussionPanelProps = {
  comments: Comment[]
  reactions: Reaction[]
  currentUserId: string
  isHost: boolean
  onPost: (body: string) => Promise<void>
  onEdit: (commentId: string, body: string) => Promise<void>
  onReact: (commentId: string, emoji: string) => Promise<void>
  onRemoveReaction: (commentId: string) => Promise<void>
  onDeleteComment: (commentId: string) => Promise<void>
  onRefresh: () => void
  hasMore?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void
}

export function DiscussionPanel({
  comments,
  reactions,
  currentUserId,
  isHost,
  onPost,
  onEdit,
  onReact,
  onRemoveReaction,
  onDeleteComment,
  onRefresh,
  hasMore,
  loadingMore,
  onLoadMore,
}: DiscussionPanelProps) {
  const { t } = useLanguage()
  const [body, setBody] = useState('')
  const [posting, setPosting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingBody, setEditingBody] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    setPosting(true)
    setError('')
    try {
      await onPost(body.trim())
      setBody('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment')
    } finally {
      setPosting(false)
    }
  }

  const reactionsByComment = reactions.reduce<Record<string, Reaction[]>>((acc, r) => {
    if (!acc[r.comment_id]) acc[r.comment_id] = []
    acc[r.comment_id].push(r)
    return acc
  }, {})

  const handleEditSubmit = async (commentId: string) => {
    if (!editingBody.trim()) return
    setError('')
    try {
      await onEdit(commentId, editingBody.trim())
      setEditingId(null)
      setEditingBody('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to edit comment')
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-lg font-semibold flex items-center gap-2">
          💬 {t('session.detail.tabs.discussion')}
          {comments.length > 0 && (
            <span className="text-xs text-ink-muted font-sans font-normal bg-paper-dark rounded-full px-2 py-0.5">
              {comments.length}
            </span>
          )}
        </h2>
        <Button variant="ghost" size="sm" onClick={onRefresh} className="gap-1.5 cursor-pointer">
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          {t('discussion.refresh')}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <Textarea
          placeholder={t('discussion.placeholder')}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          rows={3}
        />
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-ink-muted">{body.length}/2,000</span>
          <Button type="submit" loading={posting} disabled={!body.trim()} size="sm">
            {t('discussion.postBtn')}
          </Button>
        </div>
      </form>

      {comments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-3xl mb-3 opacity-60">💭</div>
          <p className="text-ink-muted text-sm">
            {t('discussion.noComments')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <ul className="space-y-3">
            {comments.map((comment) => {
              const commentReactions = reactionsByComment[comment.id] ?? []
              const myReaction = commentReactions.find((r) => r.user_id === currentUserId)
              const counts = REACTION_EMOJIS.reduce<Record<string, number>>((acc, emoji) => {
                acc[emoji] = commentReactions.filter((r) => r.emoji === emoji).length
                return acc
              }, {})

              return (
                <li
                  key={comment.id}
                  className="rounded-xl bg-paper-dark/40 p-4 border border-border/40 hover:border-border/80 transition-colors"
                >
                  <div className="flex gap-3">
                    <Avatar
                      src={comment.profile?.avatar_url}
                      name={comment.profile?.display_name ?? 'Reader'}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-medium text-sm">
                          {comment.profile?.display_name ?? 'Reader'}
                        </span>
                        <span className="text-xs text-ink-muted shrink-0">
                          {formatRelative(comment.created_at)}
                          {comment.updated_at && (
                            <span className="italic ml-1">· {t('discussion.editedBadge')}</span>
                          )}
                        </span>
                      </div>
                      {editingId === comment.id ? (
                        <div className="mt-3 space-y-2">
                          <Textarea
                            value={editingBody}
                            onChange={(event) => setEditingBody(event.target.value)}
                            maxLength={2000}
                            rows={3}
                          />
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingId(null)
                                setEditingBody('')
                              }}
                            >
                              {t('discussion.cancelBtn')}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              disabled={!editingBody.trim()}
                              onClick={() => handleEditSubmit(comment.id)}
                            >
                              {t('discussion.saveBtn')}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm mt-1.5 whitespace-pre-wrap break-words leading-relaxed">
                          {comment.body}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-1 mt-3">
                        {REACTION_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={async () => {
                              if (myReaction?.emoji === emoji) {
                                  await onRemoveReaction(comment.id)
                              } else {
                                  await onReact(comment.id, emoji)
                              }
                            }}
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm transition-all active:scale-95 cursor-pointer ${
                              myReaction?.emoji === emoji
                                ? 'bg-accent/15 ring-1 ring-accent/30 shadow-sm'
                                : 'hover:bg-paper-dark'
                            }`}
                          >
                            {emoji}
                            {(counts[emoji] ?? 0) > 0 && (
                              <span className="text-xs text-ink-muted font-medium">{counts[emoji]}</span>
                            )}
                          </button>
                        ))}

                        {(comment.user_id === currentUserId || isHost) && (
                          <div className="ml-auto flex items-center gap-1">
                            {comment.user_id === currentUserId && editingId !== comment.id && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingId(comment.id)
                                  setEditingBody(comment.body)
                                }}
                                className="text-xs text-ink-muted hover:text-ink px-2 py-1 rounded-full hover:bg-paper-dark transition-colors cursor-pointer"
                              >
                                {t('discussion.editBtn')}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onDeleteComment(comment.id)}
                              className="text-xs text-ink-muted hover:text-red-600 px-2 py-1 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              {t('discussion.deleteBtn')}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          {hasMore && onLoadMore && (
            <div className="text-center pt-2">
              <Button variant="ghost" size="sm" loading={loadingMore} onClick={onLoadMore}>
                {t('discussion.loadMore')}
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
