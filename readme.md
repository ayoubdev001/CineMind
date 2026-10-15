# CineMind AI

A movie and TV discovery app with an AI assistant. Browse what's playing, search the catalog, save favorites and a watchlist, and ask a chat assistant for recommendations that are grounded in the catalog itself (Retrieval-Augmented Generation).

Built as a final-year exam project. It has two parts:

| Part | Folder | What it is |
|---|---|---|
| Backend | [`backend/`](backend) | REST API (Node.js, Express, PostgreSQL + pgvector) |
| Mobile app | [`mobile/`](mobile) | React Native app (Expo, Expo Router, Zustand) |


## Features

- **Accounts:** register, log in, stay logged in between launches, log out. Expired or invalid sessions send you back to the login screen automatically.
- **Home:** a "Trending Now" row of movies currently in theaters, plus genre rows (Action, Comedy, Sci-Fi, Drama). Pull the list sideways to load more.
- **Search:** debounced title search across movies and TV shows.
- **Movie details:** poster, year, type, genres, and overview.
- **Favorites and watchlist:** one tap on the detail screen. Buttons update instantly (optimistic updates) and roll back if the server refuses.
- **Profile:** your initial, username and email, with Favorites and Watchlist as horizontal rows, each with a "Show all" screen, and Log out.
- **AI assistant:** a floating chat button on Home. Ask for recommendations and get an answer built from real catalog titles, with tappable "sources" that open the movie.

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend runtime | Node.js, ES Modules (`"type": "module"`) |
| Backend framework | Express 5 |
| ORM | Sequelize (schema created with `sequelize.sync()`, no migrations) |
| Database | PostgreSQL 16 + pgvector extension |
| Validation | Zod |
| Auth | JWT (access token only), bcrypt |
| Movie data | TMDB API |
| AI, embeddings | Google Gemini (`gemini-embedding-001`, 768 dimensions) |
| AI, chat replies | DeepSeek chat completions API (called with `fetch`) |
| API docs | Scalar, rendering an OpenAPI spec |
| Containers | Docker Compose (Postgres + pgvector) |
| Mobile | Expo SDK 57, React Native, Expo Router (file-based routing) |
| Mobile state | Zustand |
| Mobile networking | axios (with request and response interceptors) |
| Token storage | `expo-secure-store` |

---

## Architecture

```
┌────────────────────────┐        HTTP / JSON        ┌──────────────────────────┐
│  Mobile app (Expo)     │ ────────────────────────▶ │  Express API             │
│                        │                           │                          │
│  screens               │ ◀──────────────────────── │  routes → validate (Zod) │
│   └─ stores (Zustand)  │                           │   → controllers          │
│       └─ services      │                           │   → services             │
│           └─ axios     │                           └───────┬──────────┬───────┘
└────────────────────────┘                                   │          │
                                                  Sequelize  │          │  HTTPS
                                                             ▼          ▼
                                              ┌─────────────────┐  ┌──────────────────────┐
                                              │ PostgreSQL      │  │ TMDB (seed script)   │
                                              │ + pgvector      │  │ Gemini (embeddings)  │
                                              └─────────────────┘  │ DeepSeek (chat)      │
                                                                   └──────────────────────┘
```

On the mobile side each layer has one job: a **screen** shows things, a **store** holds shared state and decides what happens, a **service** knows the URLs, and **axios** (`api.js`) attaches the token and handles expired sessions.

Design diagrams (class and use-case) are in [`backend/docs/`](backend/docs).

---

## Project structure

