# Feature spec — Demand Profiling Report Generator

## Status

Approved

---

## Reference files

The brief (`docs/briefs/CLAUDE_CODE_BRIEF.md`) instructs reading the following files before writing this spec. Status of each:

| File | Status |
|---|---|
| `README.md` | Read |
| `docs/SDD.md` | Not found — methodology followed from `.specify/README.md` and `docs/project-management/spec-kit.md` |
| `docs/PRODUCT_BRIEF.md` | Not found |
| `specs/ui/handover-flow.md` | Not found |
| `docs/project-management/spec-kit.md` | Read |
| `.specify/README.md` | Read |

---

## Product goal

Produce a working prototype that a foodservice consultant can use to paste an equipment schedule, confirm engineering assumptions, generate deterministic calculations, and receive a Claude-assisted narrative — then preview and export a consultant-style Demand Profiling Report as a PDF.

The demo must show that the system understands the consultant workflow better than a generic Manus prompt.

Built by Akrive Consulting Ltd.

## Validation goal

Use the prototype as a discussion anchor in a coffee conversation with Radford Chancellor (Macintosh Foodservice Consultants). Determine whether a kitchen-specific, repeatable report workflow is worth a paid pilot.

This is not a production system. It is a validation artefact.

---

## Problem

Commercial kitchen design and engineering reports take significant expert time. Manus has already shown a 2-day to 2-hour improvement in one known workflow. However, Manus is a general-purpose AI tool and does not:

- enforce calculation discipline (numbers must be deterministic, not AI-generated);
- understand the specific consultant workflow (equipment schedules, demand profiling, zone totals, OPEX);
- produce a structured, professional consultant-ready document out of the box.

A kitchen-specific prototype may show clearer value and surface whether a paid pilot is viable.

---

## User

**Primary:** Radford Chancellor, Principal Consultant, Macintosh Foodservice Consultants.

**Generalised:** a foodservice or kitchen design consultant producing demand profiling reports for MEP engineers and design teams.

---

## Current workflow (known and assumed)

**Known facts:**

- Radford uses Manus for kitchen-related reports.
- He described the scope as both design and engineering.
- He reported a workflow improvement from approximately 2 days to approximately 2 hours.

**Assumed (not yet confirmed):**

- Inputs are likely an equipment schedule (ref, description, quantity, kW rating, zone), possibly supplemented by floor plans and site notes.
- The report recipient is an MEP engineer or design team.
- Some manual judgement remains after Manus output is produced.
- Report frequency is unknown but likely recurrent across projects.

---

## Inputs

| Input | Source | Required |
|---|---|---|
| Equipment schedule (Ref, Description, Qty, kW Each, Zone) | Pasted from spreadsheet or loaded from sample | Yes |
| Equipment type per row | Dropdown selection in UI | Yes |
| Project name | User entry | Yes |
| Client name | User entry | Yes |
| Consultant name | User entry | Yes |
| Organisation | User entry | Yes |
| Reference number | User entry | Yes |
| Report status | Dropdown (Draft / Issued for MEP Design / Final) | Yes |
| Report date | User entry | Yes |
| Operating days / year | Editable assumption (default: 250) | Yes |
| Operating window start | Editable assumption (default: 07:00) | Yes |
| Operating window end | Editable assumption (default: 17:00) | Yes |
| Diversity factor | Editable assumption (default: 0.65) | Yes |
| Electricity tariff £/kWh | Editable assumption (default: 0.22) | Yes |
| Water tariff £/m³ | Editable assumption (default: 4.45) | Yes |
| Power factor | Editable assumption (default: 0.90) | Yes |
| Canopy capture ratio | Editable assumption (default: 0.65) | Yes |
| Daily water consumption, litres | Editable assumption (optional; sample default: 4,190) | No — shows "review required" if blank |

---

## Output

A Demand Profiling Report containing:

1. Cover page — logo placeholder, project details, reference, status
2. Key Findings — table of calculated values
3. Introduction — Claude narrative
4. Methodology and Assumptions — Claude narrative plus assumptions table
5. Equipment Register — parsed table, zone totals, bar chart
6. Demand Profile — simplified demand table and bar chart
7. MEP OPEX Summary — table and bar chart
8. Conclusions and Recommendations — Claude narrative

Export format: PDF via browser print with A4 portrait print CSS.

Every page footer:

