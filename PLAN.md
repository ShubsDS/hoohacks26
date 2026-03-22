# Team Onboarding (read this first)

## Steps for new team members after cloning

1. **Install dependencies** from the repo root:
   ```bash
   npm install
   ```

2. **Create your backend `.env`** — ask the project lead for the values, then create `packages/backend/.env`:
   ```
   DATABASE_URL=postgresql://postgres.hltcxhxwukmgigsyrzyo:[PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
   SUPABASE_JWT_SECRET=[shared secret — ask project lead]
   PORT=3001
   ```

3. **Generate the Prisma client** (no database connection needed):
   ```bash
   cd packages/backend
   npx prisma generate
   ```

4. **Start the backend:**
   ```bash
   npm run dev
   ```
   Verify at `http://localhost:3001/health` → should return `{"status":"ok"}`

5. **Mobile `.env`** — create `packages/mobile/.env` and set your machine's LAN IP:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:3001
   EXPO_PUBLIC_SOCKET_URL=http://YOUR_LAN_IP:3001
   ```
   Find your LAN IP by running `ipconfig` (Windows) or `ifconfig` (Mac/Linux) and looking for your IPv4 address (e.g. `192.168.1.5`).

> **Do NOT re-run `prisma db push` or `prisma migrate` — the database is already set up.**

---

# HooHacks26 — UVA Safety Network

## App Overview
A mobile social safety network for UVA. Users share real-time emergency/warning reports on a map, crowdsource credibility via confirmations, and receive push alerts for nearby incidents. Admins monitor and respond via a web dashboard.

**Stack:** Expo (React Native) · Node.js/Express · Supabase (PostgreSQL + PostGIS) · socket.io · Next.js (admin)

**UVA Campus Center:** `38.0336, -78.5080`
**UVA Colors:** Navy `#232D4B` · Orange `#E57200`

---

## Developer Assignments

### Dev 1 — Backend API + Database
### Dev 2 — Mobile App: Map + Location
### Dev 3 — Mobile App: Reports + UI
### Dev 4 — Admin Dashboard + Push Notifications

> All devs do Phase 1 (setup) together first, then split.

---

## Phase 1 — Foundation (Hours 0–4) · ALL DEVS

**Goal:** Monorepo running, auth working end-to-end.

### Steps (do together or divide quickly):
1. Init monorepo root `package.json` with npm workspaces:
   ```json
   {
     "name": "hoohacks26",
     "workspaces": ["packages/*"],
     "scripts": { "dev": "turbo run dev" }
   }
   ```
2. Create Supabase project at supabase.com → copy `DATABASE_URL` and `SUPABASE_ANON_KEY`
3. Enable PostGIS in Supabase SQL editor: `CREATE EXTENSION IF NOT EXISTS postgis;`
4. Scaffold `packages/backend` — see Dev 1 section
5. Scaffold `packages/mobile` — see Dev 2/3 section
6. Scaffold `packages/admin` — see Dev 4 section
7. Scaffold `packages/shared` — see below

### Shared Types Package (`packages/shared/src/index.ts`)
```typescript
export type ReportCategory = 'EMERGENCY' | 'CRIME' | 'INFRASTRUCTURE' | 'WEATHER' | 'PROTEST' | 'OTHER';
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ReportStatus = 'ACTIVE' | 'ADMIN_VERIFIED' | 'RESOLVED' | 'DISMISSED';

export interface User {
  id: string;
  email: string;
  displayName: string;
  credibilityScore: number;
  isAdmin: boolean;
}

export interface Report {
  id: string;
  reporterId: string;
  reporter?: Pick<User, 'displayName' | 'credibilityScore'>;
  category: ReportCategory;
  severity: Severity;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  credibilityWeight: number;
  confirmationCount: number;
  status: ReportStatus;
  adminVerified: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface SocketEvents {
  // Client → Server
  'location:update': { lat: number; lng: number };
  'report:subscribe': { lat: number; lng: number; radius: number };
  // Server → Client
  'report:new': Report;
  'report:updated': Report;
  'report:resolved': { reportId: string };
  'admin:broadcast': { message: string; severity: Severity };
}
```

**Deliverable:** Everyone can `npm install` from root. Supabase project exists.

---

## Dev 1 — Backend API + Database

