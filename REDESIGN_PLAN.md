# Sortify Redesign — Implementation Plan

## Overview

Full frontend rewrite from raw Flask/Jinja templates to a modern SSR framework, implementing the new mono/dithered design system from the Claude Design prototypes. Backend refactored into a clean REST API. All existing features preserved.

---

## 1. Tech Stack

### Frontend: Next.js 15 (App Router)

**Why Next.js:**
- Server-side rendering (SSR) and static generation (SSG) out of the box — best-in-class SEO
- App Router with React Server Components: the landing page, FAQ, "how it works" sections render on the server with zero client JS
- Client Components only where needed (canvas dithering, WebSocket progress, genre picker)
- Built-in `<head>` management via `metadata` API (title, description, Open Graph, etc.)
- Route handlers for API proxying to the Python backend
- Middleware for auth cookie checks and redirects
- i18n support via `next-intl` (replaces Flask-Babel)

### Backend: FastAPI (replaces Flask)

**Why migrate from Flask:**
- The current Flask app mixes rendering and business logic — we're splitting those concerns
- FastAPI gives native async support (better for concurrent Spotify API calls and Last.fm scraping)
- Pydantic models for request/response validation
- WebSocket support built-in (replaces Flask-SocketIO)
- Auto-generated OpenAPI docs

### Database: SQLite → SQLite (via SQLAlchemy)

