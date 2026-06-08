# Books & Friends — Project Specification

**Version:** 0.2 (Locked for v1)  
**Date:** June 8, 2026  
**Status:** Ready for implementation

---

## 1. Executive Summary

**Books & Friends** is a community reading platform where anyone can register, create or join book reading sessions, track personal chapter progress, and discuss books in a single flat thread with reactions on comments.

| Attribute | Value |
|-----------|-------|
| **Product name** | Books & Friends |
| **Backend** | Supabase (Auth, Postgres, Storage) |
| **Web** | Next.js + TypeScript |
| **Mobile** | React Native (Expo) + TypeScript |
| **Launch strategy** | Web-first MVP, then mobile parity |
| **Primary users** | Casual readers, book clubs, study groups |

---

## 2. Locked Product Decisions (v1)

| # | Topic | Decision |
|---|--------|----------|
| 1 | Session visibility | **Host decides** — stored on session for future use; v1 is **link-only access** (no public catalog, no invite-only private mode) |
| 2 | Who can create sessions | **Any registered member** |
| 3 | Edit / delete / archive session | **Deferred to v2** — metadata is immutable after creation in v1 |
| 4 | Membership cap | **5,000 members** per session (enforced at join) |
| 5 | Comment structure | **Flat thread only** in v1; threaded replies in v2 |
| 6 | Spoiler tags | **Deferred to v2** |
| 7 | Progress visibility | **Private per member**; others see **aggregate stats only** |
| 8 | Book metadata | **Manual entry** in v1; external book API in v2 |
| 9 | Media | **Avatar + cover photo upload** in v1 (Supabase Storage) |
| 10 | Mobile stack | **React Native (Expo)** — shared TypeScript types with web |
| 11 | Web stack | **Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui** |
| 12 | Launch priority | **Web-first** — ship complete web MVP before mobile feature parity |
| 13 | Auth | **Email + password only** (Supabase Auth) |
| 14 | Display names | **User's choice** (pseudonym or real name) |
| 15 | Monetization | **Out of scope** for v1 |
| 16 | Localization | **Out of scope** for v1 (English UI only) |
| 17 | Moderation | **Users delete own comments**; **session host can delete any comment** in their session; formal report flow deferred to v2 |
| 18 | Timeline | **~10–12 weeks** (small team of 1–2 developers) — see §11 |
| 19 | Explicitly **not in v1** | Realtime live updates, push notifications, public discover/browse, private/invite-only sessions |

---

## 3. Product Vision & Goals

### Vision
Make group reading social, structured, and easy — from “let’s read this book together” to shared progress and meaningful discussion in one place.

### v1 Goals
- Open registration; any member can start a reading session.
- Session-centric spaces: book info, members, private progress, aggregate stats, one discussion thread.
- Host shares a **session link** to invite readers (no global browse in v1).
- Lightweight engagement via emoji reactions on comments.

### v1 Non-goals
- Public session directory or search
- Private / invite-only sessions
- Realtime comment streaming
- Push or email notifications
- Session metadata editing after creation
- Nested comment replies
- Spoiler tags or chapter-gated comments
- Book metadata API (Open Library, Google Books, etc.)
- OAuth (Google / Apple)
- Monetization, ads, or premium tiers
- Multi-language / localization
- Formal moderation / reporting
- E-commerce, DMs, or full social graph

---

## 4. User Roles & Permissions

| Role | Description | v1 Capabilities |
|------|-------------|-----------------|
| **Guest** | Unauthenticated visitor | View landing page only |
| **Member** | Registered user | Create sessions, join via link, update own progress, post flat comments, react, upload avatar |
| **Session host** | Member who created the session | All member capabilities + delete any comment in session + share session link |

**v1 permission rules:**
- All registered members can create sessions (no extra verification beyond account).
- Host **cannot** edit title, author, chapter count, or cover after publish in v1.
- Host **cannot** kick members or archive sessions in v1.
- Members can leave a session; their comments remain attributed.
- Member list is visible to all session participants (names + avatars only — not individual progress).

---

## 5. Core Features (v1 Detail)

### 5.1 Authentication & Registration