### Files to own:
```
packages/backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│       └── 001_postgis.sql
├── src/
│   ├── config/
│   │   ├── database.ts       ← Prisma client singleton
│   │   ├── socket.ts         ← socket.io setup
│   │   └── env.ts            ← zod env validation
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── admin.middleware.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── reports.routes.ts
│   │   ├── location.routes.ts
│   │   └── admin.routes.ts
│   ├── services/
│   │   ├── geo.service.ts         ← PostGIS ST_DWithin queries
│   │   ├── report.service.ts
│   │   ├── credibility.service.ts
│   │   └── notification.service.ts
│   ├── socket/
│   │   ├── handlers.ts       ← all socket event handlers
│   │   └── rooms.ts          ← geo-based room management
│   └── index.ts
└── package.json
```

### Database Schema (`prisma/schema.prisma`)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id               String   @id @default(cuid())
  email            String   @unique
  displayName      String
  credibilityScore Float    @default(1.0)
  totalReports     Int      @default(0)
  confirmedReports Int      @default(0)
  isAdmin          Boolean  @default(false)
  expoPushToken    String?
  createdAt        DateTime @default(now())
  reports          Report[]
  confirmations    ReportConfirmation[]
  location         UserLocation?
}

model UserLocation {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])
  latitude  Float
  longitude Float
  updatedAt DateTime @updatedAt
}

model Report {
  id                String       @id @default(cuid())
  reporterId        String
  reporter          User         @relation(fields: [reporterId], references: [id])
  category          ReportCategory
  severity          Severity     @default(MEDIUM)
  title             String
  description       String?
  latitude          Float
  longitude         Float
  radiusMeters      Float        @default(500)
  credibilityWeight Float        @default(1.0)
  confirmationCount Int          @default(0)
  status            ReportStatus @default(ACTIVE)
  adminVerified     Boolean      @default(false)
  adminNote         String?
  resolvedAt        DateTime?
  expiresAt         DateTime
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
  confirmations     ReportConfirmation[]
}

model ReportConfirmation {
  id        String   @id @default(cuid())
  reportId  String
  report    Report   @relation(fields: [reportId], references: [id])
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  @@unique([reportId, userId])
}

enum ReportCategory {
  EMERGENCY
  CRIME
  INFRASTRUCTURE
  WEATHER
  PROTEST
  OTHER
}

enum Severity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum ReportStatus {
  ACTIVE
  ADMIN_VERIFIED
  RESOLVED
  DISMISSED
}
```

### PostGIS Migration (`prisma/migrations/001_postgis.sql`)
```sql
-- Add geometry columns for spatial queries
ALTER TABLE "UserLocation" ADD COLUMN IF NOT EXISTS geom geometry(Point, 4326);
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS geom geometry(Point, 4326);

-- Auto-sync geom from lat/lng on UserLocation
CREATE OR REPLACE FUNCTION sync_user_location_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_location_geom_trigger
BEFORE INSERT OR UPDATE ON "UserLocation"
FOR EACH ROW EXECUTE FUNCTION sync_user_location_geom();

-- Auto-sync geom on Report
CREATE OR REPLACE FUNCTION sync_report_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER report_geom_trigger
BEFORE INSERT OR UPDATE ON "Report"
FOR EACH ROW EXECUTE FUNCTION sync_report_geom();

-- Spatial indexes
CREATE INDEX IF NOT EXISTS user_location_geom_idx ON "UserLocation" USING GIST(geom);
CREATE INDEX IF NOT EXISTS report_geom_idx ON "Report" USING GIST(geom);
```

### Key Service: `geo.service.ts`
```typescript
// Find user IDs within radiusMeters of a point
async function getUsersInRadius(lat: number, lng: number, radiusMeters: number): Promise<string[]>
// Raw SQL: SELECT "userId" FROM "UserLocation" WHERE ST_DWithin(geom::geography, ST_MakePoint($1,$2)::geography, $3)

// Find active reports within radius
async function getReportsInRadius(lat: number, lng: number, radiusMeters: number): Promise<Report[]>
```

### Key Service: `credibility.service.ts`
```
On confirmation:   score = min(3.0, score + 0.1)
On dismissal:      score = max(0.1, score - 0.3)
Report weight:     credibilityWeight × (1 + confirmationCount × 0.2)
```

### API Routes Summary
```
POST   /api/auth/register          body: { email, password, displayName }
POST   /api/auth/login             body: { email, password }
GET    /api/auth/me                header: Authorization: Bearer <token>

GET    /api/reports/nearby         query: ?lat=&lng=&radius=
POST   /api/reports                body: { category, severity, title, description, lat, lng, radiusMeters }
POST   /api/reports/:id/confirm
DELETE /api/reports/:id

