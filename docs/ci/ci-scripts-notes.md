# CI scripts notes — PREIshare dashboard

Checked against `package.json`, `.github/workflows/pr-ci.yml`, `docs/ci/pipeline-design.md`, and `docs/ci/project-ci-inventory.md`.

## Package manager

- CI uses: npm
- Lockfile present: `package-lock.json`
- Do not switch the workflow to pnpm or yarn. The `pnpm` block in `package.json` is not a lockfile.

## Scripts CI calls (must match package.json and pr-ci.yml)

| CI step | package.json script | Exact local command | Purpose |
| --- | --- | --- | --- |
| Install | (npm ci) | `npm ci` | Clean install from the lockfile |
| Typecheck | `typecheck` | `npm run typecheck` | `tsc --noEmit` |
| Build | `build` | `npm run build` | `vite build` |
| Lint | **gap** | none | No lint script and no ESLint, Prettier, or Biome config |
| Test | **gap** | none | No test script. Vitest and Jest are not dependencies |

`.github/workflows/pr-ci.yml` runs install, typecheck, and build, in that order. It does not call `npm run lint` or `npm run test`. Calling either name would fail the job because the script does not exist.

## package.json script entries

No lint or test entry was added. The tools named in the scaffold (`eslint`, `vitest`) are not installed. Prettier shows up only as a transitive lockfile entry, not as a project script. Adding a script that calls a missing binary would turn every pull request red. Choosing a linter or a test runner is still a team decision, and this note does not install one.

Existing scripts that CI already uses:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "vite build"
  }
}
```

## Intentional gaps

- No unit test runner and no browser end-to-end suite in pull-request CI.
- Secrets, Supabase migrations, embedding seeds, and production deploys stay out of this workflow.
- `dev`, `start`, and `preview` stay local because they do not exit.

## How to reproduce a CI failure locally

1. Check out the pull-request branch.
2. `npm ci`
3. `npm run typecheck`
4. `npm run build`
5. Fix until both commands pass, then push again.

There is no local `npm run lint` or `npm run test` to run until those scripts exist.
