# Dev 4 — Admin Dashboard + Push Notifications

## Overview
Full admin dashboard built with Next.js 16 (App Router), Tailwind CSS v4, Leaflet maps, TanStack Query, and socket.io. Push notification support added to both the mobile app and backend.

---

## Files Created

### Admin Dashboard (`packages/admin/`)

| File | Description |
|---|---|
| `app/layout.tsx` | Root layout — sets metadata, wraps app in `QueryClientProvider` |
| `app/page.tsx` | Redirects `/` → `/dashboard` |
| `app/login/page.tsx` | Login form — validates `@virginia.edu` email, checks `isAdmin`, stores JWT in `localStorage` |
| `app/dashboard/layout.tsx` | Sidebar nav (Overview / Reports / Users / Broadcast) + `AuthGuard` |
| `app/dashboard/page.tsx` | Overview page — live map + stats cards, socket-connected for real-time updates |
| `app/dashboard/reports/page.tsx` | Reports table with status and category filters |
| `app/dashboard/users/page.tsx` | Users table with credibility bars, toggle admin role |
| `app/dashboard/broadcast/page.tsx` | Broadcast alert form |
| `components/AuthGuard.tsx` | Client-side auth check — redirects to `/login` if no token |
| `components/Providers.tsx` | `QueryClientProvider` wrapper (client component) |
| `components/LiveMap.tsx` | Leaflet map centered on UVA — colored dots by severity, click opens detail panel, radius circle overlay |
| `components/ReportsTable.tsx` | Full reports table — filter by status/category, 30s auto-refresh, opens `ReportDetailPanel` |
| `components/ReportDetailPanel.tsx` | Slide-in panel — Verify / Resolve / Dismiss actions + admin note textarea |
| `components/StatsCards.tsx` | 4 metric cards: Active Reports, High/Critical (red if >0), Last Hour, Confirmations Today |
| `components/BroadcastForm.tsx` | Send push alert to all users — message + severity select |
| `lib/api.ts` | Typed fetch client — reads token from `localStorage`, handles auth headers |
| `lib/socket.ts` | socket.io-client singleton — connects with JWT auth, admin joins `admin:dashboard` room |
| `lib/types.ts` | `Report`, `AdminUser`, and enum types shared across admin components |

### Mobile Push Notifications (`packages/mobile/`)

| File | Description |
|---|---|
| `src/hooks/useNotifications.ts` | Requests push permissions, registers Expo push token with backend, deep links to `report/[id]` on notification tap |

### Backend (`packages/backend/`)

| File | Change |
|---|---|
| `src/routes/admin.routes.ts` | Added `GET /api/admin/users` endpoint |
| `src/services/notification.service.ts` | Already created in Phase 1 — batches Expo push notifications in chunks of 100 |

---

## API Endpoints Used

```
POST  /api/auth/login              Login + receive JWT
GET   /api/auth/me                 Verify token
POST  /api/auth/push-token         Register Expo push token

GET   /api/admin/reports           List reports (filter: status, category)
PATCH /api/admin/reports/:id       Update status / add admin note
GET   /api/admin/users             List all users
PATCH /api/admin/users/:id         Update credibility / toggle admin
POST  /api/admin/broadcast         Send push + socket broadcast to all users
GET   /api/admin/stats             Stats: active, critical, last hour, today confirmations
```

---

## Real-Time Behaviour

- Dashboard page connects socket on mount and joins `admin:dashboard` room
- Listens for `report:new`, `report:updated`, `report:resolved` → refetches active reports and updates map markers automatically
- No manual refresh needed during demo

---

## TypeScript Validation

All three packages pass `tsc --noEmit` with zero errors:

| Package | Result |
|---|---|
| `packages/admin` | ✅ 0 errors |
| `packages/backend` | ✅ 0 errors |
| `packages/mobile` | ✅ 0 errors |

---

## Manual Steps Required Before Demo

1. Start backend: `cd packages/backend && npm run dev`
2. Start admin: `cd packages/admin && npm run dev` → opens at `http://localhost:3000`
3. Create an admin user in Supabase SQL Editor:
   ```sql
   UPDATE "User" SET "isAdmin" = true WHERE email = 'your@virginia.edu';
   ```
4. Dev 2/3 must call `useNotifications(token)` in the mobile root layout (see note at top of `PLAN.md`)
