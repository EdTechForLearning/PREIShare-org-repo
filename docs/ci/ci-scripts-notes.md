# CI scripts notes — PREIshare dashboard

Checked against `package.json`, `.github/workflows/pr-ci.yml`, `docs/ci/pipeline-design.md`, and `docs/ci/project-ci-inventory.md`.

## Package manager

- CI uses: npm
- Lockfile present: `package-lock.json`
- Do not switch the workflow to pnpm or yarn. The `pnpm` block in `package.json` is not a lockfile.

## Scripts CI calls (must match package.json and pr-ci.yml)

The workflow order is install, typecheck, build, lint, test.

| CI step | package.json script | Exact local command | Purpose |
| --- | --- | --- | --- |
| Install | (npm ci) | `npm ci` | Clean install from the lockfile |
| Typecheck | `typecheck` | `npm run typecheck` | `tsc --noEmit` |
| Build | `build` | `npm run build` | `vite build` |
| Lint | `lint` | `npm run lint` | `tsc --noEmit --pretty false`. ESLint, Prettier, and Biome are not installed. The TypeScript strict flags in `tsconfig.json` are the static check this repo already has. |
| Test | `test` | `npm run test` | `node --experimental-strip-types --test src/lib/embeddings/text.test.ts`. Node’s built-in runner exits. It is not a watch command and not a browser suite. |

## package.json script entries

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "vite build",
    "lint": "tsc --noEmit --pretty false",
    "test": "node --experimental-strip-types --test src/lib/embeddings/text.test.ts"
  }
}
```

No ESLint or Vitest package was added. Those tools are not dependencies of this repo.

## Intentional gaps

- No browser end-to-end suite in pull-request CI.
- Secrets, Supabase migrations, embedding seeds, and production deploys stay out of this workflow.
- `dev`, `start`, and `preview` stay local because they do not exit.

## How to reproduce a CI failure locally

1. Check out the pull-request branch.
2. `npm ci`
3. `npm run typecheck && npm run build && npm run lint && npm run test`
4. Fix until all four pass, then push again.
