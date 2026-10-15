# Agent Working Rules & Guidelines

## 1. Memory Log Maintenance (Mandatory)
- Every time any action, feature addition, configuration change, bug fix, or architecture decision is made, you MUST update `memory.md` with:
  - The date and timestamp of the action.
  - A summary of what was done and which files were changed or created.
  - Current status of the workspace and next pending steps.
- Before beginning any new task, consult `memory.md` to maintain full context of past decisions, work completed, and current architecture.

## 2. Monorepo Integrity
- Use `pnpm` workspace standards for dependencies and scripts.
- Keep `@tulsi/contracts` as the single source of truth for shared DTOs and validation schemas.
- Ensure backend authoritative pricing: Never trust client-submitted prices or totals.
