# Gilded Rose

This is the Gilded Rose kata in TypeScript.

## Getting started

Requires Node 24 (see `.nvmrc`).

```sh
nvm use
npm install
```

## Scripts

| Command                 | What it does                               |
| ----------------------- | ------------------------------------------ |
| `npm test`              | Run the Vitest suite once                  |
| `npm run test:watch`    | Run Vitest in watch mode                   |
| `npm run test:coverage` | Run the suite with V8 coverage             |
| `npm run typecheck`     | Type-check with `tsc` (no emit)            |
| `npm run lint`          | Lint and format check with Biome           |
| `npm run lint:fix`      | Apply Biome's safe fixes and formatting    |
| `npm run ci`            | Everything CI runs: Biome, tsc, coverage   |

## Continuous integration

GitHub Actions (`.github/workflows/ci.yml`) runs Biome, the type-check and the
test suite with coverage on every pull request and on pushes to `master`.

## Notes

- The kata asks not to alter the `Item` class. The only change I made is adding
  type annotations to its constructor parameters, so it compiles under full
  `strict` mode. Types are erased at compile time, so `Item`'s runtime shape
  and behaviour are unchanged.
