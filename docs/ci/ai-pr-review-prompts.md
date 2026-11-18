# AI-assisted PR review prompt pack (PREIshare)

## Purpose

Use these prompts with a chat assistant or IDE copilot when reviewing a pull request on the PREIshare dashboard. They speed up human review. They do **not** replace CI, and they do **not** replace a human merge decision.

Grounded in `docs/ci/pr-pain-and-goals.md`, `docs/ci/project-ci-inventory.md`, and `docs/ci/pipeline-design.md`. Those three docs draw the line this pack keeps: a machine proves the project still installs and checks, and a person still owns product fit, auth, data access, secrets, and the merge.

**CI already covers**, in `.github/workflows/pr-ci.yml` and `docs/ci/ci-scripts-notes.md`: install (`npm ci`), typecheck, production build, lint (`tsc --noEmit --pretty false`), and the Node test runner. The job name is `Install, typecheck, build, lint, and test`. It runs on pull requests to `main` and does not deploy.

The planning docs were written when `lint` and `test` were still missing. Both scripts exist now, and the workflow calls them. Use the workflow for the current gate. The older “gap” notes in those three docs are history, not the job that runs today. Do not invent ESLint, Vitest, a browser suite, pnpm, or a deploy step because a prompt mentions them.

**Humans still cover:** product intent, dashboard UX, auth and row-level security, who can read or write Supabase rows, migrations, secrets, and the final approve or merge call. A green check is evidence the commands passed. It is not approval.

## How to use this pack

1. Open the pull request diff on GitHub, or locally with `git diff main...HEAD`.
2. Paste one prompt below into your assistant.
3. Attach or paste the relevant diff hunks and file paths the prompt asks for.
4. Read the answer as **advice only**. You still write the GitHub review and decide whether to merge.
5. Never paste production secrets, `.env` or `.env.local` values, or live credentials into the assistant. Names from `.env.example` are enough: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `EMBEDDING_API_KEY`, `EMBEDDING_MODEL`.

## Boundaries (read before every review)

- The AI is a **review assistant**, not a reviewer of record.
- The AI must **not** say approve, LGTM, request changes as a gate, or merge.
- The AI must **not** claim CI is green unless the human pastes CI results.
- The AI must **not** ask for a service-role key, an embedding key, or a production database so it can “verify” the change. Pull-request CI does not use those secrets (`docs/ci/project-ci-inventory.md`, Bucket B).
- Only a **human** PREIshare teammate may approve and merge the pull request.

---

## Prompt 1 — Plain-language diff summary

**When to use:** First pass on a pull request so you know what changed before a deeper review.

**Copy-paste prompt:**

```text
You are a review assistant for the PREIshare dashboard (TypeScript, TanStack Start,
React, Supabase). Summarize the pull request diff I paste below.

The live pull-request workflow runs npm ci, typecheck, build, lint, and a
non-watch Node test. It does not deploy, apply migrations, or call Supabase.
Do not restate those CI steps as if you ran them.

Output format:
1. One-sentence goal of the change (best guess from the diff).
2. Bullet list of files touched, grouped by area (UI, API/server, Supabase/data, config/CI).
3. Bullet list of behavior changes a reviewer should verify manually.
4. Open questions for the author (max 5).

Hard rules:
- Do not approve, reject, or recommend merge.
- Do not invent files or behavior that are not in the diff.
- If the diff is incomplete, say what else you need.
- Label every claim as observed in diff or inference.
- Do not claim CI is green unless the human pasted a check result.

Diff:
<PASTE DIFF OR FILE HUNKS HERE>
```

---

## Prompt 2 — Risk flags (auth, Supabase, migrations)

**When to use:** After the summary, when any auth, data, schema, env, or workflow file changed. Inventory Bucket B and Bucket C are the human side: service-role access, embeddings, migrations, and merge judgment are not proved by a green build.

**Copy-paste prompt:**

```text
You are a security-and-data risk assistant for PREIshare. Review the diff below
ONLY for risk signals. CI already runs typecheck, build, lint, and test — do not
repeat style nits unless they hide a risk. Do not ask the human to paste secret values.

Flag risks in these buckets (skip a bucket if nothing relevant appears):
- Auth / session / route protection
- Supabase client usage and who can read or write which rows
  (anon key vs service-role key; the service-role key bypasses row-level security)
- Migrations / schema / SQL under supabase/migrations/, including public.properties
- Secrets and env var names: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY,
  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, EMBEDDING_API_KEY, EMBEDDING_MODEL
- A workflow or script that would deploy, apply migrations, or seed embeddings
  from a pull request
- Destructive or irreversible data changes

For each flag output:
- Severity: high | medium | low
- File and rough location
- Why it matters for PREIshare users or data
- A concrete question the human reviewer should ask

Hard rules:
- Do not approve or merge.
- Do not claim the code is safe.
- If unsure, mark needs human verification — never invent a pass.
- Prefer questions over verdicts.
- Do not claim CI is green unless the human pasted a check result.

Diff:
<PASTE DIFF OR FILE HUNKS HERE>
```

---

## Prompt 3 — Human review question checklist

**When to use:** Before you submit your GitHub review, to build a short checklist tailored to this pull request.

**Copy-paste prompt:**

```text
You help PREIshare reviewers prepare questions. From the PR description and diff
below, generate 5–8 review questions a human should answer before merging.

Rules for questions:
- Prefer PREIshare-specific topics: dashboard UX, TanStack Start routes,
  Supabase access, auth, row-level security, migrations, embeddings, and failure modes.
- Do not duplicate pure CI concerns (install, typecheck, build, lint, test)
  unless the diff shows a likely gap those commands would miss.
- Each question must be answerable by reading code, running the app, or asking
  the author — not by guessing.
- Do not suggest pasting .env values or live keys into a chat.

Output format:
- Checklist of questions (markdown `- [ ]` items)
- Group lightly: Product / UX, Data & auth, Ops & rollback
- End with: Reminder: only a human may approve or merge this PR.

Hard rules:
- Do not approve, LGTM, or recommend merge.
- Do not speak as a required gate — speak as a helper.
- Do not claim CI is green unless the human pasted a check result.

PR description:
<PASTE PR BODY>

Diff:
<PASTE DIFF OR FILE HUNKS HERE>
```

---

## Optional follow-up — Map AI notes back to CI

If the assistant mentions something CI should have caught, open `docs/ci/pipeline-design.md`, `docs/ci/ci-scripts-notes.md`, and `.github/workflows/pr-ci.yml` and decide whether to file a follow-up for the next sprint. Do **not** weaken human review to paper over a missing automated check without a team decision. Do **not** add a secret, a deploy, or a new linter just because the assistant suggested one.

## Human merge authority (non-negotiable)

- AI output in this pack is advisory only.
- Required status checks and branch protection (see `docs/ci/branch-protection-checklist.md`) remain the automated gates. The required check name is the workflow job name: `Install, typecheck, build, lint, and test`.
- A named human reviewer owns the GitHub review and the merge click.
- Only a human may approve or merge.
- If AI and CI disagree with your judgment, trust evidence and teammates, not the model's confidence.
