# Gilded Rose

This is the Gilded Rose kata in TypeScript.

## Getting started

Requires Node 24 (see `.nvmrc`).

```sh
nvm use
npm install
```

## Scripts

| Command                      | What it does                              |
| ---------------------------- | ----------------------------------------- |
| `npm test`                   | Run the Vitest suite once                 |
| `npm run test:watch`         | Run Vitest in watch mode                  |
| `npm run test:coverage`      | Run the suite with V8 coverage            |
| `npm run test:mutation`      | Mutation testing with StrykerJS           |
| `npm run test:mutation:unit` | Mutation testing with the unit tests only |
| `npm run golden-master`      | Print the TextTest fixture day by day     |
| `npm run typecheck`          | Type-check with `tsc` (no emit)           |
| `npm run lint`               | Lint and format check with Biome          |
| `npm run lint:fix`           | Apply Biome's safe fixes and formatting   |
| `npm run ci`                 | The main CI job: Biome, tsc, coverage     |

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

## Mutation testing

`npm run test:mutation` runs [StrykerJS](https://stryker-mutator.io/), which
makes small changes (mutants) to `app/` and checks that a test fails for each
one. The HTML report lands in `reports/mutation/mutation.html`. The break
threshold is 100%, so any surviving mutant fails the run.

`npm run test:mutation:unit` does the same with only the rule-level unit tests
(`test/vitest/gilded-rose.spec.ts`), leaving out the golden master. It shows
whether the unit tests catch every mutant on their own. Its report is
`reports/mutation/unit.html`.

## Git hooks

`npm install` sets up two [Husky](https://typicode.github.io/husky/) hooks:

| Hook       | Runs                               |
| ---------- | ---------------------------------- |
| pre-commit | Biome on the staged files          |
| pre-push   | `npm run typecheck` and `npm test` |

## Continuous integration

GitHub Actions (`.github/workflows/ci.yml`) runs two jobs on every pull request
and on pushes to `master`: one for Biome, the type-check and the test suite
with coverage, and one for mutation testing, which uploads the Stryker report
as an artifact.

## Approach

I treated this like legacy code I'd inherited: first get the tooling and CI
into shape, then pin the current behaviour down, then refactor in small steps,
and only then add the new feature. The requirements are the kata's
[GildedRoseRequirements.md](https://github.com/emilybache/GildedRose-Refactoring-Kata/blob/main/GildedRoseRequirements.md).

Where it ended up:

- `updateQuality` is a `switch` with one small function per kind of item.
- Conjured items degrade twice as fast as normal items, added test first.
- A golden master and one unit test per rule, both at a 100% mutation score.
- Strict TypeScript, including `noUncheckedIndexedAccess`.

## How to read this

Each step was its own pull request, so the
[closed PRs](https://github.com/b-dashyan/gilded-rose-kata/pulls?q=is%3Apr+is%3Aclosed)
tell the story in order: tooling and CI, mutation testing, rule-level unit
tests, the refactor, Conjured items, and these finishing touches. Inside each
PR, the commits are small enough to follow one at a time. The reasoning behind each choice is in [DECISIONS.md](DECISIONS.md).
