# Gym Log

A free, personal gym tracker: log your sessions, and when you say which muscle
group(s) you're training today, get exercise suggestions pulled from a real
exercise database — not a hardcoded list.

Built from `3-gym-tracker-app.md`. Zero-cost, zero-backend: everything runs
client-side and is installable as an offline PWA.

## Stack

- **Vite + React + TypeScript**
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **react-router-dom** (`HashRouter`, so it deep-links correctly on any static host with no server config)
- **localStorage** for your split and session history — nothing leaves your device
- **[free-exercise-db](https://github.com/yuhonas/free-exercise-db)** (`src/data/exercises.json`, Unlicense) bundled locally as the exercise reference data — 876 exercises with muscles, equipment, and instructions
- **vite-plugin-pwa** for offline install

## Features

- **Split setup** — define your own training split (presets for Push/Pull/Legs, Upper/Lower, Bro Split, or fully custom), picking which muscle groups each day targets
- **Today** — see today's split day (or start freestyle), resume an in-progress session
- **Exercise picker** — filtered by target muscle group + equipment, with search and expandable instructions
- **Session logging** — add exercises, log sets (weight × reps), see last time's numbers with a one-tap "Repeat"
- **History** — consistency stats (total / last 7 days / last 30 days) and a list of past sessions
- **Per-exercise history** — best weight logged and every past set for a given exercise, across sessions

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

`npm run build` produces a static `dist/` folder (including the PWA service
worker and manifest) that can be deployed to any static host — e.g. GitHub
Pages, Netlify, Cloudflare Pages — at zero cost.

## Not yet built (v2 ideas from the spec)

- Progressive-overload suggestions
- Weekly volume-per-muscle-group totals
- Bodyweight tracking
