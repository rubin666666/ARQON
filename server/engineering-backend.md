# Calculation backend

The Pages site works independently: material balance, supplied capacity points, model comparison, saved/shared scenarios and a local PDF summary. Missing engineering data stays null. The server code is ready for a separately configured Cloudflare Worker; it is not deployed by the Pages workflow.

## Activation

1. Complete manufacturer parameters in `config/engineering.json`, preserving units and source versions. Only set `thermalApproved` after the supplied thermal model is confirmed. The confidential product-on-platform quantity is not published. Do not infer working electrical power by summing unconfirmed motor ratings.
2. Deploy `server/engineering-worker.mjs` with the existing Wrangler tooling and `nodejs_compat`. Bind a KV namespace as `CALCULATIONS`, and a Cloudflare rate limiter as `RATE_LIMITER`. Configure `ALLOWED_ORIGINS` as an exact comma-separated allowlist. Set `RETENTION_DAYS` to the agreed retention period; without it the API refuses storage.
3. Set `PUBLIC_FONT_URL` to the deployed `/ARQON/fonts/NotoSans.ttf`. Set HTTPS `CRM_WEBHOOK_URL` and `DELIVERY_WEBHOOK_URL` to adapters for the chosen services. Store `CRM_WEBHOOK_TOKEN` and `DELIVERY_WEBHOOK_TOKEN` as Worker secrets, never frontend configuration.
4. Fill `calculationEndpoint` with the Worker origin (without `/api`) and approved UA/EN `privacy` text in `config/site.json`. The personalized form appears only when both exist. Phone enquiries can work without email delivery; the email option requires its adapter.
5. Exercise a real enquiry and email before release. A successful webhook response means service acceptance, not inbox delivery. Configure monitoring and a retry process for saved leads whose delivery flags remain false.

## API contract

- `POST /api/calculations`: `{input, locale: "uk" | "en"}`. Server recomputes all results using its versioned parameter file. Returns calculation ID, bearer access token and results. The token is hashed at rest.
- `POST /api/leads`: bearer token; `{calculationId, contact: {name,email,phone,preferredChannel}, reportConsent:true, marketingConsent:boolean, source}`. Only the selected channel is required. Stores the complete input/result snapshot and separate consent flags.
- `POST /api/calculations/report`: bearer token; `{calculationId}`. Available after contact capture. Produces a personalized PDF from the saved snapshot, including missing-data notices.

CRM receives JSON with contact, consent, attribution, input, result and engine/parameter versions. Email adapter receives recipient, language, filename and PDF in `attachmentBase64`. Both adapters must deduplicate `Idempotency-Key` (calculation ID). KV is eventually consistent, so this is not a transactional exactly-once delivery guarantee. Keep webhook recipients fixed in server configuration. Rate limiting must be enabled on the deployed endpoint; CORS alone does not prevent scripted submissions.

Messaging apps, provider-specific CRM mapping, automatic recommendations, real email delivery and commercial pricing require the relevant client data/configuration. They are not simulated. All stored records expire according to the configured retention period; deletion requests can be fulfilled by deleting the calculation ID from KV and the corresponding downstream CRM records.
