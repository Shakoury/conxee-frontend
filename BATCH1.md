# Batch 1 — BUKCZ auth replacement

The current login, registration and recovery implementation is ported from `Shakoury/BUKCZ` at commit `c04c5b137bcbaa1411a083aa395be4c6a42a1276`, specifically `frontend/src/production/auth-pages.tsx`, `signup.tsx`, `institution-picker.tsx`, and their required UI helpers/styles/assets. This supersedes the earlier Shadcnblocks-based Batch 1 implementation.

Scope is **authentication and registration only**, following the user's clarification. Conxee's landing page, authenticated navigation/layouts, feature placeholders and admin separation are retained. Feed, chat, groups, marketplace, Watch and other BUKCZ feature implementations were not imported.

## Source flow

BUKCZ's login/signup tabs, desktop story panel, compact mobile forms, five-step wizard, institution search dialog, academic selectors, missing-entry submission, student/aspirant options, optional student ID, verification-link page and password recovery are reused under `src/features/bukcz-auth/`.

The registration steps are Institution → Faculty → Programme → optional Student ID → Account details. Registration happens before verification. The body is the backend's strict nationwide registration contract:

```json
{
  "account_type": "student",
  "display_name": "Example Student",
  "username": "example.student",
  "email": "student@example.com",
  "password": "example-password-123",
  "academic_context": {
    "institution_id": "<UUID>",
    "faculty_id": "<UUID>",
    "programme_id": "<UUID>"
  }
}
```

`student_id` is included only when supplied for a student account. Missing institutions use `institution_name` plus `institution_type`; missing academic choices use `faculty_name` and `programme_name` instead of their IDs. These entries go to catalogue review. The directory is queried through `/institutions?q=…&limit=20`; academic choices come from `/academics?institution_id=…`. The unrelated university npm dataset and the old registration context/forms were removed.

Passwords follow BUKCZ's 12–72 character limits and 72-byte UTF-8 guard. Registration state stays in React component memory and is lost on reload; credentials are not stored in browser storage. Student eligibility remains separate from email confirmation.

## Routes and cookies

- `/login` and `/auth`: source login/signup page, Login tab selected.
- `/register`: same source page, Signup tab selected.
- Legacy `/register/institution`, `/register/faculty`, `/register/details`, `/register/student-id`: redirect to the consolidated source wizard.
- `/verify-email` and `/register/verify`: token-link verification and resend page.
- `/forgot-password` and `/reset-password?token=…`: source password recovery.

Registration returns to `/verify-email`. The verification page reads the emailed `token`, fetches `/auth/verification-details`, then posts `{ token }` to `/auth/verify-email`. There is no six-digit OTP or pre-registration verification request in this source flow. Login handles `EMAIL_VERIFICATION_REQUIRED`, loads `/users/me` after cookie login, and then returns to Conxee's home page. Password recovery validates the backend success messages before showing completion. The campus AuthContext never grants the separate admin session.

All requests use the central API wrapper with the same-origin `/api` proxy, `credentials: "include"`, shared 401 refresh and approved backend error codes/support references. `VITE_API_URL` no longer controls requests, matching BUKCZ's fixed proxy transport. Vercel's existing API rewrite remains unchanged. A development-only Vite `/api` proxy targets `BUKCZ_DEV_API_TARGET` or the existing HTTPS backend; browser-cookie authentication still requires the backend's allowed Origin and correct HTTPS/cookie configuration.

Only auth selectors from BUKCZ's stylesheets were copied/scoped. Required dialog portals have auth-specific classes so styles do not affect Conxee's existing dialogs, feature pages or layout shells. BUKCZ's brand mark/background are included solely for the auth pages.

## Verification

Run `npm run build`, `npm test`, `npm run test:e2e`. Browser tests use mocked responses to verify the real source-shaped registration payload, academic catalogue selection, missing entries/aspirants, optional student ID, password confirmation and byte limits, login/profile loading, verification-token requests, recovery, and responsive screenshots. Existing shell/component tests continue to check Conxee's retained features. Mock-backed tests do not establish live email delivery, cookie issuance, deployed backend availability or real account creation.

BUKCZ's full backend/PostgreSQL/Redis integration suite is not copied into this standalone auth-only change and is not claimed as executed. No real account/email was used for registration or reset during these checks.

Current preview files are `artifacts/bukcz-auth-login-{375,768,1440}.png`, `artifacts/bukcz-auth-signup-{375,768,1440}.png`, and `artifacts/bukcz-auth-details-{375,768,1440}.png`. Earlier `batch1-*` auth screenshots were removed; the unchanged landing previews are retained. This change does not implement unrelated later-batch features.

Validation result: production build, all 5 API tests and all 20 browser tests passed. The browser auth flows use mocks and do not establish live backend/email delivery.