Keep SQLite for tag caching (it's appropriate for this scale), but add a proper ORM layer and connection pooling instead of raw `sqlite3.connect()` on every call.

### Session Management: Redis or signed cookies

Replace the in-memory `users_by_id` / `users_by_session` dicts (which lose all sessions on restart) with either:
- **Option A (simple):** Signed JWT cookies storing the Spotify tokens (encrypted), stateless
- **Option B (robust):** Redis for session storage — survives restarts, supports concurrent workers

Recommendation: **Option A** for now — fewer moving parts, and token refresh already works.

---

## 2. Design System Tokens

Extracted from the Claude Design prototypes (`styles.css`):

```
Colors:
  --bg:            #0a0a0a
  --bg-1:          #111111
  --bg-2:          #161616
  --fg:            #f4f2ed
  --fg-dim:        rgba(244, 242, 237, 0.62)
  --fg-mute:       rgba(244, 242, 237, 0.38)
  --fg-faint:      rgba(244, 242, 237, 0.14)
  --border:        rgba(244, 242, 237, 0.10)
  --border-strong: rgba(244, 242, 237, 0.22)
  --accent:        #ff5a1f  (hot orange, unified across all pages)

Typography:
  Font:    JetBrains Mono (300, 400, 500, 600)
  Base:    14px / 1.5
  Display: clamp(44px, 7.2vw, 104px), weight 500, tracking -0.035em
  Section: clamp(28px, 4.2vw, 52px), weight 500, tracking -0.02em
  Caps:    10-11px, uppercase, tracking 0.14-0.18em

Spacing:
  Container: 1280px max
  Padding:   clamp(20px, 4vw, 40px)

Components:
  Buttons:     pill (border-radius: 999px), 11px caps, 10px 18px padding
  Borders:     1px solid, dashed for dividers
  Cards:       1px border grid cells, hover → bg-1
  Chips/pills: 10px caps, 5px 10px padding, border-radius 999px
```

---

## 3. Project Structure

```
Sortify/
├── frontend/                    # Next.js app
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx            # Root layout (nav, font loading, metadata)
│   │   │   ├── page.tsx              # Landing page (SSR — SEO critical)
│   │   │   ├── [lng]/page.tsx        # Localized landing
│   │   │   ├── dashboard/page.tsx    # Dashboard (client-heavy)
│   │   │   ├── sort/[id]/page.tsx    # Loading/analysis screen
│   │   │   ├── create/[id]/page.tsx  # Genre picker + playlist creation
│   │   │   ├── finish/[id]/page.tsx  # Done screen
│   │   │   ├── error.tsx             # Error boundary
│   │   │   └── not-found.tsx         # 404
│   │   ├── components/
│   │   │   ├── ui/                   # Design system primitives
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Chip.tsx
│   │   │   │   ├── Nav.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── SectionHead.tsx
│   │   │   │   ├── SearchInput.tsx
│   │   │   │   └── ProgressBar.tsx
│   │   │   ├── dither/              # Canvas dither system
│   │   │   │   ├── DitherCanvas.tsx  # Wrapper component
│   │   │   │   ├── dither.ts         # Bayer matrix + paint functions (wave, sphere, linear, soundwave, cover patterns)
│   │   │   │   └── useDither.ts      # Hook for animated canvases
│   │   │   ├── landing/             # Landing page sections
│   │   │   │   ├── Hero.tsx
│   │   │   │   ├── HowItWorks.tsx
│   │   │   │   ├── Demo.tsx          # Client component — interactive sort demo
│   │   │   │   ├── Stats.tsx         # Client component — animated counters
│   │   │   │   ├── GenreGrid.tsx
│   │   │   │   ├── FAQ.tsx
│   │   │   │   └── OpenSourceCTA.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── PlaylistGrid.tsx
│   │   │   │   ├── PlaylistCard.tsx
│   │   │   │   ├── DashboardToolbar.tsx
│   │   │   │   └── FilterPills.tsx
│   │   │   ├── sort/
│   │   │   │   ├── LoadingStage.tsx   # Full-screen loader with orb animation
│   │   │   │   ├── Ticker.tsx         # Scrolling "now analysing" track name
│   │   │   │   └── ProgressFooter.tsx
│   │   │   ├── create/
│   │   │   │   ├── GenreSelector.tsx
│   │   │   │   ├── PlaylistNameInput.tsx
│   │   │   │   └── SummaryPane.tsx
│   │   │   └── finish/
│   │   │       ├── DoneCard.tsx
│   │   │       └── DoneStats.tsx
│   │   ├── lib/
│   │   │   ├── api.ts               # Fetch helpers for backend endpoints
│   │   │   ├── spotify-auth.ts      # OAuth URL builder, token helpers
│   │   │   └── i18n.ts              # next-intl config
│   │   └── styles/
│   │       ├── globals.css           # CSS custom properties, reset, base styles
│   │       └── tokens.ts            # Exported JS constants matching CSS vars
│   ├── public/
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   ├── messages/                    # i18n translation JSON files
│   │   ├── en.json
│   │   ├── fr.json
│   │   ├── de.json
│   │   └── ...                      # (migrate existing .po files)
│   ├── next.config.ts
│   ├── tailwind.config.ts           # NOT using Tailwind — raw CSS matching prototypes
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                         # FastAPI app
│   ├── app/
│   │   ├── main.py                  # FastAPI app, CORS, middleware
│   │   ├── config.py                # Env vars, settings
│   │   ├── auth/
│   │   │   ├── router.py            # /auth/spotify/callback, /auth/logout
│   │   │   ├── session.py           # JWT cookie encode/decode
│   │   │   └── spotify_oauth.py     # Token exchange, refresh
│   │   ├── playlists/
│   │   │   ├── router.py            # /api/playlists, /api/playlists/{id}/sort
│   │   │   └── spotify_client.py    # Spotify API calls (get playlists, tracks, create)
│   │   ├── sorting/
│   │   │   ├── router.py            # WebSocket endpoint /ws/sort/{id}
│   │   │   ├── scraper.py           # Last.fm scraping logic (async with httpx)
│   │   │   └── tag_cache.py         # SQLAlchemy tag model + queries
│   │   ├── db/
│   │   │   ├── database.py          # SQLAlchemy engine + session
│   │   │   ├── models.py            # Tag table model
│   │   │   └── tags_database.db     # SQLite file (migrated)
│   │   └── ws/
│   │       └── manager.py           # WebSocket connection manager
│   ├── requirements.txt
│   └── run.py                       # Uvicorn entry point
│
├── docker-compose.yml               # Frontend + backend services
├── .env.example
└── README.md
```

---

## 4. Pages — Feature Mapping

### 4.1 Landing Page (`/`)

**Design source:** `Sortify Landing.html`

**Server-rendered (SSR) for SEO.** This is the money page for search engines.

| Section | Render | Notes |
|---------|--------|-------|
| Nav | Server | Sticky, blurred backdrop, brand SVG + links |
| Hero | Client | Animated dithered soundwave canvas, title with `.lo` span in accent, blinking cursor, CTA buttons |
| How It Works | Server | 3-step grid with dithered linear gradient canvases (client hydrated for canvas paint) |
| Demo | Client | Interactive sort demo with track list, genre chips, progress bar |
| Stats | Client | Animated counter on scroll (IntersectionObserver) |
| Genre Grid | Server + Client | 18-cell grid, dithered mini canvases |
| FAQ | Client | Accordion expand/collapse |
| Open Source CTA | Server + Client | Dithered canvas background |
| Footer | Server | 4-column grid, links, credits |

**SEO metadata:**
```tsx
export const metadata = {
  title: "sortify — sort your Spotify playlists by genre",
  description: "Free, open-source utility that reads your Spotify playlists, detects genres via Last.fm tags, and splits them into clean new playlists. No signup, no ads.",
  openGraph: { ... },
}
```

**i18n:** Server component reads locale from URL param or Accept-Language header, passes to `next-intl`.

### 4.2 Dashboard (`/dashboard`)

**Design source:** `Sortify Dashboard.html`

**Client-heavy.** Auth-gated — redirect to `/` if no session cookie.

| Feature | Implementation |
|---------|---------------|
| Header | "Dashboard." title with accent `.lo`, subtitle, user info + logout button |
| Toolbar | Shown count, filter pills (All / Owned / Spotify / Blend), search with ⌘K shortcut |
| Playlist grid | 5-col responsive grid, each card has dithered cover canvas, tag, name, track count, owner |
| Hover state | "Sort →" overlay on card hover |
| Pagination | Next/prev via Spotify API offset (existing feature) |
| Refresh | Re-fetch playlists from Spotify |

**Data flow:**
1. Page loads → Next.js middleware checks session cookie
2. Client component calls `GET /api/playlists` → backend fetches from Spotify API
3. Filter/search is client-side on the fetched list
4. Click card → navigate to `/sort/{playlist_id}`

### 4.3 Loading/Sort Screen (`/sort/[id]`)

**Design source:** `Sortify Loading.html`

**Full-screen, client-only.** No SEO value.

| Feature | Implementation |
|---------|---------------|
| Header bar | Process label, brand, source playlist name |
| Central stage | Left: phase label, "Loading" title with cursor blink, description, ticker | Right: full animated dithered orb canvas (concentric rings + audio spectrum + wisps + scanline) |
| Ticker | Scrolling track name + artist + genre tag, transition animation |
| Progress footer | Elapsed timer, progress bar with 20 ticks, ETA, percentage |
| Corner crosshairs | Decorative absolute-positioned borders |

**Data flow:**
1. Page loads → opens WebSocket to `ws://backend/ws/sort/{playlist_id}`
2. Backend starts scraping in background (async tasks, not threads)
3. WebSocket messages: `{type: "start", total}`, `{type: "progress", current, track, genre}`, `{type: "finish"}`
4. On finish → redirect to `/create/{playlist_id}`

### 4.4 Genre Picker (`/create/[id]`)

**Design source:** `Sortify Pick Genres.html`

**Client-heavy.** Interactive genre selection.

| Feature | Implementation |
|---------|---------------|
| Header | "Last step." title, source playlist info |
| Toolbar | Selected count, filter pills (All / Popular / Selected), Select All, Clear, search |
| Genre grid | 4-col scrollable grid, each cell: name + count + checkbox, click to toggle, `.on` state with accent fill |
| Playlist name pane | Auto-generated name from selection, editable input (60 char max), suggested names |
| Summary pane | Genre count, track count, estimated runtime, estimated size, genre chips |
| CTA | "Back to dashboard" link, "Create playlist" button (disabled until ≥1 genre + name) |

**Data flow:**
1. Genres come from the sort result (stored in backend session or passed via API)
2. `POST /api/playlists/{id}/create` with `{name, genres}` → backend creates playlist on Spotify
3. On success → redirect to `/finish/{playlist_id}`

### 4.5 Done Screen (`/finish/[id]`)

**Design source:** `Sortify Done.html`

**Client-rendered.** Animated completion screen.

| Feature | Implementation |
|---------|---------------|
| Header | Process label, "0 · success" status with pulsing dot, duration |
| Left panel | "It's done." title with accent `.lo`, description, stats (tracks, genres, runtime, written time), genre chips |
| Center card | Animated dithered cover canvas + radiating halo canvas, playlist name, track count, "Open in Spotify" link |
| Right panel | "Next" phase label, description, action buttons (Return to dashboard, Sort another, Share) |
| Footer | Written-to target, keyboard shortcut tips (D, R) |
| Corner decorations | Same as loading screen |

**Data flow:**
1. Playlist info comes from the create response (stored in session/state)
2. "Open in Spotify" links to `external_urls.spotify` from the API response
3. Keyboard shortcuts for quick navigation

### 4.6 Error / 404

Simple pages using the design system. Server-rendered.

---

## 5. Backend API Endpoints

```
Auth:
  GET  /auth/spotify/url              → Returns OAuth URL
  GET  /auth/spotify/callback?code=   → Exchanges code, sets session cookie, redirects
  POST /auth/logout                   → Clears session cookie

Playlists:
  GET  /api/playlists                 → User's playlists (proxies Spotify API)
  GET  /api/playlists?offset=50       → Pagination

Sorting:
  POST /api/sort/{playlist_id}/start  → Kicks off tag scraping
  WS   /ws/sort/{playlist_id}         → Real-time progress updates
  GET  /api/sort/{playlist_id}/result → Returns sorted genres + track counts

Creation:
  POST /api/playlists/{playlist_id}/create  → Body: {name, genres[]}
       → Creates playlist on Spotify, returns playlist info

User:
  GET  /api/me                        → Current user info (for dashboard header)
```

---

## 6. Implementation Phases

### Phase 1: Project Scaffolding
- [ ] Initialize Next.js project in `frontend/`
- [ ] Set up CSS custom properties and base styles from design tokens
- [ ] Port `dither.ts` (Bayer matrix + all paint functions) as a client-side module
- [ ] Create `DitherCanvas` React component with resize handling
- [ ] Build UI primitives: Button, Chip, Nav, Footer, SectionHead
- [ ] Set up FastAPI project in `backend/`
- [ ] Migrate Spotify OAuth to FastAPI + JWT session cookies
- [ ] Set up SQLAlchemy for tag caching

### Phase 2: Landing Page
- [ ] Build all landing page sections as Server + Client components
- [ ] Animated soundwave hero with `useDither` hook
- [ ] Interactive demo section (client component)
- [ ] Scroll-reveal animations (IntersectionObserver)
- [ ] Animated stat counters
- [ ] FAQ accordion
- [ ] Full SEO metadata + Open Graph tags
- [ ] `robots.txt` + `sitemap.xml`

### Phase 3: Auth Flow + Dashboard
- [ ] Spotify OAuth redirect/callback via Next.js middleware + backend
- [ ] Dashboard page with playlist grid
- [ ] Dithered cover generation per card (6 patterns: radial, linear, sphere, wave, rings, grid)
- [ ] Client-side filtering (All / Owned / Spotify / Blend) and search
- [ ] Pagination (next/prev via Spotify offset)
- [ ] Responsive grid (5 → 4 → 3 → 2 columns)

### Phase 4: Sort Flow
- [ ] Loading screen with animated dithered orb
- [ ] WebSocket connection to backend for real-time progress
- [ ] Track ticker with slide animation
- [ ] Progress bar + elapsed/ETA timers
- [ ] Phase label transitions
- [ ] Auto-redirect on completion

### Phase 5: Genre Picker + Playlist Creation
- [ ] Genre grid with toggle selection
- [ ] Filter, search, select-all, clear
- [ ] Auto-generated playlist name from selection
- [ ] Summary pane with live stats
- [ ] Create playlist API call
- [ ] Redirect to done screen

### Phase 6: Done Screen
- [ ] Animated dithered cover + halo canvases
- [ ] Playlist card with stats
- [ ] "Open in Spotify" link
- [ ] Navigation actions
- [ ] Keyboard shortcuts

### Phase 7: i18n + Polish
- [ ] Migrate `.po` translation files to JSON format for `next-intl`
- [ ] Locale-based routing (`/fr`, `/de`, etc.)
- [ ] Error pages (404, generic error) in design system
- [ ] Loading states and skeleton screens
- [ ] Mobile responsive testing across all pages
- [ ] Lighthouse audit (SEO, performance, accessibility)

### Phase 8: Backend Hardening
- [ ] Replace in-memory sessions with JWT cookies
- [ ] Replace threading with async (httpx for HTTP, asyncio for concurrency)
- [ ] Add proper error handling (no bare `except:`)
- [ ] Fix existing bugs (operator precedence, timeout logic, add_tags range)
- [ ] Add rate limiting for Last.fm scraping
- [ ] Cookie security flags (httponly, secure, samesite)
- [ ] Docker setup for both services

---

## 7. Key Technical Decisions

### Canvas Dithering in React
The `dither.js` from the prototypes uses a global `paintDither()` function. We'll port it to a TypeScript module exporting individual paint functions, wrapped in a `DitherCanvas` React component that handles:
- Canvas ref management
- Resize observer for responsive redrawing
- `requestAnimationFrame` loop for animated variants (soundwave, orb)
- Cleanup on unmount

### WebSocket vs Server-Sent Events
The current app uses Socket.IO (WebSocket). Since we're going SSR-first and the communication is mostly server→client (progress updates), **Server-Sent Events (SSE)** would be simpler and work better with SSR. However, the client also sends a `wait_for_sort` event, so we'll keep **WebSocket** but use native WS (FastAPI's `WebSocket` class) instead of Socket.IO.

### Real Spotify Art vs Dithered Covers
The prototypes use procedural dithered patterns as playlist covers. In production, we should:
1. Fetch real cover art from Spotify API
2. Fall back to dithered patterns when no cover exists
3. Optionally: dither the real cover art for the aesthetic (stretch goal)

### CSS Approach
No Tailwind, no CSS-in-JS. Plain CSS with custom properties, matching the prototype's `styles.css` structure. CSS modules for component scoping where needed. The design is highly specific — utility classes would fight it.

---

## 8. Migration Strategy

1. Build the new frontend alongside the existing code (in `frontend/` and `backend/` dirs)
2. The existing Flask app in `Server/` stays untouched until the new backend is ready
3. Test each page against the prototypes visually
4. Switch over once all pages are functional
5. Remove the old `Server/` directory

---

## 9. Files from Claude Design to Reference

| Prototype File | Target Page | Key Elements |
|---|---|---|
| `Sortify Landing.html` | `/` | Hero, how-it-works, demo, stats, genres, FAQ, footer |
| `Sortify Dashboard.html` | `/dashboard` | Playlist grid, filters, search, dithered covers |
| `Sortify Loading.html` | `/sort/[id]` | Animated orb, ticker, progress bar |
| `Sortify Pick Genres.html` | `/create/[id]` | Genre grid, naming, summary |
| `Sortify Done.html` | `/finish/[id]` | Completion card, animated cover, actions |
| `styles.css` | Global styles | Full design system tokens and component styles |
| `dither.js` | `dither.ts` | Bayer matrix, wave, sphere, linear, soundwave, cover patterns |

All prototype files are preserved in `/tmp/sortify-design/sortify/project/` for reference during implementation.
