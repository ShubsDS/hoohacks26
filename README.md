# HoosAlert

A real-time campus safety network for UVA students. Report incidents, confirm nearby threats, and receive live alerts — all on a shared map.

Built at [HooHacks 2026](https://hoohacks.io).

## What It Does

- **Report incidents** (crime, emergencies, weather, infrastructure) with location, severity, optional photos
- **Live map** shows active reports with color-coded markers and radius overlays
- **Crowdsourced credibility** — users confirm reports, boosting reporter trust scores
- **Real-time updates** via WebSockets — no refresh needed
- **Push notifications** for nearby incidents
- **Admin dashboard** to verify, dismiss, and broadcast campus-wide alerts

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | Expo (React Native), React Native Maps, Zustand, Socket.IO |
| Backend | Node.js, Express, Prisma, Socket.IO, JWT auth |
| Admin | Next.js, React Leaflet, TanStack Table, Tailwind CSS |
| Database | PostgreSQL + PostGIS (hosted on Supabase) |
| Infra | Supabase (auth, DB), Expo Push Notifications |

## Project Structure

```
hoohacks26/
├── packages/
│   ├── backend/     # Express API + WebSocket server
│   ├── mobile/      # Expo React Native app
│   ├── admin/       # Next.js admin dashboard
│   └── shared/      # Shared TypeScript types
└── package.json     # npm workspaces + Turbo
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Expo Go app (on your phone)
- Supabase project with PostGIS enabled

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

**Backend** — create `packages/backend/.env`:
```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
SUPABASE_JWT_SECRET=your_jwt_secret
PORT=3001
```

**Mobile** — create `packages/mobile/.env`:
```
EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:3001
EXPO_PUBLIC_SOCKET_URL=http://YOUR_LAN_IP:3001
```

**Admin** — create `packages/admin/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### 3. Set up the database

```bash
cd packages/backend
npx prisma generate
npx prisma db push
```

### 4. Seed demo data (optional)

```bash
cd packages/backend
npx ts-node src/seed.ts
```

This creates a demo user (`demo@virginia.edu` / `password123`) and an admin (`admin@virginia.edu` / `admin123`) with sample reports around Grounds.

### 5. Run everything

```bash
# Terminal 1 — Backend
cd packages/backend && npm run dev

# Terminal 2 — Mobile
cd packages/mobile && npx expo start

# Terminal 3 — Admin
cd packages/admin && npm run dev
```

- Backend: http://localhost:3001/health
- Admin dashboard: http://localhost:3000
- Mobile: scan QR code with Expo Go

## Features

### Mobile App
- UVA-centered map with live report markers
- Submit reports with category, severity, radius, and optional photo
- Confirm other users' reports to boost credibility
- View report details with map thumbnail and admin notes
- Push notifications for nearby incidents

### Admin Dashboard
- Live map (Leaflet) with all active reports
- Filterable reports table with quick actions
- Verify, dismiss, or resolve reports
- Add admin notes visible to all users
- Broadcast alerts to all users or a targeted area
- User management with credibility score overrides

### Real-Time System
- Socket.IO rooms based on geographic grid cells (~1km)
- Reports broadcast to relevant cells on creation
- Status changes propagate instantly to all connected clients
- Fallback polling every 30s

### Credibility System
- Users start at 1.0, max 3.0
- Confirmed reports: +0.1
- Dismissed reports: -0.3
- Report weight = credibility x (1 + confirmations x 0.2)

## API Overview

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/reports/nearby?lat=&lng=&radius=
POST   /api/reports
POST   /api/reports/:id/confirm
DELETE /api/reports/:id

POST   /api/location/update
DELETE /api/location

GET    /api/admin/reports
PATCH  /api/admin/reports/:id
DELETE /api/admin/reports/:id
GET    /api/admin/users
PATCH  /api/admin/users/:id
POST   /api/admin/broadcast
GET    /api/admin/stats
```

## Team

Built by the HoosAlert team at HooHacks 2026.

## License

MIT
