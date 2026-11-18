# PREIshare PR CI — End-to-End Verification Log

**Date:** 2026-11-17
**Verifier:** Gonzalo Burga
**Repo / branch used:** `gonzaloburga-cs/PREIShare-org-repo`, local `main` tracking `origin/main` (HEAD `2c28018` when this log was written). No feature branch and no pull request.
**Inputs checked:**
- `.github/workflows/pr-ci.yml`
- `docs/ci/ci-scripts-notes.md`
- `docs/ci/branch-protection-checklist.md`
- `docs/ci/ai-pr-review-prompts.md`

This log is a dry-run. The public GitHub API for this fork returned `total_count: 0` workflow runs and an empty pull-request list. `gh` is not installed in this PowerShell session, so no Actions tab was opened. Branch protection was not turned on.

---

## 1. Static workflow review

| Check | Result (pass/fail) | Evidence / notes |
| --- | --- | --- |
| Triggers on `pull_request` (branches as designed) | pass | `on.pull_request.branches` is `main` only. Types are `opened`, `synchronize`, and `reopened`. `docs/ci/pipeline-design.md` names `main` as the merge target. There is no `push` trigger, so commits pushed straight to `main` do not start this workflow. |
| Job name(s) clear for GitHub status checks | pass | One job. Id is `ci`. Display name is `Install, typecheck, build, lint, and test`. Workflow name is `PR CI`. The checklist says to require the display name, not `quality` and not the id `ci`, after a real run shows the string. |
| Step order: checkout → runtime setup → install → typecheck → build → lint → test | pass | `actions/checkout@v4`, `actions/setup-node@v4` with `node-version: "24"`, then `npm ci`, `npm run typecheck`, `npm run build`, `npm run lint`, `npm run test`. |
| Each `run:` matches scripts in `docs/ci/ci-scripts-notes.md` | pass | Notes and `package.json` match: `npm ci`; `typecheck` = `tsc --noEmit`; `build` = `vite build`; `lint` = `tsc --noEmit --pretty false`; `test` = `node --experimental-strip-types --test src/lib/embeddings/text.test.ts`. |
| Caching / dependency install strategy present and sensible | pass | `setup-node` sets `cache: npm`, which keys the npm cache on `package-lock.json`. The workflow does not cache Vite build output. Install command is `npm ci`, not `npm install`. |
| Fail-fast behavior acceptable (failed step fails the job) | pass | No `continue-on-error`. A failing `run:` fails the job. |
| No plaintext secrets or unsafe `${{ }}` expansions in logs | pass | The workflow file has no `secrets.*` reference, no env block, and no echo of `.env` values. The only `${{ }}` values are `github.workflow`, `github.event.pull_request.number`, and `github.ref` in the concurrency group. |

**Static review summary:** The YAML matches the script notes and the designed branch filter. Node 24 is written in the workflow because the repo has no `.nvmrc` and no `engines` field. The file is ready to run on a pull request. Nothing in this section proves GitHub has executed it.

---

## 2. Local CI command dry-run

Run on Windows PowerShell in the folder that contains `package.json`. Node `v24.12.0`. Package manager npm. `npm ci` is the command already run in that terminal (exit code 0). The other four commands were run again in order on 2026-11-17 and each exited 0.

| Step | Exact command | Exit (pass/fail) | Notes |
| --- | --- | --- | --- |
| Install | `npm ci` | pass (exit 0) | Added 602 packages and audited 605. npm printed `52 vulnerabilities (1 low, 7 moderate, 42 high, 2 critical)` plus deprecation warnings for `glob@10.5.0` and `dax-sh@0.43.2`. The process still exited 0. `npm audit fix` was not run. |
| Typecheck | `npm run typecheck` | pass (exit 0) | Ran `tsc --noEmit`. No type errors. npm also printed `Unknown env config "devdir"`, which did not fail the step. |
| Build | `npm run build` | pass (exit 0) | Ran `vite build` (client, SSR, and Nitro). Finished with “You can preview this build using npx vite preview”. |
| Lint | `npm run lint` | pass (exit 0) | Ran `tsc --noEmit --pretty false`. No diagnostics. |
| Test | `npm run test` | pass (exit 0) | Node’s runner: 3 passed, 0 failed, on `src/lib/embeddings/text.test.ts`. The process exited. |

**Environment notes:** Windows, PowerShell, Node `v24.12.0` (same major as the workflow’s `"24"`), npm 11.6.2 (npm printed an upgrade notice to 11.21.3). Lockfile is `package-lock.json`.

**Local dry-run summary:** The full sequence succeeded. Nothing broke. The audit count is a warning after a successful install, not a red step. CI does not run `npm audit`, so those 2 critical advisories would not turn the GitHub job red.

---

## 3. PR → CI loop checklist

Source: `docs/ci/branch-protection-checklist.md`. No pull request was opened. Evidence for “has this run” is the GitHub API, not an Actions URL.

