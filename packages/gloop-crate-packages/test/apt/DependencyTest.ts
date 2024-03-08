/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import { describe, it } from 'vitest';

import * as F from 'effect/Function';
import * as A from 'effect/ReadonlyArray';
import * as O from 'effect/Option';

import { Dependency } from 'packages/apt/Dependency.ts';

describe('Debian APT package dependencies parsing', async () => {
  it('should be able to parse dependency strings', ({ expect }) => {
    const table = [
      [
        'testlib (>= 1.0)',
        [
          new Dependency({
            name: 'testlib',
            version: O.some('1.0'),
            alternatives: []
          })
        ]
      ],
      [
        'testlib (>= 1.0), alternameA | alternameB',
        [
          new Dependency({
            name: 'testlib',
            version: O.some('1.0'),
            alternatives: []
          }),
          new Dependency({
            name: 'alternameA',
            version: O.none(),
            alternatives: ['alternameB']
          })
        ]
      ]
    ];

    F.pipe(
      table,
      A.map(([src, expected]) => expect(Dependency.from(src as string)).to.deep.equal(expected as Dependency[], `can't parse ${src}`))
    );
  });
});