```
Draft — prepared for consultant review | Akrive Consulting Ltd | © {year} | Subject to M&E engineer verification
```

PDF filename format:

```
{ref}_{projectName}_DemandProfiling_{date}.pdf
```

---

## Screens

### Screen 1 — Landing

**Purpose:** entry point. User chooses between a sample report or their own schedule.

**Content:**

- Header: `Akrive Consulting Ltd`
- Headline: `Generate a Demand Profiling Report`
- Subtext: `Paste an equipment schedule and create a consultant-ready draft in minutes.`

**CTAs:**

| Action | Behaviour |
|---|---|
| Try sample report | Load built-in Royal London-style demo data and go to Screen 3 |
| Start with my schedule | Go to Screen 2 blank |

**Validation:** none at this screen.

---

### Screen 2 — Import

**Purpose:** paste an equipment schedule and confirm column mapping.

**Fields:**

| Element | Detail |
|---|---|
| Textarea label | `Paste your equipment schedule here` |
| Helper text | `Expected columns: Ref, Description, Qty, kW Each, Zone` |
| Accepted formats | Tab-separated (from Excel/Google Sheets) and comma-separated |

**On paste behaviour:**

1. Parse tab-separated or comma-separated values.
2. Detect columns automatically.
3. Show column mapping confirmation UI.
4. If a column is not detected, show a dropdown for manual mapping.
5. After confirmation, show an editable table with a Type dropdown added per row.

**Instant feedback after import:**

```
Connected load detected: {total} kW across {zoneCount} zones
```

**Buttons:**

| Button | Behaviour |
|---|---|
| Confirm import | Lock mapping and show editable table |
| + Add row | Append a blank row to the table |
| Continue to assumptions | Proceed to Screen 3 |

**Validation:**

- Qty must be a positive number.
- kW Each must be a positive number.
- Zone must be selected from the zone list.
- Type dropdown is required; row is flagged with "review required" if left as `other` or blank.
- At least one row must be present before continuing.

---

### Screen 3 — Confirm assumptions

**Purpose:** confirm project details and engineering assumptions before generating.

**Layout:** two-column on desktop, single-column on mobile.

**Left column — Project details:**

| Field | Type | Required |
|---|---|---|
| Project name | Text input | Yes |
| Client name | Text input | Yes |
| Consultant name | Text input | Yes |
| Organisation | Text input | Yes |
| Reference number | Text input | Yes |
| Report status | Dropdown: Draft / Issued for MEP Design / Final | Yes |
| Date | Date input | Yes |

**Right column — Engineering assumptions:**

| Field | Default | Required |
|---|---|---|
| Operating days / year | 250 | Yes |
| Operating window start | 07:00 | Yes |
| Operating window end | 17:00 | Yes |
| Diversity factor | 0.65 | Yes |
| Electricity tariff £/kWh | 0.22 | Yes |
| Water tariff £/m³ | 4.45 | Yes |
| Power factor | 0.90 | Yes |
| Canopy capture ratio | 0.65 | Yes |
| Daily water consumption, litres | (blank; sample may pre-fill 4,190) | No |

**Primary CTA:** `Generate report`

**Validation:**

- All project detail fields required before proceeding.
- Numeric assumptions must be positive numbers.
- If daily water litres is blank, water OPEX will show "review required" — no blocking error.

---

### Screen 4 — Generate

**Purpose:** display real calculated checkpoints as they complete and request Claude narrative.

**Behaviour:** show truthful state only. Do not fake values.

**States per checkpoint:**

| State | Symbol | Example |
|---|---|---|
| Complete | ✓ | `✓ Equipment schedule processed — 224.6 kW connected` |
| Warning / incomplete | ⚠ | `⚠ Heat gain — review required` |
| In progress | ⟳ | `⟳ Generating report narrative...` |

**Checkpoints in order:**

1. `Equipment schedule processed — {total} kW connected`
2. `Zone totals — {zone} {kw} kW, ...`
3. `Diversity applied — {diversifiedKW} kW / {kva} kVA`
4. `Annual OPEX estimated — £{opex}/year`
5. Heat gain — complete or review required depending on equipment types
6. `Generating report narrative...`
7. `Report ready`

**Error state:** if Claude narrative fails, show a clear error and allow retry. Do not block report preview — display `[Section requires review — data incomplete]` for affected sections.

---

### Screen 5 — Preview

