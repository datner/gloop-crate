/**
      Copyright (c) 2024 Crate Monster
      
      This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0 with no copyleft exception
*/

import * as F from 'effect/Function';
import * as Ef from 'effect/Effect';
import * as A from 'effect/ReadonlyArray';
import * as O from 'effect/Option';
import * as HashMap from 'effect/HashMap';
// import * as ConfigError from 'effect/ConfigError';

import { GitVersionsReq, GitVersionsResolver } from '../versions/GitVersion.ts';
import { SemanticVersion } from '../versions/SemanticVersion.ts';

import { Distro } from '../Distro.ts';
import * as Cont from '../Container.ts';

export const GetRubyVersions = F.pipe(
  Ef.request(new GitVersionsReq({ name: 'Ruby', repo: 'ruby', org: 'ruby' }), GitVersionsResolver),
  Ef.withRequestCaching(true),
  Ef.map(
    F.flow(
      A.filter((v) => /^v[\d_]+$/.test(v)),
      A.map((v) => v.replace('v', '').replaceAll('_', '.')),
      A.map(SemanticVersion.parseString),
      A.sortBy(SemanticVersion.Order),
      A.map((v: SemanticVersion) => v.version)
    )
  )
);

const rubyBootstrapPackages = HashMap.fromIterable<Distro, A.NonEmptyArray<string>>([
  ['alpine', ['go']],
  ['debian', ['go']],
  ['rocky', ['go']],
  ['photon', ['go']],
  ['notora', ['go']],
  ['ubi', ['go']]
]);

export const Ruby = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  F.pipe(
    GetRubyVersions,
    Cont.versionToUse(distro, version),
    Ef.map((version) =>
      Cont.Container({
        org,
        name: `ruby-${distro}`,
        distro,
        tags: [`${org}/ruby-${distro}:${version}`],
        layers: [
          Cont.Layer({
            name: 'bootstrap',
            from: `${org}/${distro}-build:${version}`,
            prepCache: true,
            steps: [
              Cont.Step({
                commands: [
                  Cont.Command({
                    withCache: true,
                    withCleanup: true,
                    withUpdate: true,
                    packages: F.pipe(rubyBootstrapPackages, HashMap.get(distro), O.getOrNull) as A.NonEmptyArray<string>,
                    run: ['echo installing']
                  })
                ]
              })
            ]
          })
        ]
      })
    )
  );
