# Skill Registry — GDOM (GDOM)

Generated: 2026-03-27

## User Skills

| Skill | Trigger | Source |
|-------|---------|--------|
| judgment-day | "judgment day", "judgment-day", "review adversarial", "dual review", "doble review", "juzgar", "que lo juzguen" | ~/.claude/skills/judgment-day |
| skill-creator | Create a new skill, add agent instructions, document patterns for AI | ~/.claude/skills/skill-creator |
| branch-pr | Creating a pull request, opening a PR, preparing changes for review | ~/.claude/skills/branch-pr |
| issue-creation | Creating a GitHub issue, reporting a bug, requesting a feature | ~/.claude/skills/issue-creation |

## Project Conventions

| File | Purpose |
|------|---------|
| CLAUDE.md | GDOM project instructions: tech stack, 4 core platform subsystems (Users & Auth, Permissions, Resources & HATEOAS, External Integrations), coding conventions, architecture, platform principles |

## Compact Rules

### branch-pr
- Requires a linked GitHub issue before creating a PR
- Uses `gh pr create` with issue reference in body
- Branch naming: `{type}/{issue-number}-{short-description}`

### issue-creation
- Creates GitHub issues with labels and structured body
- Issue types: bug, feature, task, epic
- Uses `gh issue create`

### judgment-day
- Launches 2 blind judge sub-agents in parallel
- Synthesizes findings, applies fixes, re-judges
- Max 2 iterations before escalation

### Coding Conventions (from CLAUDE.md)
- All source code in English (variables, functions, comments, routes)
- UI-facing text in Spanish
- Components in `src/components/` using atomic design (atoms, molecules, organisms)
- Never create `_components/` inside route directories
- New endpoints: 1) Register resource via admin API, 2) Configure HATEOAS links, 3) Implement controller with decorators
- ESLint flat config + Prettier enforced
- Import ordering: builtin > external > internal > parent > sibling > index
