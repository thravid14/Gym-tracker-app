# Spec: Personal Gym Log + Split-Based Exercise Suggester

## Priority: 3

## Core idea
A free, personal version of apps like Hevy/Strong: log your gym sessions, and when you tell it which muscle group(s) you're training that day (your split — e.g. "push day," "legs," "back and biceps"), it suggests exercises targeting those muscles, pulled from a real exercise database rather than a hardcoded list.

## Core features (MVP)
1. **Split setup** — define your own split once (e.g. Push/Pull/Legs, or Bro Split — chest/back/shoulders/arms/legs, whatever you actually run), so the app knows what "today" means.
2. **Exercise suggestions by muscle group** — pick today's target muscle(s), get a filtered list of exercises (with equipment, primary/secondary muscles, and instructions) to build today's session from.
3. **Session logging** — log sets/reps/weight per exercise, per session, with a timestamp.
4. **History per exercise** — see your last few sessions for a given exercise (weight/reps progression) so you know what to aim to beat.
5. **Session history/calendar** — see gym visits over time (basically a consistency log, not just a lifting log).

### Nice-to-haves (v2, not MVP)
Progressive-overload suggestions ("you did 3x8 @ 60kg last time, try 62.5kg"), volume-per-muscle-group weekly totals, body-weight tracking.

## Exercise database options

### Option A — free-exercise-db (recommended)
A public-domain (Unlicense — genuinely no restrictions) dataset of 800+ exercises as a single static JSON file. Each exercise includes name, primary/secondary muscles, equipment, category, difficulty level, and step-by-step instructions, plus images. No API key, no server, no rate limit — you just fetch or bundle the JSON file directly into your app.
- Data file: `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json`
- [free-exercise-db on GitHub](https://github.com/yuhonas/free-exercise-db)

This is the obvious choice for a personal, zero-cost app: bundle the JSON locally (or cache it once), filter client-side by `primaryMuscles`/`secondaryMuscles`, done. No ongoing dependency at all.

### Option B — wger's public API
[wger](https://github.com/wger-project/wger) is a full open-source fitness tracker (workout logging, nutrition, exercise database) that you can either self-host or hit via their public instance's API, which also has a categorized exercise database with muscle-group data. It's a heavier option — genuinely a full app already exists here — worth a look if you'd rather not build the logging half yourself at all, but self-hosting adds server cost/maintenance, which cuts against "zero cost, low effort." Mentioned for completeness; not the recommended path given you want to build this yourself.

**Recommendation**: free-exercise-db for the exercise/muscle-group data, and build the actual logging (sets/reps/history) yourself — that part is simple CRUD against your own storage and is really the part that makes it *your* tracker.

## Data model (rough)
- `Exercise` (from free-exercise-db, read-only reference data): id, name, primaryMuscles[], secondaryMuscles[], equipment, category, instructions
- `Split`: name, days[] (each day: label, targetMuscleGroups[])
- `WorkoutSession`: id, date, splitDayLabel, exercisesLogged[]
- `LoggedExercise`: exerciseId, sets[] (each: reps, weight, optional RPE/notes)

## Screens
1. Today — shows which split day it is (or let you pick), button into exercise suggestions
2. Exercise picker — filtered by target muscle group(s), search/filter by equipment available
3. Active session log — add sets/reps/weight per exercise as you go, quick "repeat last session's numbers" button
4. History — per-exercise progression chart/list, and a calendar/list of past sessions
5. Split setup — define/edit your split once

## Build phases
1. **Phase 1**: Bundle free-exercise-db, build the muscle-group filter/suggestion screen. Usable as a pure "what should I do today" tool even before logging exists.
2. **Phase 2**: Session logging (sets/reps/weight) and local storage of history.
3. **Phase 3**: Per-exercise history view and split setup/editing.
4. **Phase 4**: PWA polish — this is the app you'll open mid-workout, so a fast, offline-capable install matters more here than in the others; since the exercise data is bundled locally, this one *can* work fully offline (unlike the Spanish app).

## Cost summary
- Exercise database: **$0** (static public-domain JSON, no key, no server)
- Storage: **$0** (localStorage/IndexedDB; optional free Supabase project if you want cross-device sync)
- Hosting: **$0** (static PWA)

This is the most straightforwardly zero-cost and zero-dependency of the four — worth considering as the first one to build if you want an early, low-risk win.
