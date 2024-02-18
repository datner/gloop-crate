/**
      Copyright (c) 2024 Crate Monster

      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import { defineConfig } from 'vitest/config';
// import tsconfigPaths from 'vite-tsconfig-paths';
import * as path from 'node:path';

export default defineConfig({
  // plugins: [tsconfigPaths()],
  test: {
    coverage: {
      reporter: ['text', 'lcov']
    },
    environment: 'node',
    include: ['test/**/*Test.ts'],
    pool: 'vmForks'
    // setupFiles: ['./setup.node.ts']
  },
  resolve: {
    alias: [{ find: 'container-fluid', replacement: path.resolve(__dirname, 'packages/gloop-crate-container-fluid/src') }]
  }
});
