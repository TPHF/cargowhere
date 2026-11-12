# Vibe Coding Workshop - Prompt Log

A chronological log of all prompts used to build **SG ParkLive** (Real-Time Singapore Carpark Lot Availability Tracker) with the LTA DataMall API.

---

## Prompt 1: Initial Frontend Application & Map Build

> **Date/Time**: 2026-11-12T01:11:11-08:00

```text
i am a student in a vibe coding workshop and trying to build an app with live api.

i want to build an application that helps me track live time carpark lot availability in singapore using the LTA DataMall API with real-time updates and maps. build just the frontend for now, i will integrate the backend later.
```

### Outcome
- Built interactive Leaflet map centered on Singapore with color-coded custom lot availability markers.
- Added quick region navigation (Marina Bay, Orchard, CBD, Jurong East, Tampines, Changi Airport, Sentosa).
- Built high-density carpark list with real-time search, filters (vehicle type, agency, availability), and sorting.
- Created Carpark Detail inspection drawer with hourly occupancy patterns and estimated rates.
- Built a Singapore Parking Fee Calculator tool.
- Included Workshop API & Backend Hub with copyable Express and FastAPI starter code.

---

## Prompt 2: GitHub Repository Setup & Push

> **Date/Time**: 2026-11-12T01:18:19-08:00

```text
git push https://<GITHUB_PERSONAL_ACCESS_TOKEN>@github.com/TPHF/cargowhere.git
```
*(Original input: `git push https://ghp_...yS@https://github.com/TPHF/cargowhere.git`)*

### Outcome
- Initialized Git repository, configured safe directory permissions and user profile.
- Created initial commit `feat: initial release of Singapore real-time carpark availability tracker`.
- Pushed `main` branch to GitHub repository `TPHF/cargowhere`.

---

## Prompt 3: Serverless API Endpoints Integration

> **Date/Time**: 2026-11-12T01:39:07-08:00

```text
1. add a serverless connection that pulls live data from LTA's datamall using the following endpoint: 

# Live carpark lots (HDB, LTA and URA):
https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2

# Every request needs the header:  AccountKey: <LTA_ACCOUNT_KEY>

2. store this in /api folder at project root level (not the src file) 

3. include /health.ts and /carparkavailability.ts within the same sub folder 

4. do not hardcode any keys, i will input them later.
```

### Outcome
- Created `/api/health.ts` for health diagnostics.
- Created `/api/carparkavailability.ts` to query LTA DataMall with `AccountKey` header, caching, and CORS support.
- Created `/server.ts` mounting `/api` routes alongside Vite dev server.
- Updated `.env.example` with `LTA_ACCOUNT_KEY`.
- Updated frontend client to query `/api/carparkavailability`.
- Committed and pushed changes to remote `main`.

---

## Prompt 4: Prompt Documentation

> **Date/Time**: 2026-11-12T01:47:02-08:00

```text
collate all of the prompts and store them as a prompts.md file
```

### Outcome
- Created `prompts.md` documenting all user prompts, timestamps, and architectural outcomes across the session.
