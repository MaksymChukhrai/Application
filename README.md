# Event Management System

A full-stack Event Management application built with NestJS, React, and PostgreSQL.

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

### Environment Variables

| Variable       | Description                  | Default                     |
| -------------- | ---------------------------- | --------------------------- |
| DB_HOST        | PostgreSQL host              | localhost                   |
| DB_PORT        | PostgreSQL port              | 5432                        |
| DB_USERNAME    | PostgreSQL user              | postgres                    |
| DB_PASSWORD    | PostgreSQL password          | postgres                    |
| DB_NAME        | PostgreSQL database          | event_management            |
| JWT_SECRET     | JWT signing secret           | -                           |
| JWT_EXPIRES_IN | JWT expiration time          | 7d                          |
| PORT           | Backend port                 | 3000                        |
| FRONTEND_URL   | Frontend URL for CORS        | <http://localhost:5173>     |
| VITE_API_URL   | Backend API URL for frontend | <http://localhost:3000/api> |

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
| GET    | /api/health           | No   | Health check                                         |

`GET /api/events` and `GET /api/events/:id` accept an optional Bearer token.
When provided, the response includes a personalized `isJoined` field per event.
Unauthenticated requests return the same data with `isJoined: false`.

## Project Structure

```bash
Application/
├── backend/          # NestJS REST API
├── frontend/         # React application (see frontend section)
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

## Running Tests

```bash
cd backend
npm run test
```

### Running tests with details

```bash
npm run test -- --verbose
```

## Live Demo (Railway)

The application is deployed on [Railway](https://railway.com) as a monorepo with separate services for backend, frontend, and PostgreSQL.

- [Live project page](https://frontend-production-8050.up.railway.app)
- [Health Check](https://application-production-ab9b.up.railway.app/api/health)
- [Swagger Docs](https://application-production-ab9b.up.railway.app/api/docs)