**Purpose:** display a scrollable report preview. Allow section editing and regeneration.

**Report sections:**

1. Cover — logo placeholder, project details, reference, status
2. Key Findings — table of calculated values
3. Introduction — Claude narrative
4. Methodology and Assumptions — Claude narrative plus assumptions table
5. Equipment Register — parsed table, zone totals, bar chart
6. Demand Profile — simplified demand table and bar chart
7. MEP OPEX Summary — table and chart
8. Conclusions and Recommendations — Claude narrative

**Per narrative section controls:**

| Control | Behaviour |
|---|---|
| Edit | Inline text edit of the Claude-generated section |
| Regenerate this section | Request a new Claude narrative for this section only; or show a clear explanation if not implemented in MVP |

**Sticky bottom bar:**

| Control | Behaviour |
|---|---|
| Back to edit | Return to Screen 3 with state preserved |
| Download PDF | Trigger browser print with A4 print CSS |

---

### Screen 6 — Export

**Purpose:** PDF generation via browser print.

**Behaviour:**

- `Download PDF` triggers `window.print()`.
- Print CSS is optimised for A4 portrait.
- Footer appears on every page.
- Filename guidance is shown to the user before printing:

```
{ref}_{projectName}_DemandProfiling_{date}.pdf
```

- The browser's save-as-PDF dialogue is used; no server-side PDF generation.

---

## Acceptance criteria

### AC-01 — Sample report flow

**Given** a user clicks `Try sample report`  
**When** the app loads  
**Then** the Royal London-style sample data is pre-populated with connected loads close to 224.6 kW, all assumptions are pre-filled, and the user can proceed directly to Screen 3.

### AC-02 — Paste import — tab-separated

**Given** a user pastes tab-separated data from a spreadsheet  
**When** the import parser runs  
**Then** columns are detected automatically, a mapping confirmation is shown, and the editable table is populated correctly.

### AC-03 — Paste import — comma-separated

**Given** a user pastes comma-separated data  
**When** the import parser runs  
**Then** columns are detected automatically and the flow continues identically to AC-02.

### AC-04 — Manual column mapping

**Given** a column cannot be detected automatically  
**When** the mapping confirmation screen is shown  
**Then** the user can select the correct column from a dropdown before confirming.

### AC-05 — Equipment type required

**Given** a row has equipment type set to `other` or left blank  
**When** the report is generated  
**Then** that row is flagged with `review required`, heat gain for that row is not calculated, and Claude is informed the data is incomplete.

### AC-06 — Deterministic calculations

**Given** a complete equipment schedule and assumptions  
**When** the calculator runs  
**Then** the following are true for the Ground Floor-only sample (194.0 kW):
- Diversified demand = 194.0 × 0.65 = 126.1 kW
- kVA = 126.1 ÷ 0.90 = 140.1 kVA
- Annual electricity OPEX = 126.1 × 10 × 250 × 0.22 = £69,355/year

### AC-07 — Water OPEX blank

**Given** the daily water litres field is left blank  
**When** the report is generated  
**Then** the water OPEX row shows `review required` and no water figure is invented or calculated.

### AC-08 — Claude narrative generation

**Given** all calculations are complete  
**When** the Generate screen requests a narrative  
**Then** Claude returns methodology, executive summary, assumptions, and conclusions sections without inventing any numbers not in the calculated JSON.

### AC-09 — API key not exposed

**Given** the app is running in the browser  
**When** a user inspects the page source, browser console, and network traffic  
**Then** the Anthropic API key is not present in any of these locations.

### AC-10 — PDF export

**Given** the user is on the Preview screen  
**When** they click `Download PDF`  
**Then** the browser print dialogue opens with A4 portrait layout, the footer appears on every page, and no browser UI is visible in the print output.

### AC-11 — Mobile responsiveness

**Given** a viewport of 375px  
**When** any screen is displayed  
**Then** all content is readable, no horizontal scrolling is required, and all CTAs are accessible.

### AC-12 — Draft framing

**Given** any screen of the report preview  
**When** a user reads the content  
**Then** the UI clearly states that output is a draft, prepared for consultant review, and subject to M&E engineer verification.

---

## Three-layer architecture

### Layer 1 — Deterministic calculator

Pure TypeScript or JavaScript functions. No AI, no randomness. Same input always produces same output.

**Calculations owned by this layer:**

