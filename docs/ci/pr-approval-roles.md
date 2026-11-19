# PREIshare pull request approval roles

This file says who may do each job on a PREIshare pull request. It follows `docs/ci/ai-review-overlay-brief.md`. It does not start a new project. It does not edit `.github/workflows/pr-ci.yml`. It does not rewrite the review prompt pack.

## Two words, defined before the rules

**Approve** means a human has read the proposal and accepts it. Approve is a review decision. It does not put the change into the shared project by itself.

**Merge** means a human combines the accepted proposal into the shared branch, usually `main`, so the change becomes part of PREIshare for everyone.

Approve is not merge. A green pr-ci check is not approve, and it is not merge.

## The four roles

| Role | Who (name or job you can point to) | May do | Must not do |
| --- | --- | --- | --- |
| Author | Gonzalo Burga (`gonzaloburga-cs`), onboarding engineer in `CONTRIBUTORS.md` | Open the pull request and update it after feedback | Be the only human who approves, or merge alone, when the change touches privacy, sign-in, or money |
| Human reviewer | The human reviewer required by `docs/ci/branch-protection-checklist.md`: “At least one human review and approval before merge.” That checklist does not record a personal name. | Read the change, comment, approve, or request changes | Hand the approve button to the AI assistant |
| Maintainer | The maintainer with admin access in `docs/ci/branch-protection-checklist.md`. The sign-off line “Maintainer who can edit branch protection” is still blank, so this row does not invent a personal name. | Merge only after the human approval and the existing pr-ci check | Merge because an AI comment said the change looks fine |
| AI assistant | Chat assistant used as an advisor | Comment with suggested notes for the human reviewer | Approve, request changes as if it were a GitHub reviewer, or merge |

Gonzalo Burga is the author only. The reviewer and the maintainer are not filled with his name, and they are not written as “the team” or “someone.” The checklist has no second personal name to copy. A person approves. A person merges.

## What the AI assistant may and must not do

The AI assistant may comment. A comment is a note. A note is not a decision.

The AI assistant must not approve.

The AI assistant must not request changes as if it were a GitHub reviewer.

The AI assistant must not merge.

Request changes is an official GitHub review outcome that sends the proposal back to the author. Only the human reviewer may do that.

## Merge paths

Every allowed path ends with a named human. The AI assistant is never the last actor.

1. Gonzalo Burga opens the pull request. The existing pr-ci check runs. The human reviewer approves. The maintainer with admin access merges.
2. The pr-ci check fails. Gonzalo Burga fixes the proposal. The check passes. The human reviewer approves. The maintainer with admin access merges.
3. The human reviewer requests changes. Gonzalo Burga updates the proposal. The human reviewer approves. The maintainer with admin access merges.

Forbidden path, not allowed: the AI assistant comments that the change looks fine, and the proposal is merged with no named human approval.

## Aligned with branch protection, not applied yet

This map agrees with `docs/ci/branch-protection-checklist.md`.

Intended gates, already described in that checklist, and restated here in plain language:

- The pr-ci check should be required before merge. The required check name in the checklist is `Install, typecheck, build, lint, and test` (often listed as `PR CI / Install, typecheck, build, lint, and test`). Require that job name, not the example name `quality` and not the job id `ci`, unless a real pull-request check run shows a different string.
- A human approval should be required before merge.

This document does not change GitHub settings. It does not turn branch protection on or off. A later step records what the repository plan actually enforced.

## Accountability

If a bad change is merged, the person who answers is the maintainer with admin access, after the human reviewer approved. The AI assistant does not answer for the merge. The checklist does not yet name that maintainer.
