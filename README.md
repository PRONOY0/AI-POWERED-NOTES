# AI-POWERED-NOTES

A fullstack AI notes workspace where users can write, organise, and summarise their notes using AI. Built with Next.js, PostgreSQL, Prisma, and Groq.

---

## What it does

- Create and edit notes with a rich text editor
- Auto-saves changes so nothing is lost
- Generate AI summaries, action items, and suggested titles from note content
- Organise notes using tags and categories
- Archive notes you don't need front and centre
- Make notes public and share them with anyone via a link — no login required
- Search notes by keyword or filter by tag
- View productivity insights — most used tags, weekly activity, AI usage stats

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT via httpOnly cookie |
| AI | Groq — llama-3.3-70b-versatile |
| Styling | Tailwind CSS |

---

## Getting Started

### Prerequisites

- Node.js v24.12.0
- PostgreSQL database running locally or hosted (Neon, Supabase, etc.)
- Groq API key — free at [console.groq.com](https://console.groq.com)

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/AI-POWERED-NOTES.git
cd ai-powered-notes
```

### 2. Install dependencies

```bash
npm i
```

### 3. Set up environment variables

Create a `.env` file in the root and add:

```env
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-secret-key"
GROQ_API_KEY="your-groq-api-key"
```

### 4. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key used to sign JWT tokens |
| `GROQ_API_KEY` | Groq API key for AI summary generation |

---

## Architecture

I chose Next.js as a fullstack framework instead of maintaining a separate frontend and backend. The main reason is that I don't have to worry about connecting two separate servers — API routes live right next to the pages that use them. Dynamic routing is clean, the code is readable, and Next.js gives you SSR, CSR, and SSG out of the box depending on what you need.

**Why PostgreSQL over MongoDB** — the data here is structured. Notes have relationships with users and AI summaries, tags are stored as arrays and queried with Prisma's `has` filter, and full-text search works well with `contains` and `mode: insensitive`. PostgreSQL fits this naturally.

**Why Groq** — it's fast and free. OpenAI and Anthropic both require payment to get started. Gemini is free but unreliable — sometimes it works, sometimes it throws 500 errors mid-request. Groq with llama-3.3-70b-versatile has been consistent and the response time is noticeably faster.

**Why httpOnly cookie for auth** — storing JWT in localStorage means any JavaScript on the page can read it, which opens you up to XSS attacks. An httpOnly cookie can't be accessed from the browser console or any client-side JS at all. It goes out automatically with every request and middleware handles verification before anything reaches the route handler.

---

## API Endpoints

```
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout

GET    /api/notes                    ?q= &tag= &category= &page= &limit=
POST   /api/notes
GET    /api/notes/[id]
PATCH  /api/notes/[id]
DELETE /api/notes/[id]

POST   /api/notes/[id]/generateSummary

GET    /api/shared/[shareId]

GET    /api/analytics
```

---

## AI Integration

When a user hits Generate AI Summary on a note, the plainText content of the note is sent to Groq's chat completions API using the `llama-3.3-70b-versatile` model. The model is prompted to return a structured JSON response with three fields — a summary, a list of action items, and a suggested title.

Example response:

```json
{
  "aiSummary": {
    "suggestedTitle": "Resume Insights Project",
    "actionItems": [
      "Implement ATS score calculation",
      "Develop algorithm for weakness and strength detection",
      "Create user dashboard for displaying insights"
    ],
    "summary": "Fullstack project for resume analysis using modern web technologies"
  }
}
```

The summary is saved to the `AiSummary` table linked to the note. The user can apply the suggested title to their note with one click. Every generation increments `aiUsageCount` on the note which feeds into the insights dashboard.

---

## Database Schema

Three main models:

**User** — stores name, email, hashed password

**Note** — stores title, plainText for search and AI, content JSON for the rich text editor, tags as a string array, category, archive and public flags, a unique shareId for public links, and AI usage tracking fields

**AiSummary** — one-to-one with Note, stores summary, action items array, and suggested title

Deleting a user cascades to their notes. Deleting a note cascades to its summary.

---

## Sample Outputs

**AI Summary generation** — `POST /api/notes/[id]/generateSummary`

```json
{
  "message": "Summary generated Successfully",
  "aiSummary": {
    "id": "cmp8qvnmk000090tbpxnyo8ad",
    "noteId": "cmp79i6pd00010ctb8zs6f87j",
    "suggestedTitle": "Resume Insights Project",
    "actionItems": [
      "Implement ATS score calculation",
      "Develop algorithm for weakness and strength detection",
      "Create user dashboard for displaying insights"
    ],
    "summary": "Fullstack project for resume analysis using modern web technologies",
    "createdAt": "2026-05-16T19:34:04.892Z"
  }
}
```

**Notes list with pagination** — `GET /api/notes`

```json
{
  "notes": [...],
  "pagination": {
    "total": 6,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

## Project Structure

```
app/
├── api/
│   ├── analytics/
│   │   └── route.ts           ← productivity insights
│   ├── auth/
│   │   ├── login/route.ts
│   │   ├── logout/route.ts
│   │   └── signup/route.ts
│   ├── notes/
│   │   ├── [id]/
│   │   │   ├── generateSummary/route.ts
│   │   │   └── route.ts       ← GET, PATCH, DELETE
│   │   └── route.ts           ← GET all, POST
│   └── shared/
│       └── [shareId]/route.ts
├── dashboard/
│   └── page.tsx
├── insights/
│   └── page.tsx
├── notes/
│   ├── [id]/page.tsx          ← note editor
│   └── page.tsx
├── shared/
│   └── [id]/page.tsx          ← public note view
├── globals.css
├── layout.tsx
└── page.tsx                   ← auth page
components/
└── auth/
    ├── AuthPage.tsx
    └── Navbar.tsx
lib/
├── api.ts                     ← all API URLs
├── groq.ts                    ← Groq client
├── notesValidation.ts         ← Zod schemas
├── prisma.ts                  ← Prisma singleton
└── utils.ts
prisma/
└── schema.prisma
middleware.ts
```

---

## Notes

- Never commit your `.env` file
- The `.env.example` file is included as a reference
- Prisma generates the client into `app/generated/prisma` — this is gitignored, run `npx prisma generate` after cloning
