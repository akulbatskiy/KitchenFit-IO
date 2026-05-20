# Spec Kit project-management model for KitchenFit IO

## Purpose

Use Spec Kit style discipline to prevent premature building.

KitchenFit IO should move through evidence, specification, plan, tasks, and only then implementation.

## Why this matters

The current customer signal is promising but not yet a payment signal. The repository must protect the project from turning one interesting conversation into an over-built SaaS platform.

## Project lifecycle

### 0. Opportunity record

Capture the idea, customer signal, market hypothesis, and risks.

Output:
- `docs/product/original-idea-and-variant-2.md`
- `docs/research/`
- discovery issue

### 1. Spec

Define the feature in terms of customer outcome.

Output:
- `specs/<feature>/spec.md`

Rules:
- no tech stack yet;
- no implementation detail;
- include what, why, user, and success criteria.

### 2. Clarification

Resolve ambiguity before building.

Output:
- `specs/<feature>/clarifications.md`

Required questions:
- What real inputs are used?
- Who receives the output?
- What still takes time after Manus?
- What quality risk remains?
- Would the customer pay for a narrower version?

### 3. Plan

Decide how to build only after the spec is stable.

Output:
- `specs/<feature>/plan.md`

### 4. Tasks

Convert the plan into issue-ready tasks.

Output:
- `specs/<feature>/tasks.md`
- GitHub issues labelled `spec-task`

### 5. Implementation

Allowed only after the build gate is passed.

## Build gates

### Discovery gate

Proceed when:
- customer describes a concrete workflow;
- current inputs and outputs are clear;
- pain frequency is known;
- one old report or real artefact is available.

### Mock gate

Proceed when:
- customer agrees to review a rough clickable mock;
- the workflow can be represented in 3-5 screens;
- the mock has learning goals.

### Pilot gate

Proceed when:
- customer offers a live project;
- success criteria are agreed;
- there is money, deposit, LOI, or strong operational commitment.

### Build gate

Proceed when:
- paid or deposit-backed pilot exists;
- scope is narrow;
- manual concierge process has shown repeatable value.

## GitHub labels

Recommended labels:
- `discovery`
- `customer-signal`
- `spec`
- `clarification`
- `mock`
- `pilot`
- `build-gate`
- `do-not-build-yet`

## Issue naming

Use this format:

```text
[Spec 001] Prepare clickable mock screens
[Discovery] Radford follow-up after coffee
[Gate] Decide mock vs pilot vs park
```
