-- Books & Friends — initial schema (v1)
-- Run in Supabase Dashboard → SQL Editor

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now()
);

-- Reading sessions
create table if not exists public.reading_sessions (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  author text not null,
  total_chapters integer not null check (total_chapters > 0),
  description text,
  cover_url text,
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  created_at timestamptz not null default now()
);

create index if not exists reading_sessions_host_id_idx on public.reading_sessions (host_id);

-- Session members (progress is private to each user)
create table if not exists public.session_members (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.reading_sessions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  is_host boolean not null default false,
  current_chapter integer not null default 0 check (current_chapter >= 0),
  reading_status text not null default 'not_started'
    check (reading_status in ('not_started', 'reading', 'finished')),
  joined_at timestamptz not null default now(),
  unique (session_id, user_id)
);

create index if not exists session_members_session_id_idx on public.session_members (session_id);
create index if not exists session_members_user_id_idx on public.session_members (user_id);

-- Comments (flat thread)
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.reading_sessions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) <= 2000 and char_length(body) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz
);

create index if not exists comments_session_id_idx on public.comments (session_id);

-- Reactions
create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  emoji text not null check (emoji in ('👍', '❤️', '😂', '🤔', '🎉')),
  created_at timestamptz not null default now(),
  unique (comment_id, user_id)
);

create index if not exists reactions_comment_id_idx on public.reactions (comment_id);

-- Roster view (no private progress fields)
create or replace view public.session_roster as
select
  sm.session_id,
  sm.user_id,
  sm.is_host,
  sm.joined_at,
  p.display_name,
  p.avatar_url
from public.session_members sm
join public.profiles p on p.id = sm.user_id;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Join session with 5,000 member cap
create or replace function public.join_session(p_session_id uuid)
returns public.session_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member public.session_members;
  v_count integer;
  v_host_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select count(*) into v_count
  from public.session_members
  where session_id = p_session_id;

  if v_count >= 5000 then
    raise exception 'Session is full (maximum 5,000 members)';
  end if;

  select host_id into v_host_id
  from public.reading_sessions
  where id = p_session_id;

  if v_host_id is null then
    raise exception 'Session not found';
  end if;

  insert into public.session_members (session_id, user_id, is_host)
  values (p_session_id, auth.uid(), auth.uid() = v_host_id)
  on conflict (session_id, user_id) do update set session_id = excluded.session_id
  returning * into v_member;

  return v_member;
end;
$$;

