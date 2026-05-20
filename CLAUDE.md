# CLAUDE.md

## Project identity

You are working on **KitchenFit IO**, an early-stage product discovery project for AI-assisted commercial kitchen design, engineering reports, and possible handover packs.

This is not yet a build-stage product. Treat the repository as a discovery, specification, and validation workspace until payment readiness is proven.

## Product context

Original idea:
- KitchenFit OS: commercial kitchen fit-out project and handover tool.
- Wedge: client-facing handover pack as project ground truth.

Current Variant 2 / stronger live signal:
- Radford asked about AI for kitchens.
- He wants to aid kitchen design.
- He said the use case is both design and engineering.
- He uses Manus for reports.
- He claimed a task that previously took about 2 days now takes about 2 hours.

Current hypothesis:
- First wedge may be an AI-assisted kitchen design / engineering report assistant.
- Handover-first remains a possible later expansion.

## Non-negotiable discovery rules

1. Do not assume willingness to pay from verbal interest.
2. Separate facts, assumptions, and hypotheses.
3. Do not build a broad platform before validating a narrow paid workflow.
4. Prefer artefact-based evidence: real inputs, old reports, handover packs, equipment lists, drawings, photos, certificates.
5. Every feature should connect to one of these outcomes:
   - faster report production;
   - fewer errors or rework;
   - better client confidence;
   - reduced dispute risk;
   - faster payment;
   - repeatable professional output.

## Writing style

Use clear British English. Keep founder-facing notes concise and decision-oriented.

For client-facing copy:
- be natural and direct;
- avoid over-selling;
- avoid saying the product makes users compliant;
- say it organises evidence, reports, and workflow.

## Spec discipline

Before implementation, every feature should have:

- `spec.md` — what and why;
- `clarifications.md` — open questions and answers;
- `plan.md` — how it will be built;
- `tasks.md` — implementable tasks;
- `acceptance.md` — how we know it works;
- `decision.md` — build / defer / park.

## Current build gate

Do not implement a production app yet.

Allowed now:
- discovery notes;
- customer interview script;
- clickable mock outline;
- demo narrative;
- narrow feature spec;
- manual pilot workflow;
- GitHub issues from validated tasks.

Blocked until stronger customer evidence:
- full SaaS platform;
- complex auth;
- marketplace;
- payments;
- accounting integrations;
- broad project-management scope.
