# Contract Request: public contact forms (Contacto, Trabajá conmigo) — Pre-Contract v1

- **Date:** 2026-09-26
- **From:** Frontend Architect (vamosany-front-end), via the user
- **To:** backend team (`vamosany-back`)
- **Spec:** `docs/specs/sobre-mi/spec.md` § Data Dependencies, § Form States, AC 41–45
- **Plan:** `docs/specs/sobre-mi/plan.md` § Data writes
- **Status:** Proposed. The frontend ships against this shape now (mocked). The backend adopts it or sends a replacement, and the frontend reconciles when it lands.

## How the frontend calls it

Each form posts to a Next.js Server Action. The action validates with zod and then makes a **server-to-server** `POST` to a URL built from a server-only env var. The browser never sees the endpoint.

| Env var (server-only, never `NEXT_PUBLIC_`) | Meaning |
|---|---|
| `FORMS_API_BASE_URL` | e.g. `https://api.vamosany.example/` in prod. **Unset → the frontend makes no request and shows "Por ahora, escribime a hola@vamosany.com."** This is the expected prod state until the backend exists. |
| `FORMS_API_TIMEOUT_MS` | optional, default `8000`. The request is aborted after this. |

## Endpoint 1 — contact message

`POST {FORMS_API_BASE_URL}/v1/contact-messages`

Headers: `Content-Type: application/json`, `Accept: application/json`, `Idempotency-Key: <uuid v4, one per submit attempt>` (proposed; the backend may ignore it).

```ts
// request body
z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(254),
  topic: z.enum(["itinerario", "consultoria", "viajes-grupales", "productos", "colaboraciones", "otro"]),
  travelDate: z.string().max(60).nullable(),   // free text, e.g. "Diciembre 2026"; null when empty
  message: z.string().min(1).max(5000),
  locale: z.literal("es"),                      // pt/en later
})
```

## Endpoint 2 — collaboration request

`POST {FORMS_API_BASE_URL}/v1/collaboration-requests`

```ts
z.object({
  name: z.string().min(1).max(100),
  company: z.string().min(1).max(120),
  collaborationType: z.enum(["marca", "servicio-nueva-york", "guia", "empresa", "agencia", "otro"]),
  email: z.string().email().max(254),
  idea: z.string().min(1).max(5000),
  locale: z.literal("es"),
})
```

Enum values are stable slugs. The Spanish labels live only in the frontend.

## Responses (both endpoints)

| Response | Frontend state |
|---|---|
| any **2xx** (proposed `202 Accepted` with `{ id: string }`; the body is optional and not shown) | **Success** ("¡Recibido!") |
| **422** with `fieldErrors` (shape below) whose codes are all known | **Field error** on those fields |
| 422 without `fieldErrors`, or with an unknown code; any other 4xx (400, 413, 429…); 5xx; timeout; network error; a body that fails schema parsing | **Failed** ("No se pudo enviar tu mensaje…") |

Error shape, aligned with `frontend-security-conventions.md § Error Responses`:

```ts
z.object({
  timestamp: z.string(),
  status: z.number(),
  error: z.string(),                 // e.g. "validation_failed"
  message: z.string(),               // never shown to the Visitor
  path: z.string(),
  fieldErrors: z.record(z.string(), z.array(z.enum(["required", "invalid_email", "invalid_option", "too_long"]))).optional(),
})
```

Codes, not copy: the frontend maps `field + code` to the spec's Spanish messages. `too_long` has no approved copy yet, so it maps to Failed (the UI's `maxLength` attributes make it unreachable from the form).

## Asks for the backend team

1. Adopt or replace the two paths, payloads and the 422 shape above. If you replace them, send the OpenAPI fragment; the frontend updates `lib/api/schemas/forms.ts` and the MSW handlers.
2. Confirm the field length limits (proposed above; the spec routes them to you).
3. **Auth between Vercel and the API:** decide with the Frontend Security Engineer (shared secret header, e.g. `Authorization: Bearer <FORMS_API_TOKEN>`, or none plus WAF). The frontend has reserved an optional server-only `FORMS_API_TOKEN` but does not send it until this is decided.
4. **Anti-spam and privacy** (Security's call, Production posture): rate limit (public forms default 10/IP/hour), bot protection, and PII retention ("Uso tu email solo para responderte" must stay true). Decide which of these sit in the API and which in the frontend.
5. "Received" = the API answered 2xx after persisting or queuing the message. The success metric (submissions per month) is counted at this endpoint.

## Mock the frontend codes against (until the contract lands)

- Vitest: `tests/fixtures/msw/handlers/sobre-mi.ts` (MSW `http.post` on both paths), composed in `tests/fixtures/msw/server.ts`.
- Playwright: `tests/fixtures/delivery/mock-server.ts`, a tiny `node:http` server that Playwright starts as a second `webServer` (port 3199). The Server Action's `fetch` runs in the Next server, so `page.route()` can't intercept it.
- Both use one resolver, `tests/fixtures/delivery/scenarios.ts`, with synthetic data only. The scenario is picked by the email's local part:

| Email | Response |
|---|---|
| `invalido@ejemplo.test` | 422, `fieldErrors: { email: ["invalid_email"] }` |
| `falla@ejemplo.test` | 500 |
| `limite@ejemplo.test` | 429 |
| `lento@ejemplo.test` | 202 after `FORMS_API_TIMEOUT_MS + 500` ms (the frontend times out first → Failed) |
| anything else | 202 `{ id: "msg_test_0001" }` |

Commits that consume the mock carry the footer `Pre-Contract: POST /v1/contact-messages, /v1/collaboration-requests mocked; reconcile when contract lands`.