POST   /api/location/update        body: { lat, lng }
DELETE /api/location

GET    /api/admin/reports          query: ?status=&category=
PATCH  /api/admin/reports/:id      body: { status, adminNote }
PATCH  /api/admin/users/:id        body: { credibilityScore, isAdmin }
POST   /api/admin/broadcast        body: { message, severity, lat, lng, radiusMeters }
GET    /api/admin/stats
```

### Socket Rooms Strategy
- Each connected user joins room `geo:${gridCell}` based on their lat/lng snapped to ~1km grid
- On report submit, broadcast to all rooms whose cells intersect the report radius
- Admin joins room `admin:dashboard` for all events

### `.env` for backend
```
DATABASE_URL=postgresql://...
SUPABASE_JWT_SECRET=...
PORT=3001
```

**Deliverable:** `POST /api/reports` creates a report AND broadcasts to nearby users via socket.

---

## Dev 2 — Mobile App: Map + Location

### Files to own:
```
packages/mobile/src/
├── app/
│   ├── _layout.tsx              ← root layout, auth guard
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (tabs)/
│       ├── _layout.tsx          ← tab bar
│       └── map.tsx              ← PRIMARY SCREEN
├── components/
│   └── map/
│       ├── ReportMarker.tsx     ← colored pin by category
│       ├── RadiusCircle.tsx     ← translucent circle overlay
│       └── UserMarker.tsx       ← current user dot
├── hooks/
│   ├── useLocation.ts           ← expo-location wrapper
│   └── useSocket.ts             ← socket.io-client connection
└── stores/
    ├── auth.store.ts            ← zustand: { user, token, login, logout }
    └── location.store.ts        ← zustand: { coords, setCoords }
```

### Init Expo App
```bash
cd packages
npx create-expo-app mobile --template blank-typescript
cd mobile
npx expo install expo-location expo-router react-native-maps socket.io-client zustand axios @tanstack/react-query expo-notifications
```

### `app.json` key config
```json
{
  "expo": {
    "name": "HoosAlert",
    "slug": "hoosalert",
    "plugins": [
      ["expo-location", { "locationAlwaysAndWhenInUsePermission": "HoosAlert needs location to show nearby reports." }],
      ["expo-notifications"]
    ]
  }
}
```

### `useLocation.ts` outline
```typescript
// 1. Request foreground permissions via expo-location
// 2. watchPositionAsync with accuracy: BestForNavigation, interval: 5000ms
// 3. On each update: setCoords in zustand + POST /api/location/update
// 4. On unmount: remove watcher + DELETE /api/location
```

### `useSocket.ts` outline
```typescript
// 1. Connect to backend WS on app mount
// 2. On connect: emit 'report:subscribe' with current coords + 2km radius
// 3. Listen for 'report:new' → add to reports store
// 4. Listen for 'report:updated' → update in reports store
// 5. Listen for 'report:resolved' → remove from reports store
// 6. Listen for 'admin:broadcast' → show alert banner
// 7. Re-subscribe when user moves > 500m from last subscription point
```

### `map.tsx` outline
```typescript
// MapView centered on UVA: initialRegion { lat: 38.0336, lng: -78.5080, latDelta: 0.05, lngDelta: 0.05 }
// Show ReportMarker for each report in store
// Show RadiusCircle for selected report
// Show UserMarker at current coords
// FAB button bottom-right → navigate to /report/new
// Tap marker → navigate to /report/[id]
```

### Category colors for markers
```typescript
export const CATEGORY_COLORS = {
  EMERGENCY:      '#FF3B30',  // red
  CRIME:          '#FF9500',  // orange
  INFRASTRUCTURE: '#5AC8FA',  // blue
  WEATHER:        '#4CD964',  // green
  PROTEST:        '#AF52DE',  // purple
  OTHER:          '#8E8E93',  // gray
};
```

### Auth screens
- `register.tsx`: email (must end in `@virginia.edu`, validated client-side), displayName, password → POST `/api/auth/register`
- `login.tsx`: email + password → POST `/api/auth/login` → store JWT in zustand + SecureStore

**Deliverable:** Open app → grant location → see UVA map → dot at your location → markers for seeded reports.

---

## Dev 3 — Mobile App: Reports + UI

### Files to own:
```
packages/mobile/src/
├── app/
│   ├── (tabs)/
│   │   ├── reports.tsx          ← list of nearby reports
│   │   └── profile.tsx          ← user profile + credibility score
│   └── report/
│       ├── new.tsx              ← report submission form
│       └── [id].tsx             ← report detail + confirm button
├── components/
│   ├── reports/
│   │   ├── ReportCard.tsx       ← card in list view
│   │   ├── ReportForm.tsx       ← submission form
│   │   └── ConfirmButton.tsx    ← upvote button with count
│   └── ui/
│       ├── SeverityBadge.tsx    ← colored chip: LOW/MEDIUM/HIGH/CRITICAL
│       └── CredibilityBar.tsx   ← visual score bar (0.1–3.0)
├── hooks/
│   ├── useReports.ts            ← react-query: fetch + cache nearby reports
│   └── useNotifications.ts     ← expo-notifications setup
└── stores/
    └── reports.store.ts         ← zustand: { reports, addReport, updateReport }
