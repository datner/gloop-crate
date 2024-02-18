/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
import * as A from 'effect/ReadonlyArray';

import { describe, it } from 'vitest';
import { SemanticVersion } from 'container-fluid/versions/SemanticVersion.ts';

describe('Semantic Versions', async () => {
  it('should be comparable', async ({ expect }) => {
    F.pipe(
      [
        { input: ['1.1.0', '1.0.1'], expected: 1 },
        { input: ['1.1.0', '1.1.0'], expected: 0 },
        { input: ['1.1.0', '1.1.1'], expected: -1 }
      ],
      A.map(({ input: [a, b], expected }) => ({
        actual: SemanticVersion.Order(SemanticVersion.parseString(a), SemanticVersion.parseString(b)),
        expected
      })),
      A.forEach(({ actual, expected }) => expect(actual).toBe(expected))
    );
  });
});
