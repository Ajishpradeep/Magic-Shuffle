# Sonicstride Smart AI DJ Prototype

This is a static web MVP for the Sonicstride Smart AI DJ concept.

The prototype proves the core interaction:

1. Detect a user context snapshot.
2. Translate that context into a music mission.
3. Recommend a track from a local tagged catalog.
4. Have the AI DJ explain the choice in music-native language.

## Run

Open `index.html` in a browser.

For mock mode, no API keys, package install, server, Spotify login, Apple Watch, or HealthKit access are required.

For Google Calendar, run from localhost:

```sh
python3 -m http.server 8000
```

Then open:

```txt
http://localhost:8000
```

## File Map

- `index.html` - app structure and UI regions
- `styles.css` - visual system and responsive layout
- `data.js` - mock context profiles, mission labels, and local track catalog
- `recommender.js` - context-to-mission rules, scoring, penalties, DJ line generation
- `live-context.js` - browser geolocation and live weather context sync
- `google-calendar.js` - Google Calendar OAuth and next-event fetch
- `watch-simulator.js` - synthetic Apple Watch biometric stream
- `app.js` - UI state, event handling, simulator interactions
- `agent-plans/final-build-handoff.md` - product and engineering handoff plan

## Current MVP Scope

The app starts with simulated context signals:

- Energy, sleep, and stress
- Weather
- Location
- Calendar/schedule
- Activity mode

The `Sync Live Context` button adds a first real integration:

- Browser geolocation, with user permission
- Current weather from Open-Meteo
- Device-derived time of day

The `Connect Google Calendar` button adds real calendar context:

- Uses Google Identity Services in the browser
- Requests read-only Calendar API scope
- Fetches the next event from the user's primary Google Calendar
- Requires a Google OAuth client ID in `config.js`

To configure:

1. Create a Google Cloud OAuth client for a web application.
2. Add `http://localhost:8000` as an authorized JavaScript origin.
3. Enable the Google Calendar API.
4. Paste the client ID into `config.js`.

The `Read Motion` button adds a browser device connector:

- Samples `DeviceMotionEvent` for a few seconds when the browser allows it
- Infers still, moving, or active motion
- Updates activity and energy level in the current context

The `Import Calendar` control adds a local calendar connector:

- Reads an `.ics` calendar file in the browser
- Finds the next upcoming event
- Updates the current schedule context

The `Start Watch Stream` button adds synthetic Apple Watch data:

- Generates fake heart rate, energy, sleep quality, stress, steps, and activity
- Updates the body context every few seconds
- Lets the team test the music logic before native HealthKit/watchOS work exists

If geolocation is denied or unavailable, the app falls back to Taipei weather context. Apple Watch and HealthKit remain simulated.

The `Context Simulator` is intentionally tucked away as a prototype control. In the real product, those context values should come from device and service integrations.

## Recommendation Flow

The recommendation engine lives in `recommender.js`.

Pipeline:

1. `selectMission(context)` chooses a mission such as `gentle_activation` or `focus_flow`.
2. `recommendTrack(...)` scores the local catalog.
3. `scoreTrack(...)` combines mission fit, energy fit, mood fit, context fit, feedback fit, novelty, and penalties.
4. `buildDjLine(...)` creates the spoken AI DJ intro.
5. `buildReason(...)` creates the visible recommendation rationale.

## Future Integration Path

Replace the mock sources in this order:

1. Improve location labels with reverse geocoding.
2. Improve Google Calendar event interpretation by detecting event type, pressure, and preparation time.
3. iOS HealthKit: sleep, heart rate, activity state, and workout context.
4. watchOS companion: live workout state for real-time DJ adaptation.

Do not rely on Spotify recommendations or audio features as the core engine. Keep Sonicstride's own lightweight track tags and scoring layer.