- Email + password sign-up and sign-in (Supabase Auth).
- Email verification **required before** creating sessions, joining sessions, or posting comments.
- Password reset via email.
- Profile fields: **display name** (user's choice), **avatar upload**, optional bio.

### 5.2 Reading Sessions

A **reading session** is one group read of one book.

**Required fields at creation:**
| Field | Type | Notes |
|-------|------|-------|
| Title | string | Manual entry |
| Author | string | Manual entry |
| Total chapters | integer | Must be > 0 |

**Optional fields at creation:**
| Field | Type | Notes |
|-------|------|-------|
| Description | text | Session intro |
| Cover photo | file upload | Supabase Storage; JPG/PNG/WebP, max 5 MB |
| Start date | date | Informational only in v1 |
| End date | date | Informational only in v1 |

**Host visibility preference (stored, enforced in v2):**
- Column `visibility`: `public` | `private` — host selects at creation.
- **v1 behavior:** Both values behave the same — session is reachable only by **direct link** (`/sessions/{id}`). No catalog surfaces `public` sessions yet.

**Session state in v1:** `active` only (no draft / completed / archive workflow until v2).

**Join flow:**
- User opens shared link → session detail → **Join** (if under 5,000 members and authenticated).
- No browse or search UI in v1.

### 5.3 Membership

- Join cap: **5,000** members per session (DB constraint + join RPC check).
- Roster: display name + avatar for all members; no individual chapter shown.
- Leave: member removes themselves from `session_members`; history preserved.

### 5.4 Progress Tracking

Each member updates **only their own** progress.

| Field | Type | Notes |
|-------|------|-------|
| Current chapter | integer | 0 = not started, 1 … total_chapters |
| Reading status | enum | `not_started`, `reading`, `finished` |
| Last updated | timestamp | Auto |

**Visibility rules:**
- **Self:** full progress on session page and home.
- **Others:** cannot see any member's individual chapter.
- **Aggregate stats** (computed, shown on session page):
  - Total members
  - Members who have finished (`reading_status = finished`)
  - Chapter distribution histogram or summary, e.g. “Most readers are between chapters 5–8”
  - Average current chapter (rounded, no per-user breakdown)

**Implementation note:** Expose aggregates via a Postgres view or RPC (`get_session_progress_stats(session_id)`) so clients never receive row-level progress of other users.

### 5.5 Discussion (Single Flat Thread)

- **One flat, chronological thread** per session (oldest first).
- No `parent_id` / replies in v1 UI or API.
- Comment body: plain text (max 2,000 chars); markdown deferred to v2.
- Author can **edit** (shows `edited_at`) and **delete** own comments (soft delete).
- Host can **delete** any comment in their session (soft delete).
- **No realtime** in v1 — client polls or refetches on focus / manual refresh.

### 5.6 Reactions

- React to **comments** only.
- Fixed emoji set: 👍 ❤️ 😂 🤔 🎉
- One reaction per user per comment (change or remove allowed).
- Counts visible on each comment.

### 5.7 Media Uploads

| Asset | Storage bucket | Max size | Formats |
|-------|----------------|----------|---------|
| Avatar | `avatars` | 2 MB | JPG, PNG, WebP |
| Session cover | `covers` | 5 MB | JPG, PNG, WebP |

- RLS: users write own avatar path; host writes cover for sessions they own.
- Serve via Supabase Storage public or signed URLs.

---

## 6. User Flows (v1)

### 6.1 Register & Onboard
```
Landing → Sign up (email/password) → Verify email → Set display name + optional avatar → Home
```

### 6.2 Create a Reading Session
```
Home → Create session → Title, author, chapters, optional cover/description → Publish → Copy share link
```

### 6.3 Join & Participate
```
Open share link → Session detail → Join → Update my progress → Read discussion (refresh) → Post comment → React
```

### 6.4 Host Moderation
```
My session → Discussion → Delete inappropriate comment (any comment in host's session)
```

---

## 7. Data Model (Supabase / Postgres)

### 7.1 Entity Relationship

```
profiles ──< session_members >── reading_sessions
    │                                    │
    │                                    ├──< comments ──< reactions
    │                                    │
    └── progress lives on session_members (current_chapter, reading_status)
```

### 7.2 Tables

#### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | FK → auth.users |
| display_name | text | Required after onboarding |
| avatar_url | text | nullable |
| bio | text | nullable |
| created_at | timestamptz | |

#### `reading_sessions`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | Used in share URL |
| host_id | uuid FK → profiles | Creator / owner |
| title | text | Immutable in v1 |
| author | text | Immutable in v1 |
| total_chapters | int | check > 0; immutable in v1 |
| description | text | nullable |
| cover_url | text | nullable |
| visibility | text | `public` \| `private` — stored for v2 |
| created_at | timestamptz | |

#### `session_members`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| session_id | uuid FK | |
| user_id | uuid FK → profiles | |
| is_host | boolean | true for creator |
| current_chapter | int | default 0; **private** |
| reading_status | text | `not_started` \| `reading` \| `finished` |
| joined_at | timestamptz | |
| | | unique(session_id, user_id) |

**Join constraint:** Trigger or RPC rejects insert when `(SELECT count(*) FROM session_members WHERE session_id = ?) >= 5000`.

#### `comments`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| session_id | uuid FK | |
| user_id | uuid FK → profiles | |
| body | text | max 2000 chars |
| created_at | timestamptz | |
| updated_at | timestamptz | nullable |
| deleted_at | timestamptz | soft delete |

*(`parent_id` omitted in v1 schema; add in v2 migration for threaded replies.)*

#### `reactions`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| comment_id | uuid FK | |
| user_id | uuid FK → profiles | |
| emoji | text | one of fixed set |
| created_at | timestamptz | |
| | | unique(comment_id, user_id) |

#### `session_progress_stats` (view or RPC output)
Not a table — computed:
- `member_count`
- `finished_count`
- `avg_chapter`
- `chapter_buckets` (jsonb histogram)

### 7.3 Row Level Security (RLS)

| Table | Policy summary |
|-------|----------------|
| **profiles** | Authenticated read all (display_name, avatar_url, bio); user updates own row |
| **reading_sessions** | Authenticated read by id (link access); authenticated insert; **no update in v1** |
| **session_members** | Session participants read roster (**exclude** other users' `current_chapter` / `reading_status` from SELECT — use separate view for roster vs self) |
| **comments** | Session members read; members insert; author update/delete own; host delete any in their session |
| **reactions** | Session members read; user upsert/delete own |

**Critical:** Split `session_members` access:
- `session_members_roster` view: `user_id`, `display_name`, `avatar_url`, `is_host`, `joined_at` only.
- Full row readable only when `user_id = auth.uid()`.

### 7.4 RPC Functions (v1)

| Function | Purpose |
|----------|---------|
| `join_session(session_id)` | Enforce 5k cap, idempotent join |
| `get_session_progress_stats(session_id)` | Aggregate stats only |
| `upsert_reaction(comment_id, emoji)` | Atomic reaction toggle |
| `host_delete_comment(comment_id)` | Host-only soft delete |

---

## 8. Backend Architecture (Supabase)

### 8.1 Current Environment Setup

The project is currently connected to a hosted Supabase instance for the v1 MVP implementation.

- **Supabase URL**: `https://guwayzdivbtdtzawtawr.supabase.co`
- **Migrations**: The database schema, RLS policies, views, and RPC functions are fully versioned in the `supabase/migrations/` directory:
  - `001_initial_schema.sql`: Core tables, RLS, Storage buckets, triggers, and RPCs.
  - `002_mvp_completion.sql`: Appends date fields (`start_date`, `end_date`) and performance indexes.
- **Demo Data**: A seed file `supabase/seed_demo_data.sql` is provided for local testing.
- **Client Configuration**: The web application accesses this environment via environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`) located in `web/.env`.

| Service | v1 usage |
|---------|----------|
| **Auth** | Email/password, email verification |
| **Postgres** | All application data |
| **RLS** | Authorization |
| **Storage** | Avatars + cover images |
| **Realtime** | **Not used in v1** |
| **Edge Functions** | Optional: post-signup profile bootstrap |

---

## 9. Web App (v1)

### 9.1 Stack
- **Vite** + **React (SPA)** + **TypeScript**
- **React Router** for client-side routing
- **Tailwind CSS v4** with a custom premium design system (replacing shadcn/ui)
- **@supabase/supabase-js**
- **TanStack Query** for data fetching / cache invalidation (manual refresh, no Realtime)

### 9.2 Screens
1. Landing
2. Sign up / Sign in / Verify email / Forgot password
3. Onboarding (display name + avatar)
4. Home — **My sessions** (created + joined); no discover tab
5. Create session
6. Session detail — cover, book info, aggregate stats, member roster, my progress, discussion, reactions
7. Profile (self)
8. Settings (change password, update profile)

### 9.3 Web Requirements
- Responsive (mobile-friendly web, not a substitute for native app)
- Share link copy button on session page (host)
- Accessible form labels and keyboard nav (WCAG 2.1 AA aspirational)
- No SEO catalog pages in v1 (session pages may be `noindex` until public discover ships)

---

## 10. Mobile App (Phase 2)

### 10.1 Stack
- **Expo** (SDK 52+) + **TypeScript**
- **Expo Router** for navigation
- Same Supabase project and RLS policies
- Shared types package: `packages/shared` (session, comment, profile types + constants)

### 10.2 Screens (parity with web)
- Auth stack → Tab home (My sessions) → Create → Session detail → Profile / Settings

### 10.3 Mobile v1 scope (when built)
- Full feature parity with web v1
- Native share sheet for session link
- Pull-to-refresh on discussion (replaces Realtime)
- **No push notifications in v1**

---

## 11. Release Plan & Timeline

**Assumption:** 1–2 developers, part-time design.

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **0 — Foundation** | Weeks 1–3 | Supabase project, schema, RLS, Storage buckets, email auth, shared types |
| **1 — Web MVP** | Weeks 4–7 | Full v1 web flows: auth, sessions, join cap, progress, aggregates, flat discussion, reactions, uploads |
| **2 — Web hardening** | Weeks 8–9 | QA, rate limits, error states, host delete comment, polish |
| **3 — Mobile** | Weeks 10–12 | Expo app at web parity |
| **Buffer** | — | ~1 week slack for email deliverability / store review if mobile ships |

**v1 launch criterion:** Web app complete per this spec; mobile may follow within same cycle or immediately after web soft launch.

---

## 12. v2 Backlog (Confirmed Deferred)

| Feature | Notes |
|---------|-------|
| Session metadata edit / archive / delete | Host management |
| Host-controlled visibility enforcement | Public discover + private invite-only |
| Public browse & search | Session catalog |
| Threaded comment replies | `parent_id` on comments |
| Spoiler tags | Mark and hide spoiler content |
| Book metadata API | Auto-fill title, author, cover |
| Realtime discussion | Supabase Realtime subscriptions |
| Push & email notifications | Join, comment, reaction alerts |
| OAuth | Google / Apple sign-in |
| Report comment / admin moderation | Platform-level moderation |
| Monetization | TBD |
| Localization | i18n |

---

## 13. Non-Functional Requirements

| Category | v1 target |
|----------|-----------|
| **Availability** | Supabase hosted tier SLA |
| **Performance** | Session page interactive < 3s on mid-tier mobile browser |
| **Security** | RLS on all tables; no service role key in clients |
| **Abuse prevention** | Email verification; rate limit comments (e.g. 10/min/user); 5k join cap |
| **Privacy** | Individual progress never exposed to other members |
| **Analytics** | Optional minimal analytics post-launch (not required for v1) |

---

## 14. Success Metrics

- Registered verified users
- Sessions created per week
- Avg members per session
- Comments per session per week
- Progress update rate (% of members updating weekly)
- Share link copy / join conversion

---

## 15. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Low discovery without catalog | Strong share-link UX; host onboarding copy |
| Stale discussion without Realtime | Pull-to-refresh + refetch on tab focus |
| Spoilers in flat thread | v2 spoiler tags; v1 community norms + host delete |
| Large sessions (5k) performance | Pagination on comments; indexed queries; aggregate RPC |
| Schema churn v1→v2 | Store `visibility` now; plan migrations for `parent_id`, session status |

---

*End of specification v0.2 — locked for v1 implementation.*
