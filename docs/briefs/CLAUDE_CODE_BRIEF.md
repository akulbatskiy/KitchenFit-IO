# Claude Code Brief — Demand Profiling Report Generator

Repository: https://github.com/akulbatskiy/KitchenFit-IO  
Branch: `concept`  
Target deployment: Vercel  
Status: ready for spec-first implementation

You are working on the KitchenFit-IO project.

## Purpose

Build an early working prototype for a coffee discussion with Radford Chancellor.

This is not a production system. It is a discussion anchor and paid-pilot validation tool.

The prototype should let a foodservice consultant paste or enter an equipment schedule, confirm assumptions, generate deterministic calculations, ask Claude for narrative sections, preview a consultant-style Demand Profiling Report, and export it as a PDF.

## Product framing

Working name: Demand Profiling Report Generator

Built by Akrive Consulting Ltd.

Target user: Radford Chancellor, Principal Consultant, Macintosh Foodservice Consultants.

Primary use case: create a draft demand profiling report for foodservice operations, aimed at MEP engineers and design teams.

Key principle: deterministic calculations first, Claude narrative second.

The demo must show that the system understands the consultant workflow better than a generic Manus prompt.

## Read first — mandatory before any code

1. Read `README.md`
2. Read `docs/SDD.md` if present
3. Read `docs/PRODUCT_BRIEF.md` if present
4. Read `specs/ui/handover-flow.md` if present
5. Read existing `docs/project-management/spec-kit.md` and `.specify/README.md`

If any of these files are missing, do not fail. Continue with the available files and note the missing files in the spec.

## Branch discipline

Work only on branch:

```bash
git checkout concept
```

If you need an implementation branch after spec approval, create it from `concept`:

```bash
git checkout -b feature/demand-profiling-report
```

Never commit directly to `main`.

## Spec-first workflow

Before writing implementation code, create:

```text
specs/ui/demand-profiling-report.md
```

Initial status must be:

```text
Status: draft
```

Stop after writing the spec. Do not write implementation code until the user explicitly replies:

```text
spec approved
```

After approval:

1. Update spec status to `approved`.
2. Implement the prototype.
3. When complete and verified, update spec status to `implemented`.

The spec must include:

- Product goal and validation goal
- All screens with fields and validation
- Acceptance criteria in Given/When/Then format
- Three-layer architecture description
- Data model for project details, equipment rows, assumptions, calculations, narrative sections, and report sections
- Calculation rules
- Claude integration boundaries
- PDF export behaviour
- Out of scope items
- Known limitations
- Security notes
- Testing checklist

## What to build after spec approval

A single-page React web app using Vite.

The app must support:

1. Sample report flow
2. Paste-from-spreadsheet flow
3. Editable assumptions
4. Deterministic calculations
5. Claude-generated narrative via secure serverless API route
6. Report preview
7. PDF export via browser print CSS

## Architecture — three layers, strictly enforced

### Layer 1 — Deterministic calculator

Pure JavaScript or TypeScript functions.

Rules:

- No AI
- No randomness
- Same input always produces same output
- Calculator owns all numbers
- Claude must never calculate or invent figures

Calculations required:

- Connected load per item = `qty * kwEach`
- Total connected load = sum of item connected loads
- Zone totals = group by zone and sum connected loads
- Diversified demand = `totalConnectedLoad * diversityFactor`
- kVA = `diversifiedKW / powerFactor`
- Operating hours = difference between operating start and end
- Daily energy = `diversifiedKW * operatingHours`
- Annual energy = `dailyEnergy * operatingDays`
- Annual OPEX electricity = `annualEnergy * electricityTariff`
- Annual water = `dailyWaterLitres * operatingDays / 1000`
- Annual OPEX water = `annualWaterM3 * waterTariff`
- Total annual OPEX = electricity + water

Water input rule:

- Add editable field: `Daily water consumption, litres`.
- Default sample value may be based on the Royal London-style sample data.
- If blank, water OPEX must show `review required` and must not be invented.

Heat gain rules:

```js
const heatRules = {
  combi_oven:      { sensible: 0.40, latent: 0.53, canopy: true },
  fryer:           { sensible: 0.55, latent: 0.30, canopy: true },
  induction_hob:   { sensible: 0.45, latent: 0.35, canopy: true },
  griddle:         { sensible: 0.55, latent: 0.25, canopy: true },
  dishwasher:      { sensible: 0.20, latent: 0.70, canopy: false },
  glasswasher:     { sensible: 0.20, latent: 0.70, canopy: false },
  refrigeration:   { sensible: 0.90, latent: 0.10, canopy: false },
  display_fridge:  { sensible: 0.90, latent: 0.10, canopy: false },
  beverage:        { sensible: 0.50, latent: 0.40, canopy: false },
  ice_maker:       { sensible: 0.70, latent: 0.20, canopy: false },
  warmers:         { sensible: 0.75, latent: 0.10, canopy: false },
  general:         { sensible: 0.60, latent: 0.20, canopy: false }
}
```

Peak heat gain net to HVAC:

