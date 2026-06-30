# 🧵 Untangle

**Turn chaos into clarity.**

Untangle is an AI-powered task manager that reads messy, unstructured text — WhatsApp chats, emails, meeting notes — and instantly turns it into an organized, prioritized Kanban board. It pushes tasks to Google Calendar with intelligent scheduling, and learns your personal procrastination patterns to coach you toward better follow-through.

Built for **Vibe2Ship** — vibecoded using **Google AI Studio**, from initial prompt prototyping through to a deployed full-stack app.

---

## 🛠️ How This Was Built

This project was built using a vibecoding workflow centered on **Google AI Studio**, which was used to prototype and iterate on prompts against the Gemini API — figuring out how to reliably extract structured task data (titles, priorities, deadlines, assignees) from messy, unstructured input before that logic was wired into the backend.

General-purpose AI coding assistance was also used alongside AI Studio to help scaffold the project, generate UI components, and debug integration issues (deployment config, OAuth, Firestore rules) along the way. All architecture decisions, feature scope, and final review were done by me — the AI tools accelerated implementation enough to ship a full-stack app with real third-party integrations in a single hackathon session.

---

## 🎯 The Problem

Action items get buried in group chats and email threads. Someone says "can you review this by Friday" in the middle of a 40-message thread, and it's gone within minutes. Most people either manually re-type these into a to-do app (friction kills the habit) or just forget.

## 💡 The Solution

Paste the messy text directly into Untangle's chat panel. Gemini AI reads it, extracts every actionable task, infers priority and deadlines, identifies who's responsible, and drops it straight onto a Kanban board — no manual entry required.

---

## ✨ Features

- **AI Task Extraction** — Paste any messy text and Gemini identifies tasks, priorities (High/Medium/Low), assignees, and context automatically.
- **Conversational Refinement** — Keep chatting to reprioritize, reassign, or add tasks in natural language ("make the login task urgent").
- **Kanban Board** — Clean, animated To Do / In Progress / Completed columns with drag-free one-click status changes.
- **Google Calendar Sync** — Push any task to your calendar with one click. High-priority tasks get scheduled for tomorrow morning; lower-priority tasks get pushed further out automatically.
- **Smart Notifications** — A notification bell surfaces overdue and soon-due tasks, with optional browser push alerts.
- **Procrastination AI** — As you complete or skip tasks, Untangle logs the pattern. On request, Gemini analyzes your behavior and generates a personal productivity profile: a completion score, behavioral patterns, weak spots, and concrete recommendations.
- **Secure Multi-User** — Google Sign-In with Firebase Auth. Every task is scoped to its owner; the backend verifies identity tokens on every request, and Firestore denies all direct client access — the only path to data is through the authenticated API.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite, custom CSS-in-JS styling |
| Backend | Node.js + Express |
| AI | Google Gemini API (with automatic model fallback for reliability) |
| Database | Firebase Firestore |
| Auth | Firebase Authentication (Google Sign-In) |
| Calendar | Google Calendar API (OAuth2) |
| Hosting | Vercel (frontend) · Render (backend) |

---

## 🔐 Architecture & Security

- The frontend never talks to Firestore directly — all data access goes through the Express backend.
- Every API request from the frontend includes a Firebase ID token; the backend verifies it server-side with the Firebase Admin SDK before touching any data.
- Tasks are written and queried with a `userId` filter, so users can only ever see or modify their own board.
- Firestore security rules deny all client-side reads/writes outright; only the backend (using elevated Admin SDK credentials) can access the database.
- Secrets (Gemini API key, Firebase service account) are never committed to source control — they're injected via environment variables on the hosting platform.

---

## 🧠 How the Procrastination AI Works

1. Every time a task is marked **Done**, the completion timestamp is logged.
2. Every time a task is **deleted without being completed**, it's logged as skipped.
3. On request, the backend sends the full history of completed and skipped tasks to Gemini with a structured prompt.
4. Gemini returns a productivity score, a descriptive "archetype" (e.g. *"The High-Stakes Sprinter"*), detected behavioral patterns, weak spots, and actionable recommendations — all grounded in the user's actual data, not generic advice.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+
- A Firebase project with Firestore + Authentication (Google provider) enabled
- A Google Cloud project with Calendar API enabled and OAuth credentials
- A Gemini API key

### Backend
```bash
cd backend
npm install
# create .env with GEMINI_API_KEY, PORT, and place serviceAccountKey.json in this folder
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend's `/api/tasks` routes; update the `API` constant in `src/App.jsx` if your backend runs elsewhere.

---

## 📋 Demo Flow

1. Sign in with Google.
2. Paste a chunk of messy text — a WhatsApp thread works great.
3. Watch tasks appear on the board, color-coded by priority.
4. Ask the AI chat to "make the [task] urgent" and watch it update live.
5. Click **Push to Calendar** on a task — check Google Calendar for the new event.
6. Complete a couple of tasks, delete one, then open **My Profile** to see the AI-generated procrastination report.

---

## 🛣️ Possible Next Steps

- Team/shared boards with role-based permissions
- Slack and email ingestion (not just copy-paste)
- Recurring task detection and auto-rescheduling based on the procrastination profile
- Mobile-responsive layout

---

Built with React, Express, Gemini, and Firebase. 🧵