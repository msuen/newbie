# Newbie — Music Discovery Roadmaps

A mobile-first web app that generates step-by-step music discovery roadmaps. Enter an artist or genre, and Newbie creates a guided journey from foundational works through deeper cuts, with beginner-friendly explainers and streaming previews.

## Tech Stack

- **Frontend**: Vue 3 + Vite + TypeScript + Pinia + UnoCSS
- **Backend**: Express + TypeScript + better-sqlite3
- **AI**: Claude API (Sonnet for roadmaps, Haiku for explainers)
- **Music**: Spotify embeds (no API key required)
- **PWA**: Installable, offline-capable via vite-plugin-pwa

## Setup

```bash
# Install dependencies
pnpm install

# Configure environment
cp packages/server/.env.example packages/server/.env
# Edit .env and add your ANTHROPIC_API_KEY

# Run both client and server
pnpm dev
```

The client runs on `http://localhost:5173` and proxies API requests to the server on port 3001.

## Project Structure

```
packages/
  client/          # Vue 3 SPA
    src/
      views/       # Route-level pages (Home, Roadmap, StepDetail, Explainer, Profile)
      components/  # SearchBar, SpotifyEmbed, LoadingSkeleton
      stores/      # Pinia stores (roadmap, auth)
      api/         # API client
  server/          # Express API
    src/
      routes/      # REST endpoints (roadmaps, explainers, progress, favorites, auth)
      services/    # Claude API integration, Spotify enrichment
      db/          # SQLite schema
      middleware/  # JWT auth (optional)
```

## Features

- AI-generated roadmaps with 4-6 chronological steps
- On-demand explainers with critic quotes and "listen for" tips
- Spotify embed previews (lazy-loaded)
- Progress tracking (works without account via localStorage)
- Share roadmaps via short links + Web Share API
- Optional accounts for cross-device sync
- Installable PWA with offline support for cached roadmaps
