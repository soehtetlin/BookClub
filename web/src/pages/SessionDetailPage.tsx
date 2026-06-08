import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useLanguage } from '../contexts/LanguageContext'
import { supabase } from '../lib/supabase'
import type {
  Comment,
  ProgressStats,
  Reaction,
  ReadingSession,
  RosterMember,
  SessionMember,
  ReadingStatus,
} from '../types'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SessionDetailSkeleton } from '../components/ui/Skeleton'
import { MyProgressPanel } from '../components/MyProgressPanel'
import { ProgressStatsPanel } from '../components/ProgressStatsPanel'
import { MemberRoster } from '../components/MemberRoster'
import { DiscussionPanel } from '../components/DiscussionPanel'
import { copyToClipboard, formatDate, sessionUrl } from '../lib/utils'

const COMMENTS_PAGE_SIZE = 30

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, emailVerified } = useAuth()
  const { toast } = useToast()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [session, setSession] = useState<ReadingSession | null>(null)
  const [membership, setMembership] = useState<SessionMember | null>(null)
  const [roster, setRoster] = useState<RosterMember[]>([])
  const [stats, setStats] = useState<ProgressStats | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [hasMoreComments, setHasMoreComments] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const isHost = membership?.is_host ?? false
  const isMember = Boolean(membership)

  const loadMembership = useCallback(async () => {
    if (!id || !user) return null
    const { data } = await supabase
      .from('session_members')
      .select('*')
      .eq('session_id', id)
      .eq('user_id', user.id)
      .maybeSingle()
    return data as SessionMember | null
  }, [id, user])

  const loadSession = useCallback(async () => {
    if (!id) return
    const { data, error: err } = await supabase
      .from('reading_sessions')
      .select('*')
      .eq('id', id)
      .single()

    if (err) {
      setError('Session not found')
      setLoading(false)
      return
    }
    setSession(data as ReadingSession)
  }, [id])

  const loadComments = useCallback(
    async (offset = 0, append = false) => {
      if (!id) return

      const { data: commentsData } = await supabase
        .from('comments')
        .select('*, profiles(display_name, avatar_url)')
        .eq('session_id', id)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
        .range(offset, offset + COMMENTS_PAGE_SIZE - 1)

      if (commentsData) {
        const mapped = commentsData.map((c: Record<string, unknown>) => {
          const profiles = c.profiles as { display_name: string; avatar_url: string | null } | null
          return {
            ...(c as object),
            profile: profiles ?? undefined,
          }
        }) as Comment[]

        if (append) {
          setComments((prev) => [...prev, ...mapped])
        } else {
          setComments(mapped)
        }

        setHasMoreComments(mapped.length === COMMENTS_PAGE_SIZE)

        // Load reactions for these comments
        const commentIds = mapped.map((c) => c.id)
        if (commentIds.length > 0) {
          const { data: reactionData } = await supabase
            .from('reactions')
            .select('*')
            .in('comment_id', commentIds)

          if (append) {
            setReactions((prev) => [...prev, ...((reactionData ?? []) as Reaction[])])
          } else {
            // Also load reactions for existing comments when refreshing
            const allCommentIds = append
              ? [...comments.map((c) => c.id), ...commentIds]
              : commentIds
            if (allCommentIds.length > 0) {
              const { data: allReactions } = await supabase
                .from('reactions')
                .select('*')
                .in('comment_id', allCommentIds)
              setReactions((allReactions ?? []) as Reaction[])
            }
          }
        } else if (!append) {
          setReactions([])
        }
      }
    },
    [id, comments],
  )

  const loadMemberData = useCallback(async () => {
    if (!id) return

    const [rosterRes, statsRes] = await Promise.all([
      supabase.rpc('get_session_roster', { p_session_id: id }),
      supabase.rpc('get_session_progress_stats', { p_session_id: id }),
    ])

    if (rosterRes.data) setRoster(rosterRes.data as RosterMember[])
    if (statsRes.data) setStats(statsRes.data as ProgressStats)

    await loadComments(0, false)
  }, [id, loadComments])

  const refresh = useCallback(async () => {
    if (!id || !user) return
    const member = await loadMembership()
    setMembership(member)
    if (member) await loadMemberData()
  }, [id, user, loadMembership, loadMemberData])

  useEffect(() => {
    async function init() {
      setLoading(true)
      await loadSession()
      if (user) {
        const member = await loadMembership()
        setMembership(member)
        if (member) await loadMemberData()
      }
      setLoading(false)
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id])

  // Refetch on tab focus
  useEffect(() => {
    const handleFocus = () => {
      if (!loading && isMember) {
        refresh()
      }
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [loading, isMember, refresh])

  const handleJoin = async () => {
    if (!id || !emailVerified) return
    setJoining(true)
    setError('')
    const { data, error: joinError } = await supabase.rpc('join_session', {
      p_session_id: id,
    })
    setJoining(false)
    if (joinError) {
      setError(joinError.message)
      toast(joinError.message, 'error')
      return
    }
    setMembership(data as SessionMember)
    await loadMemberData()
    toast(t('session.detail.joinedToast'))
  }

  const handleLeave = async () => {
    if (!membership || isHost) return
    if (!confirm(t('session.detail.leaveConfirm'))) return
    await supabase.from('session_members').delete().eq('id', membership.id)
    toast(t('session.detail.leftToast'))
    navigate('/home')
  }

  const handleCopyLink = async () => {
    if (!id) return
    await copyToClipboard(sessionUrl(id))
    setCopied(true)
    toast(t('session.detail.sharedToast'))
    setTimeout(() => setCopied(false), 2000)
  }

  const handleUpdateProgress = async (chapter: number, status: ReadingStatus) => {
    if (!membership) return
    const { data, error: updateError } = await supabase
      .from('session_members')
      .update({ current_chapter: chapter, reading_status: status })
      .eq('id', membership.id)
      .select()
      .single()
    if (updateError) throw updateError
    setMembership(data as SessionMember)
    const { data: statsData } = await supabase.rpc('get_session_progress_stats', {
      p_session_id: id!,
    })
    if (statsData) setStats(statsData as ProgressStats)
    toast(t('session.detail.progressSaved'))
  }

  const handlePostComment = async (body: string) => {
    if (!id || !user) return
    const { error: postError } = await supabase.from('comments').insert({
      session_id: id,
      user_id: user.id,
      body,
    })
    if (postError) throw postError
    await loadComments(0, false)
  }

  const handleEditComment = async (commentId: string, body: string) => {
    const { error: editError } = await supabase
      .from('comments')
      .update({ body, updated_at: new Date().toISOString() })
      .eq('id', commentId)

    if (editError) throw editError
    await loadComments(0, false)
    toast(t('discussion.commentUpdated'))
  }

  const handleReact = async (commentId: string, emoji: string) => {
    await supabase.rpc('upsert_reaction', { p_comment_id: commentId, p_emoji: emoji })
    // Reload all reactions for visible comments
    const commentIds = comments.map((c) => c.id)
    if (commentIds.length > 0) {
      const { data: reactionData } = await supabase
        .from('reactions')
        .select('*')
        .in('comment_id', commentIds)
      setReactions((reactionData ?? []) as Reaction[])
    }
  }

  const handleRemoveReaction = async (commentId: string) => {
    if (!user) return
    await supabase
      .from('reactions')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
    const commentIds = comments.map((c) => c.id)
    if (commentIds.length > 0) {
      const { data: reactionData } = await supabase
        .from('reactions')
        .select('*')
        .in('comment_id', commentIds)
      setReactions((reactionData ?? []) as Reaction[])
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return
    const comment = comments.find((c) => c.id === commentId)
    if (!comment) return

    if (!confirm(t('discussion.deleteConfirm'))) return

    if (isHost && comment.user_id !== user.id) {
      await supabase.rpc('host_delete_comment', { p_comment_id: commentId })
    } else {
      await supabase
        .from('comments')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', commentId)
    }
    await loadComments(0, false)
    toast(t('discussion.deleteBtn') + 'd')
  }

  const handleLoadMore = async () => {
    setLoadingMore(true)
    await loadComments(comments.length, true)
    setLoadingMore(false)
  }

  if (loading) {
    return <SessionDetailSkeleton />
  }

  if (!session) {
    return (
      <div className="animate-fade-in">
        <Card className="text-center py-16">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-ink-muted text-lg">{error || 'Session not found'}</p>
          <Button variant="secondary" className="mt-6" onClick={() => navigate('/home')}>
            {t('session.detail.back')}
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-6">
        {session.cover_url ? (
          <img
            src={session.cover_url}
            alt=""
            className="w-32 h-48 rounded-2xl object-cover bg-paper-dark shrink-0 mx-auto sm:mx-0 shadow-lg shadow-ink/10 ring-1 ring-border"
          />
        ) : (
          <div className="w-32 h-48 rounded-2xl bg-gradient-to-br from-paper-dark to-border flex items-center justify-center text-5xl shrink-0 mx-auto sm:mx-0 shadow-lg shadow-ink/5">
            📖
          </div>
        )}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">{session.title}</h1>
          <p className="text-lg text-ink-muted mt-1">by {session.author}</p>
          <div className="flex flex-wrap items-center gap-2 mt-3 justify-center sm:justify-start">
            <span className="inline-flex items-center gap-1 text-sm text-ink-muted bg-paper-dark rounded-full px-3 py-1">
              📚 {t('session.detail.chaptersCount', { count: session.total_chapters })}
            </span>
            {isHost && (
              <span className="inline-flex items-center gap-1 text-sm text-sage bg-sage-light rounded-full px-3 py-1 font-medium">
                ✦ {t('session.detail.host')}
              </span>
            )}
          </div>
          {(session.start_date || session.end_date) && (
            <p className="text-sm text-ink-muted mt-2">
              📅 {session.start_date ? t('session.detail.startedLabel', { date: formatDate(session.start_date) }) : t('session.detail.noStart')} — {session.end_date ? formatDate(session.end_date) : t('session.detail.noEnd')}
            </p>
          )}
          {session.description && (
            <p className="text-sm mt-4 text-ink leading-relaxed bg-paper-dark/50 rounded-xl p-4 border border-border/50">
              {session.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mt-6 justify-center sm:justify-start">
            {isMember && (
              <Button variant="secondary" size="sm" onClick={handleCopyLink} className="gap-1.5">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" />
                </svg>
                {copied ? t('session.detail.sharedToast') : t('session.detail.share')}
              </Button>
            )}
            {!isMember && user && emailVerified && (
              <Button onClick={handleJoin} loading={joining} className="shadow-sm">
                {t('session.detail.joinBtn')}
              </Button>
            )}
            {!isMember && user && !emailVerified && (
              <p className="text-sm text-ink-muted bg-gold-light px-4 py-2 rounded-full">
                ⚠ {t('auth.verify.notVerified')}
              </p>
            )}
            {isMember && !isHost && (
              <Button variant="ghost" size="sm" onClick={handleLeave} className="text-ink-muted text-xs cursor-pointer">
                {t('session.detail.leaveBtn')}
              </Button>
            )}
          </div>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
      </div>

      {!isMember ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-3">
            {user ? '🚪' : '🔐'}
          </div>
          <p className="text-ink-muted text-lg">
            {user
              ? t('session.detail.notMemberBanner')
              : 'Sign in to join this reading session.'}
          </p>
          {!user && (
            <Button className="mt-4" onClick={() => navigate('/login', { state: { from: { pathname: `/sessions/${id}` } } })}>
              {t('nav.signIn')}
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <DiscussionPanel
              comments={comments}
              reactions={reactions}
              currentUserId={user!.id}
              isHost={isHost}
              onPost={handlePostComment}
              onEdit={handleEditComment}
              onReact={handleReact}
              onRemoveReaction={handleRemoveReaction}
              onDeleteComment={handleDeleteComment}
              onRefresh={() => refresh()}
              hasMore={hasMoreComments}
              loadingMore={loadingMore}
              onLoadMore={handleLoadMore}
            />
          </div>
          <div className="space-y-6">
            <MyProgressPanel
              membership={membership!}
              totalChapters={session.total_chapters}
              onUpdate={handleUpdateProgress}
            />
            {stats && <ProgressStatsPanel stats={stats} />}
            <MemberRoster members={roster} />
          </div>
        </div>
      )}
    </div>
  )
}