| Output | Formula |
|---|---|
| Connected load per item | `qty × kwEach` |
| Total connected load | `sum(connectedLoad per item)` |
| Zone total | `sum(connectedLoad) grouped by zone` |
| Diversified demand kW | `totalConnectedLoad × diversityFactor` |
| kVA | `diversifiedKW ÷ powerFactor` |
| Operating hours | `operatingEnd − operatingStart` |
| Daily energy kWh | `diversifiedKW × operatingHours` |
| Annual energy kWh | `dailyEnergy × operatingDays` |
| Annual electricity OPEX | `annualEnergy × electricityTariff` |
| Annual water m³ | `dailyWaterLitres × operatingDays ÷ 1000` |
| Annual water OPEX | `annualWaterM3 × waterTariff` |
| Total annual OPEX | `electricityOPEX + waterOPEX` |

**Heat gain rules:**

```
combi_oven:     sensible 0.40, latent 0.53, canopy true
fryer:          sensible 0.55, latent 0.30, canopy true
induction_hob:  sensible 0.45, latent 0.35, canopy true
griddle:        sensible 0.55, latent 0.25, canopy true
dishwasher:     sensible 0.20, latent 0.70, canopy false
glasswasher:    sensible 0.20, latent 0.70, canopy false
refrigeration:  sensible 0.90, latent 0.10, canopy false
display_fridge: sensible 0.90, latent 0.10, canopy false
beverage:       sensible 0.50, latent 0.40, canopy false
ice_maker:      sensible 0.70, latent 0.20, canopy false
warmers:        sensible 0.75, latent 0.10, canopy false
general:        sensible 0.60, latent 0.20, canopy false
```

**Peak heat gain net to HVAC:**

```
sum(kw × sensible × (canopy ? (1 − canopyCapture) : 1)) + sum(kw × latent)
```

If type is `other`, missing, or not in the above map: flag `review required`, do not calculate heat gain, pass incomplete status to Claude.

**Important modelling limitation:**  
The MVP uses a simplified constant diversified load model. It will not fully match a professional hour-by-hour demand model. All outputs must be clearly marked as draft estimates for consultant review.

---

### Layer 2 — Rules engine

Pre-filled editable defaults:

| Assumption | Default |
|---|---|
| Operating days / year | 250 |
| Operating window start | 07:00 |
| Operating window end | 17:00 |
| Diversity factor | 0.65 |
| Electricity tariff £/kWh | 0.22 |
| Water tariff £/m³ | 4.45 |
| Power factor | 0.90 |
| Canopy capture ratio | 0.65 |
| Daily water litres | Optional; sample default 4,190 |

**Equipment type dropdown values:**

`combi_oven`, `fryer`, `induction_hob`, `griddle`, `dishwasher`, `glasswasher`, `refrigeration`, `display_fridge`, `beverage`, `ice_maker`, `warmers`, `general`, `other`

**Zone dropdown values:**

`Hot Production`, `Servery FOH`, `Kitchen BOH`, `Preparation`, `Dishwash`, `Beverages`, `General`

---

### Layer 3 — Claude narrative

Claude receives calculated result JSON only. Claude writes narrative only.

**Sections Claude writes:**

- Methodology paragraph
- Executive summary
- Assumptions section
- Conclusions and recommendations

**Claude must not:**

- calculate any numbers;
- invent any figures;
- produce certified engineering statements.

**If a section has incomplete data, Claude must write:**

```
[Section requires review — data incomplete]
```

**System prompt:**

```
You are a senior foodservice consultant with 20 years of UK experience. You write technical demand profiling reports for MEP engineers and design teams.

You receive pre-calculated data as JSON.

Your role is to write the narrative sections only: methodology, context, assumptions rationale, and engineering recommendations.

Never invent numbers. Reference only the figures provided in the JSON.

If a section has incomplete data, write: [Section requires review — data incomplete].

Tone: technical, precise, professional.

Relevant references: CIBSE TM50, DW172, ASHRAE, Building Regulations.

Every output must be framed as draft professional assistance for consultant review, not certified engineering advice.
```

**Suggested model:** `claude-sonnet-4-6` (or closest available Claude Sonnet; document any deviation).  
**Suggested max tokens:** 2,000.

---

## Claude integration boundaries

