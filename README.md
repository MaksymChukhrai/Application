# Event Management System

A full-stack Event Management application built with NestJS, React, and PostgreSQL.

## Table of Contents

- [Event Management System](#event-management-system)
  - [Table of Contents](#table-of-contents)
  - [Tech Stack](#tech-stack)
  - [Prerequisites](#prerequisites)
  - [Quick Start (Docker)](#quick-start-docker)
  - [Local Development](#local-development)
    - [Backend](#backend)
    - [Frontend](#frontend)
    - [Environment Variables](#environment-variables)
  - [API Endpoints](#api-endpoints)
  - [Project Structure](#project-structure)
  - [Database Schema](#database-schema)
    - [Users](#users)
    - [Events](#events)
    - [Participants (join table)](#participants-join-table)
  - [Seed Data](#seed-data)
  - [WebSocket Notifications](#websocket-notifications)
  - [AI Assistant](#ai-assistant)
  - [State Management](#state-management)
  - [Storybook](#storybook)
  - [Running Tests](#running-tests)
    - [Backend](#backend-1)
    - [Frontend](#frontend-1)
  - [Live Demo (Railway)](#live-demo-railway)

## Tech Stack

**Backend:** NestJS, TypeScript, TypeORM, PostgreSQL, JWT, Swagger

**Frontend:** React, TypeScript, Vite, Tailwind CSS

**Infrastructure:** Docker, Docker Compose

## Prerequisites

- Docker Desktop
- Node.js 20+
- npm

## Quick Start (Docker)

1. Clone the repository:

   ```bash
   git clone https://github.com/MaksymChukhrai/Application.git
   cd Application
   ```

2. Create environment file:

   ```bash
   cp .env.example .env
   ```

3. Start all services:

   ```bash
   docker-compose up --build
   ```

4. Access the application:
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:3000/api](http://localhost:3000/api)
   - Swagger Docs: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## Local Development

### Backend

```bash
cd backend
npm install
npm run start:dev
```

### Frontend

```Bash
cd frontend
npm install
npm run dev
```

### Environment Variables

| Variable       | Description                   | Default                                           |
| -------------- | ----------------------------- | ------------------------------------------------- |
| DB_HOST        | PostgreSQL host               | localhost                                         |
| DB_PORT        | PostgreSQL port               | 5432                                              |
| DB_USERNAME    | PostgreSQL user               | postgres                                          |
| DB_PASSWORD    | PostgreSQL password           | postgres                                          |
| DB_NAME        | PostgreSQL database           | event_management                                  |
| JWT_SECRET     | JWT signing secret            | -                                                 |
| JWT_EXPIRES_IN | JWT expiration time           | 7d                                                |
| PORT           | Backend port                  | 3000                                              |
| GROQ_API_KEY   | Groq API key for AI assistant | -                                                 |
| GROQ_MODEL     | Groq model name               | llama-3.1-8b-instant                              |
| GROQ_API_URL   | Groq API endpoint             | <https://api.groq.com/openai/v1/chat/completions> |
| FRONTEND_URL   | Frontend URL for CORS         | <http://localhost:5173>                           |
| VITE_API_URL   | Backend API URL for frontend  | <http://localhost:3000/api>                       |
| NODE_ENV       | Application environment       | production                                        |

## API Endpoints

| Method | Endpoint              | Auth | Description                                          |
| ------ | --------------------- | ---- | ---------------------------------------------------- |
| POST   | /api/auth/register    | No   | Register new user                                    |
| POST   | /api/auth/login       | No   | Login user, returns JWT token                        |
| GET    | /api/events           | No   | Get all public events                                |
| GET    | /api/events/:id       | No   | Get single event by ID                               |
| POST   | /api/events           | Yes  | Create new event                                     |
| PATCH  | /api/events/:id       | Yes  | Update event (organizer only)                        |
| DELETE | /api/events/:id       | Yes  | Delete event (organizer only)                        |
| POST   | /api/events/:id/join  | Yes  | Join event as participant                            |
| POST   | /api/events/:id/leave | Yes  | Leave event as participant                           |
| GET    | /api/users/me/events  | Yes  | Get current user's events (organizer or participant) |
| GET    | /api/tags             | No   | Get all available tags                               |
| POST   | /api/ai/ask           | Yes  | Ask AI assistant about your events                   |
| GET    | /api/health           | No   | Health check                                         |

`GET /api/events` and `GET /api/events/:id` accept an optional Bearer token.  
When provided, the response includes a personalized `isJoined` field per event.
Unauthenticated requests return the same data with `isJoined: false`.  
`GET /api/events` accepts optional query parameter `?tags=id1,id2` for tag-based filtering (AND logic — event must have ALL specified tags).

## Project Structure

```bash
Application/
├── backend/          # NestJS REST API
├── frontend/         # React application
├── docker-compose.yml
├── .env.example
└── README.md
```

## Database Schema

### Users

- id (uuid, PK)
- email (unique)
- firstName
- lastName
- password (bcrypt hashed)
- createdAt
- updatedAt

### Events

- id (uuid, PK)
- title
- description
- date
- location
- capacity (nullable)
- visibility (public/private)
- organizerId (FK -> users)
- createdAt
- updatedAt

### Participants (join table)

- eventId (FK -> events)
- userId (FK -> users)

## Seed Data

The application automatically seeds the database on first run:

- 2 users: `alice@example.com` / `bob@example.com`
- Password for both: `password123`
- 3 public events

## WebSocket Notifications

Real-time notifications powered by **Socket.IO**.

**Backend implementation:**

- `@nestjs/websockets` + `@nestjs/platform-socket.io` + `socket.io@^4.x`
- `EventsGateway` (`src/events/events.gateway.ts`) — namespace `/events`, CORS-configured
- Room-based targeting: client emits `join-room` with `userId` on connect → server calls `socket.join('user:${userId}')`
- Gateway injected into `EventsService` — notifications fired after DB save in `create()`, `joinEvent()`, `leaveEvent()`

**Frontend implementation:**

- `socket.io-client@^4.8.3` connects to `/events` namespace
- `useSocket` hook (`src/hooks/useSocket.ts`) — initializes connection only when user is authenticated, automatically disconnects on logout
- Zustand `notificationsStore` stores notification queue in memory (not persisted)
- `NotificationBell` component in Navbar shows badge counter and dropdown list

**Events received by frontend:**

| Event                | Trigger           | Recipient             |
| -------------------- | ----------------- | --------------------- |
| `participant:joined` | User joins event  | Organizer only        |
| `participant:left`   | User leaves event | Organizer only        |
| `event:created`      | New event created | All connected clients |

**Notification types:**

- ✅ `success` — participant joined
- ⚠️ `warning` — participant left
- ℹ️ `info` — new event created

---

## AI Assistant

Read-only AI assistant that answers natural-language questions about events.

**Backend implementation:**

- `AiModule` (`src/ai/`) — `POST /api/ai/ask`, JWT-protected
- Request: `{ question: string }` (max 500 chars) → Response: `{ answer: string }`
- `AiService.buildContextSnapshot(userId)` — loads user's organizing & participated events with relations (tags, participants, organizer), deduplicates, splits into upcoming/past, formats as text
- Groq API (`llama-3.1-8b-instant`) via native `fetch` — `temperature: 0.3`, `max_tokens: 1024`
- Fallback: `"Sorry, I didn't understand that. Please try rephrasing your question."`

**Frontend implementation:**

- Protected route `/ai-assistant` — requires authentication
- `AiAssistantPage` sends `POST /api/ai/ask` with `{ question: string }` (max 500 chars)
- Suggested questions panel for quick start
- Enter key submits, loading state during request
- Fallback message if question is unclear

**Example questions:**

- "What events am I attending this week?"
- "When is my next event?"
- "List all events I organize"
- "Show my tech events"
- "Who is attending the Design Sprint?"

## State Management

**Redux Toolkit** — server data and auth:

- `auth.slice` — user session, JWT token, localStorage persistence
- `events.slice` — events list, active tag filters
- `tags.slice` — available tags

**Zustand** — UI state and real-time:

- `notificationsStore` — WebSocket notification queue (in-memory)
- `uiStore` — UI preferences:
- `searchQuery` — events search (cleared on navigation away from `/events`)
- `calendarView` — month/week preference (persisted to localStorage via `zustand/middleware/persist`)

## Storybook

Component library built with **Storybook v10** on a separate branch `feature/storybook`.
This branch is not merged into `master` and does not affect production.

**Components covered:**

- `Button` — 4 variants × 3 sizes, loading state, disabled state
- `Modal` — default, dangerous, loading, interactive open/close
- `Skeleton` — sizes, EventCard skeleton, grid layout
- `TagChip` — all 7 tags, deterministic color verification
- `NotificationBell` — empty, with badge, all notification types, 100+ items

**Run with Docker (from project root):**

```bash
git checkout feature/storybook
docker-compose up --build storybook
```

[Open: http://localhost:6006](http://localhost:6006)

**Run locally (from frontend/ directory):**

```bash
cd frontend
npm install
npm run storybook
```

[Open: http://localhost:6006](http://localhost:6006)

## Running Tests

### Backend

```bash
cd backend
npm run test
```

Run with details:

```bash
cd backend
npm run test -- --verbose
```

### Frontend

```bash
cd frontend
npm run test
```

Run with details:

```bash
cd frontend
npm run test -- --verbose
```

## Live Demo (Railway)

The application is deployed on [Railway](https://railway.com) as a monorepo with separate services for backend, frontend, and PostgreSQL.

- [Live project page](https://frontend-production-8050.up.railway.app)
- [Health Check](https://application-production-ab9b.up.railway.app/api/health)
- [Swagger Docs](https://application-production-ab9b.up.railway.app/api/docs)