```text
sum(kw * sensible * (canopy ? (1 - canopyCapture) : 1)) + sum(kw * latent)
```

If equipment type is `other`, missing, or not mapped:

- flag `review required`
- do not calculate a final heat gain value
- pass incomplete status to Claude

Important modelling limitation:

The MVP uses a simplified constant diversified load model. It will not fully match Radford's hour-by-hour professional model. The UI and report must clearly mark outputs as draft estimates for consultant review.

### Layer 2 — Rules engine

Default assumptions must be pre-filled and editable:

- Operating days: `250`
- Operating window start: `07:00`
- Operating window end: `17:00`
- Diversity factor: `0.65`
- Electricity tariff: `0.22`
- Water tariff: `4.45`
- Power factor: `0.90`
- Canopy capture: `0.65`
- Daily water litres: optional; sample may use `4190`

Equipment type dropdown per row:

- `combi_oven`
- `fryer`
- `induction_hob`
- `griddle`
- `dishwasher`
- `glasswasher`
- `refrigeration`
- `display_fridge`
- `beverage`
- `ice_maker`
- `warmers`
- `general`
- `other`

Zone dropdown per row:

- `Hot Production`
- `Servery FOH`
- `Kitchen BOH`
- `Preparation`
- `Dishwash`
- `Beverages`
- `General`

### Layer 3 — Claude narrative

Claude receives calculated result JSON only.

Claude writes narrative only:

- methodology paragraph
- executive summary
- assumptions section
- conclusions and recommendations

Claude must not calculate.

If a section has incomplete data, Claude must write:

```text
[Section requires review — data incomplete]
```

System prompt for API call:

```text
You are a senior foodservice consultant with 20 years of UK experience. You write technical demand profiling reports for MEP engineers and design teams.

You receive pre-calculated data as JSON.

Your role is to write the narrative sections only: methodology, context, assumptions rationale, and engineering recommendations.

Never invent numbers. Reference only the figures provided in the JSON.

If a section has incomplete data, write: [Section requires review — data incomplete].

Tone: technical, precise, professional.

Relevant references: CIBSE TM50, DW172, ASHRAE, Building Regulations.

Every output must be framed as draft professional assistance for consultant review, not certified engineering advice.
```

## Claude API security

Do not call Claude directly from the browser.

Use a minimal serverless API route for Claude calls:

```text
/api/generate-narrative
```

Rules:

- Serverless route reads `ANTHROPIC_API_KEY` from server-side environment variables.
- Do not use `VITE_ANTHROPIC_API_KEY`.
- Do not expose API keys in browser console, source, or network responses.
- Frontend sends only project context and calculated result JSON.
- API route returns narrative sections only.

KISS still applies:

- no database
- no auth
- no persistent backend
- no file storage
- one serverless route exists only to protect the Claude API key

Suggested model:

```text
claude-sonnet-4-20250514
```

If this exact model is unavailable in the SDK or account, use the closest available Claude Sonnet model and document the change.

Suggested max tokens:

```text
2000
```

## UX flow — six screens

### Screen 1 — Landing

Header:

```text
Akrive Consulting Ltd
```

Headline:

```text
Generate a Demand Profiling Report
```

Subtext:

```text
Paste an equipment schedule and create a consultant-ready draft in minutes.
```

Two CTAs:

- `Try sample report` — loads built-in Royal London-style demo data
- `Start with my schedule` — goes to Screen 2 blank

### Screen 2 — Import

Primary action: paste from spreadsheet.

Textarea label:

```text
Paste your equipment schedule here
```

Helper text:

```text
Expected columns: Ref, Description, Qty, kW Each, Zone
```

On paste:

1. Parse tab-separated or comma-separated values.
2. Detect columns automatically.
3. Show column mapping confirmation.
4. If a column is not detected, show dropdown to map manually.
5. After confirmation, show editable table with Type dropdown added per row.

Instant feedback after import:

```text
Connected load detected: {total} kW across {zoneCount} zones
```

Buttons:

- `Confirm import`
- `+ Add row`
- `Continue to assumptions`

### Screen 3 — Confirm assumptions

Two-column layout on desktop. Single-column on mobile.

Left: Project details

- Project name
- Client name
- Consultant name
- Organisation
- Reference number
- Report status: Draft / Issued for MEP Design / Final
- Date

Right: Engineering assumptions

- Operating days/year
- Operating window start
- Operating window end
- Diversity factor
- Electricity tariff £/kWh
- Water tariff £/m³
- Power factor
- Canopy dimensions mm
- Canopy capture ratio
- Daily water consumption, litres

Primary CTA:

```text
Generate report
```

### Screen 4 — Generate

Show real calculated checkpoints as they complete.

Do not fake values.

Example states:

```text
✓ Equipment schedule processed — {total} kW connected
✓ Zone totals — Hot Production {kw} kW, Servery FOH {kw} kW
✓ Diversity applied — {diversified} kW / {kva} kVA
✓ Annual OPEX estimated — £{opex}/year
⚠ Heat gain — review required
⟳ Generating report narrative...
```

