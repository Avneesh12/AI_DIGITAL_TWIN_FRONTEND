# AI Digital Twin — Frontend

Production-ready Next.js 15 frontend for the AI Digital Twin platform.

---

## Stack

| Concern | Technology |
|---------|-----------|
| Framework | Next.js 15 + App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + custom design tokens |
| UI | Radix UI primitives (shadcn/ui pattern) |
| State | Zustand + Immer |
| Forms | React Hook Form + Zod |
| HTTP | Axios with silent JWT refresh |
| Notifications | Sonner |
| Testing | Jest + Playwright |

---

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL to your backend URL

# 3. Develop
npm run dev

# 4. Build
npm run build && npm start
```

---

## Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── (auth)/                 # Login / register (no dashboard layout)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/              # Protected app shell
│   │   ├── layout.tsx          # Sidebar + topbar shell
│   │   ├── chat/page.tsx
│   │   ├── memory/page.tsx
│   │   ├── personality/page.tsx
│   │   ├── decisions/page.tsx
│   │   ├── history/page.tsx
│   │   └── settings/page.tsx
│   ├── globals.css             # Design system tokens + base styles
│   └── layout.tsx              # Root layout (fonts, theme, auth provider)
│
├── components/
│   └── layout/
│       ├── app-sidebar.tsx     # Primary navigation sidebar
│       └── topbar.tsx          # Top bar with memory indicator + theme toggle
│
├── features/                   # Feature-sliced modules
│   ├── auth/components/
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── chat/components/
│   │   ├── chat-window.tsx     # Top-level chat orchestrator
│   │   ├── chat-message.tsx    # Individual message bubble
│   │   ├── chat-composer.tsx   # Input + send + suggestions
│   │   └── chat-empty.tsx      # Empty state with prompt starters
│   ├── memory/components/
│   │   └── memory-panel.tsx    # Searchable, filterable memory list
│   └── personality/components/
│       └── personality-overview.tsx  # Editable Big Five + trait fields
│
├── lib/
│   ├── api/
│   │   ├── client.ts           # Axios instance + JWT refresh interceptor
│   │   ├── auth.ts             # Auth endpoint wrappers
│   │   ├── chat.ts             # Chat endpoint wrappers
│   │   ├── memory.ts           # Memory endpoint wrappers
│   │   └── personality.ts      # Personality endpoint wrappers
│   └── utils.ts                # cn(), formatDate(), traitLabel(), etc.
│
├── providers/
│   ├── auth-provider.tsx       # Hydrates auth on mount, sets cookie hint
│   └── theme-provider.tsx      # next-themes wrapper
│
├── store/
│   ├── auth-store.ts           # Global auth state (Zustand + Immer)
│   └── chat-store.ts           # Chat messages + send/retry/history
│
├── types/
│   └── index.ts                # All shared TypeScript types
│
└── middleware.ts                # Edge route protection
```

---

## Architecture Decisions

### Token Storage
- **Access token** → `sessionStorage` + in-memory variable. Cleared on tab close. Not accessible by other tabs.
- **Refresh token** → `localStorage`. Persistent across sessions.
- **Cookie hint** (`adt_auth_hint`) → plain cookie set by JS after login. Readable by Next.js Edge middleware for redirect logic. Contains no sensitive data.

This avoids storing the access token in localStorage (XSS risk) while still allowing middleware-level route guarding.

### State Layers

| Data | Where |
|------|-------|
| Auth session | Zustand `useAuthStore` (global) |
| Active chat messages | Zustand `useChatStore` (global) |
| Personality profile | Component state (fetched on mount) |
| Memory list | Component state + URL filter params |
| Form values | React Hook Form (local) |
| Composer input | `useState` (local) |
| Theme | `next-themes` (persisted) |

### JWT Refresh Flow
Axios response interceptor catches 401s and:
1. Deduplicates concurrent refresh requests (single `_refreshPromise`)
2. Calls `POST /auth/refresh` with the stored refresh token
3. Retries the original failed request with the new token
4. If refresh fails → clears tokens → redirects to `/login?reason=session_expired`

### Optimistic Chat UI
On message send:
1. User message is immediately appended to the list
2. A `isPending: true` assistant message shows the typing indicator
3. On success: pending is replaced with the real response
4. On failure: pending is removed, error is shown inline with a retry option

---

## Design System

**Font:** DM Sans (body) + DM Serif Display (headings) — warm, editorial, distinctive.

**Color Palette:** Warm stone neutrals with a single amber-gold accent. No blue AI clichés.

```css
/* Warm stone neutrals */
--bg-primary:    #FAFAF9   (page background)
--bg-secondary:  #F5F5F4   (cards, inputs)
--bg-tertiary:   #EEEDE9   (hover states, borders)
--bg-elevated:   #FFFFFF   (sidebar, chat bubbles)

/* Amber accent */
--accent:        #F59E0B
--accent-light:  #FEF3C7
--accent-text:   #78350F

/* Typography */
--text-primary:   #1C1917
--text-secondary: #57534E
--text-tertiary:  #A8A29E
```

All tokens have dark mode equivalents that automatically apply via the `.dark` class.

---

## Testing

```bash
# Unit tests (Jest)
npm test

# Type checking
npm run type-check

# E2E tests (Playwright) — requires running dev server + backend
npx playwright test

# E2E with UI
npx playwright test --ui
```

**Test coverage targets:**
- `lib/utils.ts` — 100% unit tested
- `store/auth-store.ts` — state transitions tested
- `store/chat-store.ts` — optimistic send + retry tested
- E2E: register → login → chat → personality update → memory view

---

## Deployment

### Vercel (recommended)
```bash
npx vercel --prod
# Set NEXT_PUBLIC_API_URL in Vercel environment variables
```

### Docker
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

### Railway / Render
- Set build command: `npm run build`
- Set start command: `npm start`
- Set `NEXT_PUBLIC_API_URL` to your backend URL

---

## Performance Notes

- **Server Components** are used for page metadata only; all interactive components are `"use client"` due to the auth-gated dashboard nature of the app.
- **Code splitting** is automatic via Next.js App Router — each page is a separate chunk.
- **Skeleton loaders** are shown for all data-fetching screens (memory, personality, history, decisions).
- **Font optimization** via `next/font/google` with `display: swap`.
- The embedding model on the backend is pre-warmed at startup, so first chat response latency is low.

---

## Accessibility

- All interactive elements have visible focus rings (`outline: 2px solid var(--accent)`)
- Semantic HTML throughout (`<nav>`, `<main>`, `<aside>`, `<header>`, `<form>`)
- Form labels are explicitly associated with inputs
- Color contrast ratios exceed WCAG AA for all text/background combinations
- `prefers-reduced-motion` is respected by using `transition-none` utilities when detected
- `aria-label` attributes on icon-only buttons (theme toggle, close, delete)
