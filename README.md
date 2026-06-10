# Warsha Online Maintenance Dashboard

Production-grade React admin dashboard for managing the Warsha B2B maintenance platform.

## Stack

- React 18 + TypeScript strict mode
- Vite
- React Router v6 with lazy-loaded routes
- TanStack Query v5
- Zustand for auth and UI state
- Axios with interceptors
- React Hook Form + Zod
- Tailwind CSS with Warsha brand tokens
- Shadcn-style component primitives
- Recharts
- React Toastify
- Vitest + React Testing Library

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env`:

```env
VITE_API_BASE_URL=https://your-api-host
```

3. Start development:

```bash
npm run dev
```

4. Validate the project:

```bash
npm run lint
npm run test
npm run build
```

## Architecture

The app follows a strict layered structure:

- `src/app`: bootstrap, providers, router
- `src/modules`: feature domains split into `api`, `hooks`, `components`, `pages`, `types`, `utils`
- `src/shared`: reusable components, hooks, utils, libs, and base types
- `src/config`: validated environment access
- `src/styles`: global styles

Rules enforced in code:

- API files contain typed request functions only
- Hooks wrap TanStack Query and mutations only
- Pages consume hooks, not raw API functions
- Zustand holds auth and UI state only
- Shared components stay module-agnostic

## Brand System

- Primary: `#7B1F3A`
- Page background: `#F9F3F5`
- Surface: `#FFFFFF`
- Supporting tokens are defined in `tailwind.config.ts`

## Key Features

- Dashboard with auto-refreshing stats and charts
- Filterable management tables for subscriptions, payments, orders, requests, providers, customers, and services
- Pending contract approval and rejection flows
- Category and service management surfaces
- Emergency package form with multi-service assignment
- Protected auth flow for `WrshaMaintAdministrator`

## Testing

Each module hook file includes Vitest coverage for:

- Query key construction
- API binding
- Mutation success invalidation
- Error/success toast behavior where applicable
