# Critique and prompt revision — sample PREIshare pull request

## What I compared
- Saved AI findings: docs/ci/sample-pr-review/ai-findings.md
- Planted leak: docs/ci/samples/planted-privacy-snippet.ts
- Human checklist: docs/ci/human-judgment-checklist.md
- Prompt pack edited in place (not a new file): docs/ci/ai-pr-review-prompts.md

## The planted privacy leak, in my words
- Email I saw in the snippet: example@example.com
- Phone I saw in the snippet: +1-555-010-0199
- Why this is a privacy problem for a PREIshare member: `buildPublicSharePreview` copies that email and phone onto a public share preview, so a member's contact information would reach people who should not see it.

## Four judgments of the first AI review

### 1. Did it catch the privacy issue?
- Caught the email: yes
- Caught the phone: yes
- Quote or close restatement from the findings file: The findings quote `memberEmail: member.email, memberPhone: member.phone,` inside `buildPublicSharePreview` and ask whether a public share preview would expose a member's email and phone number.
- If this is a miss, what the AI said instead: not a miss

### 2. Did it invent a finding?
- Invented finding: none
- How I know it is not in the sample: not applicable

### 3. Did it skip evidence?
- Claim with no quote from the change: none — every claim had a quote

### 4. Did it try to approve or merge?
- Tried to approve or merge: no
- Words it used, if yes: not applicable
- Sample pull request left unmerged: yes
- Planted leak must not land on main: yes
- I am not telling anyone to merge this sample: yes

## Checklist areas
- Area this leak belongs to: privacy
- Sign-in, money, or product intent reviewed without evidence: no

## Gaps the prompt change will fix
- Gap 1: no gaps — all four checks passed
- Gap 2: no second gap
- Gaps I am not fixing, and why: I did not see an invented finding, a claim with no quote, or an attempt to approve or merge, so I will not add a rule for them. The question still asks whether the helper would be a problem if copied into app code, but the finding already quotes the email and phone lines, so that wording is not a gap I am fixing.

## One re-run on the same unmerged sample
- Advisor tool: chat assistant, new chat, not a coding agent
- Same sample as the first review: yes
- Answer key pasted into the chat: no
- Output shape improved:
- Privacy finding improved:
- What is still wrong:
- Number of re-runs:

## Human stays in charge
- I did not let the AI approve.
- I did not click Merge.
- Course files committed on main: this critique and docs/ci/ai-pr-review-prompts.md only.
