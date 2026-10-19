import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    include: ['test/vitest/**/*.{spec,test}.ts'],
    coverage: {
      provider: 'v8',
      include: ['app/**/*.ts'],
      reporter: ['text', 'html', 'lcov'],
    },
  },
});
