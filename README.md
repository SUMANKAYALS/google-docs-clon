<div align="center">

# ☁️ Clouds Docs Workspace

### A real-time collaborative document editor — built from scratch, not bootstrapped from a template.

**Google Docs–style editing · Live multiplayer cursors · AI writing assistant · Word/PDF export**

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Yjs](https://img.shields.io/badge/Yjs_CRDT-000000?style=for-the-badge)](https://yjs.dev/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

[Live Demo](https://google-docs-clon.vercel.app) · [Report Bug](https://github.com/SUMANKAYALS/Clouds_Docs_Workspace/issues) · [Author](https://github.com/SUMANKAYALS)

</div>

---

## 📖 Overview

**Clouds Docs Workspace** is a full-stack, Google Docs–style collaborative editor where multiple people can write in the same document at the same time and watch each other's cursors move in real time. It isn't a wrapper around a hosted BaaS — the real-time layer, the auth flow, and the persistence pipeline are all hand-built for this project:

- A **custom Yjs/WebSocket collaboration server** (not a third-party collab SaaS) synchronizes document state and cursor "awareness" between every connected client using CRDTs, so edits never conflict and can merge even after periods offline.
- A **Redis write-behind cache + background persistence worker** decouples fast, frequent in-memory saves from MongoDB, then reconciles and flushes to the database on a queue — with automatic retry if the database write fails and a stale-write guard so a slow save can never clobber a newer one.
- An **AI writing assistant** streams completions token-by-token from Groq's Llama 3.3 70B directly into the editor, aware of the document's title, headings, and selected text.
- A complete **authentication system** built on NextAuth v5 with email/password login, OTP email verification, password reset, and MongoDB-backed sessions — no third-party auth provider required.

The goal of this project was to understand and implement the pieces that products like Google Docs and Notion abstract away — CRDT-based conflict resolution, awareness/presence protocols, cache-aside persistence, and streaming AI UX — rather than to configure someone else's collaboration backend.

---

## ✨ Features

| Category | Highlights |
|---|---|
| 📝 **Rich Text Editor** | Tiptap/ProseMirror-based editor — headings, text alignment, font family & size, line height, color & highlight, links, images, tables, task lists, undo/redo |
| 🤝 **Real-Time Collaboration** | Multi-user simultaneous editing via Yjs CRDTs, live collaborator cursors with names, presence indicators, and conflict-free merging |
| 🤖 **AI Writing Assistant** | Context-aware AI sidebar & selection menu that streams responses (continue, rewrite, summarize, etc.) from Groq/Llama 3.3, powered by Server-Sent Events |
| 🔐 **Authentication** | Email/password auth (NextAuth v5), OTP email verification, forgot/reset password, JWT sessions, bcrypt password hashing |
| 👥 **Sharing & Permissions** | Invite collaborators by email, editor/viewer roles, shareable invite links, pending-invitation inbox with accept/reject |
| 🗂️ **Document Management** | Dashboard with document grid, autosave, per-document version history, soft delete/restore |
| 📤 **Export** | Export any document to native **.docx** (via `html-to-docx`) and **PDF** (via `jsPDF` + `html2canvas`) |
| 👤 **User Profiles** | Editable profile (bio, job title, company, timezone), user preferences (default font, page size, autosave toggle, AI toggle) |
| 🌓 **UI/UX** | Responsive design, light/dark theme, Radix UI + shadcn-style components, Framer Motion micro-interactions |
| 🐳 **DevOps** | Dockerized app + collaboration server with `docker-compose`, separate Dockerfiles for the web app and the WebSocket server |

---

## 🏗️ Architecture

The system runs as **three cooperating processes**, orchestrated together in development via `concurrently` and in production via Docker Compose:

```
┌──────────────────────┐        WebSocket (Yjs sync + awareness)
│   Next.js Web App      │◄────────────────────────────┐
│  (App Router, SSR/API) │                              │
└───────────┬───────────┘                              │
            │ REST / Server Actions               ┌─────────────────────────┐
            │                                     │  Collaboration Server    │
            ▼                                     │  (Node + ws + Yjs CRDT)  │
┌───────────────────────┐                          └────────────┬─────────────┘
│       MongoDB          │◄── read/write (Mongoose)              │ awareness + doc updates
│  Users · Documents ·   │                                        ▼
│  Invitations · OTP ·   │                          ┌─────────────────────────┐
│  Version History        │◄─── write-behind flush ──│   Persistence Worker    │
└───────────────────────┘                          │  (Redis queue consumer) │
            ▲                                        └────────────┬─────────────┘
            │                                                     │
            └─────────────────── cache-aside ────────────────────►│
                                                          ┌──────────────┐
                                                          │     Redis      │
                                                          │ pending_flushes│
                                                          │ zset + doc:*   │
                                                          └──────────────┘
```

**How a keystroke actually gets saved:**
1. The Tiptap editor emits a Yjs update, broadcast instantly to every collaborator through the WebSocket collaboration server (sub-second, no database round-trip).
2. Content is cached in Redis and the document ID is pushed onto a sorted-set queue (`pending_flushes`) keyed by flush time.
3. A dedicated **persistence worker** process polls the queue every second, reads the cached snapshot, and conditionally updates MongoDB — only if the cached version is newer than what's already stored, preventing stale overwrites.
4. If the MongoDB write fails, the job is automatically re-queued with a 5-second backoff instead of being silently dropped.
5. If Redis itself is unavailable, the worker logs a single warning and idles gracefully rather than crashing — the app keeps working, it simply falls back to direct autosave.

---

## 🛠️ Tech Stack

<table>
<tr><td><b>Framework</b></td><td>Next.js 16 (App Router), React 18, TypeScript</td></tr>
<tr><td><b>Editor Engine</b></td><td>Tiptap 2 / ProseMirror, with custom extensions (font size, line height, indent)</td></tr>
<tr><td><b>Real-Time Sync</b></td><td>Yjs (CRDTs), y-websocket, y-prosemirror, y-protocols, custom <code>ws</code> server</td></tr>
<tr><td><b>Database</b></td><td>MongoDB via Mongoose (Users, Documents, Invitations, Comments, OTP, Version History)</td></tr>
<tr><td><b>Cache / Queue</b></td><td>Redis (ioredis) — write-behind persistence queue for document autosave</td></tr>
<tr><td><b>Auth</b></td><td>NextAuth v5 (beta), JWT sessions, bcryptjs, custom OTP email verification</td></tr>
<tr><td><b>AI</b></td><td>Groq API (Llama 3.3 70B) with streaming responses over Server-Sent Events</td></tr>
<tr><td><b>Styling / UI</b></td><td>Tailwind CSS, Radix UI primitives, shadcn-style components, Framer Motion, next-themes</td></tr>
<tr><td><b>Document Export</b></td><td>html-to-docx, jsPDF, html2canvas</td></tr>
<tr><td><b>State</b></td><td>Zustand</td></tr>
<tr><td><b>Email</b></td><td>Nodemailer (OTP delivery, invitations)</td></tr>
<tr><td><b>Infra</b></td><td>Docker, Docker Compose (separate containers for the app and the collaboration server)</td></tr>
</table>

---

## 📁 Project Structure

```
Clouds_Docs_Workspace/
├── scripts/
│   ├── collaboration-server.js   # Standalone Yjs WebSocket server (sync + awareness protocol)
│   └── persistence-worker.js     # Redis-queue consumer that flushes documents to MongoDB
├── src/
│   ├── app/
│   │   ├── (auth)/               # Login, register, forgot/reset password, verify email
│   │   ├── documents/            # Dashboard + [documentId] editor route
│   │   ├── join/[inviteCode]/    # Invite-link acceptance flow
│   │   ├── profile/              # User profile & preferences
│   │   └── api/
│   │       ├── ai/groq/          # Streaming AI completion endpoint
│   │       ├── auth/             # NextAuth handlers, register, OTP resend/verify
│   │       ├── documents/        # Autosave & export (.docx) endpoints
│   │       └── profile/          # Profile CRUD
│   ├── actions/                  # Server Actions: auth, documents, invitations, sharing
│   ├── components/
│   │   ├── ai/                   # AI sidebar & selection menu
│   │   ├── auth/                 # Auth forms
│   │   ├── documents/            # Document cards, share dialog, empty states
│   │   ├── notifications/        # Invitation notifications dropdown
│   │   ├── collaboration-presence.tsx
│   │   ├── live-mouse-pointers.tsx
│   │   └── ui/                   # Reusable shadcn-style primitives
│   ├── extensions/                # Custom Tiptap extensions (font-size, indent, line-height)
│   ├── models/                    # Mongoose schemas: User, Document, Invitation, Comment, OTP, VersionHistory
│   ├── lib/                       # db, redis, mail, invite-code, ai helpers, validations
│   ├── auth.ts / auth.config.ts   # NextAuth configuration
│   └── middleware.ts              # Route protection
├── Dockerfile                     # Next.js app image
├── Dockerfile.collab              # Collaboration server image
└── docker-compose.yml             # Runs app + collab server together
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js `18+`
- A running **MongoDB** instance (local or Atlas)
- A running **Redis** instance (optional — the app degrades gracefully without it)
- A [Groq API key](https://console.groq.com/) (optional, enables the AI assistant)
- An SMTP provider for Nodemailer (for OTP emails)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/SUMANKAYALS/Clouds_Docs_Workspace.git
cd Clouds_Docs_Workspace

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local   # then fill in the values below

# 4. Run the app (starts the Next.js server, the WebSocket
#    collaboration server, and the persistence worker together)
npm run dev
```

Open **http://localhost:3000** in your browser.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs the Next.js app, collaboration server, and persistence worker concurrently |
| `npm run dev:next` | Runs only the Next.js dev server |
| `npm run collab:server` | Runs only the Yjs WebSocket collaboration server |
| `npm run worker` | Runs only the Redis→MongoDB persistence worker |
| `npm run build` | Production build |
| `npm start` | Starts the production server |
| `npm run lint` | Lints the codebase |

---

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `REDIS_URL` | Redis connection string (optional; falls back gracefully if absent) |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | Secret used to sign NextAuth JWTs |
| `NEXTAUTH_URL` | Canonical app URL (used for secure-cookie detection) |
| `NEXT_PUBLIC_WS_URL` | URL of the collaboration WebSocket server (e.g. `ws://localhost:1234`) |
| `GROQ_API_KEY` | API key for the AI writing assistant (Groq) |
| `SMTP_*` | Mail server credentials used by Nodemailer for OTP/invite emails |

---

## 🐳 Running with Docker

The project ships with a two-container Compose setup — one for the Next.js app, one for the standalone collaboration server:

```bash
docker compose up --build
```

This builds and starts:
- **`clouds-docs-app`** — the Next.js application on port `3000`
- **`clouds-docs-collab`** — the Yjs WebSocket server on port `1234`

---

## 💡 Implementation Highlights

**Awareness-based live cursors.** The collaboration server implements the Yjs sync and awareness wire protocols directly (`y-protocols`), broadcasting encoded binary updates only to relevant peers rather than polling — the same approach used by production CRDT editors.

**Failure-tolerant autosave.** The persistence worker treats Redis as a best-effort accelerator, not a dependency: if it's unreachable, the worker logs once and idles instead of crashing the process, and writes only commit to MongoDB when the cached update is strictly newer than what's stored — preventing race conditions between concurrent editors.

**Streaming AI, not blocking AI.** The `/api/ai/groq` route proxies Groq's chat-completions endpoint and re-streams it to the client as Server-Sent Events chunk-by-chunk, so AI suggestions appear inline as they're generated rather than after a multi-second wait.

**Granular sharing model.** Documents track both a flat `collaborators` list and a richer `collaboratorMembers` array with per-user roles (`editor` / `viewer`) and join timestamps, backed by an `Invitation` model with expiring, status-tracked invites (`pending` / `accepted` / `rejected` / `expired`).

---

## 🗺️ Roadmap

- [ ] In-document threaded comments UI (schema already in place via the `Comment` model)
- [ ] Real-time notifications via WebSocket push instead of polling
- [ ] Granular version-history diff viewer
- [ ] Public read-only document links

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m "feat: add amazing feature"`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 👤 Author

**Suman Kayal** · *Sky*

Final-year CS Engineering student · Full-Stack Developer (MERN, real-time systems, AI-integrated tooling)

- GitHub: [@SUMANKAYALS](https://github.com/SUMANKAYALS)
- LinkedIn: [suman-kayal10](https://www.linkedin.com/in/suman-kayal10/)
- Portfolio: [sumankayalportfolio.vercel.app](https://sumankayalportfolio.vercel.app)

---

## 📄 License

Licensed under the **MIT License** — see [LICENSE](./LICENSE) for details.

<div align="center">

Made with ❤️ and a lot of WebSocket debugging by [Suman Kayal](https://github.com/SUMANKAYALS)

</div>
