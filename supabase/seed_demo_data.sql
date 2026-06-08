-- Books & Friends demo seed data
-- Run after 001_initial_schema.sql.
-- Requires these existing Supabase Auth users:
--   aa@gmail.com
--   bb@gmail.com
--   cc@gmail.com

do $$
declare
  aa_id uuid;
  bb_id uuid;
  cc_id uuid;

  session_1_id uuid := '11111111-1111-4111-8111-111111111111';
  session_2_id uuid := '22222222-2222-4222-8222-222222222222';

  comment_1_id uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
  comment_2_id uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2';
  comment_3_id uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3';
  comment_4_id uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4';
begin
  select id into aa_id from auth.users where lower(email) = 'aa@gmail.com';
  select id into bb_id from auth.users where lower(email) = 'bb@gmail.com';
  select id into cc_id from auth.users where lower(email) = 'cc@gmail.com';

  if aa_id is null or bb_id is null or cc_id is null then
    raise exception
      'Missing required auth users. Create aa@gmail.com, bb@gmail.com, and cc@gmail.com first.';
  end if;

  insert into public.profiles (id, display_name, bio)
  values
    (aa_id, 'Aye Aye', 'Host of cozy weekend reads.'),
    (bb_id, 'Bo Bo', 'Likes classics, notes, and chapter goals.'),
    (cc_id, 'Cho Cho', 'Here for thoughtful discussions.')
  on conflict (id) do update
  set
    display_name = excluded.display_name,
    bio = excluded.bio;

  insert into public.reading_sessions (
    id,
    host_id,
    title,
    author,
    total_chapters,
    description,
    visibility,
    start_date,
    end_date
  )
  values
    (
      session_1_id,
      aa_id,
      'The Little Prince',
      'Antoine de Saint-Exupery',
      27,
      'A gentle group read about wonder, friendship, and seeing clearly.',
      'public',
      current_date,
      current_date + 21
    ),
    (
      session_2_id,
      bb_id,
      'Atomic Habits',
      'James Clear',
      20,
      'A practical read for building better systems one small chapter at a time.',
      'private',
      current_date + 3,
      current_date + 31
    )
  on conflict (id) do update
  set
    host_id = excluded.host_id,
    title = excluded.title,
    author = excluded.author,
    total_chapters = excluded.total_chapters,
    description = excluded.description,
    visibility = excluded.visibility,
    start_date = excluded.start_date,
    end_date = excluded.end_date;

  insert into public.session_members (
    session_id,
    user_id,
    is_host,
    current_chapter,
    reading_status
  )
  values
    (session_1_id, aa_id, true, 8, 'reading'),
    (session_1_id, bb_id, false, 6, 'reading'),
    (session_1_id, cc_id, false, 27, 'finished'),
    (session_2_id, bb_id, true, 4, 'reading'),
    (session_2_id, cc_id, false, 2, 'reading')
  on conflict (session_id, user_id) do update
  set
    is_host = excluded.is_host,
    current_chapter = excluded.current_chapter,
    reading_status = excluded.reading_status;

  insert into public.comments (id, session_id, user_id, body, created_at)
  values
    (
      comment_1_id,
      session_1_id,
      aa_id,
      'Welcome! Let us read a few chapters this week and share favorite lines here.',
      now() - interval '3 days'
    ),
    (
      comment_2_id,
      session_1_id,
      bb_id,
      'Chapter 6 felt tiny but sharp. I like how simple the language is.',
      now() - interval '2 days'
    ),
    (
      comment_3_id,
      session_1_id,
      cc_id,
      'Finished it early. I will avoid spoilers, but the ending is worth reading slowly.',
      now() - interval '1 day'
    ),
    (
      comment_4_id,
      session_2_id,
      bb_id,
      'For this session, try noting one habit cue from your day after each chapter.',
      now() - interval '12 hours'
    )
  on conflict (id) do update
  set
    body = excluded.body,
    created_at = excluded.created_at,
    deleted_at = null;

  insert into public.reactions (comment_id, user_id, emoji)
  values
    (comment_1_id, bb_id, '👍'),
    (comment_1_id, cc_id, '❤️'),
    (comment_2_id, aa_id, '🤔'),
    (comment_3_id, aa_id, '🎉'),
    (comment_3_id, bb_id, '❤️'),
    (comment_4_id, cc_id, '👍')
  on conflict (comment_id, user_id) do update
  set
    emoji = excluded.emoji,
    created_at = now();
end $$;