| Checklist item | Status (Ready / Needs work / Blocked) | Evidence |
| --- | --- | --- |
| Workflow runs on pull requests | Needs work | YAML triggers `pull_request` to `main` for `opened`, `synchronize`, and `reopened`. `https://api.github.com/repos/gonzaloburga-cs/PREIShare-org-repo/actions/runs?per_page=5` returned `total_count: 0`. `.../pulls?state=all&per_page=5` returned `[]`. There is no Actions run URL. Pushes already on `main` do not trigger this file. |
| Check names suitable as required status checks | Needs work | The job `name` in the YAML is `Install, typecheck, build, lint, and test`. The checklist says to require that display name, not `quality` and not the job id `ci`, and it guesses GitHub may list it as `PR CI / Install, typecheck, build, lint, and test`. This verification did not see that string in GitHub. The checklist date line is still blank. |
| Concurrency / duplicate-run behavior acceptable | Needs work | YAML sets `cancel-in-progress: true` and group `pr-ci-${{ github.workflow }}-${{ github.event.pull_request.number \|\| github.ref }}`. That is the intended “same PR cancels the older run” behavior. It has not been observed, because there has not been a run to cancel. |
| Human still required for merge (CI ≠ auto-merge) | Needs work | The workflow has no deploy step and no merge step. `docs/ci/ai-pr-review-prompts.md` says only a human may approve or merge. The protection checklist boxes for “at least one human review” are still unchecked, and nobody applied branch protection. A green check, if one existed, would not be a merge. |
| Branch protection readiness gaps listed | Needs work | `docs/ci/branch-protection-checklist.md` leaves “Protect `main`”, required checks, “up to date before merging”, and human approval unchecked. Maintainer line and “Date verified against a real PR check run” are blank. The doc states that writing it did not turn protection on. Those gaps are listed. They are not closed. |

**PR loop summary:** A teammate cannot yet point at a green or red check on this fork. The workflow file is in the right shape for a pull request into `main`. Trustworthy live evidence starts when someone opens that pull request and the Actions tab shows `PR CI`.

---

## 4. AI-assisted review dry-run (human remains accountable)

**Sample change used:** The current server search path, read as a risky change already in the tree. `src/lib/property-search.ts` calls `createSupabaseServiceRoleClient()` for `match_properties` (around line 46) and again in `rankEveryStoredEmbedding` (around line 110), which selects `id, title, description, location, embedding` from `public.properties`. `src/lib/supabase.server.ts` builds that client from `SUPABASE_SERVICE_ROLE_KEY`. `src/routes/api/properties/search.ts` accepts `POST` with a `query` string and calls `searchPropertiesByText` with no session check in that handler. Tests in this dry-run cover `buildEmbeddingText` and `assertEmbeddingDimension` only.

**Prompt chosen:** Prompt 2 — Risk flags (auth, Supabase, migrations), from `docs/ci/ai-pr-review-prompts.md`.

**Tool category used:** chat-assistant (this verification session). The prompt’s hard rules were applied to the files above. No secret values were pasted.

**AI output — what helped:**
- High: both search calls use the service-role client. The comment on `createSupabaseServiceRoleClient` says this client is for jobs that must bypass row-level security. Question for the reviewer: who is allowed to call `POST /api/properties/search`, and is a bypass appropriate for that caller?
- Medium: when `match_properties` returns fewer rows than expected, the helper loads every non-null embedding and ranks them in the server process. The comment says this is because the ivfflat index uses `lists = 100` on a tiny table. Question: is that fallback only acceptable for the sample rows, and what removes it after the index is dropped?
- Medium: `src/routes/api/properties/search.ts` logs `property search failed` plus the caught error. Question: can that error text include a key, a full embedding, or a database detail that should stay out of server logs?
- Low: `npm run test` does not exercise this route, the RPC, or the service-role client. A green test run does not answer the questions above.
- Buckets with nothing new in this sample were skipped: no migration file and no workflow secret were in the hunks that were read.

**AI output — problems (if any):**
- None on merge authority. The answer did not say approved, LGTM, safe, or safe to merge. It did not claim CI was green.
- It did not invent a row-level security policy. It asked the human to check who can call the route.

**Human judgment call:** Ask for more info before any approval. The open question is whether a public search handler should use the service-role key. I would not approve or merge from this reading. CI being green only shows install, typecheck, build, lint, and the three embedding-text tests passed.

**Prompt fix applied?** No. The first run stayed advisory (questions and severity, no merge verdict), so the prompt was not rewritten and there was no second run.

---

## 5. Assess → fix → re-verify cycles

| Cycle | What failed | Fix applied (file + change) | Re-verify result |
| --- | --- | --- | --- |
| 1 | No command failed. `npm ci`, typecheck, build, lint, and test all exited 0 on the first dry-run. | No code or workflow edit in this verification. | Not re-run. The sequence was already green. |

Residual risk, still open: npm reported 2 critical vulnerabilities and the install stayed green. Separately, GitHub has zero Actions runs, so cancel-in-progress and the required-check name are written but not seen on a pull request. `docs/ci/pipeline-design.md` still says `lint` and `test` are missing; the workflow and `docs/ci/ci-scripts-notes.md` are the current command list.

---

## 6. Gate credibility decision

**Overall gate status:** Credible with known gaps

**Known gaps still open:**
1. No pull request and no Actions run on `gonzaloburga-cs/PREIShare-org-repo`, so the live status-check name and cancel-in-progress behavior are unverified.
2. Branch protection on `main` is not enabled. The checklist’s maintainer and “verified against a real PR check run” lines are blank.
3. `npm ci` prints dependency advisories (including 2 critical) and still exits 0. The workflow does not fail on `npm audit`.
4. Pull-request tests do not cover search, auth, or Supabase. The service-role search path remains a human review item.

**Safe for Sprint 6 stakeholder handoff?** Yes with caveats

**Notes for Step 12 handoff:**
- The workflow path is `.github/workflows/pr-ci.yml`. It runs on pull requests into `main`, not on a direct push to `main`.
- Local reproduction on Windows, Node `v24.12.0`, passed in this order: `npm ci`, `npm run typecheck`, `npm run build`, `npm run lint`, `npm run test`.
- The check name to require later is `Install, typecheck, build, lint, and test`. Do not require a check named `quality`.
- A green result means those five commands passed. It does not approve the pull request, and the AI prompt pack cannot merge.
- Branch protection is documented in `docs/ci/branch-protection-checklist.md` and was not turned on during this verification.
- Do not treat the npm vulnerability count as a failed CI step unless the team adds an audit gate on purpose.
