import { defineConfig } from 'vitest/config';
import baseConfig from './vitest.config.ts';

// The rule-level unit tests only, without the golden master, so mutation
// testing shows what the unit tests catch on their own
export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    include: ['test/vitest/gilded-rose.spec.ts'],
  },
});