```
backend/
  docker-compose.yml
  scalar.yml                 # OpenAPI spec (served at /openapi.yml)
  .env.example
  docs/                      # class and use-case diagrams
  src/
    app.js  server.js
    config/database.js       # Sequelize instance, pgvector types
    constants/systemPrompt.js
    models/                  # User, UserPreference, Genre, Movie, Watchlist, Favorite
    schemas/                 # Zod schemas per domain
    middleware/              # authMiddleware, validate, errorHandler
    routes/  controllers/
    services/
      authService.js  libraryService.js  tmdbService.js
      geminiService.js       # Gemini embeddings + DeepSeek chat call
      airetrieverService.js  # pgvector similarity search
      chatService.js         # RAG: retrieve, build prompt, answer
    seeders/
      seedMovies.js          # TMDB seed
      embedMovies.js         # embedding script

mobile/
  assets/images/icon.png
  src/
    app/                     # Expo Router screens
      _layout.jsx            # root: restores session, guards (auth) vs (app)
      (auth)/                # login.jsx, register.jsx
      (app)/                 # index.jsx (Home), movie/[id].jsx, profile.jsx,
                             # favorites.jsx, watchlist.jsx, search.jsx, chat.jsx
    components/              # Avatar, MovieCard, GenreRow, LibraryRow, LibraryGrid
    services/                # api.js + auth, movie, favorite, watchlist, chat
    store/                   # authStore, moviesStore, favoritesStore, watchlistStore
    utils/getErrorMessage.js
```

---

## Getting started

### Prerequisites

