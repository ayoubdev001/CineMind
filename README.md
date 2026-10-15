<div align="center">

# 🎬 CineMind AI

### Intelligent Movie & TV Show Discovery Assistant
**Software Requirements & Architecture Specification (SRS)**

![React Native](https://img.shields.io/badge/Frontend-React_Native_%2B_Expo-61DAFB?style=flat-square&logo=react)
![Node](https://img.shields.io/badge/Backend-Node.js_%2B_Express-339933?style=flat-square&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_%2B_pgvector-336791?style=flat-square&logo=postgresql)
![OpenAI](https://img.shields.io/badge/AI-GPT--4o--mini-412991?style=flat-square&logo=openai)
![Docker](https://img.shields.io/badge/Deploy-Docker_%2B_Railway%2FRender-2496ED?style=flat-square&logo=docker)
![Status](https://img.shields.io/badge/Status-Draft_for_Review-yellow?style=flat-square)

</div>
# CineMind AI — Backend

A movie/TV discovery assistant with a Retrieval-Augmented Generation (RAG) chat feature,


---

## Tech stack

| Layer | Technology |
|---|---|
| Runtime | Node.js, ES Modules (`"type": "module"`) |
| Framework | Express 5 |
| ORM | Sequelize (schema created via `sequelize.sync()`, no CLI, no migrations) |
| Database | PostgreSQL + pgvector extension |
| Validation | Zod |
| Auth | JWT (access token only, no refresh token), bcrypt |
| Movie data | TMDB API (free tier) |
| AI — embeddings | Google Gemini (`gemini-embedding-001`, 768 dimensions) |
| AI — chat | Google Gemini (`gemini-3.8-flash`, via `GEMINI_MODEL` env var) |
| API docs | Scalar (renders an OpenAPI spec) |
| Containerization | Docker (Postgres + pgvector via `pgvector/pgvector` image) |

---

## Project structure

```
backend/
  docker-compose.yml
  .env / .env.example
  src/
    config/
      database.js        # Sequelize instance, registers pgvector types
    models/
      index.js            # associations
      User.js  UserPreference.js  Genre.js  Movie.js
      Watchlist.js  Favorite.js
    middleware/
      authMiddleware.js  validate.js  errorHandler.js
    schemas/              # Zod schemas per domain
    services/
      authService.js  tmdbService.js  geminiService.js
      retrieverService.js  chatService.js
    controllers/
    routes/
    seeders/
      seedMovies.js        # TMDB seed script
      embedMovies.js        # Gemini embedding script
    app.js
    server.js
```

---

## Setup

### 1. Environment variables

Copy `.env.example` to `.env` and fill in real values:

```dotenv
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=cinemind
DB_USER=cinemind
DB_PASSWORD=cinemind

JWT_ACCESS_SECRET=<random secret, e.g. via `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`>
JWT_EXPIRES_IN=7d

GEMINI_API_KEY=<from Google AI Studio>
GEMINI_MODEL=gemini-3.8-flash

TMDB_API_KEY=<from TMDB account settings>
```

### 2. Start Postgres

```bash
docker compose up -d
```

This runs `pgvector/pgvector:pg16`, matching the `DB_*` values above.

### 3. Install dependencies

```bash
npm install
```

### 4. Start the server (creates the schema)

```bash
npm run dev
```

The server calls `CREATE EXTENSION IF NOT EXISTS vector` and `sequelize.sync()` on startup — **tables are created here, not by a separate migration step.** There are no migrations in this project; see "Scope decisions."

### 5. Seed the catalog (in a separate terminal, with the server still running)

```bash
npm run seed
```

Pulls genres and popular movies/TV shows from TMDB, plus a `isNowPlaying` flag from TMDB's now-playing endpoint. Safe to re-run — uses `findOrCreate` + updates existing rows.

### 6. Generate embeddings

```bash
npm run embed
```

Embeds every movie/TV title with no `embedding` value yet, using Gemini. Safe to re-run — only processes rows where `embedding IS NULL`.

**Order matters after any database reset:** `docker compose down -v && docker compose up -d` → start the server (creates tables) → `npm run seed` → `npm run embed`.

---

## Database schema

7 tables, integer auto-increment primary keys throughout.

| Table | Relationship | Notes |
|---|---|---|
| `users` | — | `username`, `email` (unique), `passwordHash` |
| `user_preferences` | 1-1 with `users` | `favoriteGenres` (string array) only |
| `genres` | — | `tmdbId` (unique), `name` (unique) |
| `movies` | — | `tmdbId`, `title`, `overview`, `posterUrl`, `releaseDate`, `mediaType` (`movie`/`tv_show`), `isNowPlaying`, `embedding` (`vector(768)`) |
| `movie_genres` | N-N join (`movies` ↔ `genres`) | auto-managed by Sequelize `belongsToMany` |
| `watchlists` | 1-N with `users` and `movies` | unique `(userId, movieId)` |
| `favorites` | 1-N with `users` and `movies` | unique `(userId, movieId)` |

This satisfies the three required relationship types (1-1, 1-N, N-N) without needing the `Conversation`/`Message`/`AgentLog` tables from the original spec — those were removed (see below).

---

## API endpoints

All bodies/queries validated with Zod; all list/search endpoints return JSON.

### Auth (`/api/auth`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Create account + empty `UserPreference` row (one transaction), returns a token |
| POST | `/login` | — | Returns a token |
| GET | `/me` | required | Returns the current user |

No `/refresh` or `/logout` endpoint — logout is client-side (delete the token). See "Scope decisions."

### Catalog (`/api/movies`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | — | Paginated list. Query: `page`, `limit`, `genre`, `search`, `mediaType`, `nowPlaying` |
| GET | `/:id` | — | Single title with its genres |

### Watchlist (`/api/watchlist`) and Favorites (`/api/favorites`)
Identical shape, both require auth:
| Method | Path | Description |
|---|---|---|
| GET | `/` | List the user's items (with movie included) |
| POST | `/` | Add `{ "movieId": number }` — 409 if already present |
| DELETE | `/:movieId` | Remove — 404 if not present |

### AI chat (`/api/ai`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/chat` | required | `{ "message": string }` → `{ "reply": string, "sources": [{id, title}] }` |

The endpoint is **stateless**: every request is independent, with no conversation history and no memory of previous messages in the same session.

---

## How the AI chat works

1. The user's message is embedded with Gemini (`gemini-embedding-001`).
2. The top 5 most similar catalog titles are retrieved via pgvector cosine distance (`embedding <=> $vector`), using a parameterized query (no string-concatenated SQL).
3. Those titles (title, type, overview) are injected as context into a single prompt, along with a system prompt that restricts the assistant to the CineMind catalog and instructs it to refuse anything outside that scope or any attempt to reveal the system prompt.
4. Gemini (`gemini-3.8-flash`) generates one plain-text reply from that prompt. No streaming — the full reply is returned in one response.
5. On a `503` (Gemini overloaded), the request is retried up to 3 times with increasing delay before failing. A `429` (quota exceeded) fails immediately with a clear error.

This has been tested to:
- Correctly recommend titles that are actually in the catalog, citing them by name
- Correctly refuse off-catalog questions (e.g. general trivia, directors not in the catalog) rather than inventing an answer

---

## Scope decisions

Several features from the original planning document were cut during development, in favor of a simpler, more reliably defendable project. Each decision and its reasoning:

| Cut feature | Reasoning |
|---|---|
| **Sequelize CLI / versioned migrations** | Replaced with `sequelize.sync()` at startup. Simpler for a project of this size; the trade-off (schema changes require a full DB reset during development) is acceptable here. |
| **Refresh tokens** | Single long-lived access token (`JWT_EXPIRES_IN=7d`) instead. Simpler auth flow and mobile client logic; the trade-off is a stolen token can't be revoked before it expires. |
| **Admin role** | All users are plain users. Removed the `role` column and all admin-only routes/use cases. |
| **`duration` field on Movie** | Would have needed an extra TMDB detail-endpoint call per title; not used anywhere, so dropped. |
| **SSE streaming on `/api/ai/chat`** | Plain request/response instead. Removes significant client and server complexity for a UX nicety. |
| **AI function calling** (model-initiated `search_catalog`, watchlist/favorites actions) | The chat endpoint always pre-injects retrieved context rather than letting the model call functions itself. Simpler to reason about, test, and explain. Watchlist/favorites are managed only through their own normal endpoints/screens, not via chat. |
| **`Conversation` / `Message` persistence** | Chat history is not saved. Each `/api/ai/chat` call is fully independent. No multi-turn context, no reload-on-reopen. |
| **`AgentLog` audit table** | No logging of individual AI calls/actions. |
| **Swagger** | Replaced with Scalar for rendering the OpenAPI spec (spec file itself is unchanged in format). |

---

## What's left

- [ ] Scalar API docs wired up and OpenAPI spec written
- [ ] Postman collection
- [ ] Dockerfile for the backend (multi-stage build)
- [ ] Mobile app (Expo/React Native) — not started
- [ ] Vibe-coding journal / prompt documentation
- [ ] Deployment (Railway/Render)

---

## Scripts

```bash
npm run dev      # start the server with nodemon
npm run seed     # seed genres/movies/TV from TMDB (idempotent)
npm run embed    # generate embeddings for un-embedded titles (idempotent)
npm test         # run Jest tests (if/when added)
```
