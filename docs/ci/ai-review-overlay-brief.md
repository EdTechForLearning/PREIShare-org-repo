# PREIshare review overlay brief

This brief names the review rules that sit on top of the pull-request checks already in the repo. It does not add a workflow, a second prompt pack, or a hosting project.

## Words we will use

- **Pull request:** A pull request is a proposal to change the shared project, and it stays a proposal until a person accepts it.
- **CI check:** A CI check is the automatic run of install, typecheck, build, lint, and test, and a green check means those commands passed.
- **Merge:** A merge is a person accepting the proposal so the change becomes part of the main shared copy.
- **Review comment:** A review comment is a note on the proposal, and it is not an approval and not a merge.

## What topic 1 already finished

These pieces are done and working. This topic uses them as they are.

- The existing workflow is `.github/workflows/pr-ci.yml`. This topic does not create another workflow.
- That check already runs install, typecheck, build, lint, and test.
- Branch-protection notes are already written in `docs/ci/branch-protection-checklist.md`.
- The prompt pack is already drafted in `docs/ci/ai-pr-review-prompts.md`. Later steps may refine that file. This topic does not invent a new prompt-pack name.
- The verification log is already written in `docs/ci/e2e-verification-log.md`.
- The stakeholder handoff is already written in `docs/ci/stakeholder-handoff.md`.
- Hosting stays on the existing Production URL, `https://prei-share-org-repo-chi.vercel.app`. This topic does not create a new hosting project.

## What this topic adds

Later steps will write these. This brief only names them.

1. Who may approve a pull request, and who may merge it.
2. A constrained system instruction with a required output shape, edited later inside `docs/ci/ai-pr-review-prompts.md`.
3. A human-judgment checklist.
4. A practice review on a sample pull request.
5. An honest record of which branch-protection rules the GitHub plan actually saved.

## What this topic will not rebuild

- No second workflow file.
- No second CI design and no second dashboard inventory.
- No second prompt-pack filename.
- No new hosting project.
- No claim that a green CI check is permission to merge.

## Risks a green check cannot decide

- **Sign-in:** A sponsor signs in with email and password, and only that person should reach their own dashboard. A passing test cannot decide who is allowed to be logged in.
- **Money:** Charges, payments, and money records are outside this dashboard work. A passing test cannot decide whether any charge or money record is correct.
- **Privacy:** A member's information, such as an email address, must not reach the wrong people. A passing test cannot decide that the right people were the only ones who saw it.
- **Product intent:** PREIshare is the team's shared view of real-estate market information. A passing test cannot decide whether the change still matches that purpose.

## Who is allowed to decide

- The AI may suggest findings in a review comment.
- The AI may not approve a pull request.
- The AI may not merge a pull request.
- A person approves. A person merges.

## How we will direct the agent

We plan the overlay, draft this brief, and then critique it against the topic-1 files before keeping it. This step writes only `docs/ci/ai-review-overlay-brief.md` and leaves the workflow, the prompt pack, and the hosting project unchanged.
