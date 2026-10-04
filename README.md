# VitaTrack

A phone-first gym tracker: log every set from the gym floor, plus daily food and body weight.
.NET 8 API + PostgreSQL backend, React (Vite, PWA) frontend.

## Run it locally

### 1. Backend (`Backend/`)
Requirements: .NET 8 SDK, PostgreSQL.

1. Set `ConnectionStrings:DefaultConnection` in `src/VitaTrack.Api/appsettings.json`.
2. Run:
   ```bash
   cd Backend
   dotnet restore
   dotnet run --project src/VitaTrack.Api --launch-profile http
   ```
   The API listens on `http://localhost:5177` (Swagger at `/swagger`).

On startup the API applies pending EF migrations (including `20261004120000_GymTrackerUpgrade`)
and seeds the built-in library: ~80 exercises, ~60 common foods and 4 meal slots.
Seeding only inserts missing names, so it is safe on every start.
Turn this off with `"Database": { "MigrateOnStartup": false }` and run
`dotnet ef database update --project src/VitaTrack.Infrastructure --startup-project src/VitaTrack.Api` yourself.

### 2. Frontend (`Frontend/`)
Requirements: Node 20+.

```bash
cd Frontend
npm install
npm run dev
```
Open `http://localhost:5173`. Requests to `/api` are proxied to `http://localhost:5177`.

**On your phone:** connect to the same Wi-Fi and open `http://<your-pc-ip>:5173`
(Vite prints the Network URL). Use the browser's "Add to Home Screen" to install it as an app.
If you serve the frontend from another origin, set `VITE_API_URL` in `Frontend/.env`
and add that origin to `AllowedOrigins` in `appsettings.json`.

## What's in it

**Workout**
- Live logger: per-set weight/reps (or reps only, time, distance & time — depends on the exercise),
  last session's numbers shown as placeholders and in a "Previous" column, tick to complete.
- Rest timer starts on tick (per-exercise length, ±15 s, skip); vibrates + beeps when done, from any tab.
- Set types: warm-up / drop / failure (warm-ups excluded from volume and records).
- Session is stored on the device until you finish — a refresh, locked screen or lost signal loses nothing.
  The screen is kept awake while logging.
- Personal records (heaviest weight, estimated 1RM, best set volume, most reps) computed on save.
- Routines with target sets, start in one tap; repeat, edit, save-as-routine or delete any past workout.
- Exercise library with muscle filter, custom exercises, per-exercise history, bests and 1RM chart.

**Food** — daily calories remaining and macro bars, meals per slot, add from recent / search / my foods,
servings or grams, edit/remove entries, copy a meal or a whole day, create custom foods.

**Body** — weigh-ins (one per day), body fat %, 7/30/90-day change, trend chart with goal line.

**Progress** — weekly volume and frequency, sets per muscle, 16-week consistency grid, 14-day nutrition.

**Settings** — profile (drives BMR/TDEE), recommended or custom calorie & macro targets, kg/lb,
default rest timer, rest sound, dark/light/auto theme.

See `Backend/VitaTrack-API-Docs.md` for the API.
