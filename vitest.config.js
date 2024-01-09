/**
      Copyright (c) 2024 Crate Monster

      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['test/**/*Test.ts'],
    pool: 'vmForks'
    // setupFiles: ['./setup.node.ts']
  }
});