| Boundary | Rule |
|---|---|
| API route | `/api/generate-narrative` serverless function only |
| Key storage | Server-side environment variable `ANTHROPIC_API_KEY` |
| Forbidden key names | `VITE_ANTHROPIC_API_KEY` or any browser-exposed variable |
| Frontend sends | Project context and calculated result JSON only |
| API route returns | Narrative sections only |
| Claude calculates | Never |
| Claude invents figures | Never |

---

## Data model

### Project

```
projectName: string
clientName: string
consultantName: string
organisation: string
referenceNumber: string
reportStatus: 'Draft' | 'Issued for MEP Design' | 'Final'
date: string
```

### Equipment row

```
ref: string
description: string
qty: number
kwEach: number
zone: Zone
type: EquipmentType
connectedLoad: number  // calculated
heatGainStatus: 'calculated' | 'review_required'
```

### Assumptions

```
operatingDays: number
operatingStart: string
operatingEnd: string
diversityFactor: number
electricityTariff: number
waterTariff: number
powerFactor: number
canopyCapture: number
dailyWaterLitres: number | null
```

### Calculated results

```
totalConnectedLoad: number
zoneTotals: { zone: Zone; kw: number }[]
diversifiedKW: number
kva: number
operatingHours: number
dailyEnergy: number
annualEnergy: number
annualElectricityOPEX: number
annualWaterM3: number | null
annualWaterOPEX: number | null
totalAnnualOPEX: number | null
peakHeatGainKW: number | null
heatGainStatus: 'calculated' | 'review_required'
waterOPEXStatus: 'calculated' | 'review_required'
```

### Narrative sections

```
methodology: string
executiveSummary: string
assumptions: string
conclusions: string
```

### Report

```
project: Project
equipment: EquipmentRow[]
assumptions: Assumptions
calculated: CalculatedResults
narrative: NarrativeSections
```

---

## PDF export behaviour

- Triggered by `window.print()`.
- Print CSS targets A4 portrait.
- Each report section starts on its own page where appropriate.
- Charts render in print layout.
- No browser UI is included in print output.
- Footer is repeated on every page:

```
Draft — prepared for consultant review | Akrive Consulting Ltd | © {year} | Subject to M&E engineer verification
```

- Filename guidance shown to user before printing:

```
{ref}_{projectName}_DemandProfiling_{date}.pdf
```

---

## Sample data

**Source:** built-in JavaScript constant; not fetched remotely.

**Labels:** anonymised Royal London-style demo labels. Do not copy confidential text from Radford's report.

**Expected totals:**

| Item | Value |
|---|---|
| Ground Floor connected load | Close to 194.0 kW |
| 7th Floor connected load | Close to 30.6 kW |
| Combined connected load | Close to 224.6 kW |
| Operating days | 250 |
| Electricity tariff | £0.22 / kWh |
| Water tariff | £4.45 / m³ |
| Power factor | 0.90 |
| Diversity factor | 0.65 |
| Canopy capture | 0.65 |
| Daily water litres | 4,190 |

---

## Design requirements

| Requirement | Detail |
|---|---|
| Background | White |
| Text | Slate-900 |
| Accent | Burgundy `#7B1C3E` |
| Typography | Inter or system-ui |
| Tables | Tight, professional, alternating row shading |
| Charts | Recharts only |
| Chart types | Bar charts for zone totals and OPEX; stacked bars for demand profile if simple |
| Mobile | Responsive down to 375px viewport |
| Placeholder text | None in final UI |
| Loading state | Fast, honest — real checkpoint states only |
| PDF output | Looks like a real consultant document; does not claim to be certified |

---

## Non-goals / Out of scope

- User accounts or authentication
- Database or persistent storage
- File storage (no upload to server)
- Marketplace
- Accounting integrations
- Multi-tenant SaaS
- Compliance certification replacement
- Hour-by-hour demand modelling (MVP uses simplified constant model)
- Server-side PDF generation
- Real-time collaboration
- Section-by-section regeneration (acceptable to defer with a clear UI explanation)

---

## Known limitations

- Diversified load model is simplified and constant. It will not match Radford's professional hour-by-hour model. All outputs must be clearly marked as draft estimates.
- Heat gain for `other` or unmapped types cannot be calculated; these rows are flagged and passed to Claude as incomplete.
- Water OPEX is optional; if daily water litres is blank, the field shows `review required` and is excluded from total OPEX.
- PDF relies on browser print; filename must be set manually by the user in the save-as dialogue.
- Claude narrative is best-effort; if the API call fails, the report must still be viewable with incomplete-section placeholders.

