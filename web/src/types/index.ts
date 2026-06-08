export type ReadingStatus = 'not_started' | 'reading' | 'finished'
export type Visibility = 'public' | 'private'

export type Profile = {
  id: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export type ReadingSession = {
  id: string
  host_id: string
  title: string
  author: string
  total_chapters: number
  description: string | null
  cover_url: string | null
  visibility: Visibility
  start_date: string | null
  end_date: string | null
  created_at: string
}

export type SessionMember = {
  id: string
  session_id: string
  user_id: string
  is_host: boolean
  current_chapter: number
  reading_status: ReadingStatus
  joined_at: string
}

export type RosterMember = {
  user_id: string
  display_name: string
  avatar_url: string | null
  is_host: boolean
  joined_at: string
}

export type Comment = {
  id: string
  session_id: string
  user_id: string
  body: string
  created_at: string
  updated_at: string | null
  deleted_at: string | null
  profile?: Pick<Profile, 'display_name' | 'avatar_url'>
}

export type Reaction = {
  id: string
  comment_id: string
  user_id: string
  emoji: string
  created_at: string
}

export type ProgressStats = {
  member_count: number
  finished_count: number
  avg_chapter: number
  chapter_buckets: { chapter: number; count: number }[]
}

export type SessionWithMembership = ReadingSession & {
  membership: SessionMember | null
  host?: Pick<Profile, 'display_name' | 'avatar_url'>
}

export const REACTION_EMOJIS = ['👍', '❤️', '😂', '🤔', '🎉'] as const
