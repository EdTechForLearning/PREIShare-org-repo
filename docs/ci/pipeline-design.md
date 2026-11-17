# PREIshare PR CI — Pipeline Design

## Purpose

Plain-language design for automated checks on every pull request for the PREIshare dashboard.
This document is the source of truth for the GitHub Actions workflow we will write next.
It does **not** deploy anything and does **not** replace human review.

Grounded in `docs/ci/pr-pain-and-goals.md`, `docs/ci/ci-concepts-notes.md`, and `docs/ci/project-ci-inventory.md`, rechecked against root `package.json` on 2026-11-17. Those docs name npm, `package-lock.json`, `npm run typecheck`, and `npm run build`. They mark `lint` and `test` as missing. This design does not add a workflow file.

## Trigger

- Event: `pull_request` (opened or updated). A file that never runs on `pull_request` would be CI washing, not this design.
- Branches: pull requests targeting `main`, the integration branch this repo uses.
- Goal: every proposed change gets the same install, then typecheck, then build loop before merge discussion continues.

## Ordered stages (happy path)

The goals brief and the inventory lock this order: install, then typecheck, then build. Lint and test come after those only when `package.json` has those scripts. They do not today, so they are not steps in the first job. That is why this list does not put lint before typecheck or tests before build.

1. **Checkout** — fetch the pull-request commit so the runner has the proposed code.
2. **Setup Node** — install a Node.js version and write that choice into the workflow. The repo has no `.nvmrc` and no `engines` field. Do not treat the `pnpm` block in `package.json` as the runtime.
3. **Install dependencies** — `npm ci` from `package-lock.json`. npm only. Do not run pnpm or yarn.
4. **Typecheck** — `npm run typecheck` (`tsc --noEmit`). It needs `node_modules` and does not need Supabase or an embedding key.
5. **Build** — `npm run build` (`vite build`). A broken import or config fails on the pull request, not after merge.

Leave these out of the job. They are real scripts, and they are the wrong check:

- `dev`, `start`, and `preview` start servers and do not exit.
- `generate-routes` rewrites `src/routeTree.gen.ts` instead of proving the current tree still typechecks and builds.
- `scripts/seed-property-embeddings.ts` is not a `package.json` script. Do not call `npm run seed`.

## Commands / scripts (from inventory)

| Stage | Script or command (from project-ci-inventory) | Required on PR? |
| --- | --- | --- |
| Install | `npm ci` against `package-lock.json` | Yes |
| Lint | **gap** — no `lint` script, and no ESLint, Prettier, or Biome config at the repo root | No. Do not invent `npm run lint`. |
| Typecheck | `npm run typecheck` (`tsc --noEmit`) | Yes |
| Test | **gap** — no `test` script. Vitest and Jest are not dependencies. | No. Do not invent `npm test`. |
| Build | `npm run build` (`vite build`) | Yes |

Say in the job output that lint and test are missing. Skipping them is not `continue-on-error`. There is no command to run.

## Failure policy

- If install, typecheck, or build fails, the CI job fails. The pull request shows a red X.
- Do not add `continue-on-error: true` on those three stages.
- Lint and test are gaps, not optional checks. Do not hide a missing script behind a green step.
- A green check means install, typecheck, and build passed. A person still decides whether to merge. An AI “LGTM” does not merge the pull request and does not replace a red or green result.

## Caching intent

- Cache npm downloads, keyed on `package-lock.json`, so repeated pull requests install faster.
- Do not cache `vite build` output across unrelated pull requests. A stale bundle could hide a broken import.
- The exact cache action belongs in the workflow YAML later. This file only records the intent.

## Environment and secrets

- The first job uses the committed lockfile and the public npm registry. It does not need an env file.
- No production secrets in pull-request logs. Do not copy `.env` or `.env.local` into the workflow.
- Do not set `SUPABASE_SERVICE_ROLE_KEY`, `EMBEDDING_API_KEY`, `SUPABASE_URL`, `VITE_SUPABASE_URL`, or `VITE_SUPABASE_ANON_KEY` on this job. `EMBEDDING_MODEL` is also unused here.
- Do not connect pull-request CI to a production or shared Supabase project. Do not apply `supabase/migrations/`.
- `README.md` says the dashboard shell can build without those values. If a later build starts calling Supabase or the embedding provider, move that step out of this job.

## Explicitly out of scope for this PR pipeline

- Production or staging deploy
- Live Supabase schema migrations or data mutations against shared or production projects
- Generating embeddings or seeding `public.properties`
- Manual QA, product acceptance, and the merge button
- AI auto-merge or an unattended approval
- Choosing a linter or a test runner. That is a team decision. This design does not add those tools.

## Mapping back to PREIshare goals

- Pain addressed: teammates no longer have to remember a local install, and reviewers do not have to ask “does it build?” for the commands that exist. Two laptops share one runner and one lockfile. A failure is visible on the pull request before merge to `main`.
- Inventory sources:
  - Install comes from Bucket A row 1 and the goals brief step 1 (`npm` + `package-lock.json`).
  - Typecheck comes from Bucket A row 2 and the `typecheck` script row (`tsc --noEmit`).
  - Build comes from Bucket A row 3 and the `build` script row (`vite build`).
  - Lint and test stay out because the inventory marks both MISSING and the goals brief forbids inventing them.
  - `dev`, `start`, `preview`, `generate-routes`, Supabase, and the seed file stay out because Bucket B says they are not headless-safe.
- Human boundary: a green check is evidence that install, typecheck, and build passed. Reviewers still judge product fit, UX, auth, row-level security, and whether to merge. Later AI review prompts can help a person read. They do not replace that judgment.

## Open questions / gaps

- [x] Any CI-ready script missing from package.json? Yes. `lint` and `test` are missing. Confirmed again in root `package.json` on 2026-11-17. The first workflow must not name them.
- [x] Node version source of truth unclear? Yes. No `.nvmrc` and no `engines` field. The workflow step that adds YAML must pick one current Node LTS and write that version in the workflow. This design does not guess the number.
- [x] Tests that need a database: skipped, mocked, or blocked until a safe test setup exists? There is no test script, so nothing is skipped or mocked. Supabase reads and embedding generation stay blocked out of this job until a later sprint adds a safe setup and a real `package.json` script.

## Sign-off for next step

The required stages are checkout, setup Node, `npm ci`, `npm run typecheck`, and `npm run build`. When this design stays stable, the next step may scaffold `.github/workflows/pr-ci.yml` from those stages only. No deploy, no secrets, no invented lint or test command.
