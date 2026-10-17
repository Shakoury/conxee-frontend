# Batch 1 — Registration and authentication

The nine requested screens are implemented as lazy React Router 7 pages: Landing, Login, Institution, Faculty & Department, Account Details, Email Verification, optional Student ID, Forgot Password, and Reset Password. `/register/institution` remains an alias of `/register`.

The centered card structure adapts the public [Shadcnblocks Signup 1](https://shadcnblocks.com/block/signup1) and [Login 1](https://shadcnblocks.com/block/login1) React source, retrieved from their public registry. The supplied `/group/` URLs now return 404; their current categories are `/blocks/signup` and `/blocks/login`. The category does not offer a ready-made five-step wizard, so Signup 1 was extended with five routes, shared progress, draft state, route guards, keyboard navigation and reduced-motion-aware transitions. There are no Next.js imports or social-auth buttons without a backend.

## State and validation

React Hook Form and Zod validate all forms. Passwords require 8–128 characters; usernames require 3–30 letters, numbers or underscores. Confirm-password checks run before requests. Errors are associated with each field for screen readers. Requests disable the relevant controls while pending; registration errors preserve the draft for correction and retry.

RegistrationContext holds the entire draft in React memory, including the password. Neither localStorage nor sessionStorage stores registration data. Returning through earlier steps preserves submitted values. Changing an institution clears faculty/department; changing the email invalidates verification. Reloading discards the draft and redirects deep links to the earliest incomplete step. Arriving at Login clears the draft, including after successful registration. The backend must independently enforce verification and validation; client guards are navigation conveniences.

## Institutions and suggestions

The exact `ng-universities` npm name is unavailable (public registry E404). Per the user's instruction to use the public NUC catalogue, institution search uses the backend's confirmed public endpoint:

```
GET /institutions?q=Lagos
{ "data": [{ "id": "<UUID>", "name": "University of Lagos, Lagos", ... }], "next_after": null }
```

A live read confirmed real UUIDs and government source URLs, including `https://enuc.nuc.edu.ng/nus`, as well as approved polytechnic/college sources. Institution IDs are always taken from this response, never invented from names or replaced by package slugs. Search uses a 250ms debounce and cancels superseded requests. Up to 30 visible results are offered; refine the search for a more specific match. The official NUC website is an authoritative source, not a promise of a separate stable public JSON API.

The available ISC-licensed `@i-302/ng-unis` package supplies faculty/department suggestions for its four covered universities. It is not the institution authority and its coverage is limited. Both fields accept new free-text entries. The backend institution-scoped faculty/department paths returned 404; no unsupported backend catalogue endpoints are silently presented as working.

## Auth requests

Production retains `VITE_API_URL=/api` and the same-origin Vercel proxy; these are frontend proxy paths, not a backend `/api` route prefix. All requests use the central API wrapper with `credentials: "include"`. Login/refresh success messages are followed by `GET /users/me`, preserving the already confirmed backend contract. HttpOnly cookies stay inaccessible to JavaScript.

| Trigger                          | Backend route                    | JSON body                                                                                       |
| -------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------- |
| Login                            | POST `/auth/login`               | `{ email, password }`                                                                           |
| First code request / resend      | POST `/auth/resend-verification` | `{ email }`                                                                                     |
| Verify code                      | POST `/auth/verify-email`        | `{ email, code }`                                                                               |
| Create account / skip student ID | POST `/auth/register`            | `{ institution_id, faculty, department, display_name, username, email, password, student_id? }` |
| Forgot password                  | POST `/auth/forgot-password`     | `{ email }`                                                                                     |
| Reset password                   | POST `/auth/reset-password`      | `{ token, password }`                                                                           |

The user confirmed email verification is supported before account creation. Step 3 requests the initial code, Step 4 verifies it, and only Step 5 creates the account. Resend has a 60-second client cooldown; backend rate limits remain authoritative. The optional student ID is omitted when skipped or blank. Registration success returns to Login with a confirmation message; login success goes to `/`. Reset reads `token` from the query string and blocks submission when it is absent. Forgot-password success does not disclose whether an email has an account.

## Validation and review

Run `npm run build`, `npm test`, and `npm run test:e2e`. With an existing injected VITE_API_URL, it overrides .env files; use `VITE_API_URL=/api npm run build` when verifying the production proxy configuration. Playwright tests mock auth endpoints to exercise success, rejection, OTP retry/cooldown, registration with/without student ID, password reset, field validation, keyboard selection, search retry, and memory-only state.

`artifacts/batch1-*.png` includes each screen at 375px, 768px and 1440px. Screenshots finish entrance animations before capture. Automated WCAG AA checks cover the account form in both themes at each width; earlier shell checks remain in the suite. Automated checks do not replace human accessibility review.

Live institution lookup was verified. Direct empty-body auth probes returned 403 before useful payload validation, so successful email delivery, OTP validation, account creation and password reset against the deployed backend are not claimed. No real user account was created or reset during testing. These flows require a deployment with the same-origin proxy and an authorized test account/email for live validation.

Batch 2 has not started and requires approval.

## Screenshots

| Screen               | 375px                                             | 768px                                             | 1440px                                              |
| -------------------- | ------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------- |
| Landing              | [375px](artifacts/batch1-landing-375.png)         | [768px](artifacts/batch1-landing-768.png)         | [1440px](artifacts/batch1-landing-1440.png)         |
| Login                | [375px](artifacts/batch1-login-375.png)           | [768px](artifacts/batch1-login-768.png)           | [1440px](artifacts/batch1-login-1440.png)           |
| Institution          | [375px](artifacts/batch1-institution-375.png)     | [768px](artifacts/batch1-institution-768.png)     | [1440px](artifacts/batch1-institution-1440.png)     |
| Faculty & department | [375px](artifacts/batch1-faculty-375.png)         | [768px](artifacts/batch1-faculty-768.png)         | [1440px](artifacts/batch1-faculty-1440.png)         |
| Account details      | [375px](artifacts/batch1-signup-375.png)          | [768px](artifacts/batch1-signup-768.png)          | [1440px](artifacts/batch1-signup-1440.png)          |
| Email verification   | [375px](artifacts/batch1-verification-375.png)    | [768px](artifacts/batch1-verification-768.png)    | [1440px](artifacts/batch1-verification-1440.png)    |
| Student ID           | [375px](artifacts/batch1-student-id-375.png)      | [768px](artifacts/batch1-student-id-768.png)      | [1440px](artifacts/batch1-student-id-1440.png)      |
| Forgot password      | [375px](artifacts/batch1-forgot-password-375.png) | [768px](artifacts/batch1-forgot-password-768.png) | [1440px](artifacts/batch1-forgot-password-1440.png) |
| Reset password       | [375px](artifacts/batch1-reset-password-375.png)  | [768px](artifacts/batch1-reset-password-768.png)  | [1440px](artifacts/batch1-reset-password-1440.png)  |

Final local result: production build passed using `VITE_API_URL=/api`; 5 API unit tests and all 20 Playwright tests passed. Live auth success remains unverified.

## BUKCZ design only

The BUKCZ reference is used solely for the auth screens' visual appearance: split desktop composition, compact mobile layout, logo/background artwork, typography hierarchy, spacing and circular progress display. Conxee's original inputs and inline dropdowns are retained; no popup chooser behavior was added.

The BUKCZ behavior port is reverted. Conxee retains its original nine screens, route-per-step navigation, registration context, React Hook Form/Zod validation, OTP verification, API wrapper, payloads and request order. The existing landing page, shells and other features are unchanged. Presentation code is limited to AuthFrame and `src/styles/auth-design.css`, with the two required visual assets.