If heat gain is complete:

```text
✓ Heat gain — {value} kW peak net to HVAC
```

### Screen 5 — Preview

Scrollable report preview.

Sections must match the example report structure:

1. Cover — logo placeholder, project details, reference, status
2. Key Findings — table of calculated values
3. Introduction — Claude text
4. Methodology & Assumptions — Claude text plus assumptions table
5. Equipment Register — parsed table, zone totals, chart
6. Demand Profile — simplified demand table and bar chart
7. MEP OPEX Summary — table and chart
8. Conclusions & Recommendations — Claude text

Each narrative section has:

- `Edit`
- `Regenerate this section`

Sticky bottom bar:

- `Back to edit`
- `Download PDF`

### Screen 6 — Export

`Download PDF` triggers browser print with print CSS optimised for A4 portrait.

Filename format:

```text
{ref}_{projectName}_DemandProfiling_{date}.pdf
```

Footer on every page:

```text
Draft — prepared for consultant review | Akrive Consulting Ltd | © {year} | Subject to M&E engineer verification
```

## Sample data — built in

When user clicks `Try sample report`, load built-in Royal London-style demo data based on Radford's example report.

Hard-code as a JavaScript constant. Do not fetch remotely.

Sample should include:

- Ground Floor items with total connected load close to `194.0 kW`
- 7th Floor items with total connected load close to `30.6 kW`
- Combined connected load close to `224.6 kW`
- assumptions: operating days `250`, electricity tariff `0.22`, water tariff `4.45`, power factor `0.90`, diversity factor `0.65`, canopy capture `0.65`, daily water litres `4190`

Do not copy confidential text from Radford's report into the sample narrative. Use anonymised Royal London-style demo labels if needed.

## Design requirements

- White background
- Slate-900 text
- Burgundy accent `#7B1C3E`
- Typography: Inter or system-ui
- Clean hierarchy
- Professional consultant-document aesthetic
- Tables: tight, professional, alternating row shading
- Charts: use Recharts only
- Bar charts for zone totals and OPEX
- Stacked bars for demand profile if simple enough
- Mobile responsive, including 375px viewport
- No lorem ipsum
- No placeholder text in final UI
- Loading state must feel fast and honest
- PDF output must look like a real consultant document, but not claim to be certified

## KISS constraints

- Single React app with Vite
- Minimal Vercel serverless API route only for Claude
- No database
- No auth
- No file storage
- All frontend state in React `useState` / `useReducer`
- No unnecessary packages
- Charts: Recharts only
- PDF: `window.print()` with print CSS only

## Testing — required before done

- [ ] Sample data loads correctly
- [ ] Sample data calculates close to expected connected loads
- [ ] Paste from spreadsheet works with tab-separated data
- [ ] Paste from spreadsheet works with comma-separated data
- [ ] Column mapping shows and confirms correctly
- [ ] Missing column can be mapped manually
- [ ] Equipment type can be edited per row
- [ ] Review-required warning shows when type is missing or `other`
- [ ] Calculations match simplified manual verification:
  - `194.0 * 0.65 = 126.1 kW` diversified for GF-only sample
  - `126.1 / 0.90 = 140.1 kVA`
  - `126.1 * 10 * 250 * 0.22 = £69,355/year`
- [ ] Claude narrative generates without exposing API key
- [ ] API key is not present in browser source, console, or frontend environment
- [ ] Preview renders all sections
- [ ] Edit section works
- [ ] Regenerate section works or is gracefully disabled with a clear explanation if not implemented
- [ ] PDF print/export works with correct filename guidance
- [ ] Footer appears in print CSS
- [ ] Works on 375px mobile viewport
- [ ] UI clearly states draft / consultant review / subject to engineer verification

## Definition of done

Not done until:

1. `specs/ui/demand-profiling-report.md` exists and reaches `Status: implemented` after approval and implementation.
2. The working prototype runs locally.
3. Sample data flow works end to end in 60 seconds.
4. All tests above pass or any exceptions are explicitly documented.
5. Branch is pushed to GitHub.
6. You provide:
   - local run command
   - local URL
   - exact Vercel deploy command
   - required Vercel environment variable name

## Suggested local commands

Use the simplest appropriate commands based on the repository state.

Likely commands after implementation:

```bash
npm install
npm run dev
```

Expected local URL:

```text
http://localhost:5173
```

Suggested Vercel env var:

```text
ANTHROPIC_API_KEY
```

Suggested Vercel deploy command:

```bash
vercel --prod
```

## Do not do

- Do not build accounts.
- Do not add a database.
- Do not store client files.
- Do not claim certified engineering output.
- Do not let Claude calculate numbers.
- Do not expose API keys through Vite frontend variables.
- Do not over-engineer the prototype.
- Do not commit to `main`.
- Do not leave TODO comments in implemented code.

## Communication style for completion

When finished, report succinctly:

```text
Implemented on branch: <branch>
Local run: <command>
Local URL: <url>
Vercel deploy: <command>
Required env var: ANTHROPIC_API_KEY
Notes: <any limitations>
```