-- Aggregate progress stats (no individual data)
create or replace function public.get_session_progress_stats(p_session_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_count integer;
  v_finished_count integer;
  v_avg_chapter numeric;
  v_buckets json;
begin
  if not exists (
    select 1 from public.session_members
    where session_id = p_session_id and user_id = auth.uid()
  ) then
    raise exception 'Not a session member';
  end if;

  select count(*) into v_member_count
  from public.session_members where session_id = p_session_id;

  select count(*) into v_finished_count
  from public.session_members
  where session_id = p_session_id and reading_status = 'finished';

  select coalesce(round(avg(current_chapter), 1), 0) into v_avg_chapter
  from public.session_members where session_id = p_session_id;

  select coalesce(json_agg(json_build_object('chapter', chapter, 'count', cnt) order by chapter), '[]'::json)
  into v_buckets
  from (
    select current_chapter as chapter, count(*) as cnt
    from public.session_members
    where session_id = p_session_id
    group by current_chapter
  ) sub;

  return json_build_object(
    'member_count', v_member_count,
    'finished_count', v_finished_count,
    'avg_chapter', v_avg_chapter,
    'chapter_buckets', v_buckets
  );
end;
$$;

-- Upsert reaction
create or replace function public.upsert_reaction(p_comment_id uuid, p_emoji text)
returns public.reactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reaction public.reactions;
  v_session_id uuid;
begin
  select c.session_id into v_session_id
  from public.comments c
  where c.id = p_comment_id and c.deleted_at is null;

  if v_session_id is null then
    raise exception 'Comment not found';
  end if;

  if not exists (
    select 1 from public.session_members
    where session_id = v_session_id and user_id = auth.uid()
  ) then
    raise exception 'Not a session member';
  end if;

  insert into public.reactions (comment_id, user_id, emoji)
  values (p_comment_id, auth.uid(), p_emoji)
  on conflict (comment_id, user_id)
  do update set emoji = excluded.emoji, created_at = now()
  returning * into v_reaction;

  return v_reaction;
end;
$$;

-- Host delete comment
create or replace function public.host_delete_comment(p_comment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session_id uuid;
begin
  select c.session_id into v_session_id
  from public.comments c where c.id = p_comment_id;

  if not exists (
    select 1 from public.reading_sessions
    where id = v_session_id and host_id = auth.uid()
  ) then
    raise exception 'Only the session host can delete this comment';
  end if;

  update public.comments
  set deleted_at = now()
  where id = p_comment_id;
end;
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.reading_sessions enable row level security;
alter table public.session_members enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;

-- Profiles
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select to authenticated using (true);

create policy "Users can update own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- Reading sessions: readable by authenticated (link access)
create policy "Authenticated users can view sessions"
  on public.reading_sessions for select to authenticated using (true);

create policy "Authenticated users can create sessions"
  on public.reading_sessions for insert to authenticated
  with check (auth.uid() = host_id);

create policy "Hosts can update session cover"
  on public.reading_sessions for update to authenticated
  using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

-- Session members: users see own row fully; others see roster via view only
create policy "Users can view own membership"
  on public.session_members for select to authenticated
  using (user_id = auth.uid());

create policy "Users can join sessions"
  on public.session_members for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own progress"
  on public.session_members for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users can leave sessions"
  on public.session_members for delete to authenticated
  using (user_id = auth.uid());

-- Auto-add host as member on session creation
create or replace function public.handle_new_session()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.session_members (session_id, user_id, is_host)
  values (new.id, new.host_id, true);
  return new;
end;
$$;

drop trigger if exists on_reading_session_created on public.reading_sessions;
create trigger on_reading_session_created
  after insert on public.reading_sessions
  for each row execute function public.handle_new_session();

-- Roster RPC (safe columns only)
create or replace function public.get_session_roster(p_session_id uuid)
returns table (
  user_id uuid,
  display_name text,
  avatar_url text,
  is_host boolean,
  joined_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.session_members
    where session_id = p_session_id and user_id = auth.uid()
  ) then
    raise exception 'Not a session member';
  end if;

  return query
  select sm.user_id, p.display_name, p.avatar_url, sm.is_host, sm.joined_at
  from public.session_members sm
  join public.profiles p on p.id = sm.user_id
  where sm.session_id = p_session_id
  order by sm.is_host desc, sm.joined_at asc;
end;
$$;

-- Comments
create policy "Session members can view comments"
  on public.comments for select to authenticated
  using (
    deleted_at is null and exists (
      select 1 from public.session_members sm
      where sm.session_id = comments.session_id and sm.user_id = auth.uid()
    )
  );

create policy "Session members can post comments"
  on public.comments for insert to authenticated
  with check (
    user_id = auth.uid() and exists (
      select 1 from public.session_members sm
      where sm.session_id = comments.session_id and sm.user_id = auth.uid()
    )
  );

create policy "Authors can update own comments"
  on public.comments for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Authors can delete own comments"
  on public.comments for update to authenticated
  using (user_id = auth.uid());

-- Reactions
create policy "Session members can view reactions"
  on public.reactions for select to authenticated
  using (
    exists (
      select 1 from public.comments c
      join public.session_members sm on sm.session_id = c.session_id
      where c.id = reactions.comment_id and sm.user_id = auth.uid()
    )
  );

create policy "Session members can insert own reactions"
  on public.reactions for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own reactions"
  on public.reactions for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users can delete own reactions"
  on public.reactions for delete to authenticated
  using (user_id = auth.uid());

-- Storage buckets (run separately if buckets already exist)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly accessible"
  on storage.objects for select using (bucket_id = 'avatars');

create policy "Users can upload own avatar"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update own avatar"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Cover images are publicly accessible"
  on storage.objects for select using (bucket_id = 'covers');

create policy "Hosts can upload session covers"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'covers');

create policy "Hosts can update session covers"
  on storage.objects for update to authenticated
  using (bucket_id = 'covers');
