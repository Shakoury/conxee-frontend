# CONXEE web frontend — Batch 0

React 19, Vite 6, TypeScript, Tailwind CSS 4, React Router 7, and shadcn-style components built on Radix primitives. This batch contains the design system, responsive navigation shells and placeholder routes only. No Batch 1 features or login forms are implemented.

## Development

Use Node.js 22 or 24 and npm. The application root is this repository root.

```sh
npm ci
cp .env.example .env # only if .env does not already exist
# Set VITE_API_URL to the Conxee backend URL in .env
npm run dev
```

Vite serves on port 5173. `VITE_API_URL` is configured as `https://bukcz-api.13.61.98.162.sslip.io/api` and must identify the real backend for live sessions; no backend is included. The public `.env.production` supplies this URL for production builds. A Vercel project environment variable takes precedence; if configured there, set it to the same URL including `/api` and redeploy. Restart Vite after changing it. If unset, API requests use the current origin (for deployments with an API reverse proxy). Do not put secrets in VITE variables: they are public browser configuration.

## Validation

```sh
npm run build
npm test
npm run test:e2e
```

Browser tests use `/usr/bin/chromium` in this cloud environment. Elsewhere set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an installed Chromium executable. Browser tests run a Vite server automatically and mock the auth API; they do not establish connectivity to a real Conxee backend. The test-only component harness lives under `tests/` and is not included in the production build.

## Backend contract

All requests use `credentials: "include"`; tokens are never read by JavaScript or stored in localStorage.

- `POST /auth/login`: JSON `{ email, password }`, response `{ user }`.
- `POST /auth/refresh`: response `{ user }`, or 401 for no valid session.
- `POST /auth/logout`: success JSON or 204.
- User shape: `{ id, username, display_name, email, role, is_verified, student_verification_status }`. Admin access requires `role: "admin"`. An optional `avatarUrl` can be used when supplied.

The login and refresh response shapes and HttpOnly cookie session handling were confirmed by the user. The backend must configure credentialed CORS for the frontend origin, appropriate HttpOnly cookie attributes, and CSRF protection. Cross-origin cookies may require `SameSite=None; Secure`. The API wrapper shares concurrent refreshes and retries protected requests once on 401. Backend authorization remains authoritative; frontend guards provide navigation behavior only.

Auth context exposes `user`, `isAuthenticated`, `isAdmin`, `isLoading`, `error`, `login()` and `logout()`. Session restoration failures leave the user unauthenticated. Public pages are intentionally placeholders. A denied admin navigation reaches Login with an `admin-required` navigation state, preventing the ordinary authenticated-login redirect from immediately sending the user home.

## Theme and tokens

First visit defaults to light. `useTheme().setTheme('light' | 'dark' | 'system')` persists the preference under `conxee-theme`; system mode follows live OS changes. Settings UI is deferred. Color, typography and 4px spacing tokens live in `src/styles/tokens.css`; Tailwind 4's CSS-first `@theme` extends utilities (`text-h1`, `text-h2`, `text-body`, etc.). No Tailwind 3 configuration is required.

Teal is used only for the logo/icon. Interface controls use neutral colors; destructive and status colors have readable light-theme semantic variants and neutral dark-theme variants. Form outlines use a higher-contrast semantic outline token. Reduced-motion preferences disable skeleton animation.

## Components

`src/components/ui/` contains Button (primary/secondary/ghost/icon/destructive), Input, SearchInput, Select, Textarea, FileUpload, Avatar (sm/md/lg), AvatarGroup, Badge, ToastProvider/useToast, Modal, ConfirmModal, Sheet (bottom/side), Skeleton, EmptyState, ErrorState and OfflineBanner. Icon buttons require an accessible label. FileUpload filters drag-and-drop files by `accept` and supports single/multiple files; server-side file validation is still required. Modal exposes title/description, body via children, and footer slots. Async confirmation supports an externally managed pending state.

Mobile uses top and bottom bars below 768px; tablet uses an icon sidebar at 768–1024px; desktop uses an expanded sidebar above 1024px. DesktopLayout accepts an optional rightPanel slot. Every page is loaded through a React Router lazy route. Static create routes take precedence over dynamic ID routes. Public routes use a minimal layout; admin routes use their own shell.

## Review artifacts

`artifacts/` includes 375px mobile, 768px tablet, 1440px desktop, a dark-theme capture, and a screenshot of the real folder structure. Shell screenshots use a mocked authenticated session, with no production auth bypass. Browser tests regenerate the screenshots. Batch 1 is pending review and approval.
