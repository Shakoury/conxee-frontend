# CONXEE web frontend — Batches 0 and 1

React 19, Vite 6, TypeScript, Tailwind CSS 4, React Router 7, and shadcn-style components built on Radix primitives. The app contains the design system, responsive navigation shells, registration/authentication screens and placeholder feature routes. See [Batch 1 implementation and verification](BATCH1.md) for the auth-only BUKCZ source port, five-step signup flow, backend contracts and screenshots. Social features and Batch 2 are not implemented.

## Development

Use Node.js 22 or 24 and npm. The application root is this repository root.

```sh
npm ci
cp .env.example .env # only if .env does not already exist
# Set VITE_API_URL to the Conxee backend URL in .env
npm run dev
```

Vite serves on port 5173. Auth requests use the same-origin `/api` proxy, matching BUKCZ. Vercel's existing rewrite forwards `/api/*` to the backend root, not a backend `/api` prefix. `VITE_API_URL` is no longer read by the transport. Locally, the Vite proxy targets `BUKCZ_DEV_API_TARGET` or the existing HTTPS backend. The backend must allow the frontend Origin, and Secure/HttpOnly cookie authentication requires the appropriate HTTPS deployment. Never put credentials in public Vite variables.

## Validation

```sh
npm run build
npm test
npm run test:e2e
```

Browser tests use `/usr/bin/chromium` in this cloud environment. Elsewhere set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an installed Chromium executable. Browser tests run a Vite server automatically and mock the auth API; they do not establish connectivity to a real Conxee backend. The test-only component harness lives under `tests/` and is not included in the production build.

## Backend contract

Login and refresh return success messages; authenticated profiles are read from `/users/me`. Registration follows BUKCZ's `account_type` plus nested `academic_context` contract. Faculty/programme choices come from `/academics?institution_id=…`. Account creation precedes emailed-token verification. Passwords require 12–72 characters and at most 72 UTF-8 bytes. See [BATCH1.md](BATCH1.md) for route compatibility, payloads, source provenance and validation scope. Campus sessions do not grant separate admin access.

## Theme and tokens

First visit defaults to light. `useTheme().setTheme('light' | 'dark' | 'system')` persists the preference under `conxee-theme`; system mode follows live OS changes. Settings UI is deferred. Color, typography and 4px spacing tokens live in `src/styles/tokens.css`; Tailwind 4's CSS-first `@theme` extends utilities (`text-h1`, `text-h2`, `text-body`, etc.). No Tailwind 3 configuration is required.

Teal is used only for the logo/icon. Interface controls use neutral colors; destructive and status colors have readable light-theme semantic variants and neutral dark-theme variants. Form outlines use a higher-contrast semantic outline token. Reduced-motion preferences disable skeleton animation.

## Components

`src/components/ui/` contains Button (primary/secondary/ghost/icon/destructive), Input, SearchInput, Select, Textarea, FileUpload, Avatar (sm/md/lg), AvatarGroup, Badge, ToastProvider/useToast, Modal, ConfirmModal, Sheet (bottom/side), Skeleton, EmptyState, ErrorState and OfflineBanner. Icon buttons require an accessible label. FileUpload filters drag-and-drop files by `accept` and supports single/multiple files; server-side file validation is still required. Modal exposes title/description, body via children, and footer slots. Async confirmation supports an externally managed pending state.

Mobile uses top and bottom bars below 768px; tablet uses an icon sidebar at 768–1024px; desktop uses an expanded sidebar above 1024px. DesktopLayout accepts an optional rightPanel slot. Every page is loaded through a React Router lazy route. Static create routes take precedence over dynamic ID routes. Public routes use a minimal layout; admin routes use their own shell.

## Review artifacts

`artifacts/` includes 375px mobile, 768px tablet, 1440px desktop, a dark-theme capture, and a screenshot of the real folder structure. Shell screenshots use a mocked authenticated session, with no production auth bypass. Browser tests regenerate the screenshots. Batch 1 screenshots and verification details are in [BATCH1.md](BATCH1.md). Batch 2 requires review and approval.
