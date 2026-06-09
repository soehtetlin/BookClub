# 📚 Books & Friends

**Books & Friends** is a premium community reading platform that makes group reading social, structured, and interactive. Anyone can register, create or join reading sessions, privately track their chapter-by-chapter progress, and participate in discussion threads with emoji reactions.

---

## 🚀 Key Features

- **Bilingual Interface (i18n)**: Full, seamless toggle support for **English (EN)** and **Burmese (မြန်မာ - MY)** across all pages and interactive components.
- **Secure Authentication & Onboarding**: Fully-featured auth gate using Supabase Auth (email/password with email verification verification check). Customizable display names, bios, and avatar image uploads.
- **Reading Sessions**: Users can create shared reading spaces for a specific book, complete with description metadata and customizable book cover images.
- **Privacy-First Progress Tracking**: Members update their current chapter and reading status (`not_started`, `reading`, `finished`) privately. The application computes aggregate session statistics (average progress, participant count, completion rate) for other members, keeping individual reading speeds confidential.
- **Flat Discussion Boards**: Clean chronological commentary threads. Supports host moderation (session hosts can delete any comment; authors can manage their own).
- **Emoji Reactions**: Expressive, instant feedback on comments using a curated set of emojis (👍, ❤️, 😂, 🤔, 🎉).

---

## 🛠 Tech Stack

- **Framework**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
- **Routing**: [React Router](https://reactrouter.com/) (Single-Page App routing)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (Custom UI design system)
- **Backend & Database**: [Supabase](https://supabase.com/) (Postgres DB, GoTrue Authentication, Storage Buckets, and RLS policies)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest) (Client-side caching and manual refresh triggers)

---

## 📂 Project Structure

```text
├── public/                # Static assets (icons, logos)
├── src/
│   ├── assets/            # CSS & local images
│   ├── components/        # Reusable UI elements (Buttons, Cards, Modals)
│   │   └── ui/            # Core design tokens & custom components
│   ├── contexts/          # Context providers (Auth, Language, Toast)
│   ├── lib/               # Third-party configurations (Supabase client, database types)
│   ├── locales/           # Translation dictionaries (EN/MY locales)
│   ├── pages/             # Layout pages (Auth, Home, Create Session, Details)
│   └── types/             # Common TypeScript declarations
├── tsconfig.json          # TypeScript workspace rules
├── vercel.json            # Vercel SPA routing redirects
└── vite.config.ts         # Vite compilation rules
```

---

## 🗄 Database Schema & RLS Policies

The backend database is hosted on PostgreSQL via Supabase. Data visibility is strictly regulated via Row Level Security (RLS) policies:

### 1. Database Tables
- **`profiles`**: User details (display names, bios, avatar references).
  - *RLS*: Reads are public to authenticated users; updates restricted to the profile owner.
- **`reading_sessions`**: Session details (title, author, total chapters, description, covers).
  - *RLS*: Authenticated users can insert; reading is open to all session invitation link holders.
- **`session_members`**: Joins profiles and reading sessions. Tracks user-specific progress (`current_chapter`, `reading_status`).
  - *RLS*: Full rows (specifically `current_chapter`) are private to the member. Other users query the `session_members_roster` view, which excludes progress details.
- **`comments`**: Thread discussions.
  - *RLS*: Members can write and read; comment author can edit/delete; session host can delete any comment inside their session.
- **`reactions`**: Emojis mapped to comments.
  - *RLS*: Unique constraints enforce one reaction per user per comment.

---

## 💻 Local Development

Follow these steps to run the project locally on your machine:

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/soehtetlin/BookClub.git
cd BookClub
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and configure your Supabase variables:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
To bundle and compile the application for deployment:
```bash
npm run build
```
Compiled static files will be placed in the `/dist` directory.

---

## 🌐 Production Deployment

The project is configured for deployment on **Vercel** with the following steps:

1. **Root Directory**: Set as `.` (root).
2. **Framework Preset**: Choose **Vite**.
3. **SPA URL Routing**: The `vercel.json` file handles redirecting all clean URLs to `index.html` for client-side routing.
4. **Environment Variables**: Make sure to define `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the Vercel dashboard project settings before deploying.
