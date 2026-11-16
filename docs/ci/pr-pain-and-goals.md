# PREIshare PR pain points and Sprint 6 CI goals

**Date:** 2026-11-16
**Audience:** dashboard teammates and the next learner setting up pull-request checks

This brief says what hurts today and what a machine should prove on every pull request. It does not add a GitHub Actions workflow. Workflow files come in a later step, after this brief is agreed.

## Client need

PREIshare’s dashboard team needs every pull request to get the same automatic build-and-check run. Broken TypeScript or React changes should show up before someone merges. People still decide whether the change is good enough to merge. Automation only proves the project still installs, typechecks, builds, lints, and tests.

Today `package.json` has `npm run typecheck` (`tsc --noEmit`) and `npm run build` (`vite build`). It does not have a `lint` script or a `test` script. There is no `.github/` folder, so GitHub does not run those commands when a pull request opens.

---

## Current pain

- Each teammate has to remember to install dependencies on their own computer. Two machines can disagree.
- Build and typecheck are easy to skip when a deadline is close. Lint and test are even easier to skip, because those commands are not in the project yet.
- Opening or updating a pull request does not start a shared cloud run. Nothing in the repo ties a check to the pull request.
- Broken code can land on `main`. Nothing shared fails the pull request before merge.
- Reviewers spend time asking “does it build?” instead of looking at design, risk, and whether the change matches the product.
- The team has no written line between what a machine checks and what a person must judge. That includes any help from an AI review prompt.

---

## Automated CI goals

On every pull request, a clean environment should do this work and nothing more ambitious:

1. Install the project dependencies from the lockfile.
2. Run the TypeScript typecheck (`npm run typecheck`).
3. Build the TanStack Start / React app (`npm run build`).
4. Run lint once a `lint` script exists in `package.json` and the team has agreed what it checks. Do not invent a linter in this brief.
5. Run tests once a `test` script exists in `package.json`. Do not invent a test runner in this brief.
6. Mark the pull-request check failed, in a way people can see on the pull request, when any required step fails.

Order for the required steps: install, then typecheck, then build, then lint, then test. Skip lint or test only while that script is still missing, and say so in the check output. A green check means those steps passed. It does not mean the change is approved.

This sprint’s automation does not deploy the app, does not read production secrets, and does not merge the pull request.

---

## Human review stays in charge

A person still owns the merge.

- Approve the pull request, or request changes.
- Judge product and UX risk, security-sensitive logic, and how data is handled. Row-level security, auth, and secret handling stay human reviews even when the build is green.
- Decide whether to merge. A green CI check is evidence the commands passed. The reviewer chooses whether to merge.
- AI review prompts may point out questions and speed up reading. A person remains accountable for the merge decision. The prompt pack does not approve, merge, or dismiss a review.
- Secrets and production access stay outside this pull-request automation. Do not put service-role keys, deploy tokens, or production environment values in the workflow designed from this brief.

---

## Out of scope this sprint

Leave these out of the goals and out of the first workflow:

- A production deploy that runs from the pull-request workflow.
- A bot that merges the pull request when checks pass.
- Load tests or performance suites, unless the repo already has a standard script for them. It does not today.
- New dashboard features that are unrelated to making pull requests checkable.

---

## Success signals

- Opening or updating a pull request starts one clear CI workflow.
- The required checks run in this order: install, typecheck, build, lint, test. Lint and test join that list when their scripts exist.
- A failure shows on the pull request. A teammate does not have to be asked to “try it locally” to learn that typecheck or build failed.
- A short AI-assisted review prompt pack exists. It helps a human read faster. It does not replace the human merge decision.
- Stakeholders can read a short handoff that says what the machine runs and what a person still owns.

---

## Handoff checklist for the next learner

- [ ] Read this brief before adding `.github/workflows`.
- [ ] Confirm `package.json` scripts before wiring lint or test. Today only typecheck and build are real commands.
- [ ] Keep production secrets and deploys out of the pull-request workflow.
- [ ] Leave the merge button to a person.
