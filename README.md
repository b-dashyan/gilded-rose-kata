# Gilded Rose

This is the Gilded Rose kata in TypeScript.

## Getting started

Requires Node 24 (see `.nvmrc`).

```sh
nvm use
npm install
```

## Scripts

| Command                 | What it does                             |
| ----------------------- | ---------------------------------------- |
| `npm test`              | Run the Vitest suite once                |
| `npm run test:watch`    | Run Vitest in watch mode                 |
| `npm run test:coverage` | Run the suite with V8 coverage           |
| `npm run golden-master` | Print the TextTest fixture day by day    |
| `npm run typecheck`     | Type-check with `tsc` (no emit)          |
| `npm run lint`          | Lint and format check with Biome         |
| `npm run lint:fix`      | Apply Biome's safe fixes and formatting  |
| `npm run ci`            | Everything CI runs: Biome, tsc, coverage |

## Golden master

`npm run golden-master` prints the kata's TextTest fixture for 2 days, or pass
the number of days to simulate:

```sh
npm run golden-master -- 30
```

It runs with plain `node` via Node 24's built-in type stripping, which is why
it imports `../app/gilded-rose.ts` with the extension. It is a tool for
exploring behaviour by hand. The regression test is
`test/vitest/golden-master.spec.ts`, which snapshots the same fixture plus
boundary items over 30 days.

## Continuous integration

GitHub Actions (`.github/workflows/ci.yml`) runs Biome, the type-check and the
test suite with coverage on every pull request and on pushes to `master`.

## Notes

- The kata asks not to alter the `Item` class. The only change I made is adding
  type annotations to its constructor parameters, so it compiles under full
  `strict` mode. Types are erased at compile time, so `Item`'s runtime shape
  and behaviour are unchanged.
