# SkyNex AI

SkyNex AI is an enterprise brand-governance and advertising-review platform. It stores approved brand rules, product facts, visual identity standards, and source evidence, then audits text and advertisement images before publication.

## What the application does

- Brand Knowledge and rule management
- PDF rule extraction with source/page evidence
- Admin-only Brand Knowledge imports
- Product catalog and authoritative pricing checks
- Text, document, and advertisement review
- Local OCR with Tesseract
- Optional Gemini contextual and visual analysis
- Logo, palette, layout, and accessibility review
- Human decisions, suggested fixes, version history, and publication approval
- Review History and recurring-issue insights
- Brand DNA analysis for websites and social references
- Role-based access control for Admin, Reviewer, and Creator users

The core principle is evidence before confidence. If extraction or AI analysis is incomplete, the result must be marked incomplete or require human verification rather than silently passing.

## Architecture

~~~text
Browser / Cloudflare
  React + Vite frontend
          |
          | HTTPS JSON API
          v
Render Web Service
  Express + TypeScript
  server.ts
     |             |
     |             +--> Gemini API (optional)
     |                  PDF extraction, context, image vision
     |
     +--> Local engines
     |    pdf-parse
     |    Tesseract OCR
     |    Sharp image processing
     |    deterministic rule engine
     |
     +--> .skynex-persistent-store.json
          demo persistence for brands, rules, products,
          audit reports, decisions, and security events
~~~

### Deployment model

The recommended split is:

- Frontend: Cloudflare Pages or a Cloudflare Worker/static deployment.
- Backend: Render Web Service.
- Gemini key: backend only, never in the browser.
- Custom domain: Cloudflare DNS routes traffic to the deployed service.
- API: frontend calls the Render backend through the configured API origin/proxy.

The Express server can also serve the built frontend from dist in production, so a separate Cloudflare frontend is optional.

## Repository structure

~~~text
server.ts                         Express API and review engines
src/App.tsx                       Main React application
src/types.ts                      Shared domain types
src/components/                   Workspace and modal components
src/data/mockBrands.ts            Seed brands, rules, products, history
src/data/userProfiles.ts          Role and permission matrix
src/data/userAccounts.ts          Seed accounts and authentication
src/data/clientApiFallback.ts     Frontend fallback/demo adapter
public/assets/uploads/             Persisted uploaded image assets
tests/                            Regression tests
vite.config.ts                    Vite configuration
package.json                      Scripts and dependencies
README.md                         Project and deployment guide
~~~

## Local setup

### Prerequisites

- Node.js 20 or newer
- npm
- Gemini API key for contextual/visual AI features
- Git

### Install

~~~bash
git clone <your-github-repository-url>
cd <repository-folder>
npm install --legacy-peer-deps
~~~

The legacy peer flag is currently required because the project contains a Vite/esbuild peer-dependency conflict.

### Environment variables

Create .env in the repository root:

~~~env
NODE_ENV=development
PORT=3000

GEMINI_API_KEY=your_gemini_api_key

ADMIN_PASSWORD=replace-with-a-strong-admin-password
REVIEWER_PASSWORD=replace-with-a-strong-reviewer-password
CREATOR_PASSWORD=replace-with-a-strong-creator-password
~~~

Never commit .env. Never put GEMINI_API_KEY in React code or Cloudflare public variables.

### Start locally

~~~bash
npm run dev
~~~

Open http://localhost:3000.

Development mode runs Vite middleware through Express, so the React frontend and API share one process.

## Production commands

Build the frontend:

~~~bash
npm run build
~~~

Start the production server:

~~~bash
NODE_ENV=production npm start
~~~

The production server:

1. Serves API routes under /api.
2. Serves static files from dist.
3. Provides the SPA fallback for frontend routes.
4. Listens on Render's PORT variable or port 3000.

## Render deployment

Create a Render Web Service connected to GitHub.

Use:

~~~text
Build Command:
npm install --legacy-peer-deps && npm run build

Start Command:
npm start
~~~

Add these environment variables in Render:

~~~text
NODE_ENV=production
GEMINI_API_KEY=...
ADMIN_PASSWORD=...
REVIEWER_PASSWORD=...
CREATOR_PASSWORD=...
~~~

After deployment, verify:

