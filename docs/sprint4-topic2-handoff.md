PREIshare — Sprint 4 Topic 2 Handoff
Status: Implementation and documentation handoff; NOT READY for security sign-off
Prepared: 2026-11-17
Repository: 11064469/PREIShare-org-repo
Target branch: main (this draft is not itself a Git commit)
Source documents and traceability
This handoff is based on the following four project documents. Review their current versions in the repository before accepting this handoff:
1. [`docs/sponsor-auth-requirements.md`](sponsor-auth-requirements.md) — sponsor sign-in, protected listings, ownership, and acceptance criteria.
2. [`docs/data-model-and-rls-matrix.md`](data-model-and-rls-matrix.md) — proposed tables, owner-scoped RLS, and outstanding schema decisions.
3. [`docs/env-var-checklist.md`](env-var-checklist.md) — public versus server-only Supabase configuration and Git hygiene.
4. [`docs/security-verification-checklist.md`](security-verification-checklist.md) — recorded PASS/FAIL/NOT RUN evidence, gaps, retests, and stakeholder verdict.
Four-point source summary
- Who can log in: The intended users are authorized sponsors authenticating with Supabase Auth. The criteria for sponsor approval and profile provisioning still need confirmation; a valid Supabase account alone has not been proven to establish sponsor eligibility.
- Property isolation: The proposed properties.owner_id is bound to the authenticated user ID, with SELECT USING (owner_id = auth.uid()) and INSERT WITH CHECK ownership rules. These are documented design requirements, not proof of effective deployed RLS.
- Secret placement: Browser code uses public VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY; privileged SUPABASE_SECRET_KEY is accessed only in a server-only module. Local .env.local must stay untracked. The setup documentation also discusses the publishable-key naming variant; the reviewed application code currently uses ANON_KEY.
- Verification: Source inspection of browser/server separation and the property-create guard passed within their stated scope; a recorded production build passed; login-page initialization failed with a missing public anon key and later passed after a local configuration correction. Authenticated login/logout, live listing/insert behavior, deployed RLS, and cross-sponsor isolation remain NOT RUN.
1. Client outcomes
Target outcome: A sponsor signs in, reaches protected dashboard pages, sees only their authorized PostgreSQL property listings, creates a listing owned by their authenticated account, and signs out without leaving private routes accessible.

Documented progress: The project has a sponsor-access login page and a reviewed server-side property-create route. The create handler checks for an authenticated user, derives owner_id from user.id, and handles database insert errors. A successful build and the rendered login form have been observed. These are partial implementation milestones, not evidence that the complete user journey works.

Not demonstrated: Valid and invalid sign-in, session persistence, sign-out, private-list retrieval, successful and rejected database inserts, and Sponsor A versus Sponsor B isolation have not been verified end-to-end. Do not describe these as delivered, secure, or accepted outcomes.
2. Architecture decisions
Authentication and authorization
- Supabase Auth provides identity; protected server routes should verify the current authenticated session.
- Sponsor eligibility is an unresolved business rule. The proposed sponsor_profiles.id references auth.users.id; profile provisioning is intended to be trusted, not open self-registration.
- Routine sponsor reads and writes use a session-aware Supabase client, not a privileged service-role client.
- The property-create server handler rejects unauthenticated requests and derives ownership server-side; it must not trust an owner ID supplied by the browser.
Data and RLS
- The proposed database design has sponsor_profiles and properties, with properties.owner_id referencing the sponsor profile.
- The proposed RLS policy allows sponsors to read only their own rows and insert only rows they own; anonymous access and sponsor-facing update/delete are not approved for this sprint.
- docs/data-model-and-rls-matrix.md is a planning document. A SQL migration was also drafted in earlier work, but this handoff does not establish that the migration was applied to the target database or that the policies passed live negative tests.
- Older artifacts refer to property_listings.sponsor_id, whereas the newer proposal uses properties.owner_id. Confirm the deployed schema before applying migrations or changing queries.
Configuration and secrets
- Reviewed browser client: src/lib/supabase.client.ts reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
- Reviewed server module: src/lib/supabase.server.ts imports @tanstack/react-start/server-only and separately accesses process.env.SUPABASE_SECRET_KEY for privileged operations.
- Keep actual secret values out of documentation, browser bundles, .env.example, and Git history. The earlier scan of 27 compiled browser assets found zero matches for selected privileged key names in two final scans; an initial conflicting result and absence of a secret-value-safe audit leave the broader clearance incomplete.
3. File map
Path	Purpose / evidence boundary
docs/sponsor-auth-requirements.md	Scope, sponsor workflows, and security acceptance criteria
docs/data-model-and-rls-matrix.md	Proposed schema and illustrative RLS policies; not deployment evidence
docs/env-var-checklist.md	Public and server-only environment-variable rules
docs/security-verification-checklist.md	Executed results, outstanding tests, gaps, and stakeholder verdict
src/lib/supabase.client.ts	Browser Supabase client using public configuration
src/lib/supabase.server.ts	Server-only Supabase helpers; session-aware and privileged paths are separate
src/routes/dashboard/properties.new.tsx	Reviewed server-side create handler; validates user and assigns owner ID
.env.example	Template; placeholder-only contents still require a documented check
.env.local	Local configuration; ignored and never committed
docs/sprint4-topic2-handoff.md	This handoff document


