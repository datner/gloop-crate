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

import { GitVersionsReq, GitVersionsResolver } from 'container-fluid/versions/GitVersion.ts';
import { SemanticVersion } from 'container-fluid/versions/SemanticVersion.ts';

import { Distro } from 'container-fluid/Distro.ts';
import * as Cont from 'container-fluid/Container.ts';

export const GetTruffleRubyVersions = F.pipe(
  Ef.request(new GitVersionsReq({ name: 'Truffle Ruby', repo: 'truffleruby', org: 'oracle' }), GitVersionsResolver),
  Ef.withRequestCaching(true),
  Ef.map(
    F.flow(
      A.filter((v) => /^graal-[\d.]+$/.test(v)),
      A.map((v) => v.replace('graal-', '')),
      A.map(SemanticVersion.parseString),
      A.sortBy(SemanticVersion.Order),
      A.map((v: SemanticVersion) => v.version)
    )
  )
);

const truffleRubyBootstrapPackages = HashMap.fromIterable<Distro, A.NonEmptyArray<string>>([
  ['alpine', ['go']],
  ['debian', ['go']],
  ['rocky', ['go']],
  ['photon', ['go']],
  ['notora', ['go']],
  ['ubi', ['go']]
]);

export const TruffleRuby = (org: string, distro: Distro, timestamp: number, version: O.Option<string> = O.some('latest')) =>
  F.pipe(
    GetTruffleRubyVersions,
    Cont.versionToUse(distro, version),
    Ef.map((version) =>
      Cont.Container({
        org,
        name: `truffleruby-${distro}`,
        distro,
        tags: [`${org}/truffleruby-${distro}:${version}`],
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
                    packages: F.pipe(truffleRubyBootstrapPackages, HashMap.get(distro), O.getOrNull) as A.NonEmptyArray<string>,
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