~~~text
https://<render-service>.onrender.com/api/health
~~~

Expected response:

~~~json
{
  "status": "ok",
  "geminiConfigured": true
}
~~~

Render Free plan considerations:

- The service may sleep after inactivity.
- First request after sleep may be slow.
- Tesseract and Gemini requests are CPU/time intensive.
- Local filesystem data is not a durable production database.
- Use PostgreSQL and object storage for real multi-user production.

## Cloudflare deployment

If the frontend is separate:

1. Run npm run build.
2. Deploy dist to Cloudflare Pages or the configured Worker/static application.
3. Configure the frontend API origin/proxy to the Render service.
4. Keep Gemini credentials only on Render.
5. Configure the custom domain in Cloudflare DNS.
6. Verify the frontend domain and the Render /api/health endpoint separately.

If the Render Express server serves dist, Cloudflare only needs to provide DNS, TLS, caching, or proxying.

For a Render custom domain, add the exact CNAME/root records shown by Render. Remove conflicting old A, AAAA, or CNAME records. DNS propagation can take time.

## Roles and permissions

### Workspace Admin

Can:

- Create and delete brands
- Upload/import Brand Knowledge
- Approve and replace imported rules
- Manage products and pricing
- Review security events
- Manage workspace governance

### Reviewer & Manager

Can:

- Inspect evidence and findings
- Accept or reject suggested fixes
- Request verification or escalation
- View history and insights

### Content Creator

Can:

- Write and submit content
- Upload documents and images for review
- Revise drafts based on findings

Only Workspace Admin can import Brand Knowledge. This is enforced by the backend, not only by hiding a frontend button.

Seed passwords are defined in src/data/userAccounts.ts and can be overridden with environment variables. Change them before sharing a deployment.

## Brand Knowledge workflow

1. Select the intended brand.
2. Open Brand Knowledge.
3. Upload a text-based guideline PDF.
4. The backend extracts page text with pdf-parse.
5. Multi-client documents require an explicit client section.
6. Structured rule rows are parsed deterministically first.
7. Gemini is used as a fallback when structured parsing finds nothing.
8. A heuristic parser is used when Gemini is unavailable or returns no rules.
9. Evidence is verified against the actual PDF text.
10. Admin batch import replaces the selected brand's rule catalog and stores an undo snapshot.
11. Imported Admin rules become Approved.
12. The approved rules are used by text and image review.

A decorative brand poster is not a reliable rule source. A source PDF should contain explicit actionable rules, for example:

~~~text
SSV-CLM-003
Claims
Do not claim guaranteed investment returns unless an approved substantiation document supports the claim.
Critical SSV-CLM-003
~~~

If a PDF contains multiple clients, it must not be imported into one brand without selecting the correct client section.

## Rule enforcement

Each rule includes:

- Rule ID and brand ID
- Category and title
- Rule statement
- Approved value
- Trigger patterns
- Severity and classification
- Source document, page, and section
- Evidence excerpt
- Version history
- Approval status

Only complete Approved rules are authoritative for live review.

### Generic prose rules

Rules do not need quotation marks to become enforceable. The backend derives triggers from prose such as:

- Do not claim guaranteed investment returns.
- Never use risk-free language.
- Advertisements must include prices and availability subject to verification.
- Certified materials are approved only when evidence exists.

This makes the same review engine usable for jewellery, finance, retail, healthcare, and other industries.

### Deterministic checks

The deterministic engine checks:

- Explicit target patterns
- Prohibited claims
- Terminology
- Required disclaimers
- Product-specific prices
- Product prohibited claims
- Source conflicts
- Approved rule status
- Evidence completeness

Product catalog pricing has precedence over generic pricing rules. If a product is ambiguous or unverified, the system requests human confirmation instead of guessing.

## Text and document review

1. Open Review Content.
2. Choose Paste Text or Upload Document.
3. Add the title and content.
4. Run Check Content.
5. Inspect each finding and evidence citation.
6. Accept, edit, reject, escalate, or request verification.
7. Approve publication only after pending blockers are resolved.

Supported document extraction includes text-based PDF, DOCX, TXT, and Markdown paths used by the API.

## Image review

Supported image formats:

- PNG
- JPG/JPEG
- WebP
- Maximum 10 MB