Paths above are grounded in supplied project documentation and reviewed code excerpts. This is not a claim that every file was rechecked against the current remote HEAD. A migration draft was seen in prior work, but its exact current repository location and deployment state are not certified here.
4. Verification results and known limitations
Area	Recorded status	Meaning
Browser client public-only source review	PASS (source scope)	Reviewed browser client uses public URL and anon key
Server-only separation and session-aware create path	PASS (reviewed source scope)	Server-only import and create-handler usage observed; runtime authorization still unverified
Compiled asset key-name search	Limited PASS / follow-up	Two scans: 27 files, zero matches for selected names; earlier scan discrepancy remains
Production build	PASS (historical run)	Build completed; not a substitute for runtime security tests
Login-page initialization	FAIL → PASS after local configuration change	Initial missing anon-key error; page later rendered, not proof of successful sign-in
Valid/invalid sign-in, protected routes, logout	NOT RUN	No completed authenticated walkthrough recorded
Database-backed list, create, negative insert	NOT RUN	Live RLS and write behavior unverified
Cross-sponsor read and owner-spoofing attempts	NOT RUN	Sponsor A/B isolation unverified


Gaps and fixes: The recorded login-page configuration failure was addressed locally in .env.local and the page-render retest passed. The generated-asset scan discrepancy was investigated with repeat scans, but no source-code fix or full credential-exposure clearance is claimed. Consult docs/security-verification-checklist.md for exact row IDs, evidence, and remaining gaps.

Stakeholder verdict: NOT READY. The source-level checks and successful page render do not establish end-to-end security. Release/security approval must wait for live authentication, RLS, and cross-sponsor verification.
5. Recommended next work
1. Confirm the current repository state, actual deployed table/column names, and whether the intended RLS migration has been applied. Reconcile property_listings.sponsor_id versus properties.owner_id without creating duplicate tables.
2. Confirm sponsor account provisioning/eligibility and obtain two authorized test accounts, Sponsor A and Sponsor B. Do not record credentials in docs.
3. Complete and log the login, invalid-login, signed-out redirect, navigation/session, and logout walkthrough. Record actual outcomes as PASS or FAIL.
4. Verify real PostgreSQL property listing and creation, including required-field validation, one successful insert, server-assigned ownership, error handling, and duplicate-submit behavior.
5. Test RLS with ordinary authenticated sessions: A sees A's rows, B cannot see A's rows by list or guessed ID, and B cannot insert using A's owner ID. Never use a privileged key to simulate sponsor permissions.
6. Rebuild and repeat secret-hygiene checks without printing values; inspect .env.example, current tracked files, browser-facing imports, and the actual generated browser assets. Resolve the earlier inconsistent scan result.
7. Update docs/security-verification-checklist.md with dates, evidence, failures, fixes, and retests. Reassess the NOT READY verdict only when required checks have passed.
8. Confirm this handoff matches the four linked source documents at current main, then commit only docs/sprint4-topic2-handoff.md unless other files are intentionally part of the change.
Handoff acceptance boundary
This document summarizes documented requirements, design choices, reviewed source behavior, and observed partial verification. It is not a certification of deployed database policy, production readiness, or completion of unrun tests. The next learner should use the four linked documents as the authoritative trail and update this handoff if the current repository differs from the supplied evidence.