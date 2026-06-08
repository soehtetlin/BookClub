# Books & Friends — Master Documentation

Welcome to **Books & Friends**, a community reading platform designed to make group reading social, structured, and easy. Members can register, create or join reading sessions via shared links, track their personal chapter progress privately, and discuss books in chronological threads with emoji reactions.

This repository is a monorepo containing the database schema, web application, and mobile application.

---

## 📖 Table of Contents
1. [Core Features](#-core-features)
2. [Tech Stack & Architecture](#-tech-stack--architecture)
3. [Repository Directory Structure](#-repository-directory-structure)
4. [Database Schema & Security (Supabase)](#-database-schema--security-supabase)
   - [Tables](#tables)
   - [Row Level Security (RLS)](#row-level-security-rls)
   - [Custom RPC Functions](#custom-rpc-functions)
5. [Getting Started & Local Development](#-getting-started--local-development)
   - [Backend (Supabase)](#backend-supabase)
   - [Web Application (Vite + React)](#web-application-vite--react)
   - [Mobile Application (Expo + React Native)](#mobile-application-expo--react-native)
6. [Internationalization & Localization](#-internationalization--localization)

---

## 🌟 Core Features

- **Secure Authentication**: Email and password registration powered by Supabase Auth with mandatory email verification before participating.
- **Onboarding Journey**: Fast onboarding where users set up custom display names, bios, and upload avatars.
- **Reading Sessions**: Session-centric hubs representing a reading circle for a specific book. Metadata includes title, author, total chapters, descriptions, covers, and start/end dates. Enforced cap of **5,000 members** per session.
- **Privacy-First Progress Tracking**: Readers log their current chapter progress privately. Other participants cannot inspect individual chapters; they only view **aggregate stats** (averages, finished rates, and chapter distribution histograms).
- **Interactive Discussions**: Single chronological discussion thread per session supporting custom plain-text comments (up to 2,000 characters).
- **Emoji Reactions**: Users can react to comments with any of the fixed set: 👍, ❤️, 😂, 🤔, 🎉.
- **Bilingual Interface**: Seamless translation switcher between English (EN) and Burmese (မြန်မာ - MY) on the Web client.

---

## 🛠️ Tech Stack & Architecture

### Backend & Database (Supabase)
- **Postgres Database**: Relational database for storing profiles, sessions, members, comments, and reactions.
- **Supabase Auth**: Core authentication (email/password verification flow).
- **Supabase Storage**: public storage buckets (`avatars` and `covers`) for handling image assets.
- **RLS & Security Policies**: Granular access control, database views, and PL/pgSQL functions.

### Web Client
- **Vite** + **React (SPA)** + **TypeScript**.
- **Tailwind CSS v4** styling framework with a custom, premium design system.
- **React Router** for clean client-side routing.
- **React Contexts**: Core providers for Auth, Bilingual Localization, and UI Toast alerts.

### Mobile Client
- **Expo (SDK 52+)** + **React Native** + **TypeScript**.
- **Expo Router** for nested file-based navigation.
- **Expo Image Picker**: Integration with native camera/photo galleries.

---

## 📂 Repository Directory Structure

```
BOOKCLUB/
├── PROJECT_SPEC.md           # Locked product decisions & functional spec for v1
├── README.md                 # Master documentation (this file)
├── supabase/                 # Supabase configuration, schema migrations & seed files
│   ├── migrations/
│   │   ├── 001_initial_schema.sql  # Database tables, triggers, RPCs, & RLS policies
│   │   └── 002_mvp_completion.sql  # Database updates (dates, performance indexes)
│   └── seed_demo_data.sql    # Seed script for setting up demo data locally
├── web/                      # Single Page Web Application (Vite + React)
│   ├── src/
│   │   ├── components/       # Reusable UI controls and interactive panels
│   │   ├── contexts/         # React state managers (Auth, Language, Toast)
│   │   ├── lib/              # Client configurations (Supabase connection, utils)
│   │   ├── locales/          # Localization dictionary files (en.ts, my.ts)
│   │   └── pages/            # Application page routers
└── mobile/                   # Cross-Platform Native Mobile App (Expo + React Native)
    ├── src/
    │   ├── app/              # Expo Router folder navigation structure
    │   ├── components/       # Native UI components (Avatar, Buttons, Panels)
    │   ├── constants/        # Styles, colors, and layout constants
    │   ├── contexts/         # Authentication and device-level managers
    │   └── lib/              # Supabase configurations and utilities
```

---

## 🔒 Database Schema & Security (Supabase)

### Tables

1. **`profiles`**: Tied to `auth.users` via a cascade trigger on signup. Holds display names, bios, and avatar image links.
2. **`reading_sessions`**: Stored sessions details. Title, author, total chapters are immutable in v1. Contains host reference.
3. **`session_members`**: Intermediate table linking profiles to sessions. Houses private progress trackers (`current_chapter` and `reading_status`).
4. **`comments`**: Thread messages within reading sessions. Supports soft deletion (`deleted_at`).
5. **`reactions`**: Tracks emojis attached to comments. Constrained to unique pairings of `(comment_id, user_id)`.

### Row Level Security (RLS)
- **Profiles**: Authenticated read allowed for all; writes restrict update to own row only.
- **Reading Sessions**: Authenticated read allowed for all (via direct link); insertion allowed for hosts.
- **Session Members**: Select operations on the database table only return rows where `user_id = auth.uid()`, preventing other members from reading individual progress records. Roster list views use the `session_roster` view, which filters out progress fields.
- **Comments**: Viewable and insertable only by registered session members. Comment updates are restricted to the author, while deletions are allowed for the author and the session host.

### Custom RPC Functions

- **`join_session(session_id)`**: Atomically joins a user to a session. Enforces a 5,000 membership limit.
- **`get_session_progress_stats(session_id)`**: Computes aggregated progress statistics (member count, finished count, average chapter, and progress distribution JSON buckets) without exposing raw rows.
- **`upsert_reaction(comment_id, emoji)`**: Creates or updates an emoji reaction on a comment.
- **`host_delete_comment(comment_id)`**: Allows session hosts to flag any comment in their session as soft deleted.

---

## 🚀 Getting Started & Local Development

### Backend (Supabase)
To set up or refresh your database schema:
1. Copy the SQL statements in [supabase/migrations/001_initial_schema.sql](file:///c:/Users/soehtetlin/OneDrive%20-%20Myanmar%20DCR%20Co.,%20Ltd/AI%20AGENT/BOOKCLUB/supabase/migrations/001_initial_schema.sql) and [002_mvp_completion.sql](file:///c:/Users/soehtetlin/OneDrive%20-%20Myanmar%20DCR%20Co.,%20Ltd/AI%20AGENT/BOOKCLUB/supabase/migrations/002_mvp_completion.sql) to your Supabase Project SQL Editor.
2. Ensure you create two public storage buckets: `avatars` and `covers`.
3. *(Optional)* Run [supabase/seed_demo_data.sql](file:///c:/Users/soehtetlin/OneDrive%20-%20Myanmar%20DCR%20Co.,%20Ltd/AI%20AGENT/BOOKCLUB/supabase/seed_demo_data.sql) to bootstrap test data.

### Web Application (Vite + React)
1. Navigate to the `web` folder:
   ```bash
   cd web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables by copying `.env.example` to `.env` and adding your Supabase API keys:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   ```
4. Start development server:
   ```bash
   npm run dev
   ```
5. Build project:
   ```bash
   npm run build
   ```

### Mobile Application (Expo + React Native)
1. Navigate to the `mobile` folder:
   ```bash
   cd mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` configuration file:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Start the Expo Dev CLI:
   ```bash
   npx expo start
   ```
5. Press **`a`** to open in Android Emulator, **`i`** to open in iOS Simulator, or scan the QR code to run on a physical device via Expo Go.

---

## 🌐 Internationalization & Localization

Bilingual configuration uses a custom `LanguageProvider` defined in [LanguageContext.tsx](file:///c:/Users/soehtetlin/OneDrive%20-%20Myanmar%20DCR%20Co.,%20Ltd/AI%20AGENT/BOOKCLUB/web/src/contexts/LanguageContext.tsx).

- **Translation Keys**: Traversed using dot-notation via the `t('parent.child')` utility.
- **Replacements**: Supports bracket formatting (e.g. `{count}`) for dynamic value injection.
- **State Preservation**: Saves active selection (`en` or `my`) inside the browser's `localStorage` across page reloads.