Workflow:

1. Open Review Content.
2. Choose Upload Image.
3. Upload the original creative or a screenshot.
4. Click Review Advertisement.
5. Image decoding is validated with Sharp.
6. OCR extracts visible text with Tesseract.
7. Deterministic rules check the OCR text.
8. Gemini Vision checks colors, logos, layout, accessibility, and visual issues when configured.
9. Findings are shown with evidence, severity, source, and suggested replacement.

### OCR and screenshots

Screenshots are accepted, but the engine can only review what is visible and readable:

- Cropped content cannot be recovered.
- Tiny text may be unreadable.
- Browser chrome may be included as image content.
- Resizing can reduce OCR confidence.
- Original advertisement files usually produce stronger results.

The server protects against malformed Gemini JSON. If Vision returns an incomplete response, local OCR and deterministic checks continue and visual analysis is marked incomplete.

### Color analysis

Color analysis is primarily Gemini Vision based. Gemini receives the selected brand palette, hex codes, visual guidelines, logo standards, and the advertisement image. It returns detected colors and conformity. The backend turns palette departures into visual findings.

OCR alone cannot understand colors. Without Gemini, text/product checks continue, but advanced color and logo analysis may require human verification.

## Product catalog

Products belong to a brand and can include:

- Name and SKU/model
- Category and status
- Price and promotional price
- Price verification
- Specifications
- Approved and prohibited claims
- Packaging details
- Logo placement
- Visual identity notes
- Source reference

Only Active products are authoritative for live audits. Unverified prices and claims require human confirmation.

## Brand DNA

Brand DNA analysis can inspect:

- Public website references
- Social/reference URLs
- Colors
- Typography
- Logo usage
- Visual identity
- Brand voice
- Reference content
- Consistency scores

Website analysis includes SSRF protections and validates public URLs before fetching.

## Main API routes

### Health and session

~~~text
GET  /api/health
GET  /api/session
GET  /api/auth/roles
POST /api/auth/switch-role
POST /api/session/switch-role
~~~

### Brands and state

~~~text
GET    /api/state
POST   /api/brands
DELETE /api/brands/:brandId
GET    /api/security/audit-events
~~~

### Rules and extraction

~~~text
POST   /api/brands/:brandId/rules
PUT    /api/brands/:brandId/rules/:ruleId
DELETE /api/brands/:brandId/rules/:ruleId
DELETE /api/brands/:brandId/rules
POST   /api/brands/:brandId/rules/undo
POST   /api/brands/:brandId/rules/batch
POST   /api/brands/:brandId/rules/ai-assist
POST   /api/brands/:brandId/rules/test
POST   /api/extract-text
POST   /api/extract-rules-from-pdf
~~~

### Review and decisions

~~~text
POST /api/audit
POST /api/audit-image
GET  /api/history
POST /api/history/:reportId/decision
POST /api/history/:reportId/approval
GET  /api/insights
~~~

### Brand DNA and products

~~~text
POST /api/brand-dna/analyze-website
POST /api/brand-dna/analyze-social
POST /api/brand-dna/:brandId/save
POST /api/brand-dna/:brandId/check-consistency
POST /api/brand-dna/:brandId/one-click-fix
GET  /api/brands/:brandId/products
POST /api/brands/:brandId/products
PUT  /api/brands/:brandId/products/:productId
DELETE /api/brands/:brandId/products/:productId
POST /api/brands/:brandId/products/extract-image
POST /api/brands/:brandId/products/lookup
~~~

## Persistence

The prototype writes state to:

~~~text
.skynex-persistent-store.json
~~~

It stores brands, rules, products, audit history, decisions, recurrence settings, and security events.

This is appropriate for a demo/judging environment. For production, use:

~~~text
PostgreSQL:
  workspaces, users, roles, brands, rules, rule_versions,
  products, reports, findings, decisions, security_events

Object storage:
  PDFs, images, product assets, source documents
~~~

Add signed upload URLs, background jobs, transactions, retention policies, and tenant isolation for production.

## Testing

Build:

~~~bash
npm run build
~~~

Type checking:

~~~bash
npm run lint
~~~

Regression tests:

~~~bash
npm test
~~~

Tests cover product pricing precedence, foundational hardening, RBAC authorization, and authenticated role switching.

