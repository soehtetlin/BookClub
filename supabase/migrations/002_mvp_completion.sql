-- Books & Friends — MVP completion migration
-- Run after 001_initial_schema.sql.

alter table public.reading_sessions
  add column if not exists start_date date,
  add column if not exists end_date date;

alter table public.reading_sessions
  drop constraint if exists reading_sessions_date_order_check;

alter table public.reading_sessions
  add constraint reading_sessions_date_order_check
  check (start_date is null or end_date is null or end_date >= start_date);

create index if not exists reading_sessions_created_at_idx
  on public.reading_sessions (created_at desc);

create index if not exists comments_session_created_at_idx
  on public.comments (session_id, created_at);

create index if not exists reactions_user_comment_idx
  on public.reactions (user_id, comment_id);
