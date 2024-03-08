/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
import * as Ef from 'effect/Effect';
import * as O from 'effect/Option';

import { describe, it } from 'vitest';

import { ContentsRequest, ContentsResolver } from 'packages/apt/ContentsResolver.ts';
import { Repo } from 'packages/apt/Repo.ts';

describe('Debian APT contents resolver', async () => {
  it('should be able to get the list of apt packages', async ({ expect }) => {
    const req = new ContentsRequest({
      repo: new Repo({
        source: false,
        uri: 'http://ftp.debian.org',
        release: 'stable',
        components: ['main']
      }),
      limit: O.some(10),
      start: O.none()
    });

    return F.pipe(
      Ef.request(req, ContentsResolver),
      Ef.map((chunk) => {
        expect(chunk.length).toBeGreaterThan(9);
      }),
      Ef.runPromise
    );
  });
});
