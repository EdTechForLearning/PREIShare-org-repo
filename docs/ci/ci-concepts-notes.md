# CI concepts notes — PREIshare dashboard

**Date:** 2026-11-17
**Related:** `docs/ci/pr-pain-and-goals.md`

These notes explain the words we will use when we add pull-request checks. They do not add a GitHub Actions workflow.

## In my own words

**Continuous integration (CI)**
CI means the team automatically runs the same install and quality checks every time someone proposes code changes, usually on a pull request. We learn quickly if the change breaks the app, before it lands on `main`.

**Pipeline / workflow**
A pipeline (in GitHub, often a “workflow”) is the ordered recipe of automated steps. For PREIshare that recipe is: check out the code, install dependencies, typecheck, build, then lint and test when those scripts exist. People write the recipe. A cloud machine runs it the same way every time.

**Green check vs red X**

- Green means every required automated step passed. That is a signal to start human review. It is not permission to merge without thinking.
- Red means at least one step failed. Leave the pull request unmerged until a person understands the failure and a new run checks the fix.

**Why every pull request (for PREIshare)**
`docs/ci/pr-pain-and-goals.md` names the pains: forgotten local checks, different results on different laptops, and review time spent on “does it build?” One shared pipeline on every pull request gives every teammate the same signal and catches breakages early. A person still decides whether to merge.

## Pain → CI idea map

| Pain (from `docs/ci/pr-pain-and-goals.md`) | CI idea |
| --- | --- |
| Teammates must remember to install dependencies, and build or typecheck is easy to skip | The workflow runs install and the real check commands on every pull request |
| Two machines can disagree (“works on my machine”) | One shared runner and the same lockfile and scripts |
| Reviewers spend energy re-running “does it build?” | A red X shows the basics failed, so review time goes to design and risk |
| Broken code can reach `main` because nothing shared fails the pull request | Checks run when the pull request opens or updates, before merge |
| No written line between machine checks and human judgment, including AI help | A green check is evidence. A person still approves and merges |

## Non-examples (“CI washing”) — not real CI

1. **Only building on my laptop.** Other machines and `main` never get the same proof. The result stays personal.
2. **Merging because an AI comment said “LGTM,” with no automated run.** AI review prompts can help a person read. They do not replace a green or red pipeline signal, and they do not merge the pull request.
3. **A workflow file in the repo that never triggers on `pull_request`.** The recipe exists, but it does not run when someone proposes a change.
4. **Running checks only on `main` after merge.** Feedback arrives too late. Broken code may already be on the default branch.

## What I will demand from later agent-written YAML

- The workflow triggers when a pull request is opened or updated, not only when someone clicks a manual button.
- Steps stay in a clear order: install, then typecheck, then build, then lint, then test. Lint and test wait until `package.json` actually has those scripts.
- A failed step fails the job, so the pull request shows a red X. Errors are not hidden.
- Secrets and the merge decision stay with people. The workflow does not deploy to production and does not merge the pull request.

## Open questions for inventory and design

- This repo uses npm and `package-lock.json`. `package.json` already has `typecheck` and `build`. It does not have `lint` or `test`. The design step should confirm that list again before any workflow names a script.
- Which checks can a machine run (install, typecheck, build, and later lint and test), and which stay human (product and UX risk, security-sensitive logic, and data handling)?
