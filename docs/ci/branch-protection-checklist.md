# Branch protection checklist (PREIshare PR CI)

## Purpose

Connect the automated green/red signal from `.github/workflows/pr-ci.yml` to merge policy on protected branches. This document is for maintainers with admin access. Contributors without admin rights prepare and verify the checklist only.

This file does not turn on branch protection. No one with admin access applied these settings as part of writing the checklist.

## Protected branches

`docs/ci/pipeline-design.md` names one merge target: `main`. Do not add another branch here unless that design doc lists it.

- [ ] Protect `main`

## Required status checks

After the workflow has run at least once on a pull request, GitHub shows the check name. The workflow name is `PR CI`. The job id is `ci`. The job `name` is `Install, typecheck, build, lint, and test`. Require that job name, not the example name `quality` and not the id `ci`, unless a real pull-request check run shows a different string.

- [ ] Require status checks to pass before merging
- [ ] Required check name: `Install, typecheck, build, lint, and test` (often listed as `PR CI / Install, typecheck, build, lint, and test`)
- [ ] Turn on “Require branches to be up to date before merging” so the last green run includes the latest `main`, not an older base

## What CI already enforces (automated)

These are the steps in `.github/workflows/pr-ci.yml`, in order:

- Dependency install (`npm ci`)
- Typecheck (`npm run typecheck`)
- Production build (`npm run build`)
- Lint (`npm run lint`, which runs `tsc --noEmit --pretty false`)
- Tests (`npm run test`, Node’s built-in runner, not a browser suite)

The workflow runs on `pull_request` to `main` for `opened`, `synchronize`, and `reopened`. A new commit on an open pull request is `synchronize`, so CI runs again. `cancel-in-progress: true` cancels the older run for that same pull request.

## What humans still own (not optional)

- [ ] At least one human review and approval before merge
- [ ] AI-assisted review prompts are helpers only. They never approve, merge, or replace a human. Do not auto-merge because an AI comment says the change looks good.
- [ ] Secret handling, row-level security, auth, and whether the change matches the product stay outside a green CI check

## What not to require yet

- [ ] Do not require optional or flaky jobs that are not in `pr-ci.yml`
- [ ] Do not require a deploy or production job on pull requests. This workflow does not deploy.
- [ ] Do not store Supabase or embedding secrets in the pull-request workflow just to make a check pass

## Readiness sign-off

- [ ] Workflow file path: `.github/workflows/pr-ci.yml`
- [ ] Triggers: `pull_request` to `main` (`opened`, `synchronize`, `reopened`)
- [ ] Concurrency: cancel in-progress runs for the same pull request when new commits land
- [ ] Maintainer who can edit branch protection: __________________
- [ ] Date verified against a real PR check run: __________________

## Notes for Sprint 6 handoff

A red required check should block merge. A green check means install, typecheck, build, lint, and test passed. It does not mean product review is done. Learners who cannot change repository settings stop after this checklist is written and reviewed.
