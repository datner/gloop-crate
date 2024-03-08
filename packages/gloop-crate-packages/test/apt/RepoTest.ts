/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import { describe, it } from 'vitest';

import * as F from 'effect/Function';
import * as A from 'effect/ReadonlyArray';

import { Repo } from 'packages/apt/Repo.ts';

describe('Debian APT repos', async () => {
  it('should be able parse sources.list file', async ({ expect }) => {
    const sourcesList = [
      [
        `deb-src https://uri stable main`,
        new Repo({
          source: true,
          uri: 'https://uri',
          release: 'stable',
          components: ['main']
        })
      ]
    ];

    F.pipe(
      sourcesList,
      A.map(([src, expected]) => expect(Repo.from(src as string)).to.deep.equal(expected as Repo, `can't parse ${src}`))
    );
  });
});