If tests call HTTP endpoints, start the server in another terminal:

~~~bash
npm run dev
~~~

## Troubleshooting

### Render ERESOLVE dependency error

Use:

~~~bash
npm install --legacy-peer-deps
~~~

### Render says tsx is not found

Use the build command:

~~~text
npm install --legacy-peer-deps && npm run build
~~~

Do not omit dev dependencies during the build because tsx is used by npm start.

### Homepage shows Not Found

Confirm:

- npm run build completed.
- dist/index.html exists.
- Render Start Command is npm start.
- NODE_ENV=production is set.
- The service is a Web Service, not only a static deployment.

### PDF extraction finds no rules

Confirm:

- The PDF contains real text, not only an image.
- The file contains actionable rule statements.
- The selected brand is correct.
- A multi-client PDF has a selected client section.
- The uploaded PDF is the structured rule document, not a decorative reference card.
- The latest server.ts is deployed.

### Image review says Unexpected end of JSON input

This means an external Vision response was empty or malformed. The backend should log the issue, preserve OCR/deterministic findings, and mark visual analysis incomplete. Redeploy the latest server.ts and upload the image again.

### Image review returns zero issues

Confirm:

- The selected brand contains Approved rules.
- Imported rules have non-empty targetPatterns.
- The report is new after deployment, not a stale report.
- You are reviewing the image against the correct brand.
- The image text is readable.
- The original image or a complete screenshot was uploaded.

### Colors or logos are not detected

Check /api/health and confirm geminiConfigured is true. Without Gemini, local OCR and deterministic text checks still work, but visual checks may be incomplete.

### Custom Cloudflare domain fails

1. Verify the Render service directly.
2. Verify the Render /api/health endpoint.
3. Compare Cloudflare records with Render's exact requested targets.
4. Remove conflicting old A, AAAA, or CNAME records.
5. Wait for DNS propagation.
6. Verify SSL/TLS settings.

## Safe judge/demo procedure

1. Check the deployed /api/health endpoint.
2. Confirm Gemini configuration if visual checks are required.
3. Sign in as Workspace Admin.
4. Create or select the intended brand.
5. Import structured Brand Knowledge.
6. Confirm rules are Approved.
7. Add verified products and pricing where applicable.
8. Upload text, document, or image content.
9. Run the review.
10. Inspect every finding and source citation.
11. Accept, reject, edit, or request verification.
12. Approve publication only after blockers are resolved.
13. Check Review History and Recurring Issues.

Always review content against the correct brand. Jewellery content must not be reviewed against NovaPay rules, and NovaPay content must not be reviewed against jewellery rules.

## Security notes

- Never commit API keys or passwords.
- Keep Gemini calls on the backend.
- Treat uploads and AI output as untrusted.
- Validate evidence before accepting extracted rules.
- Enforce permissions on every mutating endpoint.
- Keep client brands isolated.
- Add upload malware scanning before production.
- Replace prototype role switching with enterprise SSO before production.
- Review CORS policy before public production use.
- Add rate limiting and audit-log retention.

## Design principles

1. Evidence before confidence.
2. Approved rules only for live enforcement.
3. Deterministic checks remain available when AI is unavailable.
4. AI suggestions do not replace human governance.
5. Product-specific facts override generic pricing rules.
6. Client data must not be mixed silently.
7. Accepted corrections must be auditable.
8. Failed extraction must not look like a clean compliance result.
9. Backend authorization is authoritative.
10. Every decision should be explainable in plain language.

## Future architecture plan

### Reliability

- Structured request IDs and logs
- Non-JSON response handling in the frontend
- PDF and image fixture tests
- OCR confidence reporting
- Retries and bounded timeouts for Gemini

### Production persistence

- PostgreSQL migrations
- Object-storage uploads
- Transactional rule replacement
- Background OCR/AI jobs
- Queue-based retry handling

### Enterprise security

- OIDC/SSO
- Secure sessions and CSRF protection
- Workspace tenant isolation
- Rate limits
- Malware scanning
- Retention and deletion controls

### Explainability

- Rule-to-finding trace views
- Source page previews
- Evidence highlighting
- Human-vs-AI agreement metrics
- Evaluation dashboards

## License

Add the project's license and ownership policy before public distribution.

