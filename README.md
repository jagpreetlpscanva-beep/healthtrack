# MediMind AI — Hackathon setup

MediMind turns uploaded medical documents into structured, reviewable records. It supports PDF documents (including scanned PDFs via OpenAI's PDF vision input), JPG/PNG/WEBP images, extraction review before saving, a local JSON database for development and Supabase-backed JSON state on Vercel, a FHIR R4 bundle export, and cautious health-context insights.

> **Medical safety:** This is a prototype for organizing records, not a medical device or diagnostic service. AI can misread documents. Confirm every extracted value against the original report. It does not replace a clinician, and must not be used to change medication. Seek urgent care for severe or rapidly worsening symptoms.

## Requirements
- Windows 10/11
- Node.js 20 LTS or newer (includes npm)
- OpenAI API key with API billing enabled

## Windows: run locally
1. Extract the ZIP to a normal folder, e.g. `C:\Projects\medimind`.
2. Install Node.js from https://nodejs.org/ if needed.
3. Open the project folder in File Explorer, click the address bar, type `cmd`, and press Enter.
4. Run:
   ```bat
   npm install
   ```
5. Create your environment file:
   ```bat
   copy .env.example .env
   ```
6. Open `.env` in Notepad and replace `paste_your_key_here` with your OpenAI API key. Do not add quotes. Never share or commit this file.
7. Start frontend and backend:
   ```bat
   npm run dev:all
   ```
8. Open the Vite URL printed in the terminal (usually http://localhost:5173). Keep that terminal running.
9. Click **Upload records**, choose a readable PDF/image, review the extracted fields, correct anything uncertain, and confirm. If you only want to test the flow without API usage, use the sample report.
10. Check backend health at http://localhost:8787/api/health. `ai: true` means the key was detected; it does not guarantee that the key has available credits.

To stop the app, press `Ctrl+C` in the terminal.

## API cost controls
- Default model: `gpt-4o-mini` (set `OPENAI_MODEL` to another supported model only if needed).
- No conversation history is sent; only the current file or a compact profile summary is sent.
- Responses API requests use `store: false`, bounded output tokens, one retry, and a 45-second timeout.
- Use the sample report to demo without API usage. Large or repeated uploads still incur API charges. Set a billing budget/usage alert in your OpenAI platform account.

## Environment variables
See `.env.example`. `OPENAI_API_KEY` is server-only and must never use a `VITE_` prefix. `CORS_ORIGIN` is a comma-separated allowlist; for local development, leave it blank. For deployment, set it to the exact public app origin.

## Build and smoke test
```bat
npm run build
npm run server
```
In another terminal, run:
```bat
node --input-type=module -e "const r=await fetch('http://localhost:8787/api/health'); console.log(r.status, await r.text()); if(!r.ok) process.exit(1)"
```
For the integrated app, use `npm run dev:all`. A real extraction test needs a valid API key and can incur cost. The sample report needs no key.

## Deploy to Vercel (frontend + serverless API)

This repository is configured for Vercel: Vite builds to `dist`, and `api/[...path].js` forwards `/api/*` requests to the existing Express app. The frontend design is unchanged. Vercel's filesystem is ephemeral, so configure Supabase for persistent profile storage before deploying.

### 1. Create persistent storage in Supabase
1. Create a project at https://supabase.com/.
2. Open **SQL Editor → New query** and run:
   ```sql
   create table if not exists public.medimind_state (
     id text primary key,
     state jsonb not null default '{}'::jsonb,
     updated_at timestamptz not null default now()
   );
   alter table public.medimind_state enable row level security;
   ```
3. In **Project Settings → API**, copy the Project URL and the **service_role** key. Keep the service-role key private; never put it in frontend code or a `VITE_` variable. The table is intended for this single-user hackathon prototype; it is not multi-user storage.

### 2. Deploy the repository to Vercel
1. Push this project to a Git repository. Do not commit `.env`, uploaded medical records, or real patient data.
2. In https://vercel.com/, choose **Add New → Project**, import the repository, and keep the project root at the repository root.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`. Install command: `npm install`.
4. In **Project → Settings → Environment Variables**, add these for **Production** (and Preview if needed):
   - `OPENAI_API_KEY` = your OpenAI API key
   - `OPENAI_MODEL` = `gpt-4o-mini`
   - `SUPABASE_URL` = your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service-role key
   - `CORS_ORIGIN` = your exact deployed origin, e.g. `https://your-project.vercel.app` (no trailing slash)
   - `NODE_ENV` = `production`
   - `UPLOADS_PER_HOUR` = `20`
5. Click **Deploy**. After changing environment variables, redeploy the project.
6. Test `https://YOUR-DEPLOYMENT.vercel.app/api/health`, then test the sample-report review/save flow. A real PDF/image extraction requires a valid OpenAI API key and can incur API charges.

### 3. Local Windows development
Use `npm install`, copy `.env.example` to `.env`, and set `OPENAI_API_KEY`. Local development uses the JSON store; if Supabase variables are set, it uses Supabase instead. Start the UI and API with `npm run dev:all`.

### Vercel limitations to understand
- Original uploaded files are processed in memory and are not kept as durable file uploads on Vercel. Extracted structured data is saved in Supabase. If you need users to reopen original files later, add private object storage such as Supabase Storage.
- This is a single-profile hackathon prototype, not a multi-user medical-record system. Do not put real patient records into a public demo. Before production, implement authentication, per-user row-level access, private file storage, audit logs, retention controls, and stronger persistent rate limiting.
- ABHA/ABDM linking is a mock and does not contact government services. AI extraction and health insights may be wrong; always check the source report and consult a clinician.

## Included API
- `GET /api/health` — server/AI configuration status
- `GET /api/profile` — saved profile records
- `POST /api/documents` — upload PDF/image for extraction (multipart `file`)
- `POST /api/documents/sample` — demo extraction without AI
- `POST /api/documents/:id/confirm` — confirm reviewed extraction
- `DELETE /api/documents/:id` — delete a document
- `GET /api/insights` — cautious AI health context or deterministic fallback
- `GET /api/comparisons` — repeated test names across saved records
- `POST /api/abha/link`, `DELETE /api/abha` — **mock only**, not connected to ABDM
- `GET /api/fhir/bundle` — FHIR R4 bundle export

## Known prototype limitations
- Single-user prototype: no login or per-user isolation.
- JSON-file database at `server/data/db.json`; uploaded files are in `server/uploads/`.
- ABHA/ABDM linking is a mock. It does not contact government services.
- Report comparisons are name-based; units, laboratories and reference ranges may differ.
- AI-generated possible causes and next steps are general health information, not diagnosis or treatment.
