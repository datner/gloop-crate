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
    alias: [
      { find: 'cli', replacement: path.resolve(__dirname, 'packages/gloop-crate-cli/src') },
      { find: 'container-fluid', replacement: path.resolve(__dirname, 'packages/gloop-crate-container-fluid/src') },
      { find: 'operator', replacement: path.resolve(__dirname, 'packages/gloop-crate-operator/src') },
      { find: 'packages', replacement: path.resolve(__dirname, 'packages/gloop-crate-packages/src') },
      { find: 'vulnerabilities', replacement: path.resolve(__dirname, 'packages/gloop-crate-vulnerabilities/src') }
    ]
  }
});