```

### `report/new.tsx` — Form fields
```
Category:    picker (EMERGENCY | CRIME | INFRASTRUCTURE | WEATHER | PROTEST | OTHER)
Severity:    segmented control (LOW | MEDIUM | HIGH | CRITICAL)
Title:       text input (required, max 80 chars)
Description: multiline text (optional, max 300 chars)
Radius:      slider 100m → 5000m (default 500m, shown as "500m radius")
[Submit Report] button → POST /api/reports with current coords from location store
```

### `report/[id].tsx` — Detail screen
```
Header: category icon + severity badge + title
Body: description, reporter name, credibility bar, distance from user, time ago
Map thumbnail: small MapView showing report location + radius circle
Confirmation section: "X others have confirmed this" + ConfirmButton
Admin note (if present): shown in blue banner
Status badge: ACTIVE / VERIFIED (green) / RESOLVED / DISMISSED (gray)
```

### `reports.tsx` — List tab
```
Sorted by: effective weight (credibilityWeight × confirmationMultiplier) descending
Each row: ReportCard showing category color, severity, title, distance, confirmation count
Pull-to-refresh → refetch useReports
```

### `profile.tsx`
```
Display name, email
Credibility Score: large number + CredibilityBar + explanation text
Stats: Total Reports Submitted, Reports Confirmed by Others
```

### `useReports.ts`
```typescript
// useQuery: GET /api/reports/nearby?lat=&lng=&radius=2000
// refetchInterval: 30000 (30s polling fallback if socket missed)
// Merge with socket updates from reports.store
```

### Report auto-expiry display
```
EMERGENCY:      expires 6h after creation
CRIME:          expires 24h
INFRASTRUCTURE: expires 48h
WEATHER:        expires 24h
PROTEST:        expires 12h
OTHER:          expires 48h
```

**Deliverable:** Submit a report form → see it on Dev 2's map → tap it → see detail → confirm → count increments.

---

## Dev 4 — Admin Dashboard + Push Notifications

### Part A: Push Notifications (mobile-side, coordinate with Dev 2/3)

Add to mobile app:

**`hooks/useNotifications.ts`**
```typescript
// 1. requestPermissionsAsync() on app launch
// 2. getExpoPushTokenAsync() → POST /api/auth/push-token to save on User
// 3. addNotificationResponseReceivedListener → deep link to report/[id] on tap
// 4. addNotificationReceivedListener → show in-app banner if app is foregrounded
```

Add to backend (`notification.service.ts`):
```typescript
import { Expo } from 'expo-server-sdk';
// sendToUsers(userIds: string[], { title, body, data: { reportId } })
// Batch into chunks of 100 (Expo limit)
// Called after socket broadcast for users NOT in active socket rooms
```

### Part B: Admin Dashboard (Next.js)

```
packages/admin/
├── src/app/
│   ├── layout.tsx
│   ├── page.tsx               ← redirect to /dashboard
│   ├── login/page.tsx
│   └── dashboard/
│       ├── page.tsx           ← overview with StatsCards + LiveMap
│       ├── reports/page.tsx   ← ReportsTable with filters
│       ├── users/page.tsx     ← UsersTable with credibility scores
│       └── broadcast/page.tsx ← BroadcastForm
├── src/components/
│   ├── LiveMap.tsx            ← react-leaflet map (simpler than Mapbox)
│   ├── ReportsTable.tsx
│   ├── ReportDetailPanel.tsx  ← slide-in panel with action buttons
│   ├── StatsCards.tsx
│   └── BroadcastForm.tsx
└── src/lib/
    ├── api.ts                 ← typed fetch client
    └── socket.ts              ← socket.io-client for live updates
