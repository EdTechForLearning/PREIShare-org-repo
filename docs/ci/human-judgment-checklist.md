# PREIshare human-judgment checklist

This checklist is the human gate for a pull request. A pull request is a proposal to change the shared project. A person marks this list. The AI assistant may suggest notes. It may not mark these outcomes, approve the pull request, or merge it.

Merge means a human, Gonzalo Burga in the maintainer role, accepting the proposal so its changes become part of the main shared copy.

This file does not replace `.github/workflows/pr-ci.yml`. That workflow already installs dependencies, typechecks, builds, lints, and tests. Do not re-run those commands as items on this checklist. A green pr-ci check is required evidence that those commands passed. It is not permission to merge.

Role names below match `docs/ci/pr-approval-roles.md`. Gonzalo Burga is the author, the human reviewer, and the maintainer. Those reviewer and maintainer jobs are the same person. The AI assistant stays an advisor only. AI notes, if you read them, must follow the output shape in `docs/ci/ai-pr-review-prompts.md`: review limits, findings with severity, evidence, category, and `question_for_human`, or an explicit not-found block. This checklist is how Gonzalo Burga accepts or rejects those notes. It is not a second copy of that prompt pack.

## How a human uses this file

1. Wait until the existing pr-ci check has a result. If it is red, stop. Do not use this checklist to override a failed automatic check.
2. Read AI assistant notes only as suggestions. A note is not an approval and not a merge.
3. For each of the four sections, look at the evidence, then mark exactly one outcome: pass, fail, or needs-info.
4. If any section is fail or needs-info, the maintainer must not merge, even when pr-ci is green.
5. Only Gonzalo Burga, the human reviewer named in `docs/ci/pr-approval-roles.md`, may approve. This checklist does not click Approve or Merge.

## Sign-in

### Risk in PREIshare terms

Sign-in is how a sponsor proves who they are with email and password so only that person reaches their own dashboard. The risk is that a change lets the wrong person in, keeps someone signed in who should be signed out, or shows one sponsor another sponsor's dashboard after login. A passing test cannot decide who is allowed to be logged in.

### Evidence a human needs

- The diff (the lines added or removed) for login, logout, session, or who is signed in.
- This rule, copied from `docs/ci/ai-review-overlay-brief.md`: a sponsor signs in with email and password, and only that person should reach their own dashboard.
- If no sign-in file changed, the human reviewer still looks once for new screens that read a sponsor's dashboard data and writes what they opened.

The AI assistant's confidence is not evidence. Answering `question_for_human` inside the note is not evidence.

### What the AI is not allowed to decide

The AI assistant must not decide that sign-in is safe, must not mark pass, fail, or needs-info, and must not approve or merge.

### Outcomes

- **pass**: Gonzalo Burga saw the diff and the sponsor-dashboard rule, and this change does not let the wrong person in or show another sponsor's dashboard.
- **fail**: Gonzalo Burga saw a sign-in or session problem, or another sponsor's data shown after login. Fail blocks merge even if pr-ci is green.
- **needs-info**: Gonzalo Burga cannot tell who the change signs in or whose dashboard it shows. This is not a pass. Do not merge until the missing fact is written down and the section is marked again.

## Money

### Risk in PREIshare terms

Money means charges, payments, and money records, including a balance, a price, or a refund. The overlay brief says those records are outside this dashboard work. The risk is a wrong amount, the wrong person changing an amount, or money moving without a human knowing who is affected. A passing test cannot decide whether any charge or money record is correct.

### Evidence a human needs

- The diff, searched for amounts, prices, balances, payments, or refunds.
- The screen or file where a sponsor would see that amount.
- If the change has no money words, the human reviewer writes which files they opened and that they found none.

### What the AI is not allowed to decide

The AI assistant must not decide that an amount is correct, must not mark the money outcome, and must not approve or merge.

### Outcomes

- **pass**: Gonzalo Burga checked the diff and either found no money change, or found a money change and confirmed the amount and who can see or edit it.
- **fail**: Gonzalo Burga found a wrong amount, a hidden money change, or the wrong person able to change money. Fail blocks merge even if pr-ci is green.
- **needs-info**: Gonzalo Burga sees money words but cannot tell who is charged or who can see the amount. Do not merge until that fact is known.

## Privacy

### Risk in PREIshare terms

Privacy means a member's information, such as an email address, must not reach the wrong people. The risk is a leak: private details on a public page, in an error message, in a log, in a shared screen, or in a file the wrong person can open. A passing test cannot decide that the right people were the only ones who saw it.

### Evidence a human needs

- The diff, read for email, phone, address, or other private member fields.
- Where that text would appear: a public page, an error, a log, a download, or a screen only one sponsor should see.
- A human statement of who is allowed to see that field.

An AI sentence that says "looks fine" is not evidence. A suggested finding is only a hint to check. A not-found block is not a pass.

### What the AI is not allowed to decide

The AI assistant must not decide that a privacy leak is acceptable, must not mark the privacy outcome, and must not approve or merge.

### Outcomes

- **pass**: Gonzalo Burga read the diff and confirmed private member fields are not shown to the wrong audience.
- **fail**: Gonzalo Burga found a private field, such as a member email, exposed to the wrong audience. Fail blocks merge even if every automatic command passed.
- **needs-info**: Gonzalo Burga cannot tell who can see a private field. Do not merge until the audience is known.

## Product intent

### Risk in PREIshare terms

Product intent is this sentence from `docs/ci/ai-review-overlay-brief.md`: PREIshare is the team's shared view of real-estate market information. The risk is drift: the change still builds and tests, but it serves a different goal, a different audience, or a job the brief does not ask for. A passing test cannot decide whether the change still matches that purpose.

### Evidence a human needs

- The sentence above, copied from the overlay brief. Do not invent a new purpose.
- The pull request description, compared with that sentence.
- The diff, checked for a new audience or a new job the product was not meant to do.

### What the AI is not allowed to decide

The AI assistant must not decide that a change matches product intent, must not rewrite the product purpose, and must not approve or merge.

### Outcomes

- **pass**: Gonzalo Burga compared the change to the brief and it still serves that purpose.
- **fail**: Gonzalo Burga found drift from the brief. Fail blocks merge even if pr-ci is green.
- **needs-info**: The brief does not clearly cover this change, or the description does not say what market-information problem it solves. Ask a human stakeholder. Do not let the AI assistant invent the purpose.

## Merge rule

- Any **fail** blocks merge, even when the pr-ci check is green.
- Any **needs-info** blocks merge until Gonzalo Burga records the missing evidence and marks that section again.
- All four sections must be **pass**, and pr-ci must be green, before Gonzalo Burga, the human reviewer, may approve.
- Approve is not merge. Gonzalo Burga, the maintainer, may merge only after that approval and the green pr-ci check.
- This checklist never authorizes the AI assistant to approve or merge.

## What this checklist does not do

Do not add checklist tasks that repeat the commands already in `.github/workflows/pr-ci.yml`:

- install dependencies
- typecheck
- build
- lint
- test

If those fail, the automatic check is red and this checklist does not waive them. If those pass, this checklist still runs.

## Practice box (not the sample pull request)

This box is imaginary. It is not a pull request and it is not the sample review.

- Imaginary change: a public PREIshare page prints member@example.com. The pr-ci check is green.
- Section marked: Privacy
- Outcome: fail
- Why a green check does not allow merge: the automatic commands can pass while a private email is still visible to the wrong people. A privacy fail blocks merge.