---

## Security notes

- `ANTHROPIC_API_KEY` must only exist in the server-side environment.
- Do not use `VITE_ANTHROPIC_API_KEY` or any Vite-prefixed variable.
- The key must not appear in browser source, console output, or network responses.
- The serverless route `/api/generate-narrative` accepts only project context and calculated result JSON; it returns only narrative text.
- No user data is stored server-side.

---

## Testing checklist

- [ ] Sample data loads correctly
- [ ] Sample data calculates close to expected connected loads (194.0 kW GF, 30.6 kW 7th Floor, 224.6 kW combined)
- [ ] Paste from spreadsheet works with tab-separated data
- [ ] Paste from spreadsheet works with comma-separated data
- [ ] Column mapping shows and confirms correctly
- [ ] Missing column can be mapped manually via dropdown
- [ ] Equipment type can be edited per row after import
- [ ] Review-required warning shows when type is `other` or blank
- [ ] Calculations match simplified manual verification:
  - 194.0 × 0.65 = 126.1 kW diversified (GF sample only)
  - 126.1 ÷ 0.90 = 140.1 kVA
  - 126.1 × 10 × 250 × 0.22 = £69,355 / year
- [ ] Claude narrative generates without exposing the API key
- [ ] API key is not present in browser source, console, or frontend environment
- [ ] Preview renders all eight report sections
- [ ] Edit section works inline
- [ ] Regenerate section works, or is gracefully disabled with a clear explanation
- [ ] PDF print/export opens with A4 portrait layout
- [ ] PDF footer appears on every page
- [ ] PDF filename guidance is shown to the user before printing
- [ ] Works on 375px mobile viewport with no horizontal scrolling
- [ ] UI clearly states draft / consultant review / subject to M&E engineer verification at all stages

---

## Success criteria

**Prototype success (validation goal):**

- Radford can complete the sample flow in under 60 seconds.
- The report output is recognisable to him as similar to a Demand Profiling Report.
- He identifies at least one specific improvement over a Manus-only approach.
- The coffee conversation surfaces a concrete next step (pilot project, live data, or referral).

**Technical done criteria:**

1. `specs/ui/demand-profiling-report.md` exists and reaches `Status: implemented` after approval and implementation.
2. The prototype runs locally with `npm install && npm run dev` at `http://localhost:5173`.
3. Sample data flow works end to end in under 60 seconds.
4. All tests in the testing checklist above pass, or exceptions are explicitly documented.
5. Branch is pushed to GitHub.
6. Completion report includes: local run command, local URL, Vercel deploy command, required environment variable name.

---

## Facts

- Radford Chancellor initiated the AI-for-kitchens conversation (20 May 2026).
- He uses Manus for kitchen-related reports.
- He reported a time saving from approximately 2 days to approximately 2 hours.
- The brief specifies deterministic calculations must not be delegated to Claude.
- The brief specifies the API key must never be exposed in the browser.
- `docs/SDD.md`, `docs/PRODUCT_BRIEF.md`, and `specs/ui/handover-flow.md` do not currently exist.

---

## Assumptions

- The target user can produce or export an equipment schedule in tab-separated or CSV format.
- A browser-print PDF is acceptable for a prototype demo conversation.
- Recharts is an acceptable charting library for this scope.
- Vercel serverless functions are an acceptable approach for the API route.
- A simplified constant diversified load model is sufficient to demonstrate the workflow's value at demo stage.
- Radford will test the sample flow, not his own live data, in the first conversation.

---

## Open questions

| Question | Owner | Status |
|---|---|---|
| What exact inputs does Radford use in Manus? | Founder | Open |
| Who is the final recipient of the report? | Founder | Open |
| What remains manual after Manus output? | Founder | Open |
| What would make him willing to pay for a pilot? | Founder | Open |
| Has he seen a draft like this before from any tool? | Founder | Open |
| Is section-by-section Claude regeneration required for the prototype demo? | Founder / Tech | Open |

---

## Build gate

**Current gate:** Mock

The prototype may be built because the brief authorises it as a demo artefact for a validation conversation — not as a production system.

**Blocked until Pilot gate:**

- Production auth
- Persistent storage
- Multi-user or multi-tenant features
- Payments or billing
- Full SaaS platform scope

**Review trigger:** after the coffee conversation with Radford — decide mock / pilot / park.
