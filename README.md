# KitchenFit IO

KitchenFit IO is an early-stage product discovery project for AI-assisted commercial kitchen design, engineering reports, and potential handover workflows.

The repository is intentionally **spec-first**. It should help the founder validate the customer problem before investing in a full software build.

## Current stage

- Status: discovery / pre-build
- First live signal: Radford, 20 May 2026
- Current readiness: yellow-plus
- Build decision: not yet
- Next gate: customer reply + coffee conversation + rough clickable mock if the workflow is concrete

## Working hypothesis

The first paid wedge may be closer to an **AI-assisted kitchen design / engineering report workflow** than the original handover-first idea.

The original handover-first concept remains in scope as a development path, but not as the default build decision.

## Repository structure

```text
.claude/                 Claude Code project instructions and custom commands
.github/                 Issue and pull request templates
docs/product/            Product idea, positioning, and decision notes
docs/validation/         Customer discovery scripts and pilot gates
docs/research/           Market and domain research notes
docs/decisions/          Decision log / ADR-style records
docs/project-management/ Spec Kit and delivery operating model
.specify/                Spec-driven development working area and overrides
specs/                   Feature specifications, plans, and task lists
scripts/                 Local helper scripts
```

## Operating principle

Do not build a platform before proving a paid workflow.

The first validation target is not app usage. It is whether a real kitchen professional will commit money, time, or a live project to a narrow workflow.

## Spec Kit project-management section

This project is prepared to work with GitHub Spec Kit style project management.

See:

- `docs/project-management/spec-kit.md`
- `.specify/README.md`
- `specs/_template/`
- `specs/001-ai-kitchen-report-assistant/`

The intended flow is:

1. Define project constitution and principles.
2. Write a feature spec focused on what and why.
3. Clarify gaps before solution design.
4. Write an implementation plan.
5. Break the plan into tasks.
6. Convert validated tasks into GitHub issues.
7. Implement only after customer evidence supports the build.

## First feature candidate

`001-ai-kitchen-report-assistant`

A narrow assistant that turns kitchen project inputs into a useful report draft, initially for design / engineering support.

## Immediate next step

Send the prepared Radford discovery message, capture his reply, then decide whether to produce a rough clickable mock for a coffee conversation.
