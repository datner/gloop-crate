/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
import * as Ef from 'effect/Effect';
import * as A from 'effect/ReadonlyArray';
import * as O from 'effect/Option';

import { describe, it } from 'vitest';

import { BinariesRequest, BinariesResolver, Package } from 'packages/apt/BinariesResolver.ts';
import { Repo } from 'packages/apt/Repo.ts';
import { Dependency } from 'packages/apt/Dependency.ts';

describe('Debian APT packages', async () => {
  it('should be able to list distro packages', async ({ expect }) => {
    const req = new BinariesRequest({
      repo: new Repo({
        source: false,
        uri: 'http://ftp.pl.debian.org',
        release: 'stable',
        components: ['main']
      }),
      arch: O.none()
    });

    return F.pipe(
      Ef.request(req, BinariesResolver),
      Ef.map((chunk) => expect(chunk.length).toBeGreaterThan(1)),
      Ef.runPromise
    );
  });

  it('should be able to parse packages', async ({ expect }) => {
    const sourcesList = [
      [
        [
          'Package: 0ad-data-common',
          'Version: 0.0.26-1',
          'Architecture: all',
          'Depends: fonts-dejavu-core | ttf-dejavu-core',
          'Pre-Depends: dpkg (>= 1.15.6~)'
        ],
        new Package({
          name: '0ad-data-common',
          version: '0.0.26-1',
          arch: 'all',
          dependencies: [
            new Dependency({
              name: 'dpkg',
              alternatives: [],
              version: O.some('1.15.6~')
            }),
            new Dependency({
              name: 'fonts-dejavu-core',
              alternatives: ['ttf-dejavu-core'],
              version: O.none()
            })
          ]
        })
      ]
    ];

    F.pipe(
      sourcesList,
      A.map(([src, expected]) => expect(O.getOrThrow(Package.from(src as string[]))).to.deep.equal(expected as Package, `can't parse ${src}`))
    );
  });
});
