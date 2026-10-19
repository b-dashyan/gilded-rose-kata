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

## 10. Rule-level unit tests

The golden master tells me if behaviour changed, but not which rule broke. So
`gilded-rose.spec.ts` has one test per rule, written from
`GildedRoseRequirements.md` and named in its words. They only go through
`updateQuality()`, so they should survive the refactor untouched. Boundaries
are `it.each` tables, so every value shows up in the output and one failing
case doesn't hide the next. Conjured is left out on purpose: it's a new
feature, so it gets its own PR, test first.

Where the requirements and the code disagree, the code wins, because it's what
the shop runs today:

- **Aged Brie gains 2 a day after its sell by date.** The requirements only say
  it gains quality with age. I pinned the +2 and left a comment on the test.
- **Names match exactly.** The requirements say "Backstage passes" and
  "Sulfuras", but only `Backstage passes to a TAFKAL80ETC concert` and
  `Sulfuras, Hand of Ragnaros` get the special rules. Any other pass is a
  normal item. Nothing pinned this, so a tidy refactor to `startsWith` could
  have changed prices without anyone noticing. Now there's a near-miss test for
  each. Conjured will probably need prefix matching (the fixture item is
  `Conjured Mana Cake`), and if I want the same for the others, that test is
  where I'll have to decide it on purpose.
- **Quality above 50 is never clamped.** A brie at 55 stays 55. That input
  breaks the rules to begin with, so I didn't test it.

**Mutation testing the unit tests alone.** The golden master kills nearly
everything, so it could hide gaps in the unit tests.
`npm run test:mutation:unit` runs Stryker on the unit tests only. I expected survivors,
but they kill all 104 mutants too, so it has the same 100% threshold. It's a
local tool, not a CI job. The main run already guards the code, and this one is
for checking the unit tests before the refactor.

## 11. Refactoring `updateQuality`

I'm refactoring in small steps, each one its own commit, with the golden
master, the unit tests and Stryker all green before and after.

**Step 1: name the special items.**

- **What:** replaced the three item names, repeated as string literals 8
  times, with `AGED_BRIE`, `BACKSTAGE_PASSES` and `SULFURAS`.
- **Why:** the conditionals get shorter and easier to read for the next steps,
  and there's one definition per name instead of copies that could drift
  apart. It's a mechanical change: the golden master, the unit tests and
  Stryker are all still green.
- **Worth knowing:** Stryker now makes 99 mutants instead of 104, because it
  creates one per string literal. Eight literals became three constants, so no
  coverage was lost. The tests keep their own copies of the names on purpose:
  if they imported the constants, a typo in one would change the app and the
  tests together and nothing would fail.

**Step 2: loop with `for...of`.**

- **What:** replaced the index loop with `for (const item of this.items)`, so
  every `this.items[i]` became `item`.
- **Why:** the index was only used to reach the item, and the conditionals are
  much easier to read without it. Still mechanical, and everything is green.
- **Worth knowing:** Stryker now makes 95 mutants instead of 99. The four that
  went away were mutants of the loop counter (`i < length`, `i++`). It also
  unblocks `noUncheckedIndexedAccess` (decision 2) for `app/`. Only two spots
  in the tests still fail it: `process.argv[2]` in the TextTest fixture and the
  `const [item]` destructuring in the unit tests.

**Step 3: say "drops to 0" directly.**

- **What:** replaced `item.quality = item.quality - item.quality` with
  `item.quality = 0` for backstage passes after the concert.
- **Why:** it's the requirement's own wording, "Quality drops to 0 after the
  concert", and the old line made you stop and work it out.
- **Worth knowing:** the two only differ for `NaN` or `Infinity`, which aren't
  valid qualities, so it's safe. Stryker now makes 94 mutants instead of 95,
  because the old subtraction had its own mutant (`-` to `+`).
