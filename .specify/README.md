# Spec Kit workspace

This folder is reserved for Spec Kit style project management and local overrides.

## Intended workflow

1. Constitution — agree operating principles.
2. Specify — write the feature spec focused on what and why.
3. Clarify — resolve vague or risky assumptions.
4. Plan — decide the technical approach.
5. Tasks — break work into actionable tasks.
6. Task-to-issues — move validated tasks into GitHub issues.
7. Implement — only after the build gate is passed.

## Local rules for KitchenFit IO

- Discovery evidence comes before implementation.
- Specs must state facts, assumptions, and unknowns separately.
- No broad platform scope without customer commitment.
- A clickable mock is acceptable before paid validation; production build is not.
- GitHub issues should be linked to a spec folder.

## Suggested command mapping

- `/speckit.constitution` -> project principles
- `/speckit.specify` -> feature requirements
- `/speckit.clarify` -> unresolved customer / product questions
- `/speckit.plan` -> implementation plan
- `/speckit.tasks` -> task breakdown
- `/speckit.taskstoissues` -> GitHub issue creation
- `/speckit.implement` -> build after gate approval
