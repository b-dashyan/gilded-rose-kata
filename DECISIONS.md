# Decisions

The choices I made along the way and why, in the order I made them.

## 1. Vitest only, on Node 24, as ESM

The starter came with Jest, Mocha, an old Vitest setup and a Python TextTest
rig. I kept only Vitest and updated everything (Vitest 5, TypeScript 7, ESM).
I later stepped back to Vitest 4.1 and TypeScript 6.0 (see decision 9).

- **Node 24** is the current LTS. Node 26 is newer but not LTS yet. `.nvmrc`,
  `engines` and CI all use the same version.
- **No compile step.** Vitest runs the TypeScript directly, so `tsc` only
  type-checks.
- **Explicit imports** from `vitest` instead of globals, so every file says
  where its names come from.

TypeScript 7 is very new. If it ever causes trouble, going back to 5.9 is easy.
(It did, see decision 9.)

## 2. Strict TypeScript, and the `Item` constructor

I wanted full `strict`. The only blocker was the untyped `Item` constructor,
and the kata says not to change `Item`. I added type annotations to its
parameters and nothing else. Types are erased at compile time, so `Item`
behaves exactly the same. That felt better than turning off `noImplicitAny`
for the whole project.

Later I want `noUncheckedIndexedAccess` too. It doesn't fit the legacy
`this.items[i]` loops, so it waits for the refactor.

## 3. A golden master before touching the logic

Before refactoring, I need something that tells me if behaviour changed.
`golden-master.spec.ts` runs the kata's fixture plus items sitting on every
boundary in the rules, simulates 30 days, and compares the output to a
recorded `.txt` snapshot. It runs in-process, so no ts-node.

Coverage is 100%, but that only shows the code ran. So I also introduced 14
small bugs by hand, and the snapshot caught all of them. Stryker now does
this automatically (decision 9).

**Why 30 days:** the slowest items settle on day 26, and the extra days show
they stay there. 15 would cut off the fixture's backstage pass just before it
drops to zero.

The snapshot also records today's (wrong) Conjured behaviour. When I implement
Conjured items, the snapshot diff should only touch Conjured lines.

## 4. Tests before `lint:fix`

`lint:fix` doesn't only format: it turns `!=` into `!==`. That's almost
certainly safe here, but "almost certainly" is what characterization tests
are for. With the golden master in place first, the fix is a commit where the
tests pass before and after.

## 5. Biome for linting and formatting

One fast tool instead of ESLint plus Prettier, and it can check only staged
files, which the pre-commit hook uses. ESLint has more plugins, but I didn't
miss any here.

## 6. Keeping the TextTest fixture

I kept `test/golden-master-text-test.ts` as a tool for exploring behaviour
(`npm run golden-master -- 40`), not as a test. It runs with plain `node`
thanks to Node 24's built-in type stripping.

## 7. CI on GitHub Actions

On every pull request and push to `master`: Biome, type-check, tests with
coverage. I opened the first PR with Biome still failing on the current code,
to see the workflow run before relying on it.

## 8. Git hooks: lint on commit, test on push

- **pre-commit:** Biome on the staged files only. Fast.
- **pre-push:** type-check and tests.

Keeping tests out of pre-commit means I can commit a failing test during a
red, green, refactor cycle. Pre-push still stops a red state from leaving my
machine, and CI stays the real gate.

## 9. Mutation testing with StrykerJS

My hand-made bug check in decision 3 was convincing to me, but nobody else
could rerun it. `npm run test:mutation` runs StrykerJS, which generates 104
mutants of `app/gilded-rose.ts`. The golden master kills all of them, in
about 4 seconds. It runs as its own CI job, so a mutation failure doesn't hide
lint or test results, and the HTML report is uploaded as an artifact.

The break threshold is 100%, because that's what I measured. If a mutant
survives later, it's either a real gap in my tests or an equivalent mutant
(one that can't change behaviour). Either way I want to look at it, and an
equivalent one gets a `// Stryker disable` comment that says why.

**Stepping back on versions.** Setting this up hit two problems with the
versions I picked in decision 1:

- **Vitest 5:** Stryker's Vitest runner (10.0.0, August 2026) is older than
  Vitest 5 (September 2026). With Vitest 5 it reported every mutant as
  surviving, without any error. With Vitest 4.1 the same tests killed all 104.
  A silent 0% is worse than no tool at all, so I moved to Vitest 4.1, which is
  still maintained.
- **TypeScript 7:** the native build has no JavaScript API yet, and Stryker
  uses that API to read `tsconfig.json`. I moved to TypeScript 6.0, the last
  JavaScript-based release, which exists exactly as the bridge to 7.

Both are easy to bump again once the tooling catches up. My takeaway: being on
the newest version only helps if the rest of the toolchain works with it.