- Node.js 20 or newer
- Docker (for PostgreSQL with pgvector)
- A [TMDB](https://www.themoviedb.org/settings/api) API key (the **v3 "API Key"**, not the long "Read Access Token")
- A [Google AI Studio](https://aistudio.google.com/) API key (embeddings)
- A [DeepSeek](https://platform.deepseek.com/) API key (chat replies)
- A phone with the **Expo Go** app, or an Android/iOS emulator

### 1. Backend

```bash
cd backend
cp .env.example .env        # then fill in the values (see below)
docker compose up -d        # starts Postgres + pgvector
npm install
npm run dev                 # creates the extension and tables, starts the API
```

In a second terminal, with the server's tables created:

```bash
npm run seed                # genres, popular movies/TV, now-playing flags
npm run embed               # embeddings for titles that don't have one yet
```

The API runs on `http://localhost:3000`. Check it:

- Health: `GET /health`
- Interactive docs: `http://localhost:3000/docs`

> **Order matters after a database reset:** `docker compose down -v && docker compose up -d` → `npm run dev` (creates tables) → `npm run seed` → `npm run embed`.

#### Environment variables (`backend/.env`)

```dotenv
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=cinemind
DB_USER=cinemind
DB_PASSWORD=cinemind

JWT_ACCESS_SECRET=<long random string>
JWT_EXPIRES_IN=7d

TMDB_API_KEY=<TMDB v3 API key>

GEMINI_API_KEY=<Google AI Studio key>      # embeddings

DEEPSEEK_API_KEY=<DeepSeek key>            # chat replies
DEEPSEEK_MODEL=<model name, e.g. deepseek-chat>
```

The `DB_*` values match the credentials in `docker-compose.yml`. Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 2. Mobile app

```bash
cd mobile
npm install
```

Open `mobile/src/services/api.js` and set `BASE_URL` to your computer's local IP address, for example:

```js
const BASE_URL = "http://192.168.1.50:3000";
```

- Your phone and your computer must be on the **same Wi-Fi network**.
- Find your IP with `ipconfig` (Windows) or `ifconfig` / `ipconfig getifaddr en0` (macOS).
- On an Android emulator, use `http://10.0.2.2:3000` instead.
- If the app shows "Cannot reach the server", this address (or the backend not running) is almost always the reason.

Start the app and scan the QR code with Expo Go:

```bash
npx expo start
# add -c to clear the Metro cache after adding images or changing config
```

---

## API overview

Everything is validated with Zod and returns JSON. Errors have the shape `{ "error": "message" }`, except validation failures (`422`), which return `{ "errors": [{ "field", "message" }] }`. The full specification, with request and response schemas, is in `scalar.yml` and rendered at `/docs`.

### Auth (`/api/auth`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | no | Create an account (`username` 3-30 chars, `email`, `password` min 8) and an empty `UserPreference` row in one transaction. Returns `{ user, token }`. `409` if the email exists. |
| POST | `/login` | no | Returns `{ user, token }`. `401` for wrong credentials. |
| GET | `/me` | yes | Returns `{ user }`. |

There is no `/refresh` or `/logout` endpoint. Logging out deletes the token on the client.

### Catalog (`/api/movies`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | no | Paginated list, newest release first. Query: `page`, `limit` (max 50), `genre`, `search` (case-insensitive title match), `mediaType` (`movie` or `tv_show`), `nowPlaying`. Returns `{ data, pagination }`. |
| GET | `/:id` | no | One title with its genres. |

> `nowPlaying` is parsed with `z.coerce.boolean()`, which turns the text `"false"` into `true`. Send `nowPlaying=true` or leave the parameter out. Never send `false`.

### Favorites and watchlist (`/api/favorites`, `/api/watchlist`)

Identical shape, both require a token.

| Method | Path | Description |
|---|---|---|
| GET | `/` | The user's items, each with its movie included, newest first. |
| POST | `/` | Add `{ "movieId": number }`. `409` if already present. The reply does **not** include the movie. |
| DELETE | `/:movieId` | Remove. `204` on success, `404` if not present. |

### AI chat (`/api/ai`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/chat` | yes | `{ "message": string }` (1-2000 chars) → `{ "reply": string, "sources": [{ "id", "title" }] }`. `429` if the AI quota is exceeded, `503` if the AI service is busy. |

The endpoint is **stateless**: every request is independent, with no conversation history.

---

## How the AI chat works

1. The user's message is embedded with Gemini (`gemini-embedding-001`, 768 dimensions).
2. The five most similar catalog titles are retrieved with pgvector cosine distance (`embedding <=> $vector`). Only titles closer than a similarity threshold of `0.75` are kept. The query is parameterized (no string-concatenated SQL).
3. The retrieved titles (name, type, overview) are placed into one prompt together with a system prompt that restricts the assistant to the CineMind catalog, treats retrieved text as data rather than instructions, and tells it to refuse off-topic requests and attempts to reveal the prompt.
4. DeepSeek generates one plain-text reply. There is no streaming; the full reply comes back in one response.
5. On a `503`, the request is retried up to three times with increasing delay. A `429` fails immediately with a clear error.
6. The response includes the titles that were retrieved as `sources`, which the mobile app shows as tappable chips.

If nothing in the catalog is close enough to the question, the assistant is given no context and, following its instructions, says it doesn't know instead of inventing an answer.

---

## Database schema

Seven tables, integer auto-increment primary keys throughout.

| Table | Relationship | Notes |
|---|---|---|
| `users` | | `username`, `email` (unique), `passwordHash` |
| `user_preferences` | 1-1 with `users` | `favoriteGenres` (string array) |
| `genres` | | `tmdbId` (unique), `name` (unique) |
| `movies` | | `tmdbId`, `title`, `overview`, `posterUrl` (full image URL), `releaseDate`, `mediaType` (`movie` / `tv_show`), `isNowPlaying`, `embedding` (`vector(768)`) |
| `movie_genres` | N-N between `movies` and `genres` | managed by Sequelize `belongsToMany` |
| `watchlists` | 1-N with `users` and `movies` | unique `(userId, movieId)` |
| `favorites` | 1-N with `users` and `movies` | unique `(userId, movieId)` |

This covers the three required relationship types (1-1, 1-N, N-N).

> `sequelize.sync()` only creates tables that are missing; it never alters existing ones. If you add a column to a model you must add it to the database yourself (for example with `ALTER TABLE`) or reset the database.

---

## Mobile app

### Screens

| Route | Screen |
|---|---|
| `(auth)/login`, `(auth)/register` | Login and registration, with validation, loading state, and server error messages |
| `(app)/index` | Home: header (profile circle, logo), Trending Now, genre rows, search icon, floating AI button |
| `(app)/movie/[id]` | Movie details with favorite and watchlist buttons |
| `(app)/profile` | User info, Favorites and Watchlist rows, Log out |
| `(app)/favorites`, `(app)/watchlist` | Full two-column grids ("Show all") |
| `(app)/search` | Debounced title search |
| `(app)/chat` | AI assistant conversation |

### How the pieces fit

- **Session handling.** The root layout calls `restoreSession()` at launch (reads the token from SecureStore and validates it with `/api/auth/me`), shows a spinner while it checks, and then uses `Stack.Protected` guards to show either the `(auth)` or the `(app)` screens. Logging in or out only changes `user` in the store, and the guards do the navigation.
- **Expired tokens.** An axios response interceptor catches any `401` on a request that carried a token and logs the user out through a registered callback (so `api.js` never imports the store, which avoids a circular import).
- **Optimistic updates.** Favorites and watchlist toggles update the list immediately, send the request in the background, and undo that single change if the server refuses. A per-movie in-flight guard ignores repeated taps, and a `409` on add or `404` on remove is treated as success.
- **Shared lists.** Favorites and watchlist are loaded once after login and cleared on logout, so every screen reads the same data.
- **Pagination.** Lists load page by page (`onEndReached`), with guards against duplicate or out-of-range requests. A stable secondary sort (`id`) on the server keeps pages from overlapping.
- **Search.** Typing is debounced by 400 ms, and responses to outdated queries are ignored.
- **Errors.** One helper (`utils/getErrorMessage.js`) turns any axios error into a readable message and tells apart "the server answered with an error" from "the server could not be reached".

---

## Scope decisions

Several features from the original planning document were cut in favor of a simpler, more reliably defendable project.

| Cut feature | Reasoning |
|---|---|
| **Sequelize CLI / versioned migrations** | Replaced with `sequelize.sync()` at startup. Simpler for a project of this size; schema changes on an existing database are done by hand or with a reset. |
| **Refresh tokens** | One access token (`JWT_EXPIRES_IN=7d`). Simpler auth flow and client logic; the trade-off is that a stolen token can't be revoked before it expires. |
| **Admin role** | All users are plain users. Removed the `role` column and all admin-only routes. |
| **`duration` field on Movie** | Needed an extra TMDB call per title and was not used anywhere. |
| **SSE streaming on `/api/ai/chat`** | Plain request/response instead. Removes significant client and server complexity for a UX nicety. |
| **AI function calling** | The chat always pre-injects retrieved context instead of letting the model call functions. Simpler to reason about, test, and explain. Favorites and watchlist are managed only through their own endpoints and screens. |
| **Conversation / Message persistence** | Chat history is not saved, and the AI has no memory of earlier messages. Each question must stand on its own. |
| **`AgentLog` audit table** | No logging of individual AI calls. |
| **Swagger** | Replaced with Scalar, rendering the same OpenAPI format. |
| **Popularity ranking and an "Upcoming" row** | The database stores no popularity score and no upcoming flag, so Home shows Now Playing instead of Popular and Upcoming. |
| **Bottom tabs** | Navigation is a single stack with a floating AI button and a profile screen, for a cleaner interface. |

---

## Known limitations

- **Search matches titles only**, not descriptions or actors. For "something about space", use the AI chat, which searches by meaning.
- **The AI is stateless.** Follow-up questions such as "tell me more about the second one" don't work.
- **Genre rows on Home** request `popular=true`, which the API does not implement (unknown query parameters are ignored), so those rows are ordered by newest release date rather than by popularity.
- **Now-playing titles come from the popular lists.** The seed flags a title as now playing only if it is already in the database, so titles that are in theaters but not in TMDB's popular lists are skipped.
- **`BASE_URL` is hardcoded** in `mobile/src/services/api.js` and has to be changed whenever your computer's IP changes.
- **App icon and splash assets are incomplete.** `app.json` points to several images under `mobile/assets/images/` that are not in the repository (only `icon.png` is). Expo prints warnings, but the app runs.
- **Tokens can't be revoked** before they expire (see Scope decisions).

---

## Scripts

Backend (`backend/`):

```bash
npm run dev      # start the API with nodemon
npm run seed     # seed genres, movies and TV from TMDB (safe to re-run)
npm run embed    # embed titles that have no embedding yet (safe to re-run)
npm test         # Jest (if tests are added)
```

Mobile (`mobile/`):

```bash
npm start        # Expo dev server (npx expo start -c clears the cache)
npm run android  # open on an Android device or emulator
npm run ios      # open on an iOS simulator
npm run lint
```

---

## Remaining work

- [ ] Postman collection
- [ ] Backend Dockerfile (multi-stage build)
- [ ] Deployment (Railway or Render)
- [ ] Vibe-coding journal / prompt documentation
- [ ] Final app icon and splash screen assets