```

### Init Admin App
```bash
cd packages
npx create-next-app admin --typescript --tailwind --app
cd admin
npm install socket.io-client react-leaflet leaflet @tanstack/react-table
npx shadcn@latest init
```

### `LiveMap.tsx` — Leaflet map
```
Use react-leaflet (no API key needed vs Mapbox)
Center: [38.0336, -78.5080], zoom: 14
Marker per active report, color by severity
Popup on click → opens ReportDetailPanel
Circle overlay showing report radius
```

### `ReportsTable.tsx` — Columns
```
Created At | Category | Severity | Title | Reporter | Credibility | Confirmations | Status | Actions
Filter by: status, category, severity, date range
Actions column: [Verify] [Dismiss] [View]
```

### `ReportDetailPanel.tsx` — Actions
```
[Mark as Verified]  → PATCH /api/admin/reports/:id { status: 'ADMIN_VERIFIED' }
[Dismiss]           → PATCH /api/admin/reports/:id { status: 'DISMISSED' }
[Mark Resolved]     → PATCH /api/admin/reports/:id { status: 'RESOLVED' }
Admin Note textarea → PATCH /api/admin/reports/:id { adminNote }
```

### `StatsCards.tsx` — Metrics
```
Active Reports (count)
High/Critical Reports (count, shown in red if > 0)
Reports in Last Hour
Total Confirmations Today
```

### `BroadcastForm.tsx`
```
Message: textarea
Severity: select
Target: "All UVA Users" or draw radius on map
[Send Alert] → POST /api/admin/broadcast
```

### Admin `.env`
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

**Deliverable:** Admin logs in → sees live map with report markers → verifies/dismisses → mobile users see status change → can send broadcast push to all users.

---

## Integration Checklist

Before demo, verify end-to-end:

- [ ] User A registers with `@virginia.edu` email
- [ ] User A appears on map with location dot
- [ ] User A submits CRITICAL report
- [ ] User B (different device) sees report marker appear **without refresh** (socket)
- [ ] User B receives push notification if app is backgrounded
- [ ] User B taps "Confirm" → User A's credibility score increases
- [ ] Admin logs into dashboard → sees report on LiveMap
- [ ] Admin clicks "Verify" → report status badge updates on mobile
- [ ] Admin sends broadcast → both devices receive push notification
- [ ] Report disappears after expiry window

---

## Environment Variables Master List

```bash
# packages/backend/.env
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
SUPABASE_JWT_SECRET=[from Supabase dashboard → Settings → API → JWT Secret]
PORT=3001

# packages/mobile/.env (or app.config.ts)
EXPO_PUBLIC_API_URL=http://[your-ip]:3001
EXPO_PUBLIC_SOCKET_URL=http://[your-ip]:3001

# packages/admin/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

> **Note:** For mobile dev, use your machine's LAN IP (e.g. `192.168.x.x`), not `localhost`, so Expo Go on your phone can reach the backend.

---

## Quick Start Commands

```bash
# From repo root after initial setup:
npm install                          # install all workspace deps

# Terminal 1 — Backend
cd packages/backend
npx prisma migrate dev               # run migrations
npm run dev                          # start Express on :3001

# Terminal 2 — Mobile
cd packages/mobile
npx expo start                       # scan QR with Expo Go

# Terminal 3 — Admin (stretch)
cd packages/admin
npm run dev                          # start Next.js on :3000
```

---

## Seed Data Script (for demo)

Create `packages/backend/src/seed.ts` with 5–8 pre-placed reports around UVA:

```typescript
const DEMO_REPORTS = [
  { title: 'Suspicious person near AFC', category: 'CRIME', severity: 'HIGH', lat: 38.0321, lng: -78.5092, radiusMeters: 300 },
  { title: 'Water main break on Alderman', category: 'INFRASTRUCTURE', severity: 'MEDIUM', lat: 38.0367, lng: -78.5024, radiusMeters: 500 },
  { title: 'Large gathering blocking JPA', category: 'PROTEST', severity: 'LOW', lat: 38.0298, lng: -78.5145, radiusMeters: 800 },
  { title: 'Black ice on Rugby Rd', category: 'WEATHER', severity: 'MEDIUM', lat: 38.0412, lng: -78.5068, radiusMeters: 600 },
  { title: 'Medical emergency at Newcomb', category: 'EMERGENCY', severity: 'CRITICAL', lat: 38.0355, lng: -78.5036, radiusMeters: 200 },
];
```
