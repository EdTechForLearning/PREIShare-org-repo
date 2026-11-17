# PREIshare dashboard — CI project inventory

**Date:** 2026-11-17
**Context:** `docs/ci/pr-pain-and-goals.md`, `docs/ci/ci-concepts-notes.md`

## Purpose

List what this repo can run automatically on a GitHub-hosted runner for pull requests, what needs secrets or external services, and what stays human. Downstream pipeline design must use only real package-manager and script names found here.

This file does not add a GitHub Actions workflow.

## Repo facts

- Package manager: **npm**. CI must use npm. Do not switch to pnpm or yarn.
- Lockfile present: `package-lock.json`. No `pnpm-lock.yaml`. No `yarn.lock`.
- Node/TypeScript app signals: root `package.json`, `tsconfig.json` (strict), app code in `src/`. There is no `app/` folder.
- Framework signals: TanStack Start and React. `README.md` says so. `vite.config.ts` loads `@tanstack/react-start/plugin/vite` and `@vitejs/plugin-react`. Routes live in `src/routes/`. `package.json` depends on `react`, `react-dom`, and `@tanstack/react-start`.
- Test runner: none found. No `test` script. Vitest and Jest are not dependencies in `package.json`.
- Lint tool: none found. No `lint` script. No ESLint, Prettier, or Biome config at the repo root. Prettier appears only as a transitive entry inside `package-lock.json`, which is not a project script.

`package.json` also has a `pnpm` settings block. That block is not a lockfile. The committed lockfile is npm's, so the first pipeline installs with npm.

## Scripts discovered in package.json

| Script name | Exact command (from package.json) | Role |
| --- | --- | --- |
| `dev` | `vite dev --port 3000` | local dev server (does not exit) |
| `generate-routes` | `tsr generate` | rewrites the generated route tree |
| `build` | `vite build` | build |
| `start` | `vinxi start` | local server (does not exit) |
| `preview` | `vite preview` | local preview server (does not exit) |
| `typecheck` | `tsc --noEmit` | typecheck |

Missing common checks (no command was guessed):

- typecheck: present as `typecheck`
- build: present as `build`
- lint: MISSING
- test: MISSING

`scripts/seed-property-embeddings.ts` is a file in the repo. It is not a `package.json` script. A workflow must not call `npm run seed` or any other name that is not in the table above.

## Bucket A — Headless-safe on GitHub-hosted runners

These need only a clean checkout, `npm ci` against `package-lock.json`, and the public npm registry. No secrets.

1. Install dependencies with npm and `package-lock.json`. This is the shared environment the pain brief asks for. It runs first.
2. `typecheck` (`tsc --noEmit`). It fails when TypeScript is wrong, and it does not need Supabase or an embedding key. It runs second.
3. `build` (`vite build`). It builds the TanStack Start / React app and fails when the production bundle cannot be produced. It runs third.

Lint and test are not in this bucket. Their script names are MISSING. The goals brief says to add them only after `package.json` has `lint` and `test`.

Leave `dev`, `start`, and `preview` out of the pull-request job. They start servers and wait. Leave `generate-routes` out of the first job too. It rewrites `src/routeTree.gen.ts` instead of proving the current tree still typechecks and builds.

## Bucket B — Needs secrets, env, or external services

Do not put these in the first pull-request job. The goals brief keeps production secrets and deploys out of this sprint's automation.

| Check or step | Why it is not headless-safe | What would be required later |
| --- | --- | --- |
| Signing in, listing properties, or creating a row against Supabase | The app reads `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY`. The service-role key bypasses row-level security. | A protected CI secret store and a plan that still keeps the service-role key off the browser. Not part of the first job. |
| Generating embeddings or seeding sample vectors | `EMBEDDING_API_KEY` calls an external provider. The seed file also uses the service-role key. Neither step is a `package.json` script. | A secret, a network allow-list, and an agreed script name added to `package.json` first. |
| Applying `supabase/migrations/` to a database | Migrations change shared data. There is no migrate script in `package.json`. | A person, or a later job with a dedicated database. Not a pull-request check this sprint. |
| `dev`, `start`, `preview` | They keep a server running. A GitHub-hosted check needs a command that exits with pass or fail. | Keep them for local use. |
| Production deploy | A deploy needs host tokens and production environment values. | Out of scope. The pull-request workflow does not deploy. |

## Bucket C — Human judgment (not a green checkmark)

CI must not pretend to decide these:

- Whether the change matches the product, and whether the UX is good enough.
- Security-sensitive design: auth, row-level security, and who can read a listing. A green `build` does not prove a policy is correct.
- Whether to approve, request changes, or merge. A green check is evidence. A person owns the merge.
- AI review comments, including an "LGTM". They can help a person read. They do not merge the pull request and they do not replace a red or green pipeline result.
- Choosing a linter or a test runner. That is a team decision. This inventory does not add those tools.

## Supabase / env caveats for CI

Env var names referenced by `.env.example` (values are never written here):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_URL`
- `EMBEDDING_API_KEY`
- `EMBEDDING_MODEL`

`.env` is not in the repo. `.env.local` may exist on a laptop and is gitignored. CI must not copy it into the workflow or the docs.

Local-only or dashboard-only steps: running the app with `dev`, applying SQL in `supabase/migrations/`, and seeding embeddings. `README.md` says the dashboard shell itself can start with no env file. Sponsor auth, listings, and semantic search cannot.

Recommendation for Sprint 6 pull-request CI: keep the first pipeline on Bucket A only. Order: install, `typecheck`, `build`. Say in the job output that `lint` and `test` are MISSING. Do not read Bucket B secrets.

## Risks and open questions

- One lockfile only (`package-lock.json`). The `pnpm` key inside `package.json` could confuse a later workflow into calling pnpm. Humans should keep CI on npm until the team changes the lockfile on purpose.
- No script calls an interactive prompt. `dev`, `start`, and `preview` still do not exit, so they are a poor CI step.
- No browser test and no network test exist, because there is no `test` script.
- `build` might still need Node and the public npm registry. It does not need the Supabase or embedding secrets for the check described here. If a future build starts fetching those services at build time, move that step to Bucket B.
- Node version is not pinned. `README.md` notes there is no `engines` field and no `.nvmrc`. The workflow author should pick one current Node LTS and write it down when the workflow is added.

## Link back to earlier docs

Pain and goals addressed by Bucket A, from `docs/ci/pr-pain-and-goals.md`:

- A shared install replaces "remember to install on your own machine."
- `typecheck` and `build` run even when a person is in a hurry.
- A failure is visible on the pull request, so reviewers spend less time asking whether it builds.
- Lint and test stay out until real scripts exist. The goals brief forbids inventing them.
- Secrets, production deploys, and the merge decision stay outside the first job.

CI idea used, from `docs/ci/ci-concepts-notes.md`: the same automated checks run on every pull request before merge. A green check starts human review. It is not an automatic merge. A workflow file that never runs on `pull_request` would be CI washing, not this inventory.

## Source files inspected

- `package.json`
- `package-lock.json` (presence and manager only)
- `tsconfig.json`
- `vite.config.ts`
- `README.md`
- `.env.example` (names only)
- `src/` (routes and app code; no `app/` directory)
- `supabase/migrations/`
- `scripts/seed-property-embeddings.ts` (not a package.json script)
- `docs/ci/pr-pain-and-goals.md`
- `docs/ci/ci-concepts-notes.md`
- `docs/env-var-checklist.md` (names already matched to `.env.example`)
