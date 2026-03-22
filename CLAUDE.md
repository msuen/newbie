# Newbie — Music Discovery Roadmaps

## Project Summary
A mobile-first web app that generates step-by-step music discovery roadmaps using AI. Built with Vue 3 + Vite (client) and Express + SQLite (server) in a pnpm monorepo.

## Current State
- Full MVP is implemented (client + server)
- Railway deployment config exists (`railway.toml`, `nixpacks.toml`)
- Branch: `claude/music-discovery-roadmap-Uuli9`
- No `main` branch — this is the only branch

## Next Steps
- **Deploy to Railway** using Railway MCP tools:
  1. Check Railway CLI status (`check-railway-status`)
  2. Create a project and link it (`create-project-and-link`) if not already linked
  3. Set the `ANTHROPIC_API_KEY` env var via `set-variables`
  4. Deploy (`deploy` with `workspacePath: /home/user/newbie`)
  5. Generate a public domain (`generate-domain`)

## Key Files
- `railway.toml` — Railway deploy config (build: `pnpm install && pnpm build`, start: `node packages/server/dist/index.js`)
- `packages/client/` — Vue 3 SPA
- `packages/server/` — Express API (needs `ANTHROPIC_API_KEY` env var)
- `packages/server/.env.example` — env template

## Tech Stack
- Frontend: Vue 3 + Vite + TypeScript + Pinia + UnoCSS
- Backend: Express + TypeScript + better-sqlite3
- AI: Claude API (Sonnet for roadmaps, Haiku for explainers)
- Music: Spotify embeds (no API key required)
- PWA: Installable, offline-capable
